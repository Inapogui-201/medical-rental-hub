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
import StatusBadge from "@/components/StatusBadge";
import { toast } from "@/hooks/use-toast";

export default function Deposits() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ order: "", amount: 0, method: "cash", notes: "" });

  const { data: deposits = [] } = useQuery<any[]>({ queryKey: ["deposits"], queryFn: async () => (await api.get("/deposits")).data });
  const { data: orders = [] } = useQuery<any[]>({ queryKey: ["orders"], queryFn: async () => (await api.get("/orders")).data });

  const create = useMutation({
    mutationFn: async (p: any) => (await api.post("/deposits", p)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deposits"] }); setOpen(false); toast({ title: "Caution enregistrée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.response?.data?.message, variant: "destructive" }),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: any) => (await api.patch(`/deposits/${id}/status`, { status })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deposits"] }); toast({ title: "Mis à jour" }); },
  });

  return (
    <div>
      <PageHeader
        title="Cautions"
        description="Suivi des cautions retenues, restituées ou déduites"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvelle caution</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvelle caution</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-3">
                <div>
                  <Label>Commande</Label>
                  <Select value={form.order} onValueChange={(v) => setForm({ ...form, order: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                    <SelectContent>{orders.map((o: any) => <SelectItem key={o._id} value={o._id}>{o.reference} — {o.client?.nom}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Montant</Label><Input type="number" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
                <div>
                  <Label>Mode</Label>
                  <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="carte">Carte</SelectItem>
                      <SelectItem value="virement">Virement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter><Button type="submit" disabled={create.isPending}>Enregistrer</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr className="text-left">
              <th className="p-3 font-medium">Commande</th>
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium">Montant</th>
              <th className="p-3 font-medium">Statut</th>
              <th className="p-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deposits.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucune caution</td></tr>
            ) : deposits.map((d: any) => (
              <tr key={d._id} className="hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">{d.order?.reference}</td>
                <td className="p-3">{d.order?.client?.nom}</td>
                <td className="p-3 font-medium">{d.amount.toLocaleString()} MAD</td>
                <td className="p-3"><StatusBadge status={d.status} /></td>
                <td className="p-3 text-right">
                  <Select value={d.status} onValueChange={(status) => setStatus.mutate({ id: d._id, status })}>
                    <SelectTrigger className="w-[140px] h-8 ml-auto"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="held">held</SelectItem>
                      <SelectItem value="returned">returned</SelectItem>
                      <SelectItem value="deducted">deducted</SelectItem>
                    </SelectContent>
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
