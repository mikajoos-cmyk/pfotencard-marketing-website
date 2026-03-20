import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function useVatValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [vatError, setVatError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true); // Default to true to avoid "invalid" flicker

  // Wir exportieren die Setter, damit die UI sie bei Bedarf direkt anpassen kann
  const validationCounter = useRef(0);

  const validateVatId = useCallback(async (id: string) => {
    const cleanId = id.replace(/\s+/g, '').toUpperCase();
    const currentRequestCount = ++validationCounter.current;

    // 1. Wenn leer, setze alles zurück
    if (!cleanId) {
      setVatError(null);
      setIsValid(true);
      return true; // Empty is allowed (optional)
    }

    // 2. Lokale Format-Prüfung (Regex für EU USt-IdNr.)
    const vatRegex = /^[A-Z]{2}[A-Z0-9]{2,12}$/;
    if (!vatRegex.test(cleanId)) {
      setVatError('Ungültiges Format. Beispiel: DE123456789');
      setIsValid(false);
      return false;
    }

    // 3. Echte API Prüfung (EU VIES via Edge Function)
    setIsValidating(true);
    setVatError(null);
    // Wir setzen isValid hier auf true, solange wir noch prüfen,
    // um kein "X" oder Fehlermeldung anzuzeigen, die noch vom alten (falschen) Wert stammt.
    setIsValid(true);

    try {
      const token = localStorage.getItem('pfotencard_token');
      const { data, error } = await supabase.functions.invoke('validate-vat', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: { vatId: cleanId }
      });

      // Ignore results from stale requests
      if (currentRequestCount !== validationCounter.current) {
        return true; // We don't care about old results, assume they are "ok" enough not to block
      }

      if (error) {
        console.error("[VAT] Supabase function error:", error);
        // Bei technischen Fehlern (error) lieber durchwinken (Bypass)
        setVatError(null);
        setIsValid(true);
        return true;
      }

      // Nur wenn die API explizit 'valid: false' zurückgibt, ist die Nummer definitiv ungültig.
      if (data?.valid === false) {
        setVatError('Diese USt-IdNr. ist nicht gültig oder inaktiv.');
        setIsValid(false);
        return false;
      }

      // Bei data.valid === true ODER wenn data undefined ist, setzen wir auf Valid.
      setVatError(null);
      setIsValid(true);
      return true;

    } catch (err) {
      // Auch bei einem totalen Crash (z.B. Netzwerk-Timeout)
      // ignorieren wir veraltete Requests
      if (currentRequestCount !== validationCounter.current) {
        return true;
      }

      console.error("[VAT] Fehler im Hook, Bypass aktiv:", err);
      // Im Fehlerfall lieber durchwinken
      setVatError(null);
      setIsValid(true);
      return true;
    } finally {
      if (currentRequestCount === validationCounter.current) {
        setIsValidating(false);
      }
    }
  }, []);

  return {
    isValidating,
    vatError,
    isValid,
    validateVatId,
    setVatError,
    setIsValid
  };
}
