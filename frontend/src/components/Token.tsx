const colorMap: Record<string, string> = {
  green: "bg-ludo-green",
  yellow: "bg-ludo-yellow",
  red: "bg-ludo-red",
  blue: "bg-ludo-blue"
};

const imageMap: Record<string, string> = {
  red: "/counter_design/red_counter.svg",
  blue: "/counter_design/blue_counter.svg",
  green: "/counter_design/green_counter.svg",
  yellow: "/counter_design/yellow_counter.svg",
};

interface TokenProps {
  color: "green" | "yellow" | "red" | "blue";
  label: string;
  /** Use smaller size on board */
  small?: boolean;
}

export default function Token({ color, label, small }: TokenProps) {
  const size = small ? "h-full w-full" : "h-10 w-10";
  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full ${size} ${colorMap[color]}`}
      style={{
        boxShadow:
          "0 7px 10px rgba(0,0,0,0.35), 0 2px 0 rgba(255,255,255,0.35) inset, 0 -4px 0 rgba(0,0,0,0.28) inset",
      }}
      aria-label={label}
    >
      <span className="absolute inset-0 rounded-full ring-2 ring-white/65" />
      <span className="absolute inset-[7%] rounded-full border border-black/25 bg-white/12" />
      <span className="absolute left-[18%] top-[14%] h-[28%] w-[42%] rotate-[-18deg] rounded-full bg-white/40 blur-[0.5px]" />
      <span className="absolute bottom-[10%] h-[26%] w-[72%] rounded-full bg-black/20 blur-[1px]" />
      <img
        src={imageMap[color]}
        alt={`${color} counter`}
        className="relative z-10 h-[74%] w-[74%] rounded-full object-cover shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
        draggable={false}
      />
    </span>
  );
}
