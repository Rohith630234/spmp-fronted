import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Alert } from '../components/Alert';
import { Lock, Mail, ArrowRight, ShieldCheck, Award, BookOpen } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.status === 500 && (!err.response?.data?.message || typeof err.response?.data === 'string')) {
        setError('Cannot connect to the backend server. Please verify the Spring Boot backend is running on port 8080.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Unable to reach the server. Please check your connection.');
      } else {
        setError(err.response?.data?.message || err.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md shadow-indigo-200">
            SP
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to Portal
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Student Project Management & Evaluation Portal
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Sign In <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Test Buttons for College Viva Demonstration */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Fill Demo Accounts (Password: Password@123)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@college.edu', 'Admin')}
              className="flex items-center justify-center px-2 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('guide.arvind@college.edu', 'Guide')}
              className="flex items-center justify-center px-2 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition"
            >
              <Award className="w-3.5 h-3.5 mr-1" /> Guide
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('student.aditya@college.edu', 'Student')}
              className="flex items-center justify-center px-2 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1" /> Student
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
