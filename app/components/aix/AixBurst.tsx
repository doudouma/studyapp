/** 星芒图形：16 条放射线 + 中心点，AIX 设计系统的装饰元素 */
export function AixBurst({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <g key={i} transform={`rotate(${(i * 360) / 16} 50 50)`}>
          <line x1="50" y1="6" x2="50" y2="34" />
          <line x1="50" y1="66" x2="50" y2="94" />
        </g>
      ))}
      <circle cx="50" cy="50" r="4" />
    </svg>
  );
}
