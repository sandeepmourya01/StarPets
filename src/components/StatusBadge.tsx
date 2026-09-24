const LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] ?? status}</span>;
}
