export const statCards = [
  { label: "Documents Ingested", value: "12,480", delta: "+8.2%", trend: "up" as const, icon: "FileStack" as const },
  { label: "Active Assets", value: "1,024", delta: "+1.4%", trend: "up" as const, icon: "Factory" as const },
  { label: "Open Compliance Gaps", value: "17", delta: "-5.0%", trend: "down" as const, icon: "ShieldAlert" as const },
  { label: "Avg. Copilot Response", value: "1.8s", delta: "-12.0%", trend: "down" as const, icon: "Bot" as const },
];

export const recentActivity = [
  { id: 1, actor: "S. Rao", action: "uploaded", target: "Turbine-7 Maintenance Manual v4.pdf", time: "3m ago", type: "upload" as const },
  { id: 2, actor: "AI Copilot", action: "resolved query on", target: "Boiler Feed Pump RCA", time: "18m ago", type: "ai" as const },
  { id: 3, actor: "M. Fernandes", action: "flagged compliance gap in", target: "SOP-2231 Confined Space Entry", time: "42m ago", type: "compliance" as const },
  { id: 4, actor: "System", action: "completed OCR pipeline for", target: "Plant B — 214 scanned records", time: "1h ago", type: "system" as const },
  { id: 5, actor: "A. Khan", action: "linked failure pattern to", target: "Compressor Unit C-12", time: "2h ago", type: "maintenance" as const },
  { id: 6, actor: "System", action: "ingested", target: "48 SCADA export logs", time: "3h ago", type: "upload" as const },
];

export const uploads = [
  { id: 1, name: "Turbine-7_Manual_v4.pdf", progress: 100, status: "complete" as const, size: "24.1 MB" },
  { id: 2, name: "Plant_B_Scans_Batch12.zip", progress: 64, status: "processing" as const, size: "312 MB" },
  { id: 3, name: "SCADA_Export_July.csv", progress: 100, status: "complete" as const, size: "8.4 MB" },
  { id: 4, name: "Inspection_Report_C12.docx", progress: 22, status: "processing" as const, size: "3.2 MB" },
  { id: 5, name: "Drawing_P&ID_Rev9.dwg", progress: 0, status: "queued" as const, size: "56 MB" },
];

export const ingestionTrend = [
  { month: "Feb", documents: 640 },
  { month: "Mar", documents: 890 },
  { month: "Apr", documents: 1120 },
  { month: "May", documents: 980 },
  { month: "Jun", documents: 1430 },
  { month: "Jul", documents: 1710 },
];

export const downtimeByCause = [
  { cause: "Missing Context", value: 34 },
  { cause: "Equipment Wear", value: 28 },
  { cause: "Human Error", value: 18 },
  { cause: "Supply Delay", value: 12 },
  { cause: "Other", value: 8 },
];

export const complianceScore = [
  { week: "W1", score: 78 },
  { week: "W2", score: 81 },
  { week: "W3", score: 79 },
  { week: "W4", score: 87 },
  { week: "W5", score: 92 },
  { week: "W6", score: 95 },
];

export const copilotSuggestions = [
  "Why did Compressor C-12 fail last quarter?",
  "Show me the latest SOP for confined space entry",
  "Which assets have overdue inspections?",
  "Summarize open compliance gaps in Plant B",
];