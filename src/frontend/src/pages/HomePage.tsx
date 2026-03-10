import { Flame, LogOut, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  useDailyGoals,
  useGymActivities,
  useMeasurements,
  useNutritionEntries,
  useStreak,
  useStudyTopics,
} from "../hooks/useQueries";

interface HomePageProps {
  userId: string;
  userName: string;
  onLogout: () => void;
}

function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function daysBetween(dateStr: string): number {
  if (!dateStr) return 999;
  const past = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24));
}

export default function HomePage({
  userId,
  userName,
  onLogout,
}: HomePageProps) {
  const time = useClock();
  const { data: topics = [] } = useStudyTopics(userId);
  const { data: gymActivities = [] } = useGymActivities(userId);
  const { data: nutritionEntries = [] } = useNutritionEntries(userId);
  const { data: streakRaw } = useStreak(userId);
  const { data: measurements } = useMeasurements(userId);
  const { data: goals } = useDailyGoals(userId);

  const streak = streakRaw ? Number(streakRaw) : 0;

  const topicsDone = topics.filter((t) => t.status === "done").length;
  const topicsPending = topics.filter((t) => t.status === "pending").length;
  const topicsTotal = topics.length;

  const gymCalories = gymActivities.reduce(
    (s, a) => s + Number(a.estimatedCalories),
    0,
  );
  const musclesTrained =
    [
      ...new Set(
        gymActivities.flatMap((a) =>
          a.muscleGroups.split(",").map((m) => m.trim()),
        ),
      ),
    ].join(", ") || "—";

  const nutritionCals = nutritionEntries.reduce(
    (s, e) => s + Number(e.estimatedCalories),
    0,
  );
  const nutritionProtein = nutritionEntries.reduce(
    (s, e) => s + Number.parseFloat(e.protein || "0"),
    0,
  );
  const nutritionSugar = nutritionEntries.reduce(
    (s, e) => s + Number.parseFloat(e.sugar || "0"),
    0,
  );

  const schoolDone = goals?.schoolDone ?? false;
  const schoolCalories = schoolDone ? 1700 : 0;
  const totalBurned = gymCalories + schoolCalories;
  const netCalories = nutritionCals - totalBurned;

  const studyGoal = topicsDone > 0;
  const gymGoal = gymCalories > 0;
  const nutritionGoal = nutritionEntries.length > 0;
  const sleepGoal = goals?.sleepDone ?? false;
  const nmbGoal = goals?.nmbDone ?? false;
  const goalsCompleted = [
    studyGoal,
    gymGoal,
    nutritionGoal,
    sleepGoal,
    nmbGoal,
  ].filter(Boolean).length;

  const weeklyDays = measurements?.weeklyMeasurementDate
    ? Math.max(0, 7 - daysBetween(measurements.weeklyMeasurementDate))
    : 7;
  const monthlyDays = measurements?.monthlyMeasurementDate
    ? Math.max(0, 30 - daysBetween(measurements.monthlyMeasurementDate))
    : 30;

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const card = "rounded-xl border border-border bg-card p-4 space-y-3";
  const statRow = "flex justify-between items-center";
  const label = "text-xs text-muted-foreground uppercase tracking-wider";
  const value = "font-mono font-bold text-foreground";

  return (
    <div className="pb-24 px-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <h1 className="text-2xl font-black tracking-[0.2em] green-text font-mono">
          AXIOM
        </h1>
        <div className="flex items-center gap-1">
          <Flame size={16} className="green-text" />
          <span className="font-mono font-bold text-sm green-text">
            {streak}
          </span>
          <span className="text-xs text-muted-foreground ml-1">days</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Hello, {userName.split(" ")[0]}
          </span>
          <button
            type="button"
            data-ocid="home.button"
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Clock */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-primary/30 bg-card p-4 text-center"
        style={{ boxShadow: "0 0 20px oklch(0.85 0.29 142 / 0.1)" }}
      >
        <p className="font-mono text-4xl font-black tracking-widest green-text">
          {pad(time.getHours())}:{pad(time.getMinutes())}:
          {pad(time.getSeconds())}
        </p>
        <p className="text-muted-foreground text-xs tracking-widest mt-1 uppercase">
          {dayNames[time.getDay()]} · {time.getDate()}{" "}
          {monthNames[time.getMonth()]} {time.getFullYear()}
        </p>
      </motion.div>

      {/* Alert badges */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2">
          <p className="text-[10px] text-yellow-400 uppercase tracking-wider">
            Weekly Result
          </p>
          <p className="font-mono text-sm font-bold text-yellow-300">
            {weeklyDays} days
          </p>
        </div>
        <div className="flex-1 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2">
          <p className="text-[10px] text-blue-400 uppercase tracking-wider">
            Monthly Baseline
          </p>
          <p className="font-mono text-sm font-bold text-blue-300">
            {monthlyDays} days
          </p>
        </div>
      </div>

      {/* Study card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={card}
        style={{ borderColor: "oklch(0.65 0.22 293 / 0.4)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "oklch(0.65 0.22 293)" }}
          />
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "oklch(0.65 0.22 293)" }}
          >
            Study
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className={`${value} text-xl green-text`}>{topicsDone}</p>
            <p className={label}>Done</p>
          </div>
          <div className="text-center">
            <p className={`${value} text-xl text-yellow-400`}>
              {topicsPending}
            </p>
            <p className={label}>Pending</p>
          </div>
          <div className="text-center">
            <p className={`${value} text-xl`}>{topicsTotal}</p>
            <p className={label}>Total</p>
          </div>
        </div>
      </motion.div>

      {/* Gym card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={card}
        style={{ borderColor: "oklch(0.65 0.22 25 / 0.4)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "oklch(0.65 0.22 25)" }}
          />
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "oklch(0.65 0.22 25)" }}
          >
            Gym
          </span>
        </div>
        <div className={statRow}>
          <span className={label}>Calories Burned</span>
          <span className={`${value} text-orange-400`}>{gymCalories} kcal</span>
        </div>
        <div className={statRow}>
          <span className={label}>Muscles Trained</span>
          <span className="font-mono text-xs text-foreground">
            {musclesTrained}
          </span>
        </div>
      </motion.div>

      {/* Nutrition card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={card}
        style={{ borderColor: "oklch(0.85 0.29 142 / 0.4)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-bold tracking-widest uppercase green-text">
            Nutrition
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className={`${value} text-lg green-text`}>{nutritionCals}</p>
            <p className={label}>kcal</p>
          </div>
          <div className="text-center">
            <p className={`${value} text-lg text-blue-400`}>
              {nutritionProtein.toFixed(1)}g
            </p>
            <p className={label}>protein</p>
          </div>
          <div className="text-center">
            <p className={`${value} text-lg text-pink-400`}>
              {nutritionSugar.toFixed(1)}g
            </p>
            <p className={label}>sugar</p>
          </div>
        </div>
      </motion.div>

      {/* Calorie burn breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={card}
      >
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-yellow-400" />
          <span className="text-xs font-bold tracking-widest uppercase text-yellow-400">
            Calorie Balance
          </span>
        </div>
        <div className={statRow}>
          <span className={label}>Gym Burn</span>
          <span className={`${value} text-orange-400`}>{gymCalories} kcal</span>
        </div>
        <div className={statRow}>
          <span className={label}>School Burn</span>
          <span
            className={`${value} ${schoolDone ? "text-green-400" : "text-muted-foreground"}`}
          >
            {schoolCalories} kcal
          </span>
        </div>
        <div className="border-t border-border pt-2">
          <div className={statRow}>
            <span className={label}>Total Burned</span>
            <span className={`${value} text-red-400`}>{totalBurned} kcal</span>
          </div>
          <div className={statRow}>
            <span className={label}>Net Calories</span>
            <span
              className={`${value} ${netCalories < 0 ? "green-text" : "text-red-400"}`}
            >
              {netCalories > 0 ? "+" : ""}
              {netCalories} kcal
            </span>
          </div>
        </div>
      </motion.div>

      {/* Goals summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={card}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
            Daily Goals
          </span>
          <span className="font-mono font-black text-xl green-text">
            {goalsCompleted}/5
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(goalsCompleted / 5) * 100}%`,
              background: `oklch(${0.5 + (goalsCompleted / 5) * 0.35} ${0.29 - (goalsCompleted / 5) * 0.05} ${142 - (goalsCompleted / 5) * 50})`,
            }}
          />
        </div>
        {goalsCompleted === 5 && (
          <p className="text-center text-xs green-text font-bold tracking-wider">
            ✓ All goals completed today!
          </p>
        )}
      </motion.div>
    </div>
  );
}
