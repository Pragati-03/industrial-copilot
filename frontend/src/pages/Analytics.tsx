import { AnalyticsSummary } from "@/components/analytics/AnalyticsSummary";
import { DocumentsUploadedChart } from "@/components/analytics/DocumentsUploadedChart";
import { EquipmentHealthChart } from "@/components/analytics/EquipmentHealthChart";
import { FailureCategoriesChart } from "@/components/analytics/FailureCategoriesChart";
import { ComplianceScoreTrendChart } from "@/components/analytics/ComplianceScoreTrendChart";
import { RecentMaintenanceTable } from "@/components/analytics/RecentMaintenanceTable";

export function Analytics() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cross-platform trends: ingestion volume, asset health, failure patterns, and compliance.
        </p>
      </div>

      <AnalyticsSummary />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DocumentsUploadedChart />
        <EquipmentHealthChart />
        <FailureCategoriesChart />
        <ComplianceScoreTrendChart />
      </div>

      <RecentMaintenanceTable />
    </div>
  );
}