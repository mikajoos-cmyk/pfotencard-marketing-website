import { motion } from 'framer-motion';
import { MessageCircle, Newspaper, ShieldCheck } from 'lucide-react';

export function CommunicationSection() {
    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >

                        <h2 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-6">
                            Der direkte Draht zu deinen Kunden.
                        </h2>
                        <p className="text-lg text-muted-foreground font-body mb-8">
                            Verabschiede dich von WhatsApp-Chaos. Mit Pfotencard kommunizierst du professionell, zentral und DSGVO-konform direkt in deiner eigenen App.
                        </p>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                        <MessageCircle size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-sans font-bold text-foreground mb-2">Integrierter Chat</h3>
                                    <p className="text-muted-foreground">
                                        Sende Nachrichten, Bilder oder Dokumente direkt an deine Kunden.
                                        Behalte den Überblick über alle Konversationen an einem Ort – getrennt von deinem Privathandy.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                        <Newspaper size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-sans font-bold text-foreground mb-2">News & Updates</h3>
                                    <p className="text-muted-foreground">
                                        Poste Neuigkeiten, die sofort auf dem Startbildschirm deiner Kunden erscheinen.
                                        Erreiche gezielt alle Kunden, bestimmte Level-Gruppen oder Kursteilnehmer.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                        <ShieldCheck size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-sans font-bold text-foreground mb-2">DSGVO-Konform</h3>
                                    <p className="text-muted-foreground">
                                        Sichere und schnelle Kommunikation direkt in der App. Keine Weitergabe von Handynummern notwendig.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        {/* Hier könnte ein Screenshot der Chat-Oberfläche hin */}
                        <div className="relative z-10 bg-gradient-to-tr from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100 shadow-xl">
                            <img
                                src="https://c.animaapp.com/mj4h8vfeISPmry/img/ai_2.png"
                                alt="Chat Interface Mockup"
                                className="w-full h-auto rounded-lg shadow-sm mix-blend-multiply"
                            />
                            {/* Overlay Chat Bubble Mockup */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg border border-border max-w-xs hidden md:block">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">M</div>
                                    <div className="text-xs font-bold text-foreground">Max Mustermann</div>
                                </div>
                                <p className="text-sm text-foreground">"Danke für die tolle Stunde heute! Bello schläft schon tief und fest. 😴"</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}