import React from 'react';
import { Complaint, UserRole } from '../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  PlusCircle,
  TrendingUp,
  Building,
  UserCheck,
  ChevronRight,
  Sparkles,
  MapPin,
  ShieldCheck,
  ArrowUpRight,
  Star,
} from 'lucide-react';

interface DashboardOverviewProps {
  complaints: Complaint[];
  userRole: UserRole;
  onNavigateTab: (tab: string) => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onOpenSubmitModal: () => void;
  onOpenAiAssist: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  complaints,
  userRole,
  onNavigateTab,
  onSelectComplaint,
  onOpenSubmitModal,
  onOpenAiAssist,
}) => {
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const inProgress = complaints.filter((c) => c.status === 'Assigned' || c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const slaBreached = complaints.filter((c) => c.isSlaBreached).length;
  const urgentCount = complaints.filter((c) => c.priority === 'Urgent' && c.status !== 'Resolved').length;

  const urgentComplaints = complaints.filter((c) => c.priority === 'Urgent' && c.status !== 'Resolved');
  const recentComplaints = complaints.slice(0, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus Connect Student Resolution Hub</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Welcome back to your <span className="text-blue-400">Dashboard</span>
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
              Track active issues, log new facility or academic concerns, and monitor official department response progress in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {userRole === 'student' && (
              <button
                onClick={onOpenSubmitModal}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/25 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log New Complaint</span>
              </button>
            )}

            <button
              onClick={onOpenAiAssist}
              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>AI Draft Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Action Warning Box (if any urgent complaints exist) */}
      {urgentCount > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 text-rose-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400 shrink-0">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-100">
                {urgentCount} Urgent Active Ticket{urgentCount > 1 ? 's' : ''} Require Attention
              </p>
              <p className="text-[11px] text-rose-300/80">
                High-priority safety or dining issues currently undergoing expedited triage.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('track')}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shrink-0 transition-colors cursor-pointer"
          >
            Review Priority Tickets
          </button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Card 1: Total */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Tickets</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{total}</span>
            <span className="text-[10px] text-slate-500 font-medium">Recorded</span>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-400">{pending}</span>
            <span className="text-[10px] text-amber-500/80 font-medium">In Queue</span>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-indigo-400">{inProgress}</span>
            <span className="text-[10px] text-indigo-300/80 font-medium font-mono">Assigned</span>
          </div>
        </div>

        {/* Card 4: Resolved */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-400">{resolved}</span>
            <span className="text-[10px] text-emerald-500/80 font-medium">Closed</span>
          </div>
        </div>

        {/* Card 5: SLA Breaches */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-rose-500/30 transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">SLA Status</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-rose-400">{slaBreached}</span>
            <span className="text-[10px] text-rose-300 font-medium">Overdue SLA</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Tickets & Department Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Active Complaint Cards */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Recent Complaint Activity</h3>
              <p className="text-xs text-slate-400">Click any ticket to view live progress timeline & officer comments</p>
            </div>
            <button
              onClick={() => onNavigateTab('track')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({complaints.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentComplaints.map((c) => {
              const getStatusBadge = (status: string) => {
                switch (status) {
                  case 'Submitted':
                    return 'bg-slate-800 text-slate-300 border-slate-700';
                  case 'Under Review':
                    return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
                  case 'Assigned':
                  case 'In Progress':
                    return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
                  case 'Resolved':
                    return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
                  default:
                    return 'bg-slate-800 text-slate-300';
                }
              };

              const getPriorityBadge = (p: string) => {
                switch (p) {
                  case 'Urgent':
                    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                  case 'High':
                    return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                  case 'Medium':
                    return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
                  default:
                    return 'bg-slate-800 text-slate-400 border-slate-700';
                }
              };

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className="bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-blue-500/40 p-4 rounded-2xl transition-all cursor-pointer group space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-blue-400 transition-colors">
                        {c.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(c.priority)}`}>
                        {c.priority} Priority
                      </span>
                      {c.isAnonymous && (
                        <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                          Anonymous
                        </span>
                      )}
                    </div>

                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {c.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 gap-2">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate max-w-[200px]">{c.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.assignedDepartment}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Info Sidebar: SLA Guidelines & Quick Campus Help */}
        <div className="lg:col-span-4 space-y-6">
          {/* SLA Response Timetable */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <Clock className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Campus Resolution Service Levels</h3>
            </div>
            <p className="text-xs text-slate-400">
              Guaranteed maximum resolution timeframe based on urgency triage:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="font-bold text-rose-400">Urgent Safety / Food</span>
                <span className="font-mono text-slate-300 font-semibold">Max 12 Hours</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400">High Hostel / Electrical</span>
                <span className="font-mono text-slate-300 font-semibold">Max 24 Hours</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="font-bold text-sky-400">Medium IT / Academic</span>
                <span className="font-mono text-slate-300 font-semibold">Max 48 Hours</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-400">Low Maintenance</span>
                <span className="font-mono text-slate-300 font-semibold">Max 72 Hours</span>
              </div>
            </div>
          </div>

          {/* Student Feedback Rating Highlights */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/50 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Student Satisfaction</span>
              <div className="flex items-center text-amber-400 space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-2xl font-black text-white">94.8% Rating</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Based on 140+ student resolution reviews this semester.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
