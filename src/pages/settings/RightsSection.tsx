import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, Loader2 } from 'lucide-react';
import React from 'react';

interface UserPermission {
  can_create_courses: boolean;
  can_edit_status: boolean;
  can_edit_customers: boolean;
  can_delete_customers: boolean;
  can_create_messages: boolean;
  can_view_invoices: boolean;
  can_edit_settings: boolean;
  can_manage_staff: boolean;
}

interface User {
  id: number;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  role: string;
  permissions: UserPermission;
}

interface RightsSectionProps {
  loadingStaff: boolean;
  staff: User[];
  activeModules: string[];
  handlePermissionChange: (userId: number, field: keyof UserPermission, value: boolean) => void;
  PermissionInfo: React.FC<{ description: string }>;
}

export const RightsSection = React.memo(({
  loadingStaff,
  staff,
  activeModules,
  handlePermissionChange,
  PermissionInfo
}: RightsSectionProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck size={20} />
            Team & Rechte
          </CardTitle>
          <CardDescription>Verwalte die Berechtigungen deines Teams.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingStaff ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : staff.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-8">Keine Teammitglieder gefunden.</p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Mitarbeiter</TableHead>
                    {activeModules.includes('calendar') && (
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center">
                          Kurse anlegen
                          <PermissionInfo description="Mitarbeiter kann neue Kurse/Termine im Kalender erstellen und verwalten." />
                        </div>
                      </TableHead>
                    )}
                    {activeModules.includes('status_display') && (
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center">
                          Status bearbeiten
                          <PermissionInfo description="Mitarbeiter kann den aktuellen Status der Hundeschule (z.B. Dashboard-Meldung) ändern." />
                        </div>
                      </TableHead>
                    )}
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center">
                        Kunden bearbeiten
                        <PermissionInfo description="Mitarbeiter kann Stammdaten, Guthaben, Level und Fortschritt von Kunden bearbeiten." />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center">
                        Kunden löschen
                        <PermissionInfo description="Mitarbeiter kann Kundenkonten endgültig aus dem System löschen." />
                      </div>
                    </TableHead>
                    {activeModules.includes('news') && (
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center">
                          Neuigkeiten
                          <PermissionInfo description="Mitarbeiter kann News-Beiträge erstellen und Push-Nachrichten an Kunden versenden." />
                        </div>
                      </TableHead>
                    )}
                    <TableHead className="text-right">Rolle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {member.first_name || member.name} {member.last_name || ''}
                      </TableCell>
                      {activeModules.includes('calendar') && (
                        <TableCell className="text-center">
                          <Switch
                            checked={member.role === 'admin' || (member.permissions?.can_create_courses || false)}
                            onCheckedChange={(val) => handlePermissionChange(member.id, 'can_create_courses', val)}
                            disabled={member.role === 'admin'}
                          />
                        </TableCell>
                      )}
                      {activeModules.includes('status_display') && (
                        <TableCell className="text-center">
                          <Switch
                            checked={member.role === 'admin' || (member.permissions?.can_edit_status || false)}
                            onCheckedChange={(val) => handlePermissionChange(member.id, 'can_edit_status', val)}
                            disabled={member.role === 'admin'}
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        <Switch
                          checked={member.role === 'admin' || (member.permissions?.can_edit_customers || false)}
                          onCheckedChange={(val) => handlePermissionChange(member.id, 'can_edit_customers', val)}
                          disabled={member.role === 'admin'}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={member.role === 'admin' || (member.permissions?.can_delete_customers || false)}
                          onCheckedChange={(val) => handlePermissionChange(member.id, 'can_delete_customers', val)}
                          disabled={member.role === 'admin'}
                        />
                      </TableCell>
                      {activeModules.includes('news') && (
                        <TableCell className="text-center">
                          <Switch
                            checked={member.role === 'admin' || (member.permissions?.can_create_messages || false)}
                            onCheckedChange={(val) => handlePermissionChange(member.id, 'can_create_messages', val)}
                            disabled={member.role === 'admin'}
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${member.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {member.role}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});