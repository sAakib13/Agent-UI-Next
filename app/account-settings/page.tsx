/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  CreditCard,
  Key,
  AlertTriangle,
  ChevronRight,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

// --- Types ---
type UserProfile = {
  fullName: string;
  email: string;
  plan: "Pro" | "Starter" | "Free";
  apiKey: string;
};

// --- Reusable Input Component ---
const TextInput: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  isReadOnly?: boolean;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  endIcon?: React.ReactNode;
}> = ({
  label,
  value,
  placeholder,
  isReadOnly = false,
  type = "text",
  onChange,
  className,
  endIcon,
}) => (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          readOnly={isReadOnly}
          onChange={onChange}
          className={`w-full rounded-xl px-4 py-3 text-gray-900 dark:text-white transition-all outline-none border ${isReadOnly
            ? "bg-gray-100 dark:bg-gray-800 border-transparent text-gray-500 cursor-not-allowed"
            : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            } ${endIcon ? "pr-12" : ""}`}
        />
        {endIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 flex items-center">
            {endIcon}
          </div>
        )}
      </div>
    </div>
  );

// --- Action Row Component ---
const ActionRow: React.FC<{
  label: string;
  onClick: () => void;
  icon: React.ElementType;
  description?: string;
  isOpen?: boolean;
}> = ({ label, onClick, icon: Icon, description, isOpen }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 transition-colors group text-left ${isOpen
      ? "bg-blue-50/50 dark:bg-blue-900/10"
      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
  >
    <div className="flex items-center gap-4">
      <div
        className={`p-2 rounded-lg transition-colors ${isOpen
          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-gray-700 group-hover:text-blue-600 dark:group-hover:text-blue-400"
          }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <span
          className={`block font-medium ${isOpen
            ? "text-blue-700 dark:text-blue-300"
            : "text-gray-900 dark:text-white"
            }`}
        >
          {label}
        </span>
        {description && (
          <span className="block text-sm text-gray-500">{description}</span>
        )}
      </div>
    </div>
    <ChevronRight
      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-90 text-blue-500" : "group-hover:translate-x-1"
        }`}
    />
  </button>
);

// --- Main Page ---
export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    plan: "Free",
    apiKey: "sk-sahayata-xxxxxxxxxxxxxxxxxxxx", // Placeholder key
  });

  // -- Toggles --
  const [activeSection, setActiveSection] = useState<
    "none" | "password" | "billing" | "api"
  >("none");

  // -- Password State --
  const [passLoading, setPassLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [passForm, setPassForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // -- API Key State --
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- Fetch Data ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/login");
          return;
        }

        const email = user.email || "";
        let displayName =
          user.user_metadata?.full_name || user.user_metadata?.name;

        if (!displayName && email) {
          const namePart = email.split("@")[0];
          displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        }

        setProfile((prev) => ({
          ...prev,
          email: email,
          fullName: displayName || "",
        }));
      } catch (err) {
        console.error("Failed to load user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase, router]);

  const toggleSection = (section: "password" | "billing" | "api") => {
    if (activeSection === section) {
      setActiveSection("none");
    } else {
      setActiveSection(section);
      setStatusMessage(null); // Clear messages on switch
    }
  };

  // --- Password Handler ---
  const handlePasswordUpdate = async () => {
    setStatusMessage(null);

    if (!passForm.current || !passForm.newPass || !passForm.confirm) {
      setStatusMessage({
        type: "error",
        text: "Please fill in all password fields.",
      });
      return;
    }
    if (passForm.newPass !== passForm.confirm) {
      setStatusMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (passForm.newPass.length < 6) {
      setStatusMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    setPassLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: passForm.current,
      });

      if (signInError) {
        setStatusMessage({ type: "error", text: "Incorrect current password." });
        setPassLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passForm.newPass,
      });

      if (updateError) {
        setStatusMessage({ type: "error", text: updateError.message });
      } else {
        setStatusMessage({
          type: "success",
          text: "Password updated successfully!",
        });
        setPassForm({ current: "", newPass: "", confirm: "" });
        setTimeout(() => setActiveSection("none"), 2000);
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setPassLoading(false);
    }
  };

  // --- API Key Handlers ---
  const copyApiKey = () => {
    navigator.clipboard.writeText(profile.apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  // --- UI Helpers ---
  const TogglePassButton = (
    <button
      type="button"
      onClick={() => setShowPass(!showPass)}
      className="focus:outline-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );

  const ToggleApiButton = (
    <button
      type="button"
      onClick={() => setShowApiKey(!showApiKey)}
      className="focus:outline-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      {showApiKey ? (
        <EyeOff className="w-5 h-5" />
      ) : (
        <Eye className="w-5 h-5" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage your account preferences and security.
        </p>
      </header>

      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Profile
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <TextInput
            label="Full Name"
            placeholder="Your name"
            value={profile.fullName}
            onChange={(e) =>
              setProfile({ ...profile, fullName: e.target.value })
            }
          />
          <TextInput
            label="Email"
            placeholder="Your email"
            value={profile.email}
            isReadOnly
            onChange={() => { }}
          />
        </div>
        <div className="flex justify-end">
          <button className="px-5 py-2 bg-blue-600 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      </section>

      {/* Security & Billing Group */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 shadow-sm overflow-hidden">
        {/* --- CHANGE PASSWORD SECTION --- */}
        <div>
          <ActionRow
            label="Change Password"
            icon={Shield}
            description="Update your password securely"
            onClick={() => toggleSection("password")}
            isOpen={activeSection === "password"}
          />
          {activeSection === "password" && (
            <div className="px-4 pb-6 pt-2 bg-blue-50/30 dark:bg-blue-900/5 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-4">
                <TextInput
                  label="Current Password"
                  placeholder="Enter current password"
                  type={showPass ? "text" : "password"}
                  value={passForm.current}
                  onChange={(e) =>
                    setPassForm({ ...passForm, current: e.target.value })
                  }
                  endIcon={TogglePassButton}
                />
                <TextInput
                  label="New Password"
                  placeholder="Min 6 chars"
                  type={showPass ? "text" : "password"}
                  value={passForm.newPass}
                  onChange={(e) =>
                    setPassForm({ ...passForm, newPass: e.target.value })
                  }
                  endIcon={TogglePassButton}
                />
                <TextInput
                  label="Confirm New Password"
                  placeholder="Retype new password"
                  type={showPass ? "text" : "password"}
                  value={passForm.confirm}
                  onChange={(e) =>
                    setPassForm({ ...passForm, confirm: e.target.value })
                  }
                  endIcon={TogglePassButton}
                />
              </div>

              {statusMessage && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${statusMessage.type === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {statusMessage.text}
                </div>
              )}

              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => setActiveSection("none")}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordUpdate}
                  disabled={passLoading}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-70"
                >
                  {passLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- BILLING SECTION --- */}
        <div>
          <ActionRow
            label="Billing & Invoices"
            icon={CreditCard}
            description={`Current Plan: ${profile.plan}`}
            onClick={() => toggleSection("billing")}
            isOpen={activeSection === "billing"}
          />
          {activeSection === "billing" && (
            <div className="px-6 pb-6 pt-4 bg-gray-50 dark:bg-gray-800/30 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Current Subscription
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      Free Plan
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Renews on: Jan 24, 2026
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    View Invoices
                  </button>
                  {/* <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Upgrade to Pro
                  </button> */}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- API KEYS SECTION --- */}
        <div>
          <ActionRow
            label="API Keys"
            icon={Key}
            description="Manage your integration keys"
            onClick={() => toggleSection("api")}
            isOpen={activeSection === "api"}
          />
          {activeSection === "api" && (
            <div className="px-6 pb-6 pt-4 bg-gray-50 dark:bg-gray-800/30 animate-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Use this key to authenticate requests from your external
                applications. Keep it secret.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    readOnly
                    value=""
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-sm focus:outline-none pr-12"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {ToggleApiButton}
                  </div>
                </div>
                <button
                  onClick={copyApiKey}
                  className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                  title="Copy Key"
                >
                  {apiKeyCopied ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Regenerate Key"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <section className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 p-8">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">
              Danger Zone
            </h2>
            <p className="text-sm text-red-600/80 dark:text-red-400/70 mb-4">
              Deleting your account is permanent. All your agents and data will
              be wiped immediately.
            </p>
            <button className="px-4 py-2 bg-white dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}