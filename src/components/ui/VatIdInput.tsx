import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useVatValidation } from '@/hooks/use-vat-validation';

interface VatIdInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  onErrorStateChange?: (hasError: boolean) => void;
  onValidatingStateChange?: (isValidating: boolean) => void;
  onBlur?: () => void;
}

export function VatIdInput({
                             value,
                             onChange,
                             label = 'USt-IdNr. (für Rechnungen)',
                             placeholder = 'z.B. DE123456789',
                             id = 'vat_id',
                             className = '',
                             onErrorStateChange,
                             onValidatingStateChange,
                             onBlur,
                           }: VatIdInputProps) {
  const [localLoading, setLocalLoading] = useState(false);
  const [initialValue, setInitialValue] = useState<string | null>(value || null);
  const currentValueRef = useRef(value);

  useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

  // Wenn sich der initiale Wert von außen ändert (z.B. nach Laden des Profils),
  // aktualisieren wir unseren Referenzwert, sofern dieser noch leer war.
  useEffect(() => {
    if (value && (initialValue === null || initialValue === '')) {
      setInitialValue(value);
    }
  }, [value, initialValue]);
  const {
    isValidating,
    vatError,
    isValid,
    validateVatId,
    setVatError,
    setIsValid
  } = useVatValidation();

  // Debounced VAT-ID Prüfung während der Eingabe
  useEffect(() => {
    // Wenn der Wert leer ist, nichts tun (Hook setzt bereits alles zurück)
    if (!value) {
      setVatError(null);
      setIsValid(true);
      setLocalLoading(false);
      onErrorStateChange?.(false);
      return;
    }

    // Wenn der Wert der initiale Wert ist, als valide anzeigen ohne zu prüfen
    if (initialValue !== null && value.trim().toUpperCase() === initialValue.trim().toUpperCase()) {
      setVatError(null);
      setIsValid(true);
      setLocalLoading(false);
      onErrorStateChange?.(false);
      return;
    }

    // Wenn wir noch keinen initialen Wert haben, aber value da ist,
    // gehen wir davon aus, dass dies der gerade geladene Wert ist
    // (da initialValue im useState(value) oder im ersten useEffect gesetzt wird).
    // Das verhindert das Flackern beim ersten Mount/Navigation.
    if ((initialValue === null || initialValue === '') && value) {
      setVatError(null);
      setIsValid(true);
      setLocalLoading(false);
      // Wir setzen initialValue hier, damit nachfolgende Änderungen als Änderungen erkannt werden
      setInitialValue(value);
      onErrorStateChange?.(false);
      return;
    }

    // Nur prüfen, wenn die Nummer eine gewisse Mindestlänge hat (Ländercode + min. 2 Zeichen)
    const cleanValue = value.replace(/\s+/g, '');
    if (cleanValue.length < 4) {
      setLocalLoading(false);
      setIsValid(false);
      // NEU: Wir melden sofort einen Fehler (ohne Text), damit das Auto-Save diese kurze ID nicht speichert!
      onErrorStateChange?.(true);
      return;
    }

    // Sofort laden anzeigen
    setLocalLoading(true);

    const timer = setTimeout(async () => {
      const valueToValidate = value;
      const isVatValid = await validateVatId(valueToValidate);

      if (valueToValidate === value) {
        setLocalLoading(false);
        onErrorStateChange?.(!isVatValid);
      }
    }, 800); // Geändert von 2000ms auf 800ms

    return () => clearTimeout(timer);
  }, [value, validateVatId]);

  // Meldung an Elternkomponente bei Validierungsstatus-Wechsel
  useEffect(() => {
    onValidatingStateChange?.(isValidating || localLoading);
  }, [isValidating, localLoading, onValidatingStateChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);

    // Wir setzen isValidating sofort auf true, damit das Profil nicht speichert
    setLocalLoading(true);

    // Wir löschen Fehler sofort, wenn der User tippt,
    // aber wir setzen isValid nicht sofort auf false,
    // damit das grüne Häkchen bei einer bereits validen Nummer nicht flackert,
    // es sei denn, das Format wird offensichtlich ungültig.
    if (vatError) {
      setVatError(null);
      onErrorStateChange?.(false);
    }
  };

  return (
      <div className={`space-y-2 ${className}`}>
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input
              id={id}
              value={value}
              placeholder={placeholder}
              onChange={handleChange}
              onBlur={onBlur}
              className={vatError ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
          />

          <div className="absolute right-3 top-2.5">
            {(isValidating || localLoading) && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
            {!(isValidating || localLoading) && isValid && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {!(isValidating || localLoading) && vatError && <XCircle className="w-5 h-5 text-destructive" />}
          </div>
        </div>

        {vatError && (
            <p className="text-sm font-medium text-destructive mt-1">{vatError}</p>
        )}
      </div>
  );
}
