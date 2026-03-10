import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { GymActivity } from "../backend.d";
import { useAddGymActivity, useGymActivities } from "../hooks/useQueries";
import { parseGymDescription } from "../lib/parsers";

interface GymPageProps {
  userId: string;
}

export default function GymPage({ userId }: GymPageProps) {
  const { data: activities = [], isLoading } = useGymActivities(userId);
  const addActivity = useAddGymActivity(userId);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");

  const totalCalories = activities.reduce(
    (s, a) => s + Number(a.estimatedCalories),
    0,
  );

  const handleSave = async () => {
    if (!description.trim()) {
      toast.error("Please describe your workout");
      return;
    }
    const parsed = parseGymDescription(description);
    const activity: GymActivity = {
      id: crypto.randomUUID(),
      description: description.trim(),
      estimatedCalories: BigInt(parsed.estimatedCalories),
      muscleGroups: parsed.muscleGroups,
      createdAt: new Date().toISOString(),
    };
    await addActivity.mutateAsync(activity);
    toast.success(`Logged! ~${parsed.estimatedCalories} kcal burned`);
    setShowModal(false);
    setDescription("");
  };

  return (
    <div className="pb-24 px-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-xl font-black tracking-widest uppercase">Gym</h2>
        <button
          type="button"
          data-ocid="gym.primary_button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tracking-wider bg-primary text-primary-foreground"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Total burn */}
      {activities.length > 0 && (
        <div
          className="rounded-xl border bg-card p-4 flex items-center justify-between"
          style={{ borderColor: "oklch(0.65 0.22 25 / 0.4)" }}
        >
          <div className="flex items-center gap-2">
            <Flame size={18} style={{ color: "oklch(0.65 0.22 25)" }} />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Total Burn Today
            </span>
          </div>
          <span
            className="font-mono font-black text-xl"
            style={{ color: "oklch(0.65 0.22 25)" }}
          >
            {totalCalories} kcal
          </span>
        </div>
      )}

      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        Today's Activities
      </p>

      {isLoading ? (
        <div
          data-ocid="gym.loading_state"
          className="text-center text-muted-foreground py-8 text-sm"
        >
          Loading...
        </div>
      ) : activities.length === 0 ? (
        <div
          data-ocid="gym.empty_state"
          className="text-center py-12 space-y-2"
        >
          <p className="text-muted-foreground text-sm">
            No activities logged yet
          </p>
          <p className="text-xs text-muted-foreground/60">
            Tap + to log your workout
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              data-ocid={`gym.item.${i + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-4"
              style={{
                borderLeftColor: "oklch(0.65 0.22 25 / 0.6)",
                borderLeftWidth: "3px",
              }}
            >
              <div className="flex justify-between items-start gap-3">
                <p className="text-sm text-foreground flex-1">
                  {activity.description}
                </p>
                <div className="text-right shrink-0">
                  <p
                    className="font-mono font-bold text-sm"
                    style={{ color: "oklch(0.65 0.22 25)" }}
                  >
                    {Number(activity.estimatedCalories)} kcal
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {activity.muscleGroups}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Activity Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-end"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              data-ocid="gym.dialog"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-[430px] mx-auto bg-card rounded-t-2xl border-t border-border p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold tracking-wider">Log Activity</h3>
                <button
                  type="button"
                  data-ocid="gym.close_button"
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="rounded-lg border border-border bg-secondary/50 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground/80">Examples:</p>
                <p>"Ran 5km full power, 30 minutes"</p>
                <p>"Chest workout, 4 sets bench press, 3 sets push-ups"</p>
                <p>"Cycling 20km moderate pace"</p>
              </div>
              <Textarea
                data-ocid="gym.textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your workout..."
                className="bg-secondary border-border min-h-[120px] text-sm resize-none"
              />
              <div className="flex gap-3">
                <Button
                  data-ocid="gym.cancel_button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="gym.submit_button"
                  onClick={handleSave}
                  disabled={addActivity.isPending}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  Save Activity
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
