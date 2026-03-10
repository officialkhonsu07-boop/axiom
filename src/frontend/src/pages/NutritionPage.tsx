import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { NutritionEntry } from "../backend.d";
import { useAddNutritionEntry, useNutritionEntries } from "../hooks/useQueries";
import { parseNutritionDescription } from "../lib/parsers";

interface NutritionPageProps {
  userId: string;
}

export default function NutritionPage({ userId }: NutritionPageProps) {
  const { data: entries = [], isLoading } = useNutritionEntries(userId);
  const addEntry = useAddNutritionEntry(userId);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");

  const totalCals = entries.reduce(
    (s, e) => s + Number(e.estimatedCalories),
    0,
  );
  const totalProtein = entries.reduce(
    (s, e) => s + Number.parseFloat(e.protein || "0"),
    0,
  );
  const totalSugar = entries.reduce(
    (s, e) => s + Number.parseFloat(e.sugar || "0"),
    0,
  );

  const handleSave = async () => {
    if (!description.trim()) {
      toast.error("Please describe what you ate");
      return;
    }
    const parsed = parseNutritionDescription(description);
    const entry: NutritionEntry = {
      id: crypto.randomUUID(),
      description: description.trim(),
      estimatedCalories: BigInt(parsed.estimatedCalories),
      protein: String(parsed.protein),
      sugar: String(parsed.sugar),
      createdAt: new Date().toISOString(),
    };
    await addEntry.mutateAsync(entry);
    toast.success(
      `Logged! ~${parsed.estimatedCalories} kcal, ${parsed.protein}g protein`,
    );
    setShowModal(false);
    setDescription("");
  };

  return (
    <div className="pb-24 px-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-xl font-black tracking-widest uppercase">
          Nutrition
        </h2>
        <button
          type="button"
          data-ocid="nutrition.primary_button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tracking-wider bg-primary text-primary-foreground"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Summary */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div
            className="rounded-xl border bg-card p-3 text-center"
            style={{ borderColor: "oklch(0.85 0.29 142 / 0.4)" }}
          >
            <p className="font-mono font-black text-lg green-text">
              {totalCals}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              kcal
            </p>
          </div>
          <div
            className="rounded-xl border bg-card p-3 text-center"
            style={{ borderColor: "oklch(0.65 0.18 230 / 0.4)" }}
          >
            <p className="font-mono font-black text-lg text-blue-400">
              {totalProtein.toFixed(1)}g
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              protein
            </p>
          </div>
          <div
            className="rounded-xl border bg-card p-3 text-center"
            style={{ borderColor: "oklch(0.75 0.18 350 / 0.4)" }}
          >
            <p className="font-mono font-black text-lg text-pink-400">
              {totalSugar.toFixed(1)}g
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              sugar
            </p>
          </div>
        </div>
      )}

      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        Today's Food
      </p>

      {isLoading ? (
        <div
          data-ocid="nutrition.loading_state"
          className="text-center text-muted-foreground py-8 text-sm"
        >
          Loading...
        </div>
      ) : entries.length === 0 ? (
        <div
          data-ocid="nutrition.empty_state"
          className="text-center py-12 space-y-2"
        >
          <p className="text-muted-foreground text-sm">
            No food entries logged yet
          </p>
          <p className="text-xs text-muted-foreground/60">
            Tap + to log your first meal
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              data-ocid={`nutrition.item.${i + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-4"
              style={{
                borderLeftColor: "oklch(0.85 0.29 142 / 0.6)",
                borderLeftWidth: "3px",
              }}
            >
              <div className="flex justify-between items-start gap-3">
                <p className="text-sm text-foreground flex-1">
                  {entry.description}
                </p>
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="font-mono font-bold text-sm green-text">
                    {Number(entry.estimatedCalories)} kcal
                  </p>
                  <p className="text-[10px] text-blue-400">
                    {entry.protein}g pro
                  </p>
                  <p className="text-[10px] text-pink-400">
                    {entry.sugar}g sugar
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Entry Modal */}
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
              data-ocid="nutrition.dialog"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-[430px] mx-auto bg-card rounded-t-2xl border-t border-border p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold tracking-wider">Log Food</h3>
                <button
                  type="button"
                  data-ocid="nutrition.close_button"
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="rounded-lg border border-border bg-secondary/50 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground/80">Examples:</p>
                <p>"5 egg whites from brand X, 200g"</p>
                <p>"Chicken breast 150g with rice 200g"</p>
                <p>"Protein shake 1 scoop with milk 250g"</p>
              </div>
              <Textarea
                data-ocid="nutrition.textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you ate..."
                className="bg-secondary border-border min-h-[120px] text-sm resize-none"
              />
              <div className="flex gap-3">
                <Button
                  data-ocid="nutrition.cancel_button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="nutrition.submit_button"
                  onClick={handleSave}
                  disabled={addEntry.isPending}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  Save Entry
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
