interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function PanelHeader({ title, subtitle, onClose }: PanelHeaderProps) {
  return (
    <div className="flex items-start justify-between border-b border-border pb-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-medium text-foreground">{title}</span>
        {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
      </div>
      <button
        onClick={onClose}
        aria-label="Close panel"
        className="ml-4 cursor-pointer rounded-md p-1 text-muted transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 3l10 10M13 3L3 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
