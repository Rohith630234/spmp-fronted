import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { domainService } from '../services/domainService';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { Table } from '../components/Table';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import {
  Search,
  Filter,
  Plus,
  ExternalLink,
  UserCheck,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const ProjectList = ({ filter = 'all' }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [domains, setDomains] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination state (for 'all' view)
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Assign Guide Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetProject, setTargetProject] = useState(null);
  const [selectedGuideId, setSelectedGuideId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Quick Status Change Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      if (filter === 'my') {
        const res = await projectService.getMyProjects();
        if (res.success) {
          setProjects(res.data);
          setTotalElements(res.data.length);
        }
      } else {
        const res = await projectService.getAll({
          search: search.trim() || undefined,
          page,
          size: 8,
          sortBy: 'createdAt',
          direction: 'desc',
        });
        if (res.success) {
          setProjects(res.data.content);
          setTotalPages(res.data.totalPages);
          setTotalElements(res.data.totalElements);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filter, page, search]);

  useEffect(() => {
    // Load domains and guides for filter dropdowns and assignment modals
    const loadMetadata = async () => {
      try {
        const [domainRes, guideRes] = await Promise.all([
          domainService.getAll(true),
          userService.getGuides(),
        ]);
        if (domainRes.success) setDomains(domainRes.data);
        if (guideRes.success) setGuides(guideRes.data);
      } catch (e) {
        console.error('Failed loading metadata filters', e);
      }
    };
    loadMetadata();
  }, []);

  const handleAssignGuide = async (e) => {
    e.preventDefault();
    if (!selectedGuideId || !targetProject) return;

    setAssignLoading(true);
    try {
      const res = await projectService.assignGuide(targetProject.id, Number(selectedGuideId));
      if (res.success) {
        setSuccess(`Guide allocated successfully to "${targetProject.title}"`);
        setAssignModalOpen(false);
        fetchProjects();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to allocate guide');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!newStatus || !targetProject) return;

    setStatusLoading(true);
    try {
      const res = await projectService.updateStatus(targetProject.id, newStatus);
      if (res.success) {
        setSuccess(`Project status updated to ${newStatus}`);
        setStatusModalOpen(false);
        fetchProjects();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete project "${title}"? This will delete all milestones and submissions.`)) {
      return;
    }

    try {
      const res = await projectService.delete(id);
      if (res.success) {
        setSuccess(`Project "${title}" deleted.`);
        fetchProjects();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  // Client-side filtering when viewing 'my' projects
  const displayedProjects = filter === 'my'
    ? projects.filter((p) => {
        const matchSearch =
          !search ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase());
        const matchDomain = !selectedDomain || p.domainId === Number(selectedDomain);
        const matchStatus = !selectedStatus || p.status === selectedStatus;
        return matchSearch && matchDomain && matchStatus;
      })
    : projects;

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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };

  const columns = [
    {
      header: 'Project Details',
      key: 'title',
      className: 'w-2/5',
      render: (row) => (
        <div>
          <Link
            to={`/projects/${row.id}`}
            className="font-bold text-slate-900 hover:text-indigo-600 transition block text-sm leading-snug"
          >
            {row.title}
          </Link>
          <div className="flex items-center space-x-2 mt-1">
            <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {row.domainName}
            </span>
            <span className="text-xs text-slate-400">Batch {row.academicYear}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Student',
      key: 'studentName',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 text-sm">{row.studentName}</span>
          <div className="text-xs text-slate-400">{row.studentRollNo}</div>
          <div className="text-xs text-slate-400">{row.studentDepartment}</div>
        </div>
      ),
    },
    {
      header: 'Faculty Guide',
      key: 'guideName',
      render: (row) =>
        row.guideName ? (
          <div>
            <span className="font-medium text-slate-800 text-sm">{row.guideName}</span>
            <div className="text-xs text-slate-400">{row.guideEmail}</div>
          </div>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Pending Allocation
          </span>
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
        <div className="w-24">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>{row.completedMilestones}/{row.totalMilestones}</span>
            <span>{row.progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                row.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${row.progressPercentage}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <Link
            to={`/projects/${row.id}`}
            title="View Details"
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>

          {user?.role === 'ROLE_ADMIN' && (
            <button
              onClick={() => {
                setTargetProject(row);
                setSelectedGuideId(row.guideId || '');
                setAssignModalOpen(true);
              }}
              title="Assign Faculty Guide"
              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          )}

          {(user?.role === 'ROLE_ADMIN' || (user?.role === 'ROLE_GUIDE' && row.guideId === user.id)) && (
            <button
              onClick={() => {
                setTargetProject(row);
                setNewStatus(row.status);
                setStatusModalOpen(true);
              }}
              title="Change Status"
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
            >
              <Clock className="w-4 h-4" />
            </button>
          )}

          {(user?.role === 'ROLE_ADMIN' || (user?.role === 'ROLE_STUDENT' && row.studentId === user.id)) && (
            <button
              onClick={() => handleDeleteProject(row.id, row.title)}
              title="Delete Project"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {filter === 'my' ? 'My Associated Projects' : 'Capstone & Mini Projects'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filter === 'my'
              ? 'Projects you have proposed or have been allocated to mentor'
              : 'Browse all student projects, allocation status, and progress metrics'}
          </p>
        </div>

        {(user?.role === 'ROLE_STUDENT' || user?.role === 'ROLE_ADMIN') && (
          <Link
            to="/projects/new"
            className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition"
          >
            <Plus className="w-4 h-4 mr-2" /> Submit Proposal
          </Link>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filter / Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search projects by title, keywords, or student name..."
            className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Domain Filter */}
        <div className="w-full md:w-56">
          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value);
              setPage(0);
            }}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Domains</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="CHANGES_REQUESTED">CHANGES REQUESTED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <Table
        columns={columns}
        data={displayedProjects}
        loading={loading}
        emptyMessage="No matching projects found."
      />

      {/* Pagination Bar (when viewing all) */}
      {filter === 'all' && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-3 bg-white border border-slate-200 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">
            Showing Page <span className="font-bold text-slate-800">{page + 1}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span> ({totalElements} total projects)
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Assign Faculty Guide (Admin) */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Allocate Faculty Guide"
      >
        <form onSubmit={handleAssignGuide} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Project Title
            </label>
            <p className="text-sm font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {targetProject?.title}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Faculty Mentor
            </label>
            <select
              required
              value={selectedGuideId}
              onChange={(e) => setSelectedGuideId(e.target.value)}
              className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choose Guide --</option>
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.fullName} ({g.department})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignLoading || !selectedGuideId}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {assignLoading ? 'Assigning...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Update Project Status (Guide / Admin) */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Project Status"
      >
        <form onSubmit={handleStatusChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Project
            </label>
            <p className="text-sm font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {targetProject?.title}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              New Lifecycle Status
            </label>
            <select
              required
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="CHANGES_REQUESTED">CHANGES REQUESTED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={statusLoading}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {statusLoading ? 'Updating...' : 'Save Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
