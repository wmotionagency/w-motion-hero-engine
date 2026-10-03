export function HeroCTA({
  label,
  href,
}: {
  label: string;
  href?: string;
}) {
  if (href) {
    return (
      <a
        className="hero-cta"
        href={href}
        aria-label={label}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
      >
        {label}
        <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <span className="hero-cta" aria-label={label}>
      {label}
      <span aria-hidden="true">↗</span>
    </span>
  );
}
