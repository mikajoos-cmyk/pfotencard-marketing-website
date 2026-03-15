import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, Loader2, Save, Trash2, Upload } from 'lucide-react';
import React from 'react';

interface LegalSettings {
  company_name: string;
  legal_form: 'individual' | 'gmbh_ug' | 'registered' | 'other';
  owner_name: string;
  representative: string;
  registry_court: string;
  registry_number: string;
  street: string;
  house_number: string;
  zip_code: string;
  city: string;
  email_public: string;
  email_support: string;
  phone: string;
  supervisory_authority: string;
  has_vat_id: boolean;
  vat_id: string;
  separate_billing_address: boolean;
  billing_company_name: string;
  billing_street: string;
  billing_house_number: string;
  billing_zip_code: string;
  billing_city: string;
}

interface InvoiceSettings {
  company_name: string;
  address_line1: string;
  address_line2: string;
  tax_number: string;
  vat_id: string;
  registry_court: string;
  registry_number: string;
  bank_name: string;
  iban: string;
  bic: string;
  account_holder: string;
  footer_text: string;
  logo_url: string;
  vat_rate: number;
  is_small_business: boolean;
  small_business_text: string;
  owner_name: string;
  fantasie_name: string;
}

interface LegalSectionProps {
  legalSettings: LegalSettings;
  setLegalSettings: (val: LegalSettings | ((prev: LegalSettings) => LegalSettings)) => void;
  invoiceSettings: InvoiceSettings;
  setInvoiceSettings: (val: InvoiceSettings | ((prev: InvoiceSettings) => InvoiceSettings)) => void;
  generatingPreview: boolean;
  handleGetInvoicePreview: () => void;
  handleInvoiceLogoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInvoiceLogoUpload: () => void;
}

export const LegalSection = React.memo(({
  legalSettings,
  setLegalSettings,
  invoiceSettings,
  setInvoiceSettings,
  generatingPreview,
  handleGetInvoicePreview,
  handleInvoiceLogoFileChange,
  handleInvoiceLogoUpload
}: LegalSectionProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8 pb-20">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rechtliche Angaben & Impressum</CardTitle>
              <CardDescription>Diese Daten werden für die rechtlichen Dokumente in der App verwendet.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rechtsform</Label>
                    <Select value={legalSettings.legal_form} onValueChange={(val: any) => setLegalSettings(prev => ({ ...prev, legal_form: val }))}>
                      <SelectTrigger><SelectValue placeholder="Wähle deine Rechtsform" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Einzelunternehmer / Freiberufler</SelectItem>
                        <SelectItem value="gmbh_ug">GmbH / UG (haftungsbeschränkt)</SelectItem>
                        <SelectItem value="registered">Eingetragener Kaufmann (e.K.)</SelectItem>
                        <SelectItem value="other">Sonstige Rechtsform</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{legalSettings.legal_form === 'individual' ? 'Name der Hundeschule' : 'Firmenname (laut Register)'}</Label>
                    <Input value={legalSettings.company_name} onChange={e => setLegalSettings(prev => ({ ...prev, company_name: e.target.value }))} placeholder="Bello's Hundeschule" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{legalSettings.legal_form === 'individual' ? 'Vor- & Nachname Inhaber' : 'Geschäftsführer'}</Label>
                    <Input value={legalSettings.owner_name} onChange={e => setLegalSettings(prev => ({ ...prev, owner_name: e.target.value }))} placeholder="Max Mustermann" />
                  </div>
                  {(legalSettings.legal_form === 'gmbh_ug' || legalSettings.legal_form === 'registered') && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Registergericht</Label>
                        <Input value={legalSettings.registry_court} onChange={e => setLegalSettings(prev => ({ ...prev, registry_court: e.target.value }))} placeholder="Amtsgericht Musterstadt" />
                      </div>
                      <div className="space-y-2">
                        <Label>Registernummer</Label>
                        <Input value={legalSettings.registry_number} onChange={e => setLegalSettings(prev => ({ ...prev, registry_number: e.target.value }))} placeholder="HRB 12345" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3 space-y-2">
                    <Label>Straße</Label>
                    <Input value={legalSettings.street} onChange={e => setLegalSettings(prev => ({ ...prev, street: e.target.value }))} placeholder="Musterstraße" />
                  </div>
                  <div className="space-y-2">
                    <Label>Hausnummer</Label>
                    <Input value={legalSettings.house_number} onChange={e => setLegalSettings(prev => ({ ...prev, house_number: e.target.value }))} placeholder="12a" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>PLZ</Label>
                    <Input value={legalSettings.zip_code} onChange={e => setLegalSettings(prev => ({ ...prev, zip_code: e.target.value }))} placeholder="12345" />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <Label>Stadt</Label>
                    <Input value={legalSettings.city} onChange={e => setLegalSettings(prev => ({ ...prev, city: e.target.value }))} placeholder="Musterstadt" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Öffentliche E-Mail</Label>
                    <Input type="email" value={legalSettings.email_public} onChange={e => setLegalSettings(prev => ({ ...prev, email_public: e.target.value }))} placeholder="info@deine-hundeschule.de" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input value={legalSettings.phone} onChange={e => setLegalSettings(prev => ({ ...prev, phone: e.target.value }))} placeholder="+49 123 456789" />
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label>Ich habe eine USt-IdNr.</Label>
                    <Switch checked={legalSettings.has_vat_id} onCheckedChange={val => setLegalSettings(prev => ({ ...prev, has_vat_id: val }))} />
                  </div>
                  {legalSettings.has_vat_id && (
                    <div className="space-y-2">
                      <Label>USt-IdNr.</Label>
                      <Input value={legalSettings.vat_id} onChange={e => setLegalSettings(prev => ({ ...prev, vat_id: e.target.value }))} placeholder="DE123456789" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Abweichende Rechnungsadresse</Label>
                      <p className="text-xs text-muted-foreground">Falls deine Rechnungen an eine andere Adresse gehen sollen.</p>
                    </div>
                    <Switch checked={legalSettings.separate_billing_address} onCheckedChange={val => setLegalSettings(prev => ({ ...prev, separate_billing_address: val }))} />
                  </div>
                  {legalSettings.separate_billing_address && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="space-y-2">
                        <Label>Rechnungsempfänger / Firmenname</Label>
                        <Input value={legalSettings.billing_company_name} onChange={e => setLegalSettings(prev => ({ ...prev, billing_company_name: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-3 space-y-2"><Label>Straße</Label><Input value={legalSettings.billing_street} onChange={e => setLegalSettings(prev => ({ ...prev, billing_street: e.target.value }))} /></div>
                        <div className="space-y-2"><Label>Nr.</Label><Input value={legalSettings.billing_house_number} onChange={e => setLegalSettings(prev => ({ ...prev, billing_house_number: e.target.value }))} /></div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-2"><Label>PLZ</Label><Input value={legalSettings.billing_zip_code} onChange={e => setLegalSettings(prev => ({ ...prev, billing_zip_code: e.target.value }))} /></div>
                        <div className="col-span-3 space-y-2"><Label>Stadt</Label><Input value={legalSettings.billing_city} onChange={e => setLegalSettings(prev => ({ ...prev, billing_city: e.target.value }))} /></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rechnungskonfiguration</CardTitle>
                  <CardDescription>Daten für die automatische Rechnungserstellung.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleGetInvoicePreview} disabled={generatingPreview} className="bg-white hover:bg-white/90">
                  {generatingPreview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Test-Rechnung laden
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
                <div className="space-y-0.5">
                  <Label className="text-base">Kleinunternehmer-Regelung</Label>
                  <p className="text-xs text-muted-foreground">Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen.</p>
                </div>
                <Switch checked={invoiceSettings.is_small_business} onCheckedChange={val => setInvoiceSettings(prev => ({ ...prev, is_small_business: val }))} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold border-b pb-2">Steuerdaten</h3>
                  <div className="space-y-4">
                    {invoiceSettings.is_small_business ? (
                      <div className="space-y-2">
                        <Label>Steuernummer (Pflicht)</Label>
                        <Input value={invoiceSettings.tax_number} onChange={e => setInvoiceSettings(prev => ({ ...prev, tax_number: e.target.value }))} placeholder="12/345/67890" />
                        <p className="text-[10px] text-muted-foreground italic">Als Kleinunternehmer benötigt das Finanzamt deine Steuernummer auf der Rechnung.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>USt-IdNr. oder Steuernummer</Label>
                        <Input value={invoiceSettings.vat_id || invoiceSettings.tax_number} onChange={e => { const val = e.target.value; if (val.startsWith('DE')) setInvoiceSettings(prev => ({ ...prev, vat_id: val })); else setInvoiceSettings(prev => ({ ...prev, tax_number: val })); }} placeholder="DE123456789 oder 12/345/67890" />
                      </div>
                    )}
                    {!invoiceSettings.is_small_business && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Registergericht</Label><Input value={invoiceSettings.registry_court} onChange={e => setInvoiceSettings(prev => ({ ...prev, registry_court: e.target.value }))} /></div>
                          <div className="space-y-2"><Label>Registernummer</Label><Input value={invoiceSettings.registry_number} onChange={e => setInvoiceSettings(prev => ({ ...prev, registry_number: e.target.value }))} /></div>
                        </div>
                        <div className="space-y-2">
                          <Label>Umsatzsteuersatz (%)</Label>
                          <div className="flex items-center gap-2 max-w-[120px]"><Input type="number" value={invoiceSettings.vat_rate} onChange={e => setInvoiceSettings(prev => ({ ...prev, vat_rate: parseFloat(e.target.value) || 0 }))} /><span className="text-sm font-medium">%</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold border-b pb-2">Bankverbindung</h3>
                  <div className="space-y-2"><Label>Kontoinhaber</Label><Input value={invoiceSettings.account_holder} onChange={e => setInvoiceSettings(prev => ({ ...prev, account_holder: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Bankname</Label><Input value={invoiceSettings.bank_name} onChange={e => setInvoiceSettings(prev => ({ ...prev, bank_name: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>IBAN</Label><Input value={invoiceSettings.iban} onChange={e => setInvoiceSettings(prev => ({ ...prev, iban: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>BIC</Label><Input value={invoiceSettings.bic} onChange={e => setInvoiceSettings(prev => ({ ...prev, bic: e.target.value }))} /></div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label>Rechnungs-Logo (Optional)</Label>
                <input type="file" id="invoice-logo-upload-input" className="hidden" accept="image/*" onChange={handleInvoiceLogoFileChange} />
                <div onClick={handleInvoiceLogoUpload} className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${invoiceSettings.logo_url ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}`}>
                  {invoiceSettings.logo_url ? (
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-16 h-16 bg-white rounded border flex items-center justify-center overflow-hidden"><img src={invoiceSettings.logo_url} alt="Invoice Logo" className="w-full h-full object-contain" /></div>
                      <div className="text-left"><p className="text-sm font-medium">Eigenes Logo aktiv</p><Button variant="ghost" size="sm" className="h-7 px-2 text-xs mt-1" onClick={e => { e.stopPropagation(); setInvoiceSettings(prev => ({ ...prev, logo_url: '' })); }}><Trash2 size={12} className="mr-1" /> Entfernen</Button></div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2"><Upload size={24} className="text-muted-foreground" /><p className="text-xs font-medium">Klicke zum Hochladen eines Rechnungs-Logos</p></div>
                  )}
                </div>
                {invoiceSettings.is_small_business && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Rechtshinweis für Kleinunternehmer</Label>
                    <Input value={invoiceSettings.small_business_text} onChange={e => setInvoiceSettings(prev => ({ ...prev, small_business_text: e.target.value }))} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
});