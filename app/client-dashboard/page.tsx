/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  MessageSquare, Clock, ThumbsUp, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Zap, Activity, Users
} from 'lucide-react';

// --- Mock Data for a Single Agent (e.g., "Sales Outreach Bot") ---

const agentSpecificData = {
  name: "Sales Outreach Bot",
  id: "agt_8823_x9",
  status: "Active",
  uptime: "99.9%",
  lastTraining: "2 hours ago",

  // Daily traffic for this specific agent
  trafficData: [
    { time: '00:00', visitors: 12 },
    { time: '04:00', visitors: 8 },
    { time: '08:00', visitors: 45 },
    { time: '12:00', visitors: 120 },
    { time: '16:00', visitors: 85 },
    { time: '20:00', visitors: 50 },
    { time: '23:59', visitors: 20 },
  ],

  // What this agent is talking about
  topicDistribution: [
    { name: 'Product Demo', value: 45, color: '#3b82f6' }, // Blue
    { name: 'Pricing', value: 30, color: '#10b981' }, // Emerald
    { name: 'Integration', value: 15, color: '#8b5cf6' }, // Violet
    { name: 'Support', value: 10, color: '#f59e0b' }, // Amber
  ]
};

// --- Local Components for Modular Dashboard ---

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
        <Icon className="w-6 h-6" />
      </div>
      {change && (
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {change}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{value}</h3>
    </div>
  </div>
);

const LiveActivityFeed = () => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm h-full">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Live Interactions
      </h3>
      <button className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</button>
    </div>
    <div className="space-y-4">
      {[
        { user: '+1 (555) ...234', action: 'Asked about pricing', time: 'Just now', status: 'Replied' },
        { user: '+91 987 ...882', action: 'Requested human agent', time: '2m ago', status: 'Handoff' },
        { user: 'visitor_x92', action: 'Viewing product docs', time: '5m ago', status: 'Active' },
        { user: '+44 20 ...991', action: 'Scheduled a demo', time: '12m ago', status: 'Completed' },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-default">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${item.status === 'Handoff' ? 'bg-red-100 text-red-600 dark:bg-red-900/20' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
              {item.user[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.user}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.action}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.status === 'Handoff' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                item.status === 'Completed' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' :
                  'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
              }`}>
              {item.status}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ClientDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">

      {/* Context Header: Specific to ONE Agent */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{agentSpecificData.name}</h1>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold flex items-center gap-1">
              <Activity className="w-3 h-3" /> {agentSpecificData.status}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-4 text-sm">
            <span>ID: <span className="font-mono">{agentSpecificData.id}</span></span>
            <span>•</span>
            <span>Last Trained: {agentSpecificData.lastTraining}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm">
            View Logs
          </button>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2">
            <Zap className="w-4 h-4" /> Test Agent
          </button>
        </div>
      </header>

      {/* Agent Specific KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Conversations"
          value="1,240"
          change="12%"
          trend="up"
          icon={MessageSquare}
        />
        <StatCard
          title="Avg. Handling Time"
          value="45s"
          change="8%"
          trend="down" // Down is good for time
          icon={Clock}
        />
        <StatCard
          title="CSAT Score"
          value="4.8/5"
          change="0.2"
          trend="up"
          icon={ThumbsUp}
        />
        <StatCard
          title="Human Handoffs"
          value="4.2%"
          change="1.5%"
          trend="up" // Up might be bad depending on context, usually color coded red if bad
          icon={AlertTriangle}
        />
      </div>

      {/* Main Analytics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Traffic Chart (Col Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Agent Traffic</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Message volume over the last 24 hours</p>
            </div>
            <select className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={agentSpecificData.trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTraffic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed (Col Span 1) */}
        <LiveActivityFeed />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Topic Distribution */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Conversation Topics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">What users are asking this agent</p>
          <div className="h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agentSpecificData.topicDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {agentSpecificData.topicDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: 'none', color: 'white' }} />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Knowledge Base Health */}
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Knowledge Health</h3>
                <p className="text-blue-100 text-sm">Based on recent queries</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span>Coverage Rate</span>
                  <span>92%</span>
                </div>
                <div className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[92%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span>Confidence Score</span>
                  <span>8.5/10</span>
                </div>
                <div className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 w-[85%] rounded-full"></div>
                </div>
              </div>
            </div>

            <button className="mt-8 w-full py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-md">
              Retrain Knowledge Base
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}