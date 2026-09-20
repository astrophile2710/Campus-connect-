import React, { useState, useEffect, useRef } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, Priority, User } from './types';
import { DEMO_USERS, INITIAL_COMPLAINTS } from './data/mockData';
import { fetchComplaintsByMailOrRoll, saveComplaintToSupabase, deleteComplaintFromSupabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { DashboardOverview } from './components/DashboardOverview';
import { ComplaintTrackerTable } from './components/ComplaintTrackerTable';
import { SubmitComplaintModal } from './components/SubmitComplaintModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { AdminAnalyticsView } from './components/AdminAnalyticsView';
import { CampusHelpFAQ } from './components/CampusHelpFAQ';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import {
  ChevronDown,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Building,
  UserCheck,
  ArrowDown,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  // User Authentication State - null by default to show Login Page first
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('srm_campus_user') || localStorage.getItem('nicaw_campus_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Complaints Data State
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('srm_campus_complaints') || localStorage.getItem('nicaw_campus_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  // Fetch complaints from Supabase / Local database specifically for currentUser email or studentId
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;
    async function loadUserComplaints() {
      if (!currentUser) return;
      const userComplaints = await fetchComplaintsByMailOrRoll(
        currentUser.email,
        currentUser.studentId,
        currentUser.role !== 'student'
      );

      if (isMounted && userComplaints && userComplaints.length > 0) {
        setComplaints(userComplaints);
      }
    }

    loadUserComplaints();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.email, currentUser?.studentId, currentUser?.role]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals & Drawers
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isAiAssistOpen, setIsAiAssistOpen] = useState<boolean>(false);

  // Scroll ref for "Swipe down to view details"
  const detailsRef = useRef<HTMLDivElement>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('srm_campus_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('srm_campus_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('srm_campus_user');
    }
  }, [currentUser]);

  // Smooth scroll down action
  const handleScrollDownToDetails = () => {
    if (detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle Tab Switch
  const handleTabChange = (tab: string) => {
    if (tab === 'submit') {
      if (currentUser?.role === 'student') {
        setIsSubmitModalOpen(true);
      }
      return;
    }
    setCurrentTab(tab);
  };

  // Submit New Complaint Handler
  const handleCreateComplaint = async (data: {
    title: string;
    category: ComplaintCategory;
    priority: Priority;
    location: string;
    description: string;
    isAnonymous: boolean;
    attachmentUrl?: string;
    attachmentType?: 'image' | 'video';
    attachmentName?: string;
    attachmentSize?: string;
  }) => {
    if (!currentUser) return;

    const newId = `CC-2024-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const slaHoursMap: Record<Priority, number> = {
      Urgent: 12,
      High: 24,
      Medium: 48,
      Low: 72,
    };

    const isVideo =
      data.attachmentType === 'video' ||
      (data.attachmentUrl &&
        (data.attachmentUrl.startsWith('data:video') ||
          data.attachmentUrl.includes('.mp4') ||
          data.attachmentUrl.includes('webm') ||
          data.attachmentUrl.includes('video')));

    const newComplaint: Complaint = {
      id: newId,
      title: data.title,
      category: data.category,
      priority: data.priority,
      location: data.location,
      description: data.description,
      isAnonymous: data.isAnonymous,
      studentId: currentUser.studentId || currentUser.id,
      studentName: data.isAnonymous ? 'Anonymous Student' : currentUser.name,
      studentEmail: currentUser.email,
      createdAt: now,
      updatedAt: now,
      status: 'Submitted',
      assignedDepartment: 'Estate & Maintenance (Electrical & Plumbing)',
      assignedStaff: 'Unassigned Officer',
      slaHours: slaHoursMap[data.priority],
      slaDueDate: new Date(Date.now() + slaHoursMap[data.priority] * 3600 * 1000).toISOString(),
      isSlaBreached: false,
      attachments: data.attachmentUrl
        ? [
            {
              id: `att-${Date.now()}`,
              name: data.attachmentName || (isVideo ? 'video_evidence.mp4' : 'photo_evidence.jpg'),
              size: data.attachmentSize || '2.4 MB',
              type: isVideo ? 'video' : 'image',
              url: data.attachmentUrl,
            },
          ]
        : [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'Submitted',
          title: 'Grievance Registered',
          note: `Logged by ${data.isAnonymous ? 'Anonymous Student' : currentUser.name}`,
          updatedBy: data.isAnonymous ? 'Anonymous Student' : currentUser.name,
          role: currentUser.role,
          timestamp: now,
        },
      ],
      comments: [],
    };

    // Store in Supabase tied to Mail ID & Roll No
    await saveComplaintToSupabase(newComplaint);

    setComplaints((prev) => [newComplaint, ...prev]);
    setIsSubmitModalOpen(false);
    setCurrentTab('track');
    handleScrollDownToDetails();
  };

  // Update Status Handler (Admin/Officer)
  const handleUpdateStatus = (
    complaintId: string,
    newStatus: ComplaintStatus,
    note?: string,
    proofAttachment?: string
  ) => {
    if (!currentUser) return;
    const now = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;

        const updatedTimeline = [
          ...c.timeline,
          {
            id: `tl-${Date.now()}`,
            status: newStatus,
            title: `Status Changed to ${newStatus}`,
            note: note || `Updated by ${currentUser.name}`,
            updatedBy: currentUser.name,
            role: currentUser.role,
            timestamp: now,
            proofAttachment,
          },
        ];

        const updated = {
          ...c,
          status: newStatus,
          updatedAt: now,
          resolutionSummary: newStatus === 'Resolved' ? note || c.resolutionSummary : c.resolutionSummary,
          officialProofImage: proofAttachment || c.officialProofImage,
          timeline: updatedTimeline,
        };

        // Sync with Supabase
        saveComplaintToSupabase(updated);

        return updated;
      })
    );

    setSelectedComplaint((prev) => (prev && prev.id === complaintId ? { ...prev, status: newStatus } : prev));
  };

  // Assign Department Handler
  const handleAssignDepartment = (complaintId: string, department: string, staff: string) => {
    if (!currentUser) return;
    const now = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;

        const updatedTimeline = [
          ...c.timeline,
          {
            id: `tl-${Date.now()}`,
            status: c.status === 'Submitted' ? 'Assigned' : c.status,
            title: `Routed to ${department}`,
            note: `Assigned to ${staff}`,
            updatedBy: currentUser.name,
            role: currentUser.role,
            timestamp: now,
          },
        ];

        const updated = {
          ...c,
          assignedDepartment: department,
          assignedStaff: staff,
          status: c.status === 'Submitted' ? 'Assigned' : c.status,
          updatedAt: now,
          timeline: updatedTimeline,
        };

        saveComplaintToSupabase(updated);

        return updated;
      })
    );
  };

  // Add Comment Handler
  const handleAddComment = (complaintId: string, message: string, isInternal: boolean) => {
    if (!currentUser) return;
    const now = new Date().toISOString();

    const newComment = {
      id: `cm-${Date.now()}`,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      message,
      timestamp: now,
      isInternalOnly: isInternal,
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const updated = {
          ...c,
          comments: [...c.comments, newComment],
        };

        saveComplaintToSupabase(updated);

        return updated;
      })
    );
  };

  // Student Rating Feedback Handler
  const handleSubmitFeedback = (complaintId: string, rating: number, feedbackText: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const updated = {
          ...c,
          rating,
          feedbackText,
        };

        saveComplaintToSupabase(updated);

        return updated;
      })
    );
  };

  // Delete Complaint Handler
  const handleDeleteComplaint = (complaintId: string) => {
    if (confirm(`Are you sure you want to delete ticket ${complaintId}?`)) {
      deleteComplaintFromSupabase(complaintId);
      setComplaints((prev) => prev.filter((c) => c.id !== complaintId));
      if (selectedComplaint?.id === complaintId) setSelectedComplaint(null);
    }
  };

  // 1. Unauthenticated Login Screen First
  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  const pendingCount = complaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const slaBreachCount = complaints.filter((c) => c.isSlaBreached).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-orange-600 selection:text-white">
      {/* Top Welcome / Swipe Down Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80 px-6 py-8 sm:py-12 relative overflow-hidden shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 px-4 py-1.5 rounded-full text-orange-300 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-orange-400" />
            <span>SRM Campus Resolution Portal</span>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Namaste, <span className="text-orange-400">{currentUser.name}</span>!
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              {currentUser.role === 'student'
                ? `Roll No: ${currentUser.studentId || 'RA2411003010042'} • SRM Grievance & SLA Resolution System`
                : `${currentUser.department || 'Dean of Student Welfare (DSW)'} • Admin Management Panel`}
            </p>
          </div>

          {/* Quick Badges Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
            <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{complaints.filter((c) => c.status === 'Resolved').length} Complaints Resolved</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 text-slate-300">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>{pendingCount} Pending Active Tickets</span>
            </div>
          </div>

          {/* Swipe / Scroll Down Interactive Bar */}
          <button
            onClick={handleScrollDownToDetails}
            className="group mt-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:to-amber-500 text-white px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-xl shadow-orange-600/20 flex items-center space-x-3 transition-all cursor-pointer animate-bounce"
          >
            <span>Swipe / Scroll Down to View Portal Details</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Target Scroll Destination */}
      <div ref={detailsRef} id="portal-details" className="scroll-mt-16">
        {/* Navbar */}
        <Navbar
          currentUser={currentUser}
          onSelectUser={(u) => setCurrentUser(u)}
          onLogout={() => setCurrentUser(null)}
          onOpenAiAssist={() => setIsAiAssistOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={(st) => {
            setSearchTerm(st);
            if (st && currentTab !== 'track') setCurrentTab('track');
          }}
          pendingCount={pendingCount}
        />

        {/* Main Portal Dashboard Layout */}
        <div className="max-w-[1600px] w-full mx-auto flex flex-1">
          {/* Left Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onTabChange={handleTabChange}
            userRole={currentUser.role}
            pendingCount={pendingCount}
            slaBreachCount={slaBreachCount}
          />

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
            {currentTab === 'dashboard' && (
              <DashboardOverview
                complaints={complaints}
                userRole={currentUser.role}
                onNavigateTab={handleTabChange}
                onSelectComplaint={(c) => setSelectedComplaint(c)}
                onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
                onOpenAiAssist={() => setIsAiAssistOpen(true)}
              />
            )}

            {currentTab === 'track' && (
              <ComplaintTrackerTable
                complaints={complaints}
                currentUser={currentUser}
                onSelectComplaint={(c) => setSelectedComplaint(c)}
                onDeleteComplaint={handleDeleteComplaint}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            )}

            {currentTab === 'analytics' && <AdminAnalyticsView complaints={complaints} />}

            {currentTab === 'help' && <CampusHelpFAQ />}
          </main>
        </div>
      </div>

      {/* Modals & Overlay Drawers */}
      {isSubmitModalOpen && (
        <SubmitComplaintModal
          currentUser={currentUser}
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmit={handleCreateComplaint}
        />
      )}

      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          currentUser={currentUser}
          onClose={() => setSelectedComplaint(null)}
          onUpdateStatus={handleUpdateStatus}
          onAssignDepartment={handleAssignDepartment}
          onAddComment={handleAddComment}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAiAssistOpen}
        onClose={() => setIsAiAssistOpen(false)}
        onOpenSubmitModal={() => {
          setIsAiAssistOpen(false);
          setIsSubmitModalOpen(true);
        }}
      />
    </div>
  );
}
