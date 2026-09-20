import React, { useState, useRef } from 'react';
import { ComplaintCategory, Priority, User } from '../types';
import {
  X,
  Sparkles,
  Building2,
  AlertCircle,
  FileText,
  MapPin,
  EyeOff,
  Upload,
  CheckCircle2,
  Home,
  GraduationCap,
  Utensils,
  Wifi,
  BookOpen,
  Bus,
  ShieldAlert,
  DollarSign,
  Send,
  Loader2,
  Image as ImageIcon,
  Video,
  Paperclip,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react';

interface SubmitComplaintModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (data: {
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
  }) => void;
}

const CATEGORY_OPTIONS: { name: ComplaintCategory; icon: any; desc: string }[] = [
  { name: 'Hostel & Housing', icon: Home, desc: 'Plumbing, heating, furniture, cleanliness' },
  { name: 'Academic & Exams', icon: GraduationCap, desc: 'Grades, exam keys, schedule conflicts' },
  { name: 'Infrastructure & Facilities', icon: Building2, desc: 'Elevators, AC, lighting, classrooms' },
  { name: 'Mess & Dining', icon: Utensils, desc: 'Food quality, hygiene, catering schedule' },
  { name: 'IT & Wi-Fi', icon: Wifi, desc: 'Eduroam signal, lab PCs, portal access' },
  { name: 'Library Services', icon: BookOpen, desc: 'Study space, book availability, noise' },
  { name: 'Transportation', icon: Bus, desc: 'Campus shuttle frequency, bus stops' },
  { name: 'Campus Safety & Security', icon: ShieldAlert, desc: 'Street lights, ID access, safety' },
  { name: 'Financial & Accounts', icon: DollarSign, desc: 'Tuition receipt, scholarship disbursement' },
];

const CATEGORY_SAMPLE_EVIDENCE: Record<
  ComplaintCategory,
  { label: string; url: string; type: 'image' | 'video'; size: string }[]
> = {
  'Hostel & Housing': [
    {
      label: 'Pipe Water Leakage (Photo)',
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '1.8 MB',
    },
    {
      label: 'Broken Furniture / Fan (Photo)',
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '2.1 MB',
    },
    {
      label: 'Pipe Burst Water Flow (Video)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      type: 'video',
      size: '4.8 MB',
    },
  ],
  'Mess & Dining': [
    {
      label: 'Unhygienic Food Tray (Photo)',
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '1.4 MB',
    },
    {
      label: 'Dirty Dining Table & Water (Photo)',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '2.0 MB',
    },
    {
      label: 'Mess Hall Issue (Video)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      type: 'video',
      size: '3.6 MB',
    },
  ],
  'IT & Wi-Fi': [
    {
      label: 'Wi-Fi Speed Test 0.1 Mbps (Photo)',
      url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '1.2 MB',
    },
    {
      label: 'Portal Login Auth Error (Photo)',
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '1.5 MB',
    },
    {
      label: 'Eduroam Disconnection (Video)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      type: 'video',
      size: '2.9 MB',
    },
  ],
  'Infrastructure & Facilities': [
    {
      label: 'Elevator Out of Service (Photo)',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '2.3 MB',
    },
    {
      label: 'AC Dripping Water (Photo)',
      url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '1.9 MB',
    },
    {
      label: 'Classroom Noise Issue (Video)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      type: 'video',
      size: '5.1 MB',
    },
  ],
  'Academic & Exams': [
    {
      label: 'Grade Sheet Discrepancy (Photo)',
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '1.1 MB',
    },
    {
      label: 'Exam Hall Seat Damage (Photo)',
      url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '1.7 MB',
    },
  ],
  'Campus Safety & Security': [
    {
      label: 'Dark Street Light Hazard (Photo)',
      url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '2.4 MB',
    },
    {
      label: 'Damaged Boundary Fence (Photo)',
      url: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '2.2 MB',
    },
    {
      label: 'Night Pathway Hazard (Video)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      type: 'video',
      size: '4.2 MB',
    },
  ],
  Transportation: [
    {
      label: 'Overcrowded Bus Queue (Video)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      type: 'video',
      size: '3.9 MB',
    },
    {
      label: 'Damaged Bus Shelter Seat (Photo)',
      url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '1.6 MB',
    },
  ],
  'Library Services': [
    {
      label: 'Damaged Book Inventory (Photo)',
      url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '1.8 MB',
    },
    {
      label: 'Reading Room Noise (Video)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4',
      type: 'video',
      size: '3.1 MB',
    },
  ],
  'Financial & Accounts': [
    {
      label: 'Fee Receipt Failed Transaction (Photo)',
      url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
      type: 'image',
      size: '1.3 MB',
    },
  ],
};

export const SubmitComplaintModal: React.FC<SubmitComplaintModalProps> = ({
  currentUser,
  onClose,
  onSubmit,
}) => {
  const [category, setCategory] = useState<ComplaintCategory>('Hostel & Housing');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Evidence Attachment State
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentType, setAttachmentType] = useState<'image' | 'video'>('image');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [attachmentSize, setAttachmentSize] = useState<string>('');
  const [attachmentMode, setAttachmentMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');
  const [aiError, setAiError] = useState('');

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video');
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAttachmentUrl(result);
        setAttachmentType(isVid ? 'video' : 'image');
        setAttachmentName(file.name);
        setAttachmentSize(sizeMB);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video');
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAttachmentUrl(result);
        setAttachmentType(isVid ? 'video' : 'image');
        setAttachmentName(file.name);
        setAttachmentSize(sizeMB);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Custom URL
  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();
    const isVid = url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('video');
    setAttachmentUrl(url);
    setAttachmentType(isVid ? 'video' : 'image');
    setAttachmentName(isVid ? 'web_video_evidence.mp4' : 'web_photo_evidence.jpg');
    setAttachmentSize('1.5 MB');
    setCustomUrlInput('');
  };

  // Clear Attachment
  const handleClearAttachment = () => {
    setAttachmentUrl('');
    setAttachmentType('image');
    setAttachmentName('');
    setAttachmentSize('');
  };

  // Gemini AI Refinement Call
  const handleAiRefine = async () => {
    if (!description && !title) {
      setAiError('Please type a brief summary or problem draft first before using AI Refinement.');
      return;
    }

    setIsAiProcessing(true);
    setAiError('');
    setAiSuccessMessage('');

    try {
      const draftText = title ? `${title}: ${description}` : description;
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refine', text: draftText }),
      });

      if (!res.ok) {
        throw new Error('AI Refinement endpoint unavailable.');
      }

      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.category && CATEGORY_OPTIONS.some((c) => c.name === data.category)) {
        setCategory(data.category as ComplaintCategory);
      }
      if (data.priority) setPriority(data.priority as Priority);
      if (data.refinedDescription) setDescription(data.refinedDescription);

      setAiSuccessMessage('Gemini AI refined your complaint into formal, structured administrative language!');
    } catch (err: any) {
      setAiError('Unable to connect to AI server. Proceeding with manual text input.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      title,
      category,
      priority,
      location: location.trim() || 'Main Campus',
      description,
      isAnonymous,
      attachmentUrl: attachmentUrl || undefined,
      attachmentType,
      attachmentName,
      attachmentSize,
    });
  };

  const sampleListForCategory = CATEGORY_SAMPLE_EVIDENCE[category] || CATEGORY_SAMPLE_EVIDENCE['Hostel & Housing'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Submit Campus Complaint</h3>
              <p className="text-xs text-slate-400">
                Log an official grievance ticket for department triage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* AI Banner Callout */}
          <div className="bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 border border-purple-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-xl">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-200">Gemini AI Auto-Formatter</p>
                <p className="text-[11px] text-purple-300/80">
                  Type rough notes below and click AI Refine to structure formal complaint wording.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAiRefine}
              disabled={isAiProcessing}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 transition-all cursor-pointer shrink-0 shadow-md shadow-purple-600/20"
            >
              {isAiProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Refining Text...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI Refine & Categorize</span>
                </>
              )}
            </button>
          </div>

          {aiSuccessMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{aiSuccessMessage}</span>
            </div>
          )}

          {aiError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Complaint Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-start space-x-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        isSelected ? 'text-blue-400' : 'text-slate-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{cat.name}</p>
                      <p className="text-[10px] opacity-70 line-clamp-1">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject & Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Subject / Issue Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Water Leakage in Hostel Block B Room 304"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low (General Maintenance)</option>
                <option value="Medium">Medium (Standard Ticket)</option>
                <option value="High">High (Impacting Living/Study)</option>
                <option value="Urgent">Urgent (Safety/Health Risk)</option>
              </select>
            </div>
          </div>

          {/* Location Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Campus Location / Room Number</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hostel Block B Room 304 or Central Library Floor 3"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue clearly. Mention time observed, frequency, and impact on campus routine..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            ></textarea>
          </div>

          {/* Photo & Video Evidence Attachment Section */}
          <div className="space-y-3 bg-slate-950/80 border border-slate-800 p-4.5 rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                <Paperclip className="w-4 h-4 text-indigo-400" />
                <span>Attach Evidence Proof (Photos & Videos)</span>
              </label>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setAttachmentMode('upload')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                    attachmentMode === 'upload'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Local File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttachmentMode('preset')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                    attachmentMode === 'preset'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Sample Issue Gallery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttachmentMode('url')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                    attachmentMode === 'url'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>Web Link</span>
                </button>
              </div>
            </div>

            {/* Active Attachment Preview if any attached */}
            {attachmentUrl ? (
              <div className="bg-slate-900 border border-emerald-500/40 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Evidence File Attached</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                      {attachmentType === 'video' ? '🎥 VIDEO' : '📷 PHOTO'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearAttachment}
                    className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-800/80 transition-colors cursor-pointer text-xs flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove File</span>
                  </button>
                </div>

                {/* Media Player / Image Preview */}
                <div className="rounded-xl overflow-hidden bg-black/60 border border-slate-800 max-h-52 flex items-center justify-center">
                  {attachmentType === 'video' ? (
                    <video
                      src={attachmentUrl}
                      controls
                      playsInline
                      className="w-full max-h-48 object-contain rounded-xl"
                    />
                  ) : (
                    <img
                      src={attachmentUrl}
                      alt={attachmentName || 'Proof image'}
                      className="w-full max-h-48 object-cover rounded-xl"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span className="font-semibold text-slate-200 truncate max-w-[280px]">
                    {attachmentName || 'campus_evidence_file'}
                  </span>
                  <span>{attachmentSize || '2.0 MB'}</span>
                </div>
              </div>
            ) : (
              <div>
                {/* MODE 1: Local File Drag & Drop / File Picker */}
                {attachmentMode === 'upload' && (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 bg-slate-900/60 hover:bg-slate-900 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        Click to Choose Photo or Video Proof or Drag & Drop File
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Supports JPEG, PNG, WEBP, MP4, WEBM, MOV (Max size: 50MB)
                      </p>
                    </div>

                    <div className="inline-flex items-center space-x-3 text-[10px] text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                      <span className="flex items-center space-x-1">
                        <ImageIcon className="w-3 h-3 text-blue-400" />
                        <span>Photos</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Video className="w-3 h-3 text-purple-400" />
                        <span>Videos</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* MODE 2: Category Sample Evidence Gallery */}
                {attachmentMode === 'preset' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400">
                      Select sample evidence proof for category: <strong className="text-slate-200">{category}</strong>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {sampleListForCategory.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAttachmentUrl(item.url);
                            setAttachmentType(item.type);
                            setAttachmentName(item.label);
                            setAttachmentSize(item.size);
                          }}
                          className="p-2.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 rounded-xl text-left text-xs flex items-center space-x-3 transition-all cursor-pointer group"
                        >
                          {item.type === 'video' ? (
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                              <Video className="w-5 h-5" />
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.label}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-slate-200 truncate group-hover:text-blue-300">
                              {item.label}
                            </p>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">
                              {item.type === 'video' ? '🎥 Video Clip' : '📷 Photo'} • {item.size}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MODE 3: Direct Web Link */}
                {attachmentMode === 'url' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400">
                      Paste a direct image or video URL (Google Drive, Cloud storage, Imgur, MP4 link):
                    </p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        placeholder="https://example.com/evidence_photo.jpg or video.mp4"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomUrl}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Attach Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confidential / Anonymous Toggle */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Submit Anonymously</p>
                <p className="text-[11px] text-slate-400">
                  Hides your name and student ID from staff view.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
