import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import { Table } from '../components/Table';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
  Download,
  Calendar,
  Layers,
  Award,
  ExternalLink
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const STATUS_COLORS = {
  SUBMITTED: '#6366f1', // Indigo
  APPROVED: '#0ea5e9',  // Sky
  IN_PROGRESS: '#f59e0b', // Amber
  CHANGES_REQUESTED: '#ec4899', // Pink
  COMPLETED: '#10b981', // Emerald
  REJECTED: '#f43f5e',  // Rose
};

const CHART_PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899', '#8b5cf6'];

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loader message="Generating analytics and charts..." size="lg" />;

  const getStatusBadge = (status) => {
    const config = {
      SUBMITTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      APPROVED: 'bg-sky-50 text-sky-700 border-sky-200',
      IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
      CHANGES_REQUESTED: 'bg-pink-50 text-pink-700 border-pink-200',
      COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    }[status] || 'bg-slate-50 text-slate-700 border-slate-200';

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${config}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };

  // Columns for Recent Projects Table
  const projectColumns = [
    {
      header: 'Project Title',
      key: 'title',
      render: (row) => (
        <div>
          <Link
            to={`/projects/${row.id}`}
            className="font-semibold text-slate-900 hover:text-indigo-600 transition"
          >
            {row.title}
          </Link>
          <div className="text-xs text-slate-400 mt-0.5">{row.domainName}</div>
        </div>
      ),
    },
    {
      header: 'Student',
      key: 'studentName',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800">{row.studentName}</span>
          <div className="text-xs text-slate-400">{row.studentRollNo}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Progress',
      key: 'progressPercentage',
      render: (row) => (
        <div className="w-28">
          <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
            <span>{row.completedMilestones}/{row.totalMilestones}</span>
            <span>{row.progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${row.progressPercentage}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Action',
      render: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          View <ExternalLink className="w-3 h-3 ml-1" />
        </Link>
      ),
    },
  ];

  // Columns for Recent Submissions Table
  const submissionColumns = [
    {
      header: 'Milestone',
      key: 'milestoneTitle',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-900">{row.milestoneTitle}</span>
          <div className="text-xs text-slate-400 truncate max-w-xs">{row.projectTitle}</div>
        </div>
      ),
    },
    {
      header: 'Submitted By',
      key: 'studentName',
      render: (row) => (
        <span className="text-xs font-medium text-slate-700">{row.studentName}</span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'File',
      key: 'fileName',
      render: (row) => (
        <a
          href={`/api/files/download/${row.filePath}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <Download className="w-3.5 h-3.5 mr-1" /> {row.fileName?.substring(0, 15)}...
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100">
        <div className="relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md mb-3 border border-white/20">
            Academic Session 2025-2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName}!
          </h1>
          <p className="mt-2 text-indigo-100 max-w-2xl text-sm sm:text-base leading-relaxed">
            {user?.role === 'ROLE_ADMIN' &&
              'Central Evaluation & Project Coordination Portal: Monitor proposal allocations, milestones, and final viva grading.'}
            {user?.role === 'ROLE_GUIDE' &&
              'Faculty Mentorship Dashboard: Track student milestone submissions, enter review rubric scores, and leave feedback.'}
            {user?.role === 'ROLE_STUDENT' &&
              'Student Capstone Portal: Track your sprint milestones, upload deliverables, and view review scorecards.'}
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Projects</p>
            <p className="text-2xl font-black text-slate-900">{stats?.totalProjects || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black text-slate-900">{stats?.completedProjects || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Reviews</p>
            <p className="text-2xl font-black text-slate-900">{stats?.pendingSubmissions || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faculty Guides</p>
            <p className="text-2xl font-black text-slate-900">{stats?.totalGuides || 0}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Project Status Distribution (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Project Status Distribution</h2>
              <p className="text-xs text-slate-400">Current progress state across all departmental batches</p>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {stats?.statusDistribution && stats.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {stats.statusDistribution.map((entry, index) => {
                      const cleanKey = entry.name.toUpperCase().replace(/\s+/g, '_');
                      const fill = STATUS_COLORS[cleanKey] || CHART_PALETTE[index % CHART_PALETTE.length];
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">
                No status data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Projects per Technology Domain (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Projects by Technology Domain</h2>
              <p className="text-xs text-slate-400">Distribution across AI, Web, Cloud, IoT, and Security</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {stats?.domainDistribution && stats.domainDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.domainDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" name="Projects" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">
                No domain data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Faculty Mentoring Workload Chart */}
      {stats?.guideWorkload && stats.guideWorkload.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Faculty Guide Mentorship Workload</h2>
              <p className="text-xs text-slate-400">Number of active student projects allocated per faculty member</p>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.guideWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" name="Mentored Batches" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recently Submitted Projects</h2>
            <Link
              to="/projects"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <Table
            columns={projectColumns}
            data={stats?.recentProjects || []}
            emptyMessage="No project proposals submitted yet."
          />
        </div>

        {/* Recent Submissions Feed (1 Col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Deliverables</h2>
            <span className="text-xs text-slate-400 font-medium">Sprint Uploads</span>
          </div>
          <Table
            columns={submissionColumns}
            data={stats?.recentSubmissions || []}
            emptyMessage="No milestone files uploaded yet."
          />
        </div>
      </div>
    </div>
  );
};
