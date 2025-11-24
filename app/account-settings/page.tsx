"use client";

import React, { useState } from "react";
import {
  Settings,
  User,
  CreditCard,
  Key,
  AlertTriangle,
  LogOut,
  ChevronRight,
} from "lucide-react";

// --- Types and Mock Data ---

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

// --- Reusable Form Components ---

// Component for standard text inputs (used for profile fields)
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
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      readOnly={isReadOnly}
      onChange={onChange}
      className={`w-full rounded-lg px-4 py-2 text-white transition-colors 
        ${
          isReadOnly
            ? "bg-gray-800 border border-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gray-800 border border-gray-700 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
        }`}
    />
  </div>
);

// Component for full-width action buttons (used in settings panels)
const ActionButton: React.FC<{
  label: string;
  onClick: () => void;
  icon: React.ElementType;
}> = ({ label, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors text-white"
  >
    <div className="flex items-center space-x-3">
      <Icon className="w-5 h-5 text-blue-400" />
      <span className="font-medium">{label}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </button>
);

// --- Main Page Component ---

export default function AccountSettingsPage() {
  const [profile, setProfile] = useState(mockProfile);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleProfileChange = (
    field: keyof Omit<UserProfile, "plan" | "apiKey">,
    value: string
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    console.log("Profile saved:", profile);
    // Add API call here
  };

  const handlePasswordChange = () => {
    console.log(
      "Password change initiated. Current:",
      currentPassword,
      "New:",
      newPassword
    );
    // Add API call here
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleRegenerateApiKey = () => {
    const newKey = "sk-sahayata-" + Math.random().toString(36).substring(2, 22);
    setProfile((prev) => ({ ...prev, apiKey: newKey }));
    console.log("API Key Regenerated:", newKey);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Header */}
      <header className="pb-4 border-b border-gray-800">
        <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-500" />
          <span>Account Settings</span>
        </h1>
        <p className="text-gray-400 mt-1">
          Manage your personal information, subscription, and security.
        </p>
      </header>

      {/* 1. Personal Information */}
      <section className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
        <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 flex items-center space-x-2 text-white">
          <User className="w-5 h-5" />
          <span>Personal Information</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            label="Full Name"
            placeholder="Your name"
            value={profile.fullName}
            onChange={(e) => handleProfileChange("fullName", e.target.value)}
          />
          <TextInput
            label="Email Address"
            placeholder="Your email"
            value={profile.email}
            isReadOnly
            onChange={() => {}}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveProfile}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Profile
          </button>
        </div>
      </section>

      {/* Password Change */}
      <section className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
        <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">
          Password Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            type="password"
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextInput
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            type="password"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handlePasswordChange}
            disabled={!currentPassword || !newPassword}
            className={`px-6 py-2 text-white rounded-lg font-medium transition-colors 
              ${
                currentPassword && newPassword
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
          >
            Change Password
          </button>
        </div>
      </section>

      {/* 2. Subscription & Billing */}
      <section className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
        <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 flex items-center space-x-2 text-white">
          <CreditCard className="w-5 h-5" />
          <span>Subscription & Billing</span>
        </h2>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-lg font-semibold text-white">
            Current Plan: {profile.plan}
          </p>
          <p className="text-sm text-gray-400">
            Your current plan provides unlimited agents and priority support.
          </p>
        </div>

        <div className="space-y-3">
          <ActionButton
            label="Manage Billing and Invoices"
            onClick={() =>
              console.log("Redirecting to Stripe/Billing portal...")
            }
            icon={CreditCard}
          />
          <ActionButton
            label="Change Subscription Plan"
            onClick={() => console.log("Opening plan change modal...")}
            icon={ChevronRight}
          />
        </div>
      </section>

      {/* 3. API Key Management */}
      <section className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
        <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 flex items-center space-x-2 text-white">
          <Key className="w-5 h-5" />
          <span>API Key Management</span>
        </h2>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 break-words">
          <p className="text-sm font-medium text-gray-400 mb-1">
            Current API Key:
          </p>
          <code className="text-yellow-400 select-all">{profile.apiKey}</code>
        </div>

        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-gray-500 hidden sm:block">
            Regenerating your key will immediately invalidate the old one.
          </p>
          <button
            onClick={handleRegenerateApiKey}
            className="px-6 py-2 border border-yellow-600 text-yellow-400 rounded-lg hover:bg-yellow-900/30 transition-colors font-medium"
          >
            Regenerate Key
          </button>
        </div>
      </section>

      {/* 4. Danger Zone */}
      <section className="space-y-6 border border-red-800 rounded-xl p-6 bg-red-900/20">
        <h2 className="text-xl font-semibold border-b border-red-800 pb-3 flex items-center space-x-2 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>Danger Zone</span>
        </h2>

        <div className="flex justify-between items-center">
          <p className="text-gray-300">
            Permanently delete your account and all associated data.
          </p>
          <button
            onClick={() => console.log("Show delete confirmation modal...")}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete Account
          </button>
        </div>
      </section>
    </div>
  );
}
