export function HeroCTA({ label }: { label: string }) {
  return (
    <span className="hero-cta" aria-label={label}>
      {label}
      <span aria-hidden="true">↗</span>
    </span>
  );
}
