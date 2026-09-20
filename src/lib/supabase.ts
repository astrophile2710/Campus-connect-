import { createClient } from '@supabase/supabase-js';
import { Complaint, User } from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'MY_SUPABASE_URL');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Interface for stored users in Supabase srm_users table
 */
export interface RegisteredUserRecord {
  id: string;
  name: string;
  email: string;
  student_id: string;
  role: 'student' | 'admin' | 'officer';
  department?: string;
  avatar?: string;
  phone?: string;
  password?: string;
  created_at?: string;
}

/**
 * Register a user in Supabase or LocalStorage
 */
export async function registerUserInSupabase(user: User, passwordVal: string): Promise<{ success: boolean; user: User; message?: string }> {
  const cleanPassword = passwordVal.trim();
  const userWithPassword = { ...user, password: cleanPassword };

  // Save to LocalStorage registry first
  const existingUsers: any[] = JSON.parse(localStorage.getItem('srm_registered_users') || '[]');
  const filtered = existingUsers.filter(
    u => u.email.toLowerCase() !== user.email.toLowerCase() && u.studentId?.toLowerCase() !== user.studentId?.toLowerCase()
  );
  const updated = [...filtered, userWithPassword];
  localStorage.setItem('srm_registered_users', JSON.stringify(updated));

  if (supabase) {
    try {
      const { error } = await supabase.from('srm_users').upsert({
        id: user.id,
        name: user.name,
        email: user.email.toLowerCase(),
        student_id: user.studentId || user.id,
        role: user.role,
        department: user.department || null,
        avatar: user.avatar || user.name.slice(0, 2).toUpperCase(),
        phone: user.phone || null,
        password: cleanPassword,
      }, { onConflict: 'email' });

      if (error) {
        console.warn('Supabase user save notice:', error.message);
      }
    } catch (e) {
      console.warn('Supabase operation fallback:', e);
    }
  }

  return { success: true, user };
}

/**
 * Authenticate or retrieve user strictly from Supabase / LocalStorage
 */
export async function authenticateUserInSupabase(emailOrRoll: string, passwordInput: string): Promise<{ user: User | null; message: string }> {
  const queryLower = emailOrRoll.trim().toLowerCase();
  const cleanPasswordInput = passwordInput.trim();

  const isMatch = (stored: string, input: string) => {
    const s1 = stored.trim();
    const s2 = input.trim();
    if (s1.toUpperCase() === s2.toUpperCase()) return true;
    const n1 = s1.replace(/[-/\s]/g, '').toUpperCase();
    const n2 = s2.replace(/[-/\s]/g, '').toUpperCase();
    return n1.length > 0 && n1 === n2;
  };

  // 1. Try Supabase if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('srm_users')
        .select('*')
        .or(`email.eq.${queryLower},student_id.eq.${queryLower.toUpperCase()}`)
        .maybeSingle();

      if (!error && data) {
        const storedPassword = (data.password || data.student_id || '').trim();
        if (storedPassword && !isMatch(storedPassword, cleanPasswordInput)) {
          const passType = data.role === 'admin' ? 'Date of Birth' : 'Register Number';
          return { user: null, message: `Incorrect ${passType} password! Please verify your password.` };
        }

        const userObj: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          studentId: data.student_id,
          department: data.department || undefined,
          avatar: data.avatar || data.name.slice(0, 2).toUpperCase(),
          phone: data.phone || '+91 98765 43210',
        };
        return { user: userObj, message: 'Login successful' };
      }
    } catch (e) {
      console.warn('Supabase query fallback to local:', e);
    }
  }

  // 2. Check local registered users list
  const existingUsers: any[] = JSON.parse(localStorage.getItem('srm_registered_users') || '[]');
  const found = existingUsers.find(
    u => u.email.toLowerCase() === queryLower || u.studentId?.toLowerCase() === queryLower
  );

  if (found) {
    const storedPassword = (found.password || found.studentId || '').trim();
    if (storedPassword && !isMatch(storedPassword, cleanPasswordInput)) {
      const passType = found.role === 'admin' ? 'Date of Birth' : 'Register Number';
      return { user: null, message: `Incorrect ${passType} password! Please verify your password.` };
    }

    const userObj: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      studentId: found.studentId,
      department: found.department,
      avatar: found.avatar,
      phone: found.phone,
    };
    return { user: userObj, message: 'Login successful' };
  }

  return { user: null, message: 'Account not found! You must sign up first before logging in.' };
}

/**
 * Fetch complaints linked to a particular Mail ID or Roll Number
 */
export async function fetchComplaintsByMailOrRoll(
  email: string,
  studentId?: string,
  isStaff: boolean = false
): Promise<Complaint[]> {
  // If staff/admin, fetch all complaints
  if (supabase) {
    try {
      let query = supabase.from('srm_complaints').select('*');

      if (!isStaff) {
        // Particular student complaints filter
        query = query.or(`student_email.eq.${email.toLowerCase()},student_id.eq.${(studentId || '').toUpperCase()}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          priority: item.priority,
          location: item.location,
          description: item.description,
          isAnonymous: item.is_anonymous,
          studentId: item.student_id,
          studentName: item.student_name,
          studentEmail: item.student_email,
          createdAt: item.created_at,
          updatedAt: item.updated_at || item.created_at,
          status: item.status,
          assignedDepartment: item.assigned_department,
          assignedStaff: item.assigned_staff || 'Unassigned Officer',
          slaHours: item.sla_hours || 24,
          slaDueDate: item.sla_due_date,
          isSlaBreached: item.is_sla_breached || false,
          resolutionSummary: item.resolution_summary,
          officialProofImage: item.official_proof_image,
          attachments: item.attachments || [],
          timeline: item.timeline || [],
          comments: item.comments || [],
          rating: item.rating,
          feedbackText: item.feedback_text,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch complaint error:', e);
    }
  }

  // LocalStorage fallback filtering by email or roll no
  const localComplaints: Complaint[] = JSON.parse(
    localStorage.getItem('srm_campus_complaints') || '[]'
  );

  if (isStaff) {
    return localComplaints;
  }

  return localComplaints.filter(
    c =>
      c.studentEmail?.toLowerCase() === email.toLowerCase() ||
      c.studentId?.toLowerCase() === (studentId || '').toLowerCase()
  );
}

/**
 * Store or upsert a complaint in Supabase and sync with local state
 */
export async function saveComplaintToSupabase(complaint: Complaint): Promise<boolean> {
  if (supabase) {
    try {
      const dbRow = {
        id: complaint.id,
        title: complaint.title,
        category: complaint.category,
        priority: complaint.priority,
        location: complaint.location,
        description: complaint.description,
        is_anonymous: complaint.isAnonymous,
        student_id: complaint.studentId,
        student_name: complaint.studentName,
        student_email: complaint.studentEmail.toLowerCase(),
        created_at: complaint.createdAt,
        updated_at: complaint.updatedAt,
        status: complaint.status,
        assigned_department: complaint.assignedDepartment,
        assigned_staff: complaint.assignedStaff,
        sla_hours: complaint.slaHours,
        sla_due_date: complaint.slaDueDate,
        is_sla_breached: complaint.isSlaBreached,
        resolution_summary: complaint.resolutionSummary || null,
        official_proof_image: complaint.officialProofImage || null,
        attachments: complaint.attachments || [],
        timeline: complaint.timeline || [],
        comments: complaint.comments || [],
        rating: complaint.rating || null,
        feedback_text: complaint.feedbackText || null,
      };

      const { error } = await supabase.from('srm_complaints').upsert(dbRow, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase complaint save notice:', error.message);
      }
    } catch (e) {
      console.warn('Supabase save complaint fallback:', e);
    }
  }

  return true;
}

/**
 * Delete a complaint from Supabase
 */
export async function deleteComplaintFromSupabase(complaintId: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('srm_complaints').delete().eq('id', complaintId);
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  }
  return true;
}
