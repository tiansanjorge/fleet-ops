interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
