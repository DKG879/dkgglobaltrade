export const companyTypes = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "producer", label: "Producer" },
  { value: "mine", label: "Mine" },
  { value: "refinery", label: "Refinery" },
  { value: "trader", label: "Trader" },
  { value: "broker", label: "Broker" },
  { value: "mandate", label: "Mandate" },
  { value: "inspector", label: "Inspection company" },
  { value: "logistics", label: "Logistics / freight" },
  { value: "bank", label: "Bank / trade finance" },
  { value: "other", label: "Other" },
] as const;

export const companyRoles = companyTypes.filter((t) => t.value !== "other");

export const companyStatuses = [
  { value: "active", label: "Active" },
  { value: "prospect", label: "Prospect" },
  { value: "dormant", label: "Dormant" },
  { value: "archived", label: "Archived" },
] as const;

export const riskLevels = [
  { value: "unknown", label: "Unknown" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export const verificationStatuses = [
  { value: "not_reviewed", label: "Not reviewed" },
  { value: "received", label: "Documents received" },
  { value: "under_review", label: "Under review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
] as const;

export const commoditySides = [
  { value: "buy", label: "Buys" },
  { value: "sell", label: "Sells" },
  { value: "both", label: "Buys & sells" },
] as const;

export function labelOf(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string | null | undefined,
) {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

export const verificationTone: Record<string, string> = {
  not_reviewed: "border-border text-muted-foreground",
  received: "border-accent/50 text-accent",
  under_review: "border-accent/50 text-accent",
  verified: "border-primary/50 text-primary",
  rejected: "border-destructive/60 text-destructive",
  expired: "border-destructive/60 text-destructive",
};

export const riskTone: Record<string, string> = {
  unknown: "border-border text-muted-foreground",
  low: "border-primary/50 text-primary",
  medium: "border-accent/50 text-accent",
  high: "border-destructive/60 text-destructive",
};
