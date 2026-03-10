import { Apple, BookOpen, Dumbbell, Home, Target } from "lucide-react";

export type Tab = "home" | "study" | "gym" | "food" | "goals";

const tabs: {
  id: Tab;
  label: string;
  Icon: React.FC<{ size?: number; className?: string }>;
}[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "study", label: "Study", Icon: BookOpen },
  { id: "gym", label: "Gym", Icon: Dumbbell },
  { id: "food", label: "Food", Icon: Apple },
  { id: "goals", label: "Goals", Icon: Target },
];

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="max-w-[430px] mx-auto flex justify-around">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.tab`}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 px-3 flex-1 transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={20} className={isActive ? "green-text" : ""} />
              <span
                className={`text-[10px] tracking-wide font-medium ${isActive ? "green-text" : ""}`}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
