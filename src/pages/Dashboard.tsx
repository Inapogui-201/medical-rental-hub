import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface Summary {
  activeOrders: number;
  stockDispo: number;
  stockTotal: number;
  revenueMonth: number;
  endingSoon: any[];
}

export default function Dashboard() {
  const { data, isLoading } = useQuery<Summary>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => (await api.get("/dashboard/summary")).data,
  });

  const cards = [
    { label: "Locations actives", value: data?.activeOrders ?? "—", icon: Activity, color: "text-primary" },
    { label: "Stock disponible", value: `${data?.stockDispo ?? 0} / ${data?.stockTotal ?? 0}`, icon: Package, color: "text-success" },
    { label: "CA du mois", value: `${(data?.revenueMonth ?? 0).toLocaleString()} MAD`, icon: TrendingUp, color: "text-warning" },
  ];

  return (
    <div>
      <PageHeader title="Tableau de bord" description="Vue d'ensemble des opérations" />
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent grid place-items-center">
                <c.icon className={`h-6 w-6 ${c.color}`} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
                <div className="text-2xl font-semibold">{isLoading ? "…" : c.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Locations se terminant bientôt (≤ 3 jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.endingSoon?.length ? (
            <p className="text-sm text-muted-foreground">Aucune alerte.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.endingSoon.map((o: any) => (
                <div key={o._id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{o.client?.nom}</div>
                    <div className="text-muted-foreground text-xs">{o.equipment?.nom} · {o.reference}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{format(new Date(o.endDate), "dd/MM/yyyy")}</div>
                    <div className="text-xs text-muted-foreground">{o.client?.telephone}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
