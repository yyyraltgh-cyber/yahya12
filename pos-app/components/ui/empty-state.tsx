import { Card } from "@/components/ui/card";

export function EmptyState({ message }: { message: string }) {
  return (
    <Card className="text-center text-sm text-[var(--color-text-muted)]">
      {message}
    </Card>
  );
}
