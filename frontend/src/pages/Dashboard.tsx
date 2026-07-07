import { StatCards } from "@/components/dashboard/Statcards";
import { RecentActivityPanel } from "@/components/dashboard/RecentActivityPanel";
import { UploadStatusCard } from "@/components/dashboard/UploadStatusCard";
import { CopilotQuickAccess } from "@/components/dashboard/CopilotQuickAccess";
import { AnalyticsPanels } from "@/components/dashboard/AnalyticsPanel";

export function Dashboard() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Unified overview of plant assets, documents, and operational intelligence.
        </p>
      </div>

      <StatCards />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CopilotQuickAccess />
        </div>
        <UploadStatusCard />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AnalyticsPanels />
        </div>
        <RecentActivityPanel />
      </div>
    </div>
  );
}