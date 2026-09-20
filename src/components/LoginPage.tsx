import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { registerUserInSupabase, authenticateUserInSupabase } from '../lib/supabase';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Mail,
  AlertCircle,
  KeyRound,
  UserPlus,
  LogIn,
  IdCard,
  User as PersonIcon,
  Calendar,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // Default to 'signup' mode so user must sign up first
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  
  // Input fields
  const [nameInput, setNameInput] = useState('');
  const [rollInput, setRollInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanRollNo = rollInput.trim().toUpperCase();
    const cleanDob = dobInput.trim();
    const cleanPassword = passwordInput.trim();

    // Regex for Register Number: Starts with 'RA' followed by exactly 12 digits
    const raRegisterNoRegex = /^RA\d{12}$/i;

    // -------------------------------------------------------------------
    // SIGN UP FLOW
    // -------------------------------------------------------------------
    if (authMode === 'signup') {
      if (!nameInput.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }

      if (!cleanEmail) {
        setErrorMessage('Please enter your official SRM email address.');
        return;
      }

      // STRICT DOMAIN CHECK: Must end with @srmist.edu.in
      if (!cleanEmail.endsWith('@srmist.edu.in')) {
        setErrorMessage('Incorrect Email Address! Email must end with @srmist.edu.in');
        return;
      }

      let passwordToSave = '';
      let studentIdToSave = '';

      if (selectedRole === 'student') {
        // STRICT REGISTER NUMBER CHECK FOR STUDENTS: Must start with RA followed by 12 digits
        if (!cleanRollNo) {
          setErrorMessage('Please enter your SRM Register Number starting with RA followed by 12 digits.');
          return;
        }

        if (!raRegisterNoRegex.test(cleanRollNo)) {
          setErrorMessage('Incorrect Register Number! Must start with "RA" followed by exactly 12 digits (e.g. RA241100301004).');
          return;
        }

        studentIdToSave = cleanRollNo;
        passwordToSave = cleanRollNo;
      } else {
        // WARDEN / ADMIN ROLE
        if (!cleanRollNo) {
          setErrorMessage('Please enter your Warden / Staff Employee ID (e.g. WRD-1024 or DSW-001).');
          return;
        }

        if (!cleanDob) {
          setErrorMessage('Please enter your Date of Birth (e.g. 15/08/1980). This will act as your Warden password.');
          return;
        }

        studentIdToSave = cleanRollNo;
        passwordToSave = cleanDob;
      }

      const initials = nameInput.trim().split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'SR';

      const newUser: User = {
        id: `${selectedRole === 'student' ? 'STU' : 'ADM'}-${Date.now().toString().slice(-4)}`,
        name: nameInput.trim(),
        email: cleanEmail,
        role: selectedRole,
        studentId: studentIdToSave,
        department: selectedRole === 'admin' ? 'SRM Hostel Administration & Warden Office' : undefined,
        avatar: initials,
        phone: selectedRole === 'admin' ? '+91 94222 00002' : '+91 98765 43210',
      };

      // Store in Supabase & Local state
      await registerUserInSupabase(newUser, passwordToSave);
      onLogin(newUser);
      return;
    }

    // -------------------------------------------------------------------
    // LOGIN FLOW (Cannot login without signing up first)
    // -------------------------------------------------------------------
    if (!emailInput.trim()) {
      setErrorMessage(
        selectedRole === 'admin'
          ? 'Please enter your registered SRM Warden Email ID (@srmist.edu.in) or Staff ID.'
          : 'Please enter your registered SRM Email ID (@srmist.edu.in) or Register Number.'
      );
      return;
    }

    // Check email domain if an email address is provided
    if (cleanEmail.includes('@') && !cleanEmail.endsWith('@srmist.edu.in')) {
      setErrorMessage('Incorrect Email Address! Email must end with @srmist.edu.in');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage(
        selectedRole === 'admin'
          ? 'Please enter your password (your Date of Birth, e.g. 15/08/1980).'
          : 'Please enter your password (your RA Register Number).'
      );
      return;
    }

    if (selectedRole === 'student' && !raRegisterNoRegex.test(cleanPassword.toUpperCase())) {
      setErrorMessage('Incorrect Password format! Student password must be your RA Register Number starting with "RA" followed by 12 digits.');
      return;
    }

    // Authenticate strictly against registered accounts
    const authResult = await authenticateUserInSupabase(emailInput, cleanPassword);
    if (authResult.user) {
      if (authResult.user.role !== selectedRole) {
        setErrorMessage(
          `Role mismatch! Account "${authResult.user.email}" is registered as a ${
            authResult.user.role === 'student' ? 'Student' : 'Warden / Admin'
          }. Please select the ${authResult.user.role === 'student' ? 'Student' : 'Warden / Admin'} role option above.`
        );
        return;
      }

      onLogin(authResult.user);
      return;
    }

    // If user is not found or password fails
    setErrorMessage(authResult.message || 'Account not found! You must sign up first before logging in.');
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(234,88,12,0.15),rgba(255,255,255,0))] flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Branding Column */}
        <div className="md:col-span-5 space-y-6 text-white">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>SRM Campus Portal Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            SRM <span className="text-orange-500">Student Complaint</span> Portal
            <span className="block text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">
              Grievance & Resolution Hub
            </span>
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Official SRM Institute portal for Hostel Warden escalation, Central Mess hygiene audits, Paari & MRA Hall maintenance, and Academic requests with Supabase database integration.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-200">Strict Domain Verification</p>
                <p className="text-[11px] text-slate-400">Registration is restricted exclusively to authorized <code className="text-orange-400 font-mono">@srmist.edu.in</code> student & staff emails.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-200">Supabase Persistent Storage</p>
                <p className="text-[11px] text-slate-400">All registered complaints are saved directly under your particular Mail ID or RA Roll Number.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-200">SRM Hostel & Mess SLA Resolution</p>
                <p className="text-[11px] text-slate-400">Guaranteed 12 to 24-hour SLA tracking for urgent campus & hostel tickets.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Credentials Form Column */}
        <div className="md:col-span-7 bg-slate-900/95 border border-slate-800 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
          {/* Login / Sign Up Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex space-x-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage('');
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </div>

            <div className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              {authMode === 'login' ? 'Sign In to SRM Portal' : 'Create SRM Portal Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {authMode === 'login'
                ? 'Enter your SRM Email ID or RA Roll Number and Password'
                : 'Registration requires an official @srmist.edu.in email address'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {errorMessage && (
              <div className="flex items-start space-x-2 p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Role Switcher */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Select Account Role
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'student'
                      ? 'bg-slate-800 text-orange-400 border border-orange-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Student / Scholar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'bg-slate-800 text-orange-400 border border-orange-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Warden / DSW / Admin</span>
                </button>
              </div>
            </div>

            {/* Full Name input (Sign Up mode) */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <PersonIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            {/* Campus Email ID input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {authMode === 'signup'
                  ? 'SRM Email Address (@srmist.edu.in required)'
                  : selectedRole === 'admin'
                  ? 'SRM Warden Email Address or Staff ID'
                  : 'SRM Email Address or Register Number'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={
                    authMode === 'signup'
                      ? 'e.g. name@srmist.edu.in'
                      : selectedRole === 'admin'
                      ? 'e.g. warden.name@srmist.edu.in or WRD-1024'
                      : 'e.g. student.name@srmist.edu.in or RA241100301004'
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {authMode === 'signup' && (
                <p className="text-[10px] text-orange-400/90 mt-1">
                  Must end with <span className="font-mono font-bold">@srmist.edu.in</span>.
                </p>
              )}
            </div>

            {/* SIGN UP CREDENTIALS FIELDS */}
            {authMode === 'signup' && (
              selectedRole === 'student' ? (
                /* Student Register Number */
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    SRM Register Number <span className="text-orange-400 font-normal">(Acts as your Password)</span>
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={rollInput}
                      onChange={(e) => setRollInput(e.target.value)}
                      placeholder="e.g. RA241100301004"
                      maxLength={14}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 tracking-wider font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Must start with <span className="text-orange-400 font-mono font-bold">RA</span> followed by 12 digits (e.g. <span className="font-mono text-slate-300">RA241100301004</span>). This will be your student password.
                  </p>
                </div>
              ) : (
                /* Warden / Admin Staff ID & Date of Birth */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Warden / Staff Employee ID
                    </label>
                    <div className="relative">
                      <IdCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={rollInput}
                        onChange={(e) => setRollInput(e.target.value)}
                        placeholder="e.g. WRD-1024 or DSW-001"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 tracking-wider font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Date of Birth <span className="text-orange-400 font-normal">(Acts as your Password)</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={dobInput}
                        onChange={(e) => setDobInput(e.target.value)}
                        placeholder="e.g. 15/08/1980 or 15-08-1980"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Enter your Date of Birth (e.g. <span className="text-orange-400 font-mono font-bold">15/08/1980</span> or <span className="text-orange-400 font-mono font-bold">DD-MM-YYYY</span>). This will be your Warden password for signing in.
                    </p>
                  </div>
                </div>
              )
            )}

            {/* LOGIN PASSWORD FIELD */}
            {authMode === 'login' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password{' '}
                  <span className="text-slate-400 font-normal">
                    {selectedRole === 'admin' ? '(Your Date of Birth)' : '(Your RA Register Number)'}
                  </span>
                </label>
                <div className="relative">
                  {selectedRole === 'admin' ? (
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  ) : (
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  )}
                  <input
                    type={selectedRole === 'admin' ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={
                      selectedRole === 'admin'
                        ? 'e.g. 15/08/1980 or 15-08-1980'
                        : 'e.g. RA241100301004'
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {selectedRole === 'admin'
                    ? 'Enter the Date of Birth (e.g. 15/08/1980 or DD-MM-YYYY) you set during Warden Sign Up.'
                    : 'Enter the RA Register Number (RA + 12 digits) you set during Student Sign Up.'}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <span>{authMode === 'login' ? 'Sign In & Enter SRM Portal' : 'Register Account & Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
            <span>SRM Dean of Student Welfare (DSW) Gateway</span>
            <span className="text-slate-400">Protected Campus SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

