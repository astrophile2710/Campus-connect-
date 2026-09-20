import React, { useState } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, User, UserRole } from '../types';
import { DEPARTMENTS } from '../data/mockData';
import {
  Search,
  Filter,
  Download,
  Eye,
  Building,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ListFilter,
  ShieldCheck,
  MapPin,
  Trash2,
} from 'lucide-react';

interface ComplaintTrackerTableProps {
  complaints: Complaint[];
  currentUser: User;
  onSelectComplaint: (complaint: Complaint) => void;
  onDeleteComplaint?: (complaintId: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const ComplaintTrackerTable: React.FC<ComplaintTrackerTableProps> = ({
  complaints,
  currentUser,
  onSelectComplaint,
  onDeleteComplaint,
  searchTerm = '',
  onSearchChange,
}) => {
  const isAdminOrOfficer = currentUser.role === 'admin' || currentUser.role === 'officer';

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [onlyMyComplaints, setOnlyMyComplaints] = useState<boolean>(!isAdminOrOfficer);

  // Filter complaints logic
  const filtered = complaints.filter((c) => {
    // Role filter
    if (onlyMyComplaints && c.studentId !== currentUser.id && c.studentEmail !== currentUser.email) {
      return false;
    }

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchLoc = c.location.toLowerCase().includes(q);
      const matchStudent = c.studentName.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchDesc && !matchLoc && !matchStudent) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;

    // Status filter
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;

    // Priority filter
    if (selectedPriority !== 'all' && c.priority !== selectedPriority) return false;

    // Department filter
    if (selectedDept !== 'all' && c.assignedDepartment !== selectedDept) return false;

    return true;
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Location', 'Department', 'Logged At'];
    const rows = filtered.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.status,
      `"${c.location.replace(/"/g, '""')}"`,
      c.assignedDepartment,
      c.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_connect_complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            {isAdminOrOfficer ? 'All Campus Complaint Tickets' : 'My Complaint Portal'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Filter, inspect, and track real-time resolution timeline progress
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Hostel & Housing">Hostel & Housing</option>
              <option value="Academic & Exams">Academic & Exams</option>
              <option value="Infrastructure & Facilities">Infrastructure & Facilities</option>
              <option value="Mess & Dining">Mess & Dining</option>
              <option value="IT & Wi-Fi">IT & Wi-Fi</option>
              <option value="Library Services">Library Services</option>
              <option value="Transportation">Transportation</option>
              <option value="Campus Safety & Security">Campus Safety & Security</option>
              <option value="Financial & Accounts">Financial & Accounts</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle My Complaints */}
          <div className="flex items-end">
            <label className="w-full flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 cursor-pointer">
              <span className="font-semibold">Only My Complaints</span>
              <input
                type="checkbox"
                checked={onlyMyComplaints}
                onChange={(e) => setOnlyMyComplaints(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Complaints Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="p-4">Ticket ID</th>
                <th className="p-4">Subject & Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Department</th>
                <th className="p-4">Logged</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.length > 0 ? (
                filtered.map((c) => {
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
                    <tr
                      key={c.id}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="p-4 font-mono font-bold text-blue-400">
                        {c.id}
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                          {c.title}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {c.location} • {c.description}
                        </p>
                      </td>

                      <td className="p-4 text-slate-300 font-medium">
                        {c.category}
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getPriorityBadge(c.priority)}`}>
                          {c.priority}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full border text-[10px] font-bold ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>
                      </td>

                      <td className="p-4 text-slate-300">
                        <div className="flex items-center space-x-1">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          <span>{c.assignedDepartment}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onSelectComplaint(c)}
                            className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 p-2 rounded-xl border border-blue-500/30 transition-colors cursor-pointer"
                            title="Inspect Complaint Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isAdminOrOfficer && onDeleteComplaint && (
                            <button
                              onClick={() => onDeleteComplaint(c.id)}
                              className="bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 p-2 rounded-xl border border-rose-500/30 transition-colors cursor-pointer"
                              title="Delete Ticket"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No complaints match your selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
