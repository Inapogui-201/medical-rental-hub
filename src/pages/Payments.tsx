import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Payments() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ order: "", amount: 0, method: "cash", notes: "" });
  const [receipt, setReceipt] = useState<any>(null);

  const { data: payments = [] } = useQuery<any[]>({ queryKey: ["payments"], queryFn: async () => (await api.get("/payments")).data });
  const { data: orders = [] } = useQuery<any[]>({ queryKey: ["orders"], queryFn: async () => (await api.get("/orders")).data });

  const create = useMutation({
    mutationFn: async (p: any) => (await api.post("/payments", p)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payments"] }); setOpen(false); toast({ title: "Paiement enregistré" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.response?.data?.message, variant: "destructive" }),
  });

  const showReceipt = async (id: string) => {
    const { data } = await api.get(`/payments/${id}/receipt`);
    setReceipt(data);
  };

  return (
    <div>
      <PageHeader
        title="Paiements"
        description="Enregistrer les paiements et générer les reçus"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouveau paiement</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouveau paiement</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-3">
                <div>
                  <Label>Commande</Label>
                  <Select value={form.order} onValueChange={(v) => setForm({ ...form, order: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                    <SelectContent>{orders.map((o: any) => <SelectItem key={o._id} value={o._id}>{o.reference} — {o.client?.nom}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Montant (MAD)</Label><Input type="number" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
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
              <th className="p-3 font-medium">Reçu</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Commande</th>
              <th className="p-3 font-medium">Montant</th>
              <th className="p-3 font-medium">Mode</th>
              <th className="p-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Aucun paiement</td></tr>
            ) : payments.map((p: any) => (
              <tr key={p._id} className="hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">{p.reference}</td>
                <td className="p-3">{format(new Date(p.createdAt), "dd/MM/yy HH:mm")}</td>
                <td className="p-3">{p.order?.reference} — {p.order?.client?.nom}</td>
                <td className="p-3 font-medium">{p.amount.toLocaleString()} MAD</td>
                <td className="p-3 capitalize">{p.method}</td>
                <td className="p-3 text-right">
                  <Button variant="outline" size="sm" onClick={() => showReceipt(p._id)}><Receipt className="h-4 w-4 mr-1" />Reçu</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={!!receipt} onOpenChange={() => setReceipt(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reçu de paiement</DialogTitle></DialogHeader>
          {receipt && (
            <div className="space-y-2 text-sm font-mono bg-muted/40 p-4 rounded-md">
              <div>N° reçu : <b>{receipt.receiptNumber}</b></div>
              <div>Date : {format(new Date(receipt.date), "dd/MM/yyyy HH:mm")}</div>
              <div>Client : {receipt.client}</div>
              <div>Équipement : {receipt.equipment}</div>
              <div>Commande : {receipt.orderRef}</div>
              <div>Mode : {receipt.method}</div>
              <div className="pt-2 border-t border-border text-base">Montant : <b>{receipt.amount.toLocaleString()} MAD</b></div>
              <div className="text-xs text-muted-foreground pt-2">Reçu par : {receipt.receivedBy}</div>
            </div>
          )}
          <DialogFooter><Button onClick={() => window.print()} variant="outline">Imprimer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
