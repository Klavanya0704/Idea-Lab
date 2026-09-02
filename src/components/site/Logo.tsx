export function ToothIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.2c-1.5 0-2.2.7-3.6.7-1 0-1.6-.5-2.7-.2C4 4.2 3 6.1 3 8.6c0 2.3.7 3.6 1.3 5.4.5 1.5.6 3 .9 4.6.2 1.2.7 2.2 1.7 2.2 1.1 0 1.4-1.1 1.7-2.6.3-1.6.5-3.4 1.6-4.2.5-.4 1.1-.5 1.8-.5s1.3.1 1.8.5c1.1.8 1.3 2.6 1.6 4.2.3 1.5.6 2.6 1.7 2.6 1 0 1.5-1 1.7-2.2.3-1.6.4-3.1.9-4.6.6-1.8 1.3-3.1 1.3-5.4 0-2.5-1-4.4-2.7-4.9-1.1-.3-1.7.2-2.7.2-1.4 0-2.1-.7-3.6-.7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <a href="#home" className="flex min-w-0 items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-white shadow-soft">
        <ToothIcon className="h-6 w-6" />
      </span>
      <span className="min-w-0 leading-none">
        <span className="block truncate text-[1.15rem] font-bold tracking-tight text-foreground">
          SmileCare
        </span>
        <span className="mt-1 block truncate text-[0.6rem] font-semibold tracking-[0.22em] text-muted-foreground">
          DENTAL HOSPITAL
        </span>
      </span>
    </a>
  );
}
