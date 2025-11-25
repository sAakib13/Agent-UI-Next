import { MetricCard, ActiveAgentCard } from "@/components/ui/MetricCard";
import {
  MessageSquare,
  FileText,
  Globe,
  Users,
  User,
  Building,
  Zap,
  ArrowUpRight,
} from "lucide-react";



const metricsData = {
  messagesProcessed: 14500,
  documentsUploaded: 75,
  urlsCrawled: 420,
  agentStatus: "Active",
  lastUpdated: "11/20/2025 4:21 PM",
  numberOfAgents: 3,
  contacts: 12,
  organizations: 8,
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Welcome back, here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex space-x-3">
          {/* Example Action Button */}
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Download Report
          </button>
        </div>
      </header>

      {/* Overview Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <ActiveAgentCard
            status={metricsData.agentStatus as "Active" | "Inactive"}
            lastUpdated={metricsData.lastUpdated}
          />
          <MetricCard
            title="Messages Processed"
            value={metricsData.messagesProcessed.toLocaleString()}
            icon={MessageSquare}
            iconBgColor="text-emerald-600 dark:text-emerald-400"
          />
          <MetricCard
            title="Documents Uploaded"
            value={metricsData.documentsUploaded.toLocaleString()}
            icon={FileText}
            iconBgColor="text-amber-600 dark:text-amber-400"
          />
          <MetricCard
            title="URLs Crawled"
            value={metricsData.urlsCrawled.toLocaleString()}
            icon={Globe}
            iconBgColor="text-rose-600 dark:text-rose-400"
          />
        </div>
      </section>

      {/* Platform Stats & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Platform Stats */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <MetricCard
              title="Agents"
              value={metricsData.numberOfAgents.toLocaleString()}
              icon={Users}
              iconBgColor="text-indigo-600 dark:text-indigo-400"
            />
            <MetricCard
              title="Contacts"
              value={metricsData.contacts.toLocaleString()}
              icon={User}
              iconBgColor="text-fuchsia-600 dark:text-fuchsia-400"
            />
            <MetricCard
              title="Organizations"
              value={metricsData.organizations.toLocaleString()}
              icon={Building}
              iconBgColor="text-cyan-600 dark:text-cyan-400"
            />
          </div>
        </div>

        {/* Side Panel: Actions & Test */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg text-white">
              <h3 className="font-bold text-lg mb-2">Deploy New Agent</h3>
              <p className="text-blue-100 text-sm mb-6">
                Create a new instance or update existing configurations
                instantly.
              </p>
              <button className="w-full py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                <span>Start Deployment</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Test Agent
            </h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-48 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group cursor-pointer">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Scan via WhatsApp
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
