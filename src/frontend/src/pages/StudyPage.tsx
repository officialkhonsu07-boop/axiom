import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { StudyTopic } from "../backend.d";
import { useAddStudyTopic, useStudyTopics } from "../hooks/useQueries";

interface StudyPageProps {
  userId: string;
}

function ProtocolMode({
  topics,
  onClose,
}: { topics: StudyTopic[]; onClose: () => void }) {
  const [seconds, setSeconds] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const topic = topics[0];

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const startHold = () => {
    let progress = 0;
    holdRef.current = setInterval(() => {
      progress += 100 / 30;
      setHoldProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(holdRef.current!);
        onClose();
      }
    }, 100);
  };

  const stopHold = () => {
    if (holdRef.current) clearInterval(holdRef.current);
    setHoldProgress(0);
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDash = circumference - (holdProgress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between py-10 px-6">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground pulse-green">
          PROTOCOL LOCKED
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        <div className="text-center space-y-1">
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
            Subject
          </p>
          <p className="text-xl font-bold text-foreground tracking-wider">
            {topic?.subject || "—"}
          </p>
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase mt-3">
            Topic
          </p>
          <p className="text-base text-muted-foreground">
            {topic?.topicName || "—"}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
            MENTAL VOLUME
          </p>
          <p className="font-mono text-6xl font-black text-foreground tracking-widest">
            {pad(h)}:{pad(m)}:{pad(s)}
          </p>
          <p className="text-[10px] tracking-widest text-muted-foreground mt-2">
            HH : MM : SS
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 text-center max-w-xs">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Navigation gestures disabled · Calls silenced · Focus enforced
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-2">
            Web-layer simulation — OS-level controls require native app
          </p>
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          HOLD 3 SEC TO TERMINATE SESSION
        </p>
        <div className="relative w-24 h-24 mx-auto">
          <svg
            className="absolute inset-0 -rotate-90"
            width="96"
            height="96"
            aria-hidden="true"
          >
            <circle
              cx="48"
              cy="48"
              r="45"
              fill="none"
              stroke="oklch(0.18 0 0)"
              strokeWidth="4"
            />
            <circle
              cx="48"
              cy="48"
              r="45"
              fill="none"
              stroke="oklch(0.85 0.29 142)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
          </svg>
          <button
            type="button"
            data-ocid="study.delete_button"
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-destructive/60 bg-destructive/10 text-destructive select-none"
          >
            <X size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudyPage({ userId }: StudyPageProps) {
  const { data: topics = [], isLoading } = useStudyTopics(userId);
  const addTopic = useAddStudyTopic(userId);
  const [showModal, setShowModal] = useState(false);
  const [protocolActive, setProtocolActive] = useState(false);

  const [subject, setSubject] = useState("");
  const [topicName, setTopicName] = useState("");
  const [timeTarget, setTimeTarget] = useState("");
  const [status, setStatus] = useState<"pending" | "done" | "later">("pending");

  const done = topics.filter((t) => t.status === "done").length;
  const pending = topics.filter((t) => t.status === "pending").length;
  const later = topics.filter((t) => t.status === "later").length;

  const handleSave = async () => {
    if (!subject.trim() || !topicName.trim()) {
      toast.error("Subject and topic name are required");
      return;
    }
    const topic: StudyTopic = {
      id: crypto.randomUUID(),
      subject: subject.trim(),
      topicName: topicName.trim(),
      timeTargetMinutes: BigInt(Number.parseInt(timeTarget) || 30),
      status,
      createdAt: new Date().toISOString(),
    };
    await addTopic.mutateAsync(topic);
    toast.success("Topic added!");
    setShowModal(false);
    setSubject("");
    setTopicName("");
    setTimeTarget("");
    setStatus("pending");
  };

  const statusColor = {
    done: "green-text",
    pending: "text-yellow-400",
    later: "text-muted-foreground",
  };
  const statusBg = {
    done: "border-primary/40",
    pending: "border-yellow-500/40",
    later: "border-border",
  };

  return (
    <div className="pb-24 px-4 space-y-4">
      {protocolActive && topics.length > 0 && (
        <ProtocolMode
          topics={topics}
          onClose={() => setProtocolActive(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-xl font-black tracking-widest uppercase">Study</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="study.toggle"
            onClick={() => {
              if (topics.length === 0) {
                toast.error("Add at least one topic first");
                return;
              }
              setProtocolActive(true);
            }}
            className="rounded-full px-3 py-1 text-xs font-bold tracking-wider border"
            style={{
              borderColor: "oklch(0.65 0.22 293 / 0.6)",
              color: "oklch(0.65 0.22 293)",
              background: "oklch(0.65 0.22 293 / 0.08)",
            }}
          >
            ⚡ PROTOCOL
          </button>
          <button
            type="button"
            data-ocid="study.primary_button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tracking-wider bg-primary text-primary-foreground"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-primary/30 bg-card p-3 text-center">
          <p className="font-mono text-2xl font-black green-text">{done}</p>
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">
            Done
          </p>
        </div>
        <div className="rounded-xl border border-yellow-500/30 bg-card p-3 text-center">
          <p className="font-mono text-2xl font-black text-yellow-400">
            {pending}
          </p>
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">
            Pending
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="font-mono text-2xl font-black text-muted-foreground">
            {later}
          </p>
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">
            Later
          </p>
        </div>
      </div>

      {/* Topics list */}
      {isLoading ? (
        <div
          data-ocid="study.loading_state"
          className="text-center text-muted-foreground py-8 text-sm"
        >
          Loading...
        </div>
      ) : topics.length === 0 ? (
        <div
          data-ocid="study.empty_state"
          className="text-center py-12 space-y-2"
        >
          <p className="text-muted-foreground text-sm">No topics added yet</p>
          <p className="text-xs text-muted-foreground/60">
            Tap + to add your first study topic
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {topics.map((topic, i) => (
            <motion.div
              key={topic.id}
              data-ocid={`study.item.${i + 1}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border bg-card p-4 ${statusBg[topic.status as keyof typeof statusBg] || "border-border"}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p
                    className={`font-bold text-sm ${statusColor[topic.status as keyof typeof statusColor] || ""}`}
                  >
                    {topic.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {topic.topicName}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${statusColor[topic.status as keyof typeof statusColor] || ""}`}
                  >
                    {topic.status}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    {Number(topic.timeTargetMinutes)}min
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Topic Modal */}
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
              data-ocid="study.dialog"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-[430px] mx-auto bg-card rounded-t-2xl border-t border-border p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold tracking-wider">Add Topic</h3>
                <button
                  type="button"
                  data-ocid="study.close_button"
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Subject
                  </Label>
                  <Input
                    data-ocid="study.input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="bg-secondary border-border mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Topic Name
                  </Label>
                  <Input
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="e.g. Calculus derivatives"
                    className="bg-secondary border-border mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Time Target (minutes)
                  </Label>
                  <Input
                    type="number"
                    value={timeTarget}
                    onChange={(e) => setTimeTarget(e.target.value)}
                    placeholder="30"
                    className="bg-secondary border-border mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Status
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(v) =>
                      setStatus(v as "pending" | "done" | "later")
                    }
                  >
                    <SelectTrigger
                      data-ocid="study.select"
                      className="bg-secondary border-border mt-1"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="later">Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  data-ocid="study.cancel_button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="study.submit_button"
                  onClick={handleSave}
                  disabled={addTopic.isPending}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  Save
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
