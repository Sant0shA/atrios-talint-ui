// ─── ICON ─────────────────────────────────────────────────────────────────────
// Wrapper for Google Material Symbols Outlined
// Usage: <Icon n="search" size={20} color="#fff" />

export default function Icon({ n, size = 20, color, style: st = {} }) {
  return (
    <span
      className="ms"
      style={{ fontSize: size, color: color || "inherit", ...st }}
    >
      {n}
    </span>
  );
}
