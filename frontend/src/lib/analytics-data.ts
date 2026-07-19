export const documentsUploadedTrend = [
  { month: "Dec", pdf: 210, docx: 40, image: 90, txt: 20 },
  { month: "Jan", pdf: 260, docx: 55, image: 110, txt: 25 },
  { month: "Feb", pdf: 300, docx: 70, image: 140, txt: 30 },
  { month: "Mar", pdf: 280, docx: 65, image: 120, txt: 28 },
  { month: "Apr", pdf: 340, docx: 80, image: 160, txt: 35 },
  { month: "May", pdf: 390, docx: 95, image: 190, txt: 40 },
  { month: "Jun", pdf: 430, docx: 110, image: 210, txt: 45 },
  { month: "Jul", pdf: 470, docx: 120, image: 230, txt: 50 },
];

export type HealthBand = "Healthy" | "Watch" | "Critical";

export function healthBand(score: number): HealthBand {
  if (score >= 75) return "Healthy";
  if (score >= 50) return "Watch";
  return "Critical";
}

export const equipmentHealth = [
  { equipment: "Conveyor CV-9", score: 95 },
  { equipment: "Boiler B-3", score: 90 },
  { equipment: "Pump P-204", score: 82 },
  { equipment: "Motor M-11", score: 76 },
  { equipment: "Generator G-5", score: 67 },
  { equipment: "Compressor C-12", score: 58 },
  { equipment: "Turbine T-7", score: 41 },
  { equipment: "Chiller CH-2", score: 34 },
].map((e) => ({ ...e, band: healthBand(e.score) }));

export const failureCategories = [
  { category: "Bearing Failure", count: 34 },
  { category: "Vibration", count: 28 },
  { category: "Corrosion", count: 19 },
  { category: "Overheating", count: 15 },
  { category: "Seal Failure", count: 11 },
  { category: "Misalignment", count: 9 },
  { category: "Other", count: 7 },
];

export const complianceScoreTrend = [
  { week: "W1", score: 62 },
  { week: "W2", score: 65 },
  { week: "W3", score: 70 },
  { week: "W4", score: 68 },
  { week: "W5", score: 74 },
  { week: "W6", score: 79 },
  { week: "W7", score: 83 },
  { week: "W8", score: 87 },
];

export const COMPLIANCE_TARGET = 85;

export type MaintenanceStatus = "Completed" | "Scheduled" | "Overdue";

export const recentMaintenance: {
  date: string;
  equipment: string;
  type: string;
  engineer: string;
  status: MaintenanceStatus;
}[] = [
  { date: "Jul 14, 2026", equipment: "Compressor C-12", type: "Lubrication", engineer: "S. Rao", status: "Completed" },
  { date: "Jul 12, 2026", equipment: "Turbine T-7", type: "Emergency Repair", engineer: "A. Khan", status: "Completed" },
  { date: "Jul 10, 2026", equipment: "Chiller CH-2", type: "Inspection", engineer: "M. Fernandes", status: "Overdue" },
  { date: "Jul 08, 2026", equipment: "Pump P-204", type: "Calibration", engineer: "S. Rao", status: "Completed" },
  { date: "Jul 05, 2026", equipment: "Generator G-5", type: "Overhaul", engineer: "A. Khan", status: "Scheduled" },
  { date: "Jul 02, 2026", equipment: "Boiler B-3", type: "Routine Inspection", engineer: "M. Fernandes", status: "Completed" },
];