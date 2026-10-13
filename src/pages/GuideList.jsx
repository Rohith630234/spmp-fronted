import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import { Award, Mail, Phone, Building, BadgeCheck, ArrowRight } from 'lucide-react';

export const GuideList = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await userService.getGuides();
        if (res.success) setGuides(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load faculty guides');
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  if (loading) return <Loader message="Loading faculty mentor directory..." size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Faculty Mentors Directory
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Project guides and evaluators for capstone & mini-project batches
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((g) => (
          <div
            key={g.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center space-x-4">
                <img
                  src={g.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${g.fullName}`}
                  alt={g.fullName}
                  className="w-14 h-14 rounded-full ring-2 ring-indigo-100"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{g.fullName}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mt-0.5">
                    <Award className="w-3 h-3 mr-1" /> Faculty Mentor
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex items-center">
                  <Building className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                  <span>{g.department}</span>
                </div>
                <div className="flex items-center">
                  <BadgeCheck className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                  <span>Emp ID: {g.rollOrEmpId}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                  <a href={`mailto:${g.email}`} className="text-indigo-600 hover:underline">
                    {g.email}
                  </a>
                </div>
                {g.phone && (
                  <div className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                    <span>{g.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link
                to="/projects"
                className="w-full inline-flex items-center justify-center py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
              >
                View Mentored Projects <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
