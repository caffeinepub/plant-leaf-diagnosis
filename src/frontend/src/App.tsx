import { Toaster } from "@/components/ui/sonner";
import { BarChart2, Camera, Home, Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import DiagnoseScreen from "./screens/DiagnoseScreen";
import HomeScreen from "./screens/HomeScreen";
import ReportsScreen from "./screens/ReportsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import type { Diagnosis } from "./types/diagnosis";
import { loadDiagnoses } from "./types/diagnosis";

type Tab = "home" | "diagnose" | "reports" | "settings";

const NAV_ITEMS: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "diagnose", label: "Diagnose", Icon: Camera },
  { id: "reports", label: "Reports", Icon: BarChart2 },
  { id: "settings", label: "Settings", Icon: Settings },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>(() =>
    loadDiagnoses(),
  );
  const { identity, isLoginSuccess } = useInternetIdentity();

  const refreshDiagnoses = useCallback(() => {
    setDiagnoses(loadDiagnoses());
  }, []);

  const handleSaved = useCallback(() => {
    refreshDiagnoses();
    setTab("home");
  }, [refreshDiagnoses]);

  useEffect(() => {
    if (tab === "home" || tab === "reports") {
      refreshDiagnoses();
    }
  }, [tab, refreshDiagnoses]);

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f5" }}>
      {/* Mobile container */}
      <div
        className="mx-auto relative flex flex-col"
        style={{
          maxWidth: "430px",
          minHeight: "100dvh",
          background: "#f9fdf9",
          boxShadow: "0 0 40px rgba(0,0,0,0.1)",
        }}
      >
        {/* Main content */}
        <main
          className="flex-1 overflow-hidden"
          style={{ paddingBottom: "70px" }}
        >
          <AnimatePresence mode="wait">
            {tab === "home" && (
              <motion.div
                key="home"
                className="h-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ height: "calc(100dvh - 70px)", overflowY: "auto" }}
              >
                <HomeScreen
                  diagnoses={diagnoses}
                  onStartDiagnose={() => setTab("diagnose")}
                  onOpenSettings={() => setTab("settings")}
                />
              </motion.div>
            )}
            {tab === "diagnose" && (
              <motion.div
                key="diagnose"
                className="h-full"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                style={{ height: "calc(100dvh - 70px)", overflowY: "auto" }}
              >
                <DiagnoseScreen onSaved={handleSaved} />
              </motion.div>
            )}
            {tab === "reports" && (
              <motion.div
                key="reports"
                className="h-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                style={{ height: "calc(100dvh - 70px)", overflowY: "auto" }}
              >
                <ReportsScreen
                  diagnoses={diagnoses}
                  isLoggedIn={isLoginSuccess}
                  identity={identity}
                />
              </motion.div>
            )}
            {tab === "settings" && (
              <motion.div
                key="settings"
                className="h-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                style={{ height: "calc(100dvh - 70px)", overflowY: "auto" }}
              >
                <SettingsScreen onBack={() => setTab("home")} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Nav */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 border-t border-border z-20 flex"
          style={{
            width: "min(430px, 100vw)",
            background: "white",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.link`}
              onClick={() => setTab(id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all"
              style={{ color: tab === id ? "#43a047" : "#9e9e9e" }}
            >
              {id === "diagnose" ? (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center -mt-6 shadow-card"
                  style={{ background: tab === id ? "#43a047" : "#e8f5e9" }}
                >
                  <Icon
                    size={22}
                    style={{ color: tab === id ? "white" : "#43a047" }}
                  />
                </div>
              ) : (
                <Icon size={20} />
              )}
              <span
                className="text-xs font-medium"
                style={{ marginTop: id === "diagnose" ? "2px" : "0" }}
              >
                {label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <footer className="hidden sm:block text-center py-2 text-xs text-gray-400">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          caffeine.ai
        </a>
      </footer>

      <Toaster />
    </div>
  );
}
