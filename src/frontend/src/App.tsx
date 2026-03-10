import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import BottomNav, { type Tab } from "./components/BottomNav";
import AuthPage from "./pages/AuthPage";
import GoalsPage from "./pages/GoalsPage";
import GymPage from "./pages/GymPage";
import HomePage from "./pages/HomePage";
import NutritionPage from "./pages/NutritionPage";
import StudyPage from "./pages/StudyPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppInner() {
  const [userId, setUserId] = useState(
    () => localStorage.getItem("axiom_userId") ?? "",
  );
  const [userName, setUserName] = useState(
    () => localStorage.getItem("axiom_userName") ?? "",
  );
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const handleLogin = (id: string, name: string) => {
    setUserId(id);
    setUserName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem("axiom_userId");
    localStorage.removeItem("axiom_userName");
    setUserId("");
    setUserName("");
    queryClient.clear();
  };

  if (!userId) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto relative">
        <main
          className="overflow-y-auto no-scrollbar"
          style={{ minHeight: "100svh" }}
        >
          {activeTab === "home" && (
            <HomePage
              userId={userId}
              userName={userName}
              onLogout={handleLogout}
            />
          )}
          {activeTab === "study" && <StudyPage userId={userId} />}
          {activeTab === "gym" && <GymPage userId={userId} />}
          {activeTab === "food" && <NutritionPage userId={userId} />}
          {activeTab === "goals" && <GoalsPage userId={userId} />}
        </main>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster position="top-center" theme="dark" />
    </QueryClientProvider>
  );
}
