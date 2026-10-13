import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { domainService } from '../services/domainService';
import { userService } from '../services/userService';
import { Alert } from '../components/Alert';
import { Loader } from '../components/Loader';
import {
  FolderPlus,
  Upload,
  Github,
  Globe,
  ArrowLeft,
  CheckCircle,
  FileText
} from 'lucide-react';

export const ProjectForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domainId: '',
    guideId: '',
    academicYear: '2025-2026',
    githubUrl: '',
    liveDemoUrl: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [domains, setDomains] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        const [domainRes, guideRes] = await Promise.all([
          domainService.getAll(true),
          userService.getGuides(),
        ]);
        if (domainRes.success) setDomains(domainRes.data);
        if (guideRes.success) setGuides(guideRes.data);

        if (isEditing) {
          const projectRes = await projectService.getById(id);
          if (projectRes.success) {
            const p = projectRes.data;
            setFormData({
              title: p.title,
              description: p.description,
              domainId: p.domainId,
              guideId: p.guideId || '',
              academicYear: p.academicYear || '2025-2026',
              githubUrl: p.githubUrl || '',
              liveDemoUrl: p.liveDemoUrl || '',
            });
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed loading form data');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.domainId) {
      setError('Please select a technical domain category.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        domainId: Number(formData.domainId),
        guideId: formData.guideId ? Number(formData.guideId) : null,
        academicYear: formData.academicYear,
        githubUrl: formData.githubUrl.trim() || null,
        liveDemoUrl: formData.liveDemoUrl.trim() || null,
      };

      if (isEditing) {
        const res = await projectService.update(id, payload);
        if (res.success) {
          if (selectedFile) {
            await projectService.uploadDocument(id, selectedFile);
          }
          navigate(`/projects/${id}`);
        }
      } else {
        const res = await projectService.create(payload, selectedFile);
        if (res.success) {
          navigate(`/projects/${res.data.id}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading project form..." size="lg" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top back navigation */}
      <div className="flex items-center space-x-3">
        <Link
          to={isEditing ? `/projects/${id}` : '/projects'}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isEditing ? 'Edit Project Proposal' : 'Submit Project Proposal'}
          </h1>
          <p className="text-sm text-slate-500">
            {isEditing
              ? 'Update project synopsis, repository URLs, or domain'
              : 'Submit your capstone or mini project proposal for faculty mentor review'}
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Project Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Project Title *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. AI-Powered Brain Tumor Detection using MRI Images"
            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Abstract / Scope Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Project Abstract / Scope Description *
          </label>
          <textarea
            name="description"
            required
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the problem statement, objectives, proposed methodology, and expected deliverables..."
            className="block w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Domain and Academic Batch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Technical Domain Specialization *
            </label>
            <select
              name="domainId"
              required
              value={formData.domainId}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Technical Domain --</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Academic Year Batch *
            </label>
            <input
              type="text"
              name="academicYear"
              required
              value={formData.academicYear}
              onChange={handleChange}
              placeholder="2025-2026"
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Preferred Faculty Guide */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Preferred Faculty Guide (Optional)
          </label>
          <select
            name="guideId"
            value={formData.guideId}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Let Coordinator Allocate Guide --</option>
            {guides.map((g) => (
              <option key={g.id} value={g.id}>
                {g.fullName} ({g.department})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            You may request a mentor, or the department project coordinator will assign one.
          </p>
        </div>

        {/* Repository & Demo Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              GitHub Repository URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Github className="w-4 h-4" />
              </div>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/project"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Live Demo / Hosted URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="url"
                name="liveDemoUrl"
                value={formData.liveDemoUrl}
                onChange={handleChange}
                placeholder="https://my-demo-app.vercel.app"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Document Upload (Synopsis PDF) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Synopsis / Project Proposal Document (PDF / DOCX)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-indigo-400 transition bg-slate-50/50">
            <div className="space-y-2 text-center">
              <div className="mx-auto w-10 h-10 text-indigo-500 flex items-center justify-center bg-indigo-50 rounded-full">
                <Upload className="w-5 h-5" />
              </div>
              <div className="flex text-sm text-slate-600 justify-center">
                <label className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1 text-slate-500">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-400">PDF or Word documents up to 25MB</p>
              {selectedFile && (
                <div className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mt-2">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Link
            to={isEditing ? `/projects/${id}` : '/projects'}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50 transition"
          >
            {submitting ? 'Saving Proposal...' : isEditing ? 'Save Changes' : 'Submit Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
};
