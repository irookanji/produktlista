type IconProps = {
  readonly className?: string;
};

export const ChecklistIcon = ({ className = "size-icon" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <rect
      x="5"
      y="5"
      width="14"
      height="14"
      rx="3"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M8.5 12.2 11 14.7 15.5 9.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CartIcon = ({ className = "size-icon" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M6 7h2l1.5 9h8l1.8-6H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10.5" cy="18.5" r="1.2" fill="currentColor" />
    <circle cx="16.5" cy="18.5" r="1.2" fill="currentColor" />
  </svg>
);

export const EmptyCartIcon = ({ className = "size-empty-icon" }: IconProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 88 88"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="32" cy="72" r="5" fill="currentColor" stroke="none" />
    <circle cx="64" cy="72" r="5" fill="currentColor" stroke="none" />
    <path d="M16 24h8l8 36h32l8-24H30" />
    <path d="M28 24c2-8 8-14 16-14" />
  </svg>
);

export const DownloadIcon = ({ className = "size-icon" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M12 4v10m0 0-3.5-3.5M12 14l3.5-3.5M6 18h12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ShareIcon = ({ className = "size-icon" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M12 15V4m0 0-3.5 3.5M12 4l3.5 3.5M6 11v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PlusIcon = ({ className = "size-icon" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const CheckIcon = ({ className = "size-icon-sm" }: IconProps) => (
  <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
    <path
      d="M3.5 8.2 6.4 11.2 12.5 4.8"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CloseIcon = ({ className = "size-icon-sm" }: IconProps) => (
  <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
    <path
      d="M4 4l8 8M12 4l-8 8"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

export const GripIcon = ({ className = "size-icon-sm" }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="6" cy="3.5" r="1.15" />
    <circle cx="10" cy="3.5" r="1.15" />
    <circle cx="6" cy="8" r="1.15" />
    <circle cx="10" cy="8" r="1.15" />
    <circle cx="6" cy="12.5" r="1.15" />
    <circle cx="10" cy="12.5" r="1.15" />
  </svg>
);

export const SunIcon = ({ className = "size-icon" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const MoonIcon = ({ className = "size-icon" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const DeviceIcon = ({ className = "size-icon" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <rect
      x="7"
      y="3"
      width="10"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M10 18h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
