import {
  User,
  Mail,
  Building,
  BadgeCheck,
  Phone,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Department Administrator
          </span>
        );
      case 'ROLE_GUIDE':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Award className="w-3.5 h-3.5 mr-1.5" /> Faculty Guide / Evaluator
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Student Researcher
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Account Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Your credentials and academic departmental registration details
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Banner Header */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 relative">
          <div className="absolute -bottom-10 left-8">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
              alt=""
              className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 pb-8 px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
              <p className="text-sm text-slate-500">{user?.department}</p>
            </div>
            <div>{getRoleBadge(user?.role)}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <Mail className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                <p className="font-semibold text-slate-800">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <BadgeCheck className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Roll No / Employee ID</p>
                <p className="font-semibold text-slate-800">{user?.rollOrEmpId}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <Building className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Academic Department</p>
                <p className="font-semibold text-slate-800">{user?.department}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <Phone className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                <p className="font-semibold text-slate-800">{user?.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Account Status</p>
                <p className="font-semibold text-emerald-700">Active & Verified</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Academic Session</p>
                <p className="font-semibold text-slate-800">2025-2026 Batch</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
