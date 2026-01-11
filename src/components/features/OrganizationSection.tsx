import { motion } from 'framer-motion';
import { Calendar, Users, FileText, CheckCircle2 } from 'lucide-react';

export function OrganizationSection() {
    return (
        <section className="py-24 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-4">
                        Organisation leicht gemacht.
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Spare dir die Zettelwirtschaft. Verwalte Termine, Teilnehmer und wichtige Dokumente digital.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Termine */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-card p-8 rounded-xl border border-border shadow-sm"
                    >
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
                            <Calendar size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Terminverwaltung</h3>
                        <p className="text-muted-foreground mb-4">
                            Erstelle Einzel- oder Gruppentermine. Definiere Teilnehmerlimits und behalte den Überblick über Anmeldungen und Wartelisten.
                        </p>
                        <ul className="space-y-2 text-sm text-foreground">
                            <li className="flex gap-2"><CheckCircle2 size={16} className="text-primary" /> Automatische Warteliste</li>
                            <li className="flex gap-2"><CheckCircle2 size={16} className="text-primary" /> Zu/Absagen verwalten</li>
                        </ul>
                    </motion.div>

                    {/* Card 2: Dokumente */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-card p-8 rounded-xl border border-border shadow-sm"
                    >
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-6">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Dokumenten-Safe</h3>
                        <p className="text-muted-foreground mb-4">
                            Schluss mit verlorenen Impfpässen. Lade wichtige Dokumente direkt in die digitale Kundenakte hoch.
                        </p>
                        <ul className="space-y-2 text-sm text-foreground">
                            <li className="flex gap-2"><CheckCircle2 size={16} className="text-orange-500" /> Impfpass-Upload</li>
                            <li className="flex gap-2"><CheckCircle2 size={16} className="text-orange-500" /> Versicherungsnachweise</li>
                        </ul>
                    </motion.div>

                    {/* Card 3: Teilnehmer */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-card p-8 rounded-xl border border-border shadow-sm"
                    >
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
                            <Users size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Anwesenheitslisten</h3>
                        <p className="text-muted-foreground mb-4">
                            Checke Teilnehmer direkt in der App ein. Das System verrechnet automatisch Guthaben oder Kurstickets.
                        </p>
                        <ul className="space-y-2 text-sm text-foreground">
                            <li className="flex gap-2"><CheckCircle2 size={16} className="text-indigo-500" /> Digitaler Check-in</li>
                            <li className="flex gap-2"><CheckCircle2 size={16} className="text-indigo-500" /> Historie pro Kunde</li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}