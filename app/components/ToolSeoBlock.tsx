export function ToolSeoBlock({
  title,
  answer,
  steps,
  center,
  className,
}: {
  title: string;
  answer?: string;
  steps: string[];
  center?: boolean;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2
        className={`text-2xl font-bold tracking-tight text-foreground${center ? " text-center" : ""}`}
      >
        {title}
      </h2>
      <div className="mt-6 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        {answer && (
          <p className="text-[15px] leading-relaxed text-muted-foreground">{answer}</p>
        )}
        <ol className={answer ? "mt-4 space-y-3" : "space-y-3"}>
          {steps.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
