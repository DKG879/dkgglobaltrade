const arcs = [
  { d: "M40,150 C120,60 260,60 340,120", label: "Guinea → Ningbo" },
  { d: "M60,220 C150,150 280,140 350,190", label: "Chile → Shanghai" },
  { d: "M30,110 C130,180 250,230 360,240", label: "Dubai → Zurich" },
];

const ports = [
  { x: 40, y: 150 },
  { x: 340, y: 120 },
  { x: 60, y: 220 },
  { x: 350, y: 190 },
  { x: 360, y: 240 },
];

/** Light 3D globe: rotating CSS sphere with animated freight routes layered on top. */
export function Globe({ className = "" }: { className?: string }) {
  return (
    <div className={`globe-scene relative aspect-square w-full ${className}`}>
      <div
        className="absolute inset-[8%] rounded-full opacity-70 blur-2xl"
        style={{ background: "var(--gradient-ocean)" }}
        aria-hidden
      />
      <div
        className="absolute inset-[8%] rounded-full border border-accent/40"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, color-mix(in oklab, var(--teal) 35%, transparent), color-mix(in oklab, var(--background) 88%, transparent) 62%)",
          boxShadow: "inset 0 0 60px color-mix(in oklab, var(--background) 80%, transparent)",
        }}
        aria-hidden
      />
      <div className="globe-sphere absolute inset-[8%]" aria-hidden>

        {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5].map((deg) => (
          <div key={deg} className="globe-ring" style={{ transform: `rotateY(${deg}deg)` }} />
        ))}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const scale = Math.cos((lat * Math.PI) / 180);
          return (
            <div
              key={lat}
              className="globe-ring"
              style={{
                transform: `rotateX(90deg) translateZ(${-lat * 1.6}px) scale(${scale})`,
                borderColor: "color-mix(in oklab, var(--gold) 22%, transparent)",
              }}
            />
          );
        })}
      </div>

      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Animated globe showing international commodity freight routes"
      >
        {arcs.map((arc) => (
          <g key={arc.d}>
            <path d={arc.d} fill="none" stroke="var(--gold)" strokeWidth="1.2" opacity="0.35" />
            <path
              d={arc.d}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="2"
              className="route-dash"
              opacity="0.9"
            />
          </g>
        ))}
        {ports.map((p) => (
          <g key={`${p.x}-${p.y}`}>
            <circle cx={p.x} cy={p.y} r="7" fill="var(--teal)" opacity="0.18" />
            <circle cx={p.x} cy={p.y} r="3" fill="var(--gold)" />
          </g>
        ))}
      </svg>
    </div>
  );
}
