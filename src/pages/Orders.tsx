import { useState, useMemo } from "react";
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
import StatusBadge from "@/components/StatusBadge";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const STATUSES = ["pending", "confirmed", "active", "ended", "cancelled"] as const;

export default function Orders() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    client: "", equipment: "", unit: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd"),
    cautionAmount: 0, notes: "",
  });

  const { data: orders = [] } = useQuery<any[]>({ queryKey: ["orders"], queryFn: async () => (await api.get("/orders")).data });
  const { data: clients = [] } = useQuery<any[]>({ queryKey: ["clients"], queryFn: async () => (await api.get("/clients")).data });
  const { data: equipments = [] } = useQuery<any[]>({ queryKey: ["equipments"], queryFn: async () => (await api.get("/equipments")).data });
  const { data: units = [] } = useQuery<any[]>({ queryKey: ["units"], queryFn: async () => (await api.get("/units")).data });

  const availableUnits = useMemo(
    () => units.filter((u: any) => u.status === "available" && (!form.equipment || String(u.equipment?._id) === form.equipment)),
    [units, form.equipment]
  );

  const create = useMutation({
    mutationFn: async (p: any) => (await api.post("/orders", p)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["units"] });
      qc.invalidateQueries({ queryKey: ["equipments"] });
      setOpen(false);
      toast({ title: "Commande créée" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e?.response?.data?.message, variant: "destructive" }),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: any) => (await api.patch(`/orders/${id}/status`, { status })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["units"] });
      qc.invalidateQueries({ queryKey: ["equipments"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e?.response?.data?.message, variant: "destructive" }),
  });

  return (
    <div>
      <PageHeader
        title="Commandes"
        description="Locations en cours et historique"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvelle commande</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvelle commande</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-3">
                <div>
                  <Label>Client</Label>
                  <Select value={form.client} onValueChange={(v) => setForm({ ...form, client: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                    <SelectContent>{clients.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.nom} — {c.telephone}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Équipement</Label>
                  <Select value={form.equipment} onValueChange={(v) => setForm({ ...form, equipment: v, unit: "" })}>
                    <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                    <SelectContent>
                      {equipments.map((e: any) => (
                        <SelectItem key={e._id} value={e._id} disabled={e.stockDisponible === 0}>
                          {e.nom} ({e.stockDisponible} dispo)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unité (n° série)</Label>
                  <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })} disabled={!form.equipment}>
                    <SelectTrigger><SelectValue placeholder={availableUnits.length ? "Choisir…" : "Aucune unité disponible"} /></SelectTrigger>
                    <SelectContent>{availableUnits.map((u: any) => <SelectItem key={u._id} value={u._id}>{u.serialNumber}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date début</Label><Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                  <div><Label>Date fin</Label><Input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
                </div>
                <div><Label>Caution (MAD)</Label><Input type="number" min="0" value={form.cautionAmount} onChange={(e) => setForm({ ...form, cautionAmount: Number(e.target.value) })} /></div>
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
              <th className="p-3 font-medium">Référence</th>
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium">Équipement</th>
              <th className="p-3 font-medium">Période</th>
              <th className="p-3 font-medium">Statut</th>
              <th className="p-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Aucune commande</td></tr>
            ) : orders.map((o: any) => (
              <tr key={o._id} className="hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">{o.reference}</td>
                <td className="p-3">{o.client?.nom}</td>
                <td className="p-3">{o.equipment?.nom} <span className="text-muted-foreground text-xs">({o.unit?.serialNumber})</span></td>
                <td className="p-3 text-xs">{format(new Date(o.startDate), "dd/MM/yy")} → {format(new Date(o.endDate), "dd/MM/yy")}</td>
                <td className="p-3"><StatusBadge status={o.status} /></td>
                <td className="p-3 text-right">
                  <Select value={o.status} onValueChange={(status) => setStatus.mutate({ id: o._id, status })}>
                    <SelectTrigger className="w-[140px] h-8 ml-auto"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
