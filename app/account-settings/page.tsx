"use client"
import React, { useState } from "react";
import {
  Settings,
  User,
  CreditCard,
  Key,
  AlertTriangle,
  ChevronRight,
  Shield,
} from "lucide-react";

type UserProfile = {
  fullName: string;
  email: string;
  plan: "Pro" | "Starter";
  apiKey: string;
};
const mockProfile: UserProfile = {
  fullName: "Jane Doe",
  email: "jane.doe@example.com",
  plan: "Pro",
  apiKey: "sk-sahayata-xxxxxxxxxxxxxxxxxxxx",
};

const TextInput: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  isReadOnly?: boolean;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({
  label,
  value,
  placeholder,
  isReadOnly = false,
  type = "text",
  onChange,
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      readOnly={isReadOnly}
      onChange={onChange}
      className={`w-full rounded-xl px-4 py-3 text-gray-900 dark:text-white transition-all outline-none border ${
        isReadOnly
          ? "bg-gray-100 dark:bg-gray-800 border-transparent text-gray-500 cursor-not-allowed"
          : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      }`}
    />
  </div>
);

const ActionRow: React.FC<{
  label: string;
  onClick: () => void;
  icon: React.ElementType;
  description?: string;
}> = ({ label, onClick, icon: Icon, description }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group text-left"
  >
    <div className="flex items-center gap-4">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
      </div>
      <div>
        <span className="block font-medium text-gray-900 dark:text-white">
          {label}
        </span>
        {description && (
          <span className="block text-sm text-gray-500">{description}</span>
        )}
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
  </button>
);

export default function AccountSettingsPage() {
  const [profile, setProfile] = useState(mockProfile);

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
            onChange={() => {}}
          />
        </div>
        <div className="flex justify-end">
          <button className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      </section>

      {/* Security & Billing Group */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 shadow-sm overflow-hidden">
        <ActionRow
          label="Change Password"
          icon={Shield}
          description="Update your password securely"
          onClick={() => {}}
        />
        <ActionRow
          label="Billing & Invoices"
          icon={CreditCard}
          description={`Current Plan: ${profile.plan}`}
          onClick={() => {}}
        />
        <ActionRow
          label="API Keys"
          icon={Key}
          description="Manage your integration keys"
          onClick={() => {}}
        />
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
