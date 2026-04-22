import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const ROLES = ["admin", "employe", "caissier", "livreur"];

export default function Users() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ name: "", email: "", password: "", role: "employe" });

  const { data: users = [] } = useQuery<any[]>({ queryKey: ["users"], queryFn: async () => (await api.get("/users")).data });

  const create = useMutation({
    mutationFn: async (p: any) => (await api.post("/auth/register", p)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setOpen(false); toast({ title: "Utilisateur créé" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.response?.data?.message, variant: "destructive" }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: any) => (await api.put(`/users/${id}`, data)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast({ title: "Mis à jour" }); },
  });

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description="Gérer les comptes du back-office"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvel utilisateur</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvel utilisateur</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-3">
                <div><Label>Nom</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Mot de passe</Label><Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <div>
                  <Label>Rôle</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <DialogFooter><Button type="submit" disabled={create.isPending}>Créer</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr className="text-left">
              <th className="p-3 font-medium">Nom</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Rôle</th>
              <th className="p-3 font-medium">Statut</th>
              <th className="p-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u: any) => (
              <tr key={u._id} className="hover:bg-muted/30">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <Select value={u.role} onValueChange={(role) => update.mutate({ id: u._id, data: { role } })}>
                    <SelectTrigger className="w-[120px] h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  {u.active ? <Badge className="bg-success/15 text-success border border-success/30">actif</Badge>
                    : <Badge className="bg-muted text-muted-foreground">inactif</Badge>}
                </td>
                <td className="p-3 text-right">
                  <Button variant="outline" size="sm" onClick={() => update.mutate({ id: u._id, data: { active: !u.active } })}>
                    {u.active ? "Désactiver" : "Activer"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
