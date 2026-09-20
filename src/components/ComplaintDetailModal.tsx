import React, { useState } from 'react';
import { Complaint, ComplaintStatus, User, UserRole } from '../types';
import { DEPARTMENTS, DEPARTMENT_STAFF } from '../data/mockData';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  UserCheck,
  Send,
  Sparkles,
  Printer,
  ShieldCheck,
  MessageSquare,
  Star,
  MapPin,
  Calendar,
  Lock,
  Loader2,
  FileText,
  Paperclip,
  Check,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint;
  currentUser: User;
  onClose: () => void;
  onUpdateStatus: (
    complaintId: string,
    newStatus: ComplaintStatus,
    note?: string,
    proofAttachment?: string
  ) => void;
  onAssignDepartment: (complaintId: string, department: string, staff: string) => void;
  onAddComment: (complaintId: string, message: string, isInternal: boolean) => void;
  onSubmitFeedback: (complaintId: string, rating: number, feedbackText: string) => void;
}

const STATUS_STEPS: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
];

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  currentUser,
  onClose,
  onUpdateStatus,
  onAssignDepartment,
  onAddComment,
  onSubmitFeedback,
}) => {
  const isAdminOrOfficer = currentUser.role === 'admin' || currentUser.role === 'officer';

  // Admin Controls State
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
  const [resolutionNote, setResolutionNote] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [selectedDept, setSelectedDept] = useState(complaint.assignedDepartment || DEPARTMENTS[0]);
  const [selectedStaff, setSelectedStaff] = useState(complaint.assignedStaff || '');

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  // Student Feedback State
  const [rating, setRating] = useState(complaint.rating || 5);
  const [feedbackText, setFeedbackText] = useState(complaint.feedbackText || '');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(!!complaint.rating);

  // AI Suggestions State
  const [aiSuggestions, setAiSuggestions] = useState<{ steps: string[]; recommendedDepartment?: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Calculate current step index for timeline
  const currentStepIndex = STATUS_STEPS.indexOf(complaint.status);

  // Gemini AI Suggest Resolution Plan
  const handleFetchAiSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest_solution',
          text: `${complaint.title}: ${complaint.description}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyStatusChange = () => {
    onUpdateStatus(complaint.id, selectedStatus, resolutionNote, proofImage);
  };

  const handleApplyAssignment = () => {
    onAssignDepartment(complaint.id, selectedDept, selectedStaff);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(complaint.id, commentText, isInternalComment);
    setCommentText('');
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitFeedback(complaint.id, rating, feedbackText);
    setFeedbackSubmitted(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-black bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-xl">
              {complaint.id}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                complaint.status === 'Resolved'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {complaint.status}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Ticket</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Ticket Title & Meta */}
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">{complaint.title}</h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{complaint.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>Category: <strong className="text-slate-200">{complaint.category}</strong></span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Logged: {new Date(complaint.createdAt).toLocaleString()}</span>
              </span>
            </div>
          </div>

          {/* Visual Step-by-Step Resolution Timeline */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Resolution Progress Bar
            </p>

            <div className="grid grid-cols-5 gap-2 relative">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center text-center space-y-1.5 z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                          : isPassed
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {isPassed && !isCurrent ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        isCurrent
                          ? 'text-blue-400'
                          : isPassed
                          ? 'text-slate-200'
                          : 'text-slate-600'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Issue Description Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Original Issue Description
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>

            {/* Evidence Attachments if any */}
            {complaint.attachments.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <p className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Student Attached Evidence ({complaint.attachments.length})</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {complaint.attachments.map((att) => {
                    const isVideo =
                      att.type === 'video' ||
                      att.url.startsWith('data:video') ||
                      att.url.endsWith('.mp4') ||
                      att.url.endsWith('.webm') ||
                      att.url.includes('video');

                    return (
                      <div
                        key={att.id}
                        className="bg-slate-900 border border-slate-700/80 p-3 rounded-2xl flex flex-col space-y-2 group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200 truncate max-w-[200px]" title={att.name}>
                            {att.name}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            isVideo ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}>
                            {isVideo ? '🎥 VIDEO PROOF' : '📷 PHOTO EVIDENCE'}
                          </span>
                        </div>

                        {isVideo ? (
                          <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800">
                            <video
                              src={att.url}
                              controls
                              playsInline
                              preload="metadata"
                              className="w-full max-h-48 object-contain"
                            >
                              Your browser does not support HTML5 video playback.
                            </video>
                          </div>
                        ) : (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group/img overflow-hidden rounded-xl border border-slate-800 block"
                          >
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-full h-36 object-cover group-hover/img:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-xs text-white font-bold transition-opacity">
                              Click to Enlarge
                            </div>
                          </a>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>Size: {att.size || '2.1 MB'}</span>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 underline font-semibold"
                          >
                            Open Full Screen ↗
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ADMIN ACTION PANEL (Only visible to Admin & Officers) */}
          {isAdminOrOfficer && (
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                <div className="flex items-center space-x-2 text-indigo-300">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Officer Administration Panel</h3>
                </div>

                <button
                  type="button"
                  onClick={handleFetchAiSuggestions}
                  disabled={isAiLoading}
                  className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  {isAiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  )}
                  <span>Get Gemini Action Steps</span>
                </button>
              </div>

              {/* AI Suggested Steps */}
              {aiSuggestions && (
                <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl text-xs space-y-2">
                  <p className="font-bold text-purple-200 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Gemini AI Recommended Official Steps</span>
                  </p>
                  <ul className="list-disc list-inside text-purple-300 space-y-1">
                    {aiSuggestions.steps.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Status Update & Resolution Note Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Switcher */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Update Ticket Status
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {STATUS_STEPS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleApplyStatusChange}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Department Assignment */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Assign Department & Staff
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedDept}
                      onChange={(e) => {
                        setSelectedDept(e.target.value);
                        setSelectedStaff(DEPARTMENT_STAFF[e.target.value]?.[0] || '');
                      }}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleApplyAssignment}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>

              {/* Resolution Proof Attachment Box */}
              {selectedStatus === 'Resolved' && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-emerald-400">Resolution Note & Proof Image</p>
                  <textarea
                    rows={2}
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Provide official resolution summary for the student..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Student Feedback & Rating Section (When ticket is resolved) */}
          {complaint.status === 'Resolved' && (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-white">Issue Resolved</h3>
                </div>
                <span className="text-xs text-emerald-300 font-mono">Case Closed</span>
              </div>

              {complaint.resolutionSummary && (
                <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <strong>Official Resolution Summary:</strong> {complaint.resolutionSummary}
                </p>
              )}

              {/* Student Rating Box */}
              {!feedbackSubmitted ? (
                <form onSubmit={handleSendFeedback} className="space-y-3 pt-2">
                  <p className="text-xs font-bold text-slate-200">Rate Department Resolution Quality</p>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Optional feedback for welfare committee..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500"
                  />

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Submit Feedback Rating
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl space-y-1">
                  <div className="flex items-center space-x-1">
                    <span className="font-bold">Student Rating:</span>
                    <div className="flex text-amber-400">
                      {[...Array(rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  {feedbackText && <p>"{feedbackText}"</p>}
                </div>
              )}
            </div>
          )}

          {/* Timeline Audit Logs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Audit Logs & Activity History
            </h4>

            <div className="space-y-2">
              {complaint.timeline.map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between text-xs text-slate-300"
                >
                  <div>
                    <p className="font-bold text-white">{event.title}</p>
                    {event.note && <p className="text-slate-400 mt-0.5">{event.note}</p>}
                    <p className="text-[10px] text-slate-500 mt-1">
                      Updated by {event.updatedBy} ({event.role})
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Thread */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Discussion & Officer Notes ({complaint.comments.length})</span>
              </h4>

              {isAdminOrOfficer && (
                <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalComment}
                    onChange={(e) => setIsInternalComment(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0"
                  />
                  <span>Internal Staff Only</span>
                </label>
              )}
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {complaint.comments.map((cm) => (
                <div
                  key={cm.id}
                  className={`p-3 rounded-2xl border text-xs space-y-1 ${
                    cm.isInternalOnly
                      ? 'bg-purple-950/40 border-purple-500/30 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center space-x-2">
                      <span>{cm.senderName}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {cm.senderRole}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(cm.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-300">{cm.message}</p>
                </div>
              ))}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handleSendComment} className="flex space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post a message or update..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
