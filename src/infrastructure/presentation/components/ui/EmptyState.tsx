interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
}

export function EmptyState({ emoji, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <h2 className="text-white text-xl font-semibold mb-2">{title}</h2>
      <p className="text-zinc-400 max-w-sm">{message}</p>
    </div>
  );
}
