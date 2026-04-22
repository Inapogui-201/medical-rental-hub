import { Badge } from "@/components/ui/badge";

const map: Record<string, { label: string; cls: string }> = {
  pending:   { label: "En attente",  cls: "bg-muted text-muted-foreground" },
  confirmed: { label: "Confirmée",   cls: "bg-accent text-accent-foreground" },
  active:    { label: "Active",      cls: "bg-success/15 text-success border border-success/30" },
  ended:     { label: "Terminée",    cls: "bg-secondary text-secondary-foreground" },
  cancelled: { label: "Annulée",     cls: "bg-destructive/10 text-destructive border border-destructive/30" },
  available: { label: "Disponible",  cls: "bg-success/15 text-success border border-success/30" },
  rented:    { label: "Louée",       cls: "bg-warning/15 text-warning border border-warning/30" },
  maintenance:{label: "Maintenance", cls: "bg-muted text-muted-foreground" },
  lost:      { label: "Perdue",      cls: "bg-destructive/10 text-destructive border border-destructive/30" },
  held:      { label: "Retenue",     cls: "bg-warning/15 text-warning border border-warning/30" },
  returned:  { label: "Restituée",   cls: "bg-success/15 text-success border border-success/30" },
  deducted:  { label: "Déduite",     cls: "bg-destructive/10 text-destructive border border-destructive/30" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = map[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return <Badge className={`${s.cls} font-normal`}>{s.label}</Badge>;
}
