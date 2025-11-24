import { MetricCard, ActiveAgentCard } from "@/components/ui/MetricCard";
import {
  MessageSquare,
  FileText,
  Globe,
  Users,
  User,
  Building,
  Zap,
} from "lucide-react";

// Mock data to simulate fetching from an API
const metricsData = {
  // Existing Summary Metrics
  messagesProcessed: 14500,
  documentsUploaded: 75,
  urlsCrawled: 420,
  agentStatus: "Active",
  lastUpdated: "11/20/2025 4:21:16 PM",

  // New Platform Statistics
  numberOfAgents: 3,
  contacts: 12,
  organizations: 8,
};

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Dashboard Header */}
      <header className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Overview of your Sahayata Agent platform
        </p>
      </header>

      {/* Quick Summary Section (Existing Cards) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Quick Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Active Agent Card (Custom Layout) */}
          <ActiveAgentCard
            status={metricsData.agentStatus as "Active" | "Inactive"}
            lastUpdated={metricsData.lastUpdated}
          />

          {/* 2. Messages Processed Card */}
          <MetricCard
            title="Messages Processed"
            value={metricsData.messagesProcessed.toLocaleString()}
            icon={MessageSquare}
            iconBgColor="text-green-600 dark:text-green-400"
          />

          {/* 3. Documents Uploaded Card */}
          <MetricCard
            title="Documents Uploaded"
            value={metricsData.documentsUploaded.toLocaleString()}
            icon={FileText}
            iconBgColor="text-yellow-600 dark:text-yellow-400"
          />

          {/* 4. URLs Crawled Card */}
          <MetricCard
            title="URLs Crawled"
            value={metricsData.urlsCrawled.toLocaleString()}
            icon={Globe}
            iconBgColor="text-red-600 dark:text-red-400"
          />
        </div>
      </section>

      {/* Platform Statistics Section (New Cards) */}
      <section className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-900">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Platform Statistics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Number of Agents Card */}
          <MetricCard
            title="Number of Agents"
            value={metricsData.numberOfAgents.toLocaleString()}
            icon={Users}
            iconBgColor="text-indigo-600 dark:text-indigo-400"
          />

          {/* 2. Contacts Card */}
          <MetricCard
            title="Contacts"
            value={metricsData.contacts.toLocaleString()}
            icon={User}
            iconBgColor="text-pink-600 dark:text-pink-400"
          />

          {/* 3. Organizations Card */}
          <MetricCard
            title="Organizations"
            value={metricsData.organizations.toLocaleString()}
            icon={Building}
            iconBgColor="text-cyan-600 dark:text-cyan-400"
          />
        </div>
      </section>

      {/* Quick Actions Section (New) */}
      <section className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-900">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>

        {/* Updated background and text classes */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-0">
            Easily deploy changes or create a new agent instance.
          </p>
          <button className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-150 w-full sm:w-auto">
            Create / Update Demo Agent
          </button>
        </div>
      </section>

      {/* Test Your Agent Section (New) */}
      <section className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-900">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Test Your Agent
        </h2>

        {/* Updated background and border classes */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 dark:text-gray-500 h-48">
          {/* Updated placeholder background for QR code (should be light/dark aware) */}
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4 border border-gray-300 dark:border-gray-700">
            {/* Placeholder for QR Code / WhatsApp logo */}
            <Zap className="w-10 h-10 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-sm">Scan to test your agent on WhatsApp</p>
        </div>
      </section>
    </div>
  );
}
