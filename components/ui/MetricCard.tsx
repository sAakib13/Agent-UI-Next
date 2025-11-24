import React from "react";
import { AlertCircle } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBgColor: string;
  children?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
  children,
}) => {
  const content = children ? (
    children
  ) : (
    <div className="text-4xl sm:text-5xl font-bold mt-6 text-gray-900 dark:text-white tracking-tight">
      {value}
    </div>
  );

  return (
    <div className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out h-full flex flex-col">
      <div className="flex justify-between items-start">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center">
          {title}
        </h3>
        <div
          className={`p-2 rounded-lg ${iconBgColor
            .replace("text-", "bg-")
            .replace("600", "100")
            .replace("400", "900/30")} ${iconBgColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-end">{content}</div>
    </div>
  );
};

export const ActiveAgentCard: React.FC<{
  status: "Active" | "Inactive";
  lastUpdated: string;
}> = ({ status, lastUpdated }) => {
  const isAvailable = status === "Active";
  const statusColor = isAvailable
    ? "bg-emerald-500 shadow-emerald-500/30"
    : "bg-amber-500 shadow-amber-500/30";

  return (
    <MetricCard
      title="Active Demo Agent"
      value=""
      icon={AlertCircle}
      iconBgColor="text-blue-600 dark:text-blue-400"
    >
      <div className="flex flex-col h-full mt-4">
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Active
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-lg ${statusColor} text-white`}
            >
              {status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">
            Last synced: {lastUpdated}
          </p>
        </div>

        <button className="mt-auto w-full py-2.5 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm shadow-md">
          Manage Agent
        </button>
      </div>
    </MetricCard>
  );
};

export default MetricCard;
