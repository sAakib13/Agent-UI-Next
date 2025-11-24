import { MetricCard, ActiveAgentCard } from "@/components/ui/MetricCard";
import { MessageSquare, FileText, Globe } from "lucide-react";

// Mock data to simulate fetching from an API
const metricsData = {
  messagesProcessed: 14500,
  documentsUploaded: 75,
  urlsCrawled: 420,
  agentStatus: "Active",
  lastUpdated: "11/20/2025 4:21:16 PM",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <header className="pb-4 border-b border-gray-800">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Overview of your Sahayata Agent platform
        </p>
      </header>

      {/* Quick Summary Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Quick Summary</h2>

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
            iconBgColor="text-green-400"
          />

          {/* 3. Documents Uploaded Card */}
          <MetricCard
            title="Documents Uploaded"
            value={metricsData.documentsUploaded.toLocaleString()}
            icon={FileText}
            iconBgColor="text-yellow-400"
          />

          {/* 4. URLs Crawled Card */}
          <MetricCard
            title="URLs Crawled"
            value={metricsData.urlsCrawled.toLocaleString()}
            icon={Globe}
            iconBgColor="text-red-400"
          />
        </div>
      </section>

      {/* Placeholder for future sections like Charts or Recent Activity */}
      <section className="pt-8 border-t border-gray-800 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-gray-500 h-48 flex items-center justify-center">
          *Placeholder for recent agent logs or charts*
        </div>
      </section>
    </div>
  );
}
