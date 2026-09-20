import React from 'react';
import { Complaint } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Download,
  Building,
  ShieldCheck,
} from 'lucide-react';

interface AdminAnalyticsViewProps {
  complaints: Complaint[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({ complaints }) => {
  // Compute category distribution
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const categoryData = Object.keys(categoryCounts).map((cat) => ({
    name: cat,
    value: categoryCounts[cat],
  }));

  // Compute department breakdown
  const deptCounts: Record<string, { total: number; resolved: number }> = {};
  complaints.forEach((c) => {
    const d = c.assignedDepartment || 'Unassigned';
    if (!deptCounts[d]) deptCounts[d] = { total: 0, resolved: 0 };
    deptCounts[d].total += 1;
    if (c.status === 'Resolved') deptCounts[d].resolved += 1;
  });

  const departmentData = Object.keys(deptCounts).map((dept) => ({
    department: dept,
    total: deptCounts[dept].total,
    resolved: deptCounts[dept].resolved,
  }));

  // Weekly trend mock data
  const trendData = [
    { day: 'Mon', submitted: 8, resolved: 6 },
    { day: 'Tue', submitted: 12, resolved: 10 },
    { day: 'Wed', submitted: 15, resolved: 14 },
    { day: 'Thu', submitted: 9, resolved: 11 },
    { day: 'Fri', submitted: 14, resolved: 13 },
    { day: 'Sat', submitted: 5, resolved: 6 },
    { day: 'Sun', submitted: 3, resolved: 4 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Welfare Committee SLA Intelligence</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Campus SLA & Turnaround Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time department resolution speed, category breakdown, and SLA compliance scores
          </p>
        </div>

        <button
          onClick={() => alert('Official SLA Analytics Summary generated.')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Audit Report</span>
        </button>
      </div>

      {/* Metric Cards Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Avg Resolution Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">21.4 Hours</p>
          <p className="text-[11px] text-emerald-400 font-semibold">↓ 14% faster than last month</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>SLA Compliance Rate</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">96.2%</p>
          <p className="text-[11px] text-slate-400">Target: &gt;95.0%</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>SLA Breaches</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">
            {complaints.filter((c) => c.isSlaBreached).length} Tickets
          </p>
          <p className="text-[11px] text-rose-300 font-semibold">Requires department review</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Student Rating</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">4.8 / 5.0</p>
          <p className="text-[11px] text-slate-400">Based on 140+ verified ratings</p>
        </div>
      </div>

      {/* Visual Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Distribution Pie Chart */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white">Complaints Distribution by Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend Line Chart */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white">Weekly Inflow vs Resolution Volume</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke="#f59e0b" strokeWidth={3} name="Logged" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Efficiency Horizontal Bar Chart */}
        <div className="lg:col-span-12 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white">Department Resolution Load & Efficiency</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <XAxis dataKey="department" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Total Complaints" />
                <Bar dataKey="resolved" fill="#10b981" radius={[6, 6, 0, 0]} name="Resolved Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
