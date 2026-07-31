type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
  "aria-hidden"?: boolean;
};

/**
 * Google Material Symbols glyph. Not an AI-generated icon set —
 * loaded from Google Fonts and rendered as text via ligature.
 */
export function Icon({ name, className, filled = false, ...rest }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className ?? ""}`}
      style={filled ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
      aria-hidden={rest["aria-hidden"] ?? true}
    >
      {name}
    </span>
  );
}
