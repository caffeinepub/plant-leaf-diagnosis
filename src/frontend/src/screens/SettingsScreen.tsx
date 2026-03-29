import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, LogIn, LogOut, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: Props) {
  const { login, clear, identity, isLoggingIn, isLoginSuccess } =
    useInternetIdentity();

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 8)}…${principal.slice(-6)}`
    : null;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3 shadow-xs">
        <button
          type="button"
          data-ocid="settings.close_button"
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={20} className="text-muted-foreground" />
        </button>
        <h1 className="text-base font-bold" style={{ color: "#2d7d32" }}>
          Settings
        </h1>
      </header>

      <div className="flex-1 px-4 pt-5 pb-8 space-y-5">
        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-card overflow-hidden"
        >
          {/* Section header */}
          <div className="px-4 py-3 flex items-center gap-2 border-b border-border">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#e8f5e9" }}
            >
              <User size={16} style={{ color: "#2d7d32" }} />
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: "#2d7d32" }}
            >
              Account
            </span>
          </div>

          <div className="px-4 py-4 space-y-4">
            {isLoginSuccess && principal ? (
              /* Logged in state */
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Principal ID
                    </p>
                    <p
                      className="text-sm font-mono font-medium"
                      style={{ color: "#1a1a1a" }}
                    >
                      {shortPrincipal}
                    </p>
                  </div>
                  <Badge
                    data-ocid="settings.success_state"
                    className="flex-shrink-0 text-xs px-2.5 py-1"
                    style={{
                      background: "#e8f5e9",
                      color: "#2d7d32",
                      border: "1px solid #a5d6a7",
                    }}
                  >
                    ✓ Logged In
                  </Badge>
                </div>
                <Separator />
                <div
                  className="flex items-start gap-3 rounded-xl p-3"
                  style={{ background: "#f0faf0" }}
                >
                  <Shield
                    size={16}
                    style={{ color: "#43a047" }}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You can now download reports from the Reports tab. Your
                    identity is secured via Internet Identity.
                  </p>
                </div>
                <Button
                  data-ocid="settings.delete_button"
                  variant="outline"
                  className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
                  onClick={clear}
                >
                  <LogOut size={15} className="mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              /* Logged out state */
              <div className="space-y-4">
                <div
                  className="flex items-start gap-3 rounded-xl p-3"
                  style={{ background: "#f0faf0" }}
                >
                  <Shield
                    size={16}
                    style={{ color: "#43a047" }}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Login with Internet Identity to enable report downloads.
                    Your data stays private and secure on the blockchain.
                  </p>
                </div>
                <Button
                  data-ocid="settings.primary_button"
                  disabled={isLoggingIn}
                  onClick={login}
                  className="w-full rounded-xl font-semibold text-white"
                  style={{
                    background: isLoggingIn
                      ? "#a5d6a7"
                      : "linear-gradient(135deg, #2d7d32 0%, #43a047 100%)",
                  }}
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Connecting…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn size={15} />
                      Login with Internet Identity
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-card overflow-hidden"
        >
          <div className="px-4 py-3 flex items-center gap-2 border-b border-border">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#e8f5e9" }}
            >
              <Shield size={16} style={{ color: "#2d7d32" }} />
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: "#2d7d32" }}
            >
              About
            </span>
          </div>
          <div className="px-4 py-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">App</span>
              <span
                className="text-sm font-medium"
                style={{ color: "#1a1a1a" }}
              >
                Plant Leaf Diagnosis
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Version</span>
              <span
                className="text-sm font-medium"
                style={{ color: "#1a1a1a" }}
              >
                1.0.0
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Model</span>
              <span
                className="text-sm font-medium"
                style={{ color: "#1a1a1a" }}
              >
                YOLOv8 Classifier
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Diseases</span>
              <span
                className="text-sm font-medium"
                style={{ color: "#1a1a1a" }}
              >
                38 classes
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
