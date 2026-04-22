import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Package } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Equipment {
  _id: string; reference: string; nom: string; description?: string;
  prixJournalier: number; cautionDefaut: number; stockTotal: number; stockDisponible: number;
}
interface Unit { _id: string; serialNumber: string; status: string; equipment: any; }

export default function Equipments() {
  const qc = useQueryClient();
  const [openEq, setOpenEq] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const [eqForm, setEqForm] = useState<any>({ reference: "", nom: "", prixJournalier: 0, cautionDefaut: 0, stockTotal: 0 });
  const [unitForm, setUnitForm] = useState<any>({ equipment: "", serialNumber: "" });

  const { data: equipments = [] } = useQuery<Equipment[]>({
    queryKey: ["equipments"],
    queryFn: async () => (await api.get("/equipments")).data,
  });
  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: async () => (await api.get("/units")).data,
  });

  const saveEq = useMutation({
    mutationFn: async (p: any) => (await api.post("/equipments", p)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["equipments"] }); setOpenEq(false); toast({ title: "Équipement créé" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.response?.data?.message, variant: "destructive" }),
  });
  const saveUnit = useMutation({
    mutationFn: async (p: any) => (await api.post("/units", p)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["units"] });
      qc.invalidateQueries({ queryKey: ["equipments"] });
      setOpenUnit(false); toast({ title: "Unité ajoutée" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e?.response?.data?.message, variant: "destructive" }),
  });

  return (
    <div>
      <PageHeader
        title="Équipements & stock"
        description="Catalogue et unités physiques (numéros de série)"
        actions={
          <div className="flex gap-2">
            <Dialog open={openUnit} onOpenChange={setOpenUnit}>
              <DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-2" />Ajouter une unité</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nouvelle unité</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); saveUnit.mutate(unitForm); }} className="space-y-3">
                  <div>
                    <Label>Équipement</Label>
                    <Select value={unitForm.equipment} onValueChange={(v) => setUnitForm({ ...unitForm, equipment: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                      <SelectContent>{equipments.map(e => <SelectItem key={e._id} value={e._id}>{e.nom}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Numéro de série</Label><Input required value={unitForm.serialNumber} onChange={(e) => setUnitForm({ ...unitForm, serialNumber: e.target.value })} /></div>
                  <DialogFooter><Button type="submit" disabled={saveUnit.isPending}>Enregistrer</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={openEq} onOpenChange={setOpenEq}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvel équipement</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nouvel équipement</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); saveEq.mutate(eqForm); }} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Référence</Label><Input required value={eqForm.reference} onChange={(e) => setEqForm({ ...eqForm, reference: e.target.value })} /></div>
                    <div><Label>Nom</Label><Input required value={eqForm.nom} onChange={(e) => setEqForm({ ...eqForm, nom: e.target.value })} /></div>
                  </div>
                  <div><Label>Description</Label><Textarea value={eqForm.description || ""} onChange={(e) => setEqForm({ ...eqForm, description: e.target.value })} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Prix/jour</Label><Input type="number" min="0" required value={eqForm.prixJournalier} onChange={(e) => setEqForm({ ...eqForm, prixJournalier: Number(e.target.value) })} /></div>
                    <div><Label>Caution</Label><Input type="number" min="0" value={eqForm.cautionDefaut} onChange={(e) => setEqForm({ ...eqForm, cautionDefaut: Number(e.target.value) })} /></div>
                    <div><Label>Stock initial</Label><Input type="number" min="0" value={eqForm.stockTotal} onChange={(e) => setEqForm({ ...eqForm, stockTotal: Number(e.target.value) })} /></div>
                  </div>
                  <DialogFooter><Button type="submit" disabled={saveEq.isPending}>Enregistrer</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {equipments.map((e) => (
          <Card key={e._id} className="p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent grid place-items-center"><Package className="h-5 w-5 text-primary" /></div>
              <div className="flex-1">
                <div className="font-medium">{e.nom}</div>
                <div className="text-xs text-muted-foreground">{e.reference}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 text-center text-sm">
              <div><div className="font-semibold">{e.stockDisponible}</div><div className="text-xs text-muted-foreground">Dispo</div></div>
              <div><div className="font-semibold">{e.stockTotal}</div><div className="text-xs text-muted-foreground">Total</div></div>
              <div><div className="font-semibold">{e.prixJournalier}</div><div className="text-xs text-muted-foreground">MAD/j</div></div>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">Unités</h2>
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr className="text-left">
              <th className="p-3 font-medium">N° série</th>
              <th className="p-3 font-medium">Équipement</th>
              <th className="p-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {units.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Aucune unité</td></tr>
            ) : units.map((u) => (
              <tr key={u._id} className="hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">{u.serialNumber}</td>
                <td className="p-3">{u.equipment?.nom}</td>
                <td className="p-3"><StatusBadge status={u.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
