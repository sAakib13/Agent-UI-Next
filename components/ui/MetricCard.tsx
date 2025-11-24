import React from "react";
import {
  AlertCircle,
  MessageSquare,
  FileText,
  Globe,
  Users,
  User,
  Building,
} from "lucide-react";

// Define the shape of the props for flexibility
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBgColor: string; // Tailwind class for icon background (e.g., 'text-blue-400')
  children?: React.ReactNode; // For the 'Active Demo Agent' details/button
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
  children,
}) => {
  // Conditionally render the value or the children content
  const content = children ? (
    children
  ) : (
    // Updated text color for light mode
    <div className="text-5xl lg:text-6xl font-extrabold mt-4 text-gray-900 dark:text-white">
      {value}
    </div>
  );

  return (
    // Updated background and border for theme awareness
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-md dark:shadow-lg h-full transition-shadow duration-300 hover:shadow-blue-500/30">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center">
          {title}
          {/* Small icon next to title */}
          <Icon className={`w-4 h-4 ml-2 ${iconBgColor}`} />
        </h3>
        {/* You could add a small information icon here if needed */}
      </div>

      {content}
    </div>
  );
};

// Specific component for the 'Active Demo Agent' card, showing how to use the children prop
export const ActiveAgentCard: React.FC<{
  status: "Active" | "Inactive";
  lastUpdated: string;
}> = ({ status, lastUpdated }) => {
  const isAvailable = status === "Active";
  const statusColor = isAvailable ? "bg-green-600" : "bg-yellow-600";
  const statusText = isAvailable ? "Active" : "Inactive";

  return (
    <MetricCard
      title="Active Demo Agent"
      value="" // Value is rendered via children
      icon={AlertCircle}
      iconBgColor="text-blue-600 dark:text-blue-400"
    >
      <div className="flex flex-col h-full justify-between mt-4">
        <div>
          {/* Updated text color */}
          <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Active
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${statusColor} text-white`}
          >
            {statusText}
          </span>

          {/* Last Updated - Updated text color */}
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            Last Updated:
            <br />
            {lastUpdated}
          </p>
        </div>

        {/* Manage Button */}
        <button className="mt-6 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-150">
          Manage Agent
        </button>
      </div>
    </MetricCard>
  );
};

// Exporting the MetricCard component for general use
export default MetricCard;
