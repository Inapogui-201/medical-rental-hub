import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Client {
  _id: string; nom: string; telephone: string; adresse?: string; cin?: string;
  gps?: { lat: number; lng: number }; notes?: string;
}

const empty: Partial<Client> = { nom: "", telephone: "", adresse: "", cin: "", notes: "" };

export default function Clients() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Client> & { _id?: string; lat?: string; lng?: string }>(empty);

  const { data = [], isLoading } = useQuery<Client[]>({
    queryKey: ["clients", q],
    queryFn: async () => (await api.get("/clients", { params: q ? { q } : {} })).data,
  });

  const save = useMutation({
    mutationFn: async (payload: any) => {
      const body = {
        ...payload,
        gps: payload.lat && payload.lng ? { lat: Number(payload.lat), lng: Number(payload.lng) } : undefined,
      };
      delete body.lat; delete body.lng;
      if (payload._id) return (await api.put(`/clients/${payload._id}`, body)).data;
      return (await api.post(`/clients`, body)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      setOpen(false); setForm(empty);
      toast({ title: "Client enregistré" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e?.response?.data?.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/clients/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); toast({ title: "Supprimé" }); },
  });

  const openEdit = (c: Client) => {
    setForm({ ...c, lat: c.gps?.lat?.toString() ?? "", lng: c.gps?.lng?.toString() ?? "" });
    setOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Gérer les clients de l'entreprise"
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm(empty)}><Plus className="h-4 w-4 mr-2" />Nouveau client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form._id ? "Modifier" : "Nouveau"} client</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-3">
                <div><Label>Nom</Label><Input required value={form.nom || ""} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
                <div><Label>Téléphone</Label><Input required value={form.telephone || ""} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
                <div><Label>CIN</Label><Input value={form.cin || ""} onChange={(e) => setForm({ ...form, cin: e.target.value })} /></div>
                <div><Label>Adresse</Label><Input value={form.adresse || ""} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>GPS Lat</Label><Input value={form.lat || ""} onChange={(e) => setForm({ ...form, lat: e.target.value })} /></div>
                  <div><Label>GPS Lng</Label><Input value={form.lng || ""} onChange={(e) => setForm({ ...form, lng: e.target.value })} /></div>
                </div>
                <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <DialogFooter><Button type="submit" disabled={save.isPending}>Enregistrer</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Rechercher par nom, téléphone, CIN…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr className="text-left">
              <th className="p-3 font-medium">Nom</th>
              <th className="p-3 font-medium">Téléphone</th>
              <th className="p-3 font-medium">CIN</th>
              <th className="p-3 font-medium">Adresse</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Chargement…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucun client</td></tr>
            ) : data.map((c) => (
              <tr key={c._id} className="hover:bg-muted/30">
                <td className="p-3 font-medium">{c.nom}</td>
                <td className="p-3">{c.telephone}</td>
                <td className="p-3">{c.cin || "—"}</td>
                <td className="p-3 max-w-xs truncate">{c.adresse || "—"}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => confirm("Supprimer ?") && del.mutate(c._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
