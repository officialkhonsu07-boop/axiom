import { Switch } from "@/components/ui/switch";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  useDailyGoals,
  useGymActivities,
  useNutritionEntries,
  useStudyTopics,
  useUpdateDailyGoals,
} from "../hooks/useQueries";

interface GoalsPageProps {
  userId: string;
}

interface GoalCardProps {
  label: string;
  description: string;
  color: string;
  checked: boolean;
  auto?: boolean;
  onToggle?: () => void;
  ocid: string;
}

function GoalCard({
  label,
  description,
  color,
  checked,
  auto,
  onToggle,
  ocid,
}: GoalCardProps) {
  return (
    <div
      className="rounded-xl border bg-card p-4 flex items-center gap-4"
      style={{
        borderColor: `${color}40`,
        borderLeftColor: color,
        borderLeftWidth: "3px",
      }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm tracking-wide" style={{ color }}>
            {label}
          </p>
          {auto && (
            <span
              className="text-[9px] font-bold tracking-widest uppercase rounded px-1 py-0.5"
              style={{ background: `${color}20`, color }}
            >
              AUTO-TRACKED
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch
        data-ocid={ocid}
        checked={checked}
        onCheckedChange={auto ? undefined : onToggle}
        disabled={auto}
        className={checked ? "data-[state=checked]:bg-primary" : ""}
      />
    </div>
  );
}

export default function GoalsPage({ userId }: GoalsPageProps) {
  const { data: goals, isLoading } = useDailyGoals(userId);
  const updateGoals = useUpdateDailyGoals(userId);
  const { data: topics = [] } = useStudyTopics(userId);
  const { data: gymActivities = [] } = useGymActivities(userId);
  const { data: nutritionEntries = [] } = useNutritionEntries(userId);

  const studyDone = topics.filter((t) => t.status === "done").length > 0;
  const gymDone =
    gymActivities.reduce((s, a) => s + Number(a.estimatedCalories), 0) > 0;
  const nutritionDone = nutritionEntries.length > 0;
  const sleepDone = goals?.sleepDone ?? false;
  const nmbDone = goals?.nmbDone ?? false;
  const schoolDone = goals?.schoolDone ?? false;

  const completed = [
    studyDone,
    gymDone,
    nutritionDone,
    sleepDone,
    nmbDone,
  ].filter(Boolean).length;
  const progressPct = (completed / 5) * 100;

  const toggle = async (field: "sleepDone" | "nmbDone" | "schoolDone") => {
    const current = goals ?? {
      sleepDone: false,
      nmbDone: false,
      schoolDone: false,
    };
    const updated = { ...current, [field]: !current[field] };
    await updateGoals.mutateAsync(updated);
    toast.success(
      `${field === "sleepDone" ? "Sleep" : field === "nmbDone" ? "NMB" : "School"} toggled!`,
    );
  };

  if (isLoading)
    return (
      <div
        data-ocid="goals.loading_state"
        className="flex items-center justify-center py-20 text-muted-foreground text-sm"
      >
        Loading...
      </div>
    );

  const progressColor =
    progressPct < 40
      ? "oklch(0.62 0.22 25)"
      : progressPct < 80
        ? "oklch(0.75 0.18 60)"
        : "oklch(0.85 0.29 142)";

  return (
    <div className="pb-24 px-4 space-y-4">
      {/* Header */}
      <div className="pt-4">
        <h2 className="text-xl font-black tracking-widest uppercase">
          Daily Goals
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {completed}/5 completed today
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{completed} done</span>
          <span>{5 - completed} remaining</span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: progressColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Goal cards */}
      <div className="space-y-2">
        <GoalCard
          ocid="goals.study.switch"
          label="Study"
          description={
            studyDone
              ? `${topics.filter((t) => t.status === "done").length} topics completed`
              : "Complete at least one topic"
          }
          color="oklch(0.65 0.22 293)"
          checked={studyDone}
          auto
        />
        <GoalCard
          ocid="goals.gym.switch"
          label="Gym"
          description={
            gymDone
              ? `${gymActivities.reduce((s, a) => s + Number(a.estimatedCalories), 0)} kcal burned`
              : "Log a workout session"
          }
          color="oklch(0.65 0.22 25)"
          checked={gymDone}
          auto
        />
        <GoalCard
          ocid="goals.nutrition.switch"
          label="Nutrition"
          description={
            nutritionDone
              ? `${nutritionEntries.length} meals logged`
              : "Log your daily nutrition"
          }
          color="oklch(0.85 0.29 142)"
          checked={nutritionDone}
          auto
        />
        <GoalCard
          ocid="goals.sleep.switch"
          label="Sleep"
          description="7+ hours of recovery sleep"
          color="oklch(0.65 0.18 230)"
          checked={sleepDone}
          onToggle={() => toggle("sleepDone")}
        />
        <GoalCard
          ocid="goals.nmb.switch"
          label="NMB"
          description="Daily discipline toggle"
          color="oklch(0.75 0.18 60)"
          checked={nmbDone}
          onToggle={() => toggle("nmbDone")}
        />
      </div>

      {/* School toggle */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">Did you go to school today?</p>
            <p className="text-xs text-muted-foreground mt-0.5 green-text">
              Adds 1700 kcal burned
            </p>
          </div>
          <Switch
            data-ocid="goals.school.switch"
            checked={schoolDone}
            onCheckedChange={() => toggle("schoolDone")}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      {/* Perfect day celebration */}
      {completed === 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border p-5 text-center"
          style={{
            borderColor: "oklch(0.85 0.29 142 / 0.6)",
            background: "oklch(0.85 0.29 142 / 0.08)",
            boxShadow: "0 0 24px oklch(0.85 0.29 142 / 0.2)",
          }}
        >
          <p className="text-2xl mb-2">🔥</p>
          <p className="font-black text-lg tracking-wider green-text">
            PERFECT DAY
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            All goals completed. Keep the streak alive!
          </p>
        </motion.div>
      )}
    </div>
  );
}
