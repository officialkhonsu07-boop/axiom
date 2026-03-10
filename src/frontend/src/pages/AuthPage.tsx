import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface AuthPageProps {
  onLogin: (userId: string, userName: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const { actor } = useActor();

  const handleSubmit = async () => {
    if (!name.trim() || !dob) {
      toast.error("Please enter your name and date of birth");
      return;
    }
    if (!actor) {
      toast.error("Connecting to backend...");
      return;
    }
    setLoading(true);
    try {
      let userId = await actor.login(name.trim(), dob);
      if (!userId) {
        userId = await actor.register(
          name.trim(),
          dob,
          new Date().toISOString(),
        );
      }
      if (userId) {
        localStorage.setItem("axiom_userId", userId);
        localStorage.setItem("axiom_userName", name.trim());
        onLogin(userId, name.trim());
        toast.success(`Welcome, ${name.trim()}!`);
      } else {
        toast.error("Authentication failed. Try again.");
      }
    } catch (_e) {
      toast.error("Connection error. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black tracking-[0.3em] green-text font-mono">
            AXIOM
          </h1>
          <p className="text-muted-foreground text-xs tracking-widest mt-2 uppercase">
            Life Operating System
          </p>
          <div className="w-16 h-px bg-primary mx-auto mt-4 opacity-60" />
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label
              htmlFor="auth-name"
              className="text-xs tracking-widest uppercase text-muted-foreground"
            >
              Name
            </Label>
            <Input
              id="auth-name"
              data-ocid="auth.input"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="auth-dob"
              className="text-xs tracking-widest uppercase text-muted-foreground"
            >
              Date of Birth
            </Label>
            <Input
              id="auth-dob"
              data-ocid="auth.select"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="bg-card border-border text-foreground h-12 text-base"
            />
          </div>

          <Button
            data-ocid="auth.submit_button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 text-sm font-bold tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "LOGIN / REGISTER"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            New user? Your account is created automatically.
          </p>
        </motion.div>
      </motion.div>

      <footer className="absolute bottom-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="green-text"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
