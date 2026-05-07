interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="text-sm text-zinc-400 dark:text-zinc-500">{message}</p>
    </div>
  );
}
