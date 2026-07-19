import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { recentMaintenance, type MaintenanceStatus } from "@/lib/analytics-data";

const STATUS_VARIANT: Record<MaintenanceStatus, "success" | "accent" | "critical"> = {
  Completed: "success",
  Scheduled: "accent",
  Overdue: "critical",
};

export function RecentMaintenanceTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Maintenance</CardTitle>
        <CardDescription>Latest maintenance activity across all assets</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-6 py-2 font-medium">Date</th>
                <th className="px-6 py-2 font-medium">Equipment</th>
                <th className="px-6 py-2 font-medium">Type</th>
                <th className="px-6 py-2 font-medium">Engineer</th>
                <th className="px-6 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentMaintenance.map((row, idx) => (
                <tr key={idx} className="hover:bg-secondary/40">
                  <td className="whitespace-nowrap px-6 py-3 text-muted-foreground">{row.date}</td>
                  <td className="whitespace-nowrap px-6 py-3 font-medium text-foreground">
                    {row.equipment}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-muted-foreground">{row.type}</td>
                  <td className="whitespace-nowrap px-6 py-3 text-muted-foreground">{row.engineer}</td>
                  <td className="whitespace-nowrap px-6 py-3">
                    <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}