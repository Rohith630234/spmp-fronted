import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { milestoneService } from '../services/milestoneService';
import { submissionService } from '../services/submissionService';
import { evaluationService } from '../services/evaluationService';
import { feedbackService } from '../services/feedbackService';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Github,
  Globe,
  Download,
  Plus,
  Send,
  Award,
  BookOpen,
  User,
  ShieldCheck,
  FileText,
  Upload,
  AlertCircle,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react';

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [scorecard, setScorecard] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [guides, setGuides] = useState([]);

  const [activeTab, setActiveTab] = useState('overview'); // overview, milestones, evaluations, feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', dueDate: '', status: 'PENDING' });

  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionComments, setSubmissionComments] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalForm, setEvalForm] = useState({
    reviewStage: 'REVIEW_1',
    technicalScore: 25,
    documentationScore: 25,
    presentationScore: 35,
    remarks: '',
  });

  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusVal, setStatusVal] = useState('');

  // Guide Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignGuideId, setAssignGuideId] = useState('');

  const fetchProjectData = async () => {
    try {
      const [projRes, mileRes, subRes, scoreRes, feedRes] = await Promise.all([
        projectService.getById(id),
        milestoneService.getByProject(id),
        submissionService.getByProject(id),
        evaluationService.getScorecard(id),
        feedbackService.getByProject(id),
      ]);

      if (projRes.success) setProject(projRes.data);
      if (mileRes.success) setMilestones(mileRes.data);
      if (subRes.success) setSubmissions(subRes.data);
      if (scoreRes.success) setScorecard(scoreRes.data);
      if (feedRes.success) setFeedbacks(feedRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed loading project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
    userService.getGuides().then((res) => {
      if (res.success) setGuides(res.data);
    });
  }, [id]);

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    try {
      const res = await milestoneService.create(id, milestoneForm);
      if (res.success) {
        setSuccess('Milestone added successfully');
        setMilestoneModalOpen(false);
        setMilestoneForm({ title: '', description: '', dueDate: '', status: 'PENDING' });
        fetchProjectData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create milestone');
    }
  };

  const handleMilestoneStatusToggle = async (milestoneId, currentStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await milestoneService.updateStatus(milestoneId, nextStatus);
      if (res.success) {
        fetchProjectData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update milestone status');
    }
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!submissionFile || !selectedMilestoneId) return;

    setUploadLoading(true);
    try {
      const res = await submissionService.submitFile(selectedMilestoneId, submissionFile, submissionComments);
      if (res.success) {
        setSuccess('Deliverable submitted successfully');
        setSubmissionModalOpen(false);
        setSubmissionFile(null);
        setSubmissionComments('');
        fetchProjectData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload deliverable');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleReviewSubmission = async (submissionId, status) => {
    try {
      const res = await submissionService.reviewSubmission(submissionId, status);
      if (res.success) {
        setSuccess(`Submission marked as ${status}`);
        fetchProjectData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review submission');
    }
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        reviewStage: evalForm.reviewStage,
        technicalScore: Number(evalForm.technicalScore),
        documentationScore: Number(evalForm.documentationScore),
        presentationScore: Number(evalForm.presentationScore),
        remarks: evalForm.remarks.trim(),
      };
      const res = await evaluationService.submitEvaluation(id, payload);
      if (res.success) {
        setSuccess(`Evaluation scores saved for ${evalForm.reviewStage}`);
        setEvalModalOpen(false);
        fetchProjectData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save evaluation scores');
    }
  };

  const handlePostFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedbackText.trim()) return;

    setFeedbackLoading(true);
    try {
      const res = await feedbackService.addFeedback(id, newFeedbackText.trim());
      if (res.success) {
        setNewFeedbackText('');
        fetchProjectData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const res = await projectService.updateStatus(id, statusVal);
      if (res.success) {
        setSuccess(`Project status updated to ${statusVal}`);
        setStatusModalOpen(false);
        fetchProjectData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssignGuide = async (e) => {
    e.preventDefault();
    try {
      const res = await projectService.assignGuide(id, Number(assignGuideId));
      if (res.success) {
        setSuccess('Guide allocated successfully');
        setAssignModalOpen(false);
        fetchProjectData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign guide');
    }
  };

  if (loading) return <Loader message="Loading project details..." size="lg" />;
  if (!project) return <Alert type="error" message="Project not found" />;

  const isOwner = user?.id === project.studentId;
  const isGuide = user?.id === project.guideId;
  const isAdmin = user?.role === 'ROLE_ADMIN';

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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${config}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top back navigation & action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/projects"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Batch {project.academicYear}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {project.domainName}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {project.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {getStatusBadge(project.status)}

          {(isAdmin || isGuide) && (
            <button
              onClick={() => {
                setStatusVal(project.status);
                setStatusModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition"
            >
              Update Status
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                setAssignGuideId(project.guideId || '');
                setAssignModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-lg shadow-2xs transition"
            >
              Assign Guide
            </button>
          )}

          {(isOwner || isAdmin) && (
            <Link
              to={`/projects/${project.id}/edit`}
              className="p-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition"
              title="Edit Proposal"
            >
              <Edit className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Tabs Header */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          {[
            { id: 'overview', label: 'Overview & Abstract' },
            { id: 'milestones', label: `Milestones (${milestones.length})` },
            { id: 'evaluations', label: 'Evaluations & Scorecard' },
            { id: 'feedback', label: `Discussion & Remarks (${feedbacks.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 text-sm font-bold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Column: Abstract & URLs (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Project Abstract & Scope</h2>
              <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
                {project.description}
              </p>

              {/* External Links Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
                  >
                    <Github className="w-3.5 h-3.5 mr-1.5" /> Repository
                  </a>
                )}
                {project.liveDemoUrl && (
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition border border-indigo-200"
                  >
                    <Globe className="w-3.5 h-3.5 mr-1.5" /> Live Demo
                  </a>
                )}
                {project.documentPath && (
                  <a
                    href={`/api/files/download/${project.documentPath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Download Proposal PDF
                  </a>
                )}
              </div>
            </div>

            {/* Overall Progress KPI Bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">Sprint Milestone Completion</span>
                <span className="text-sm font-extrabold text-indigo-600">{project.progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    project.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${project.progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                <span>{project.completedMilestones} completed</span>
                <span>{project.totalMilestones} total milestones</span>
              </div>
            </div>
          </div>

          {/* Right Column: People Cards (1 Col) */}
          <div className="space-y-6">
            {/* Student Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-indigo-500" /> Student Researcher
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-indigo-50 text-indigo-700 font-bold rounded-xl flex items-center justify-center text-lg">
                  {project.studentName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{project.studentName}</h3>
                  <p className="text-xs text-slate-500">{project.studentRollNo}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <p><span className="font-semibold text-slate-700">Dept:</span> {project.studentDepartment}</p>
                <p><span className="font-semibold text-slate-700">Email:</span> {project.studentEmail}</p>
              </div>
            </div>

            {/* Guide Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-500" /> Faculty Mentor
              </div>
              {project.guideName ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 bg-amber-50 text-amber-700 font-bold rounded-xl flex items-center justify-center text-lg">
                      {project.guideName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{project.guideName}</h3>
                      <p className="text-xs text-slate-500">{project.guideEmail}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-center">
                  <p className="text-xs font-semibold text-amber-800">No Mentor Assigned Yet</p>
                  <p className="text-xs text-amber-600 mt-1">Project coordinator will allocate a faculty guide.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES & DELIVERABLES */}
      {activeTab === 'milestones' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sprint Deadlines & Deliverables</h2>
              <p className="text-xs text-slate-500">Track milestones and submit project deliverables for review</p>
            </div>
            {(isOwner || isGuide || isAdmin) && (
              <button
                onClick={() => setMilestoneModalOpen(true)}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Milestone
              </button>
            )}
          </div>

          <div className="space-y-4">
            {milestones.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
                No milestones defined for this project yet.
              </div>
            ) : (
              milestones.map((m) => {
                const milestoneSubs = submissions.filter((s) => s.milestoneId === m.id);

                return (
                  <div
                    key={m.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleMilestoneStatusToggle(m.id, m.status)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                            m.status === 'COMPLETED'
                              ? 'bg-emerald-500 text-white'
                              : 'border-2 border-slate-300 hover:border-indigo-600 text-transparent'
                          }`}
                          title="Toggle Completion"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <h3
                            className={`text-sm font-bold ${
                              m.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {m.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-400">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" /> Due: {m.dueDate}
                            </span>
                            {m.isOverdue && (
                              <span className="text-rose-600 font-semibold bg-rose-50 px-1.5 rounded">
                                Overdue
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            m.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : m.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {m.status}
                        </span>

                        {isOwner && (
                          <button
                            onClick={() => {
                              setSelectedMilestoneId(m.id);
                              setSubmissionModalOpen(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition"
                          >
                            <Upload className="w-3 h-3 mr-1" /> Submit File
                          </button>
                        )}
                      </div>
                    </div>

                    {m.description && (
                      <p className="text-xs text-slate-600 pl-9">{m.description}</p>
                    )}

                    {/* Submissions List for this Milestone */}
                    {milestoneSubs.length > 0 && (
                      <div className="mt-3 pl-9 pt-3 border-t border-slate-100 space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Deliverables Submitted
                        </p>
                        {milestoneSubs.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <span className="font-semibold text-slate-800">{sub.fileName}</span>
                                {sub.comments && (
                                  <p className="text-slate-500 italic mt-0.5">"{sub.comments}"</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-2 py-0.5 rounded text-2xs font-bold ${
                                  sub.status === 'APPROVED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : sub.status === 'REJECTED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {sub.status}
                              </span>

                              <a
                                href={`/api/files/download/${sub.filePath}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-indigo-600 hover:underline flex items-center"
                              >
                                <Download className="w-3 h-3 mr-1" /> Download
                              </a>

                              {(isGuide || isAdmin) && sub.status === 'SUBMITTED' && (
                                <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                                  <button
                                    onClick={() => handleReviewSubmission(sub.id, 'APPROVED')}
                                    className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                                    title="Approve Submission"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleReviewSubmission(sub.id, 'REJECTED')}
                                    className="p-1 text-rose-600 hover:bg-rose-100 rounded"
                                    title="Reject Submission"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EVALUATIONS & SCORECARD */}
      {activeTab === 'evaluations' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Scorecard Summary Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-2xl text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Official Academic Scorecard
              </span>
              <h2 className="text-2xl font-black tracking-tight mt-1">University Evaluation Rubric</h2>
              <p className="text-sm text-slate-300 mt-1">
                Aggregated scoring across Design, Implementation, and Final Viva Voce
              </p>
            </div>

            <div className="flex items-center space-x-6 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-300">Average Score</p>
                <p className="text-3xl font-black text-white">
                  {scorecard?.overallAverage ? `${scorecard.overallAverage}/100` : '--'}
                </p>
              </div>
              <div className="h-10 w-px bg-white/20"></div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-300">Grade Awarded</p>
                <span className="inline-block mt-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
                  {scorecard?.academicGrade || 'Pending Evaluation'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Review Stage Breakdown</h3>
            {(isGuide || isAdmin) && (
              <button
                onClick={() => setEvalModalOpen(true)}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
              >
                <Award className="w-3.5 h-3.5 mr-1.5" /> Enter / Edit Review Scores
              </button>
            )}
          </div>

          {/* 3 Review Stage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Review 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  REVIEW 1
                </span>
                <span className="text-lg font-black text-slate-900">
                  {scorecard?.review1Total != null ? `${scorecard.review1Total}/100` : 'Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Literature Survey & System Design</p>
              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex justify-between"><span>Technical Depth:</span> <span className="font-semibold">Max 30</span></div>
                <div className="flex justify-between"><span>Documentation & SRS:</span> <span className="font-semibold">Max 30</span></div>
                <div className="flex justify-between"><span>Presentation & Q&A:</span> <span className="font-semibold">Max 40</span></div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                  REVIEW 2
                </span>
                <span className="text-lg font-black text-slate-900">
                  {scorecard?.review2Total != null ? `${scorecard.review2Total}/100` : 'Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Module Implementation & Code Testing</p>
              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex justify-between"><span>Code Architecture:</span> <span className="font-semibold">Max 30</span></div>
                <div className="flex justify-between"><span>Test Coverage:</span> <span className="font-semibold">Max 30</span></div>
                <div className="flex justify-between"><span>Sprint Progress:</span> <span className="font-semibold">Max 40</span></div>
              </div>
            </div>

            {/* Final Viva */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  FINAL VIVA
                </span>
                <span className="text-lg font-black text-slate-900">
                  {scorecard?.finalVivaTotal != null ? `${scorecard.finalVivaTotal}/100` : 'Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Final Demonstration & External Viva</p>
              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex justify-between"><span>Working Demo:</span> <span className="font-semibold">Max 30</span></div>
                <div className="flex justify-between"><span>Final Thesis:</span> <span className="font-semibold">Max 30</span></div>
                <div className="flex justify-between"><span>Examiner Viva Q&A:</span> <span className="font-semibold">Max 40</span></div>
              </div>
            </div>
          </div>

          {/* Evaluator Remarks Log */}
          {scorecard?.evaluationDetails && scorecard.evaluationDetails.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Evaluator Remarks & Notes</h4>
              <div className="divide-y divide-slate-100">
                {scorecard.evaluationDetails.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-indigo-700">{item.reviewStage.replace('_', ' ')}</span>
                      <span className="text-slate-400">By {item.evaluatorName}</span>
                    </div>
                    <p className="text-sm text-slate-700 italic">"{item.remarks || 'No remarks entered.'}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DISCUSSION & FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900">Project Mentorship Remarks Stream</h2>

            {/* Comments List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {feedbacks.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-400">
                  No comments or feedback remarks posted yet. Start the conversation below!
                </div>
              ) : (
                feedbacks.map((fb) => (
                  <div key={fb.id} className="flex space-x-3">
                    <img
                      src={fb.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fb.authorName}`}
                      alt=""
                      className="w-8 h-8 rounded-full shrink-0"
                    />
                    <div className="flex-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{fb.authorName}</span>
                          <span
                            className={`text-2xs font-semibold px-1.5 py-0.2 rounded ${
                              fb.authorRole === 'ROLE_GUIDE'
                                ? 'bg-amber-100 text-amber-800'
                                : fb.authorRole === 'ROLE_ADMIN'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {fb.authorRole === 'ROLE_GUIDE'
                              ? 'Guide'
                              : fb.authorRole === 'ROLE_ADMIN'
                              ? 'Admin'
                              : 'Student'}
                          </span>
                        </div>
                        <span className="text-2xs text-slate-400">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {fb.feedbackText}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Post comment form */}
            <form onSubmit={handlePostFeedback} className="pt-4 border-t border-slate-100 flex gap-3">
              <input
                type="text"
                required
                value={newFeedbackText}
                onChange={(e) => setNewFeedbackText(e.target.value)}
                placeholder="Write a feedback remark or guidance note..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={feedbackLoading || !newFeedbackText.trim()}
                className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 transition shadow-xs"
              >
                <Send className="w-4 h-4 mr-1.5" /> Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: Add Milestone */}
      <Modal
        isOpen={milestoneModalOpen}
        onClose={() => setMilestoneModalOpen(false)}
        title="Add Sprint Milestone"
      >
        <form onSubmit={handleCreateMilestone} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Milestone Heading *
            </label>
            <input
              type="text"
              required
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              placeholder="e.g. System Architecture & Database Design"
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description / Deliverables Expected
            </label>
            <textarea
              rows={3}
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
              placeholder="Expected documents or code modules to submit..."
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Target Due Date *
            </label>
            <input
              type="date"
              required
              value={milestoneForm.dueDate}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setMilestoneModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Save Milestone
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Submit Deliverable File */}
      <Modal
        isOpen={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
        title="Upload Milestone Deliverable"
      >
        <form onSubmit={handleSubmitDeliverable} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Document / Code Archive *
            </label>
            <input
              type="file"
              required
              onChange={(e) => setSubmissionFile(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="text-xs text-slate-400 mt-1">Accepts PDF, Word, ZIP files up to 25MB</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Student Submission Remarks
            </label>
            <textarea
              rows={3}
              value={submissionComments}
              onChange={(e) => setSubmissionComments(e.target.value)}
              placeholder="Notes on methodology, test results, or changes made..."
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSubmissionModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadLoading || !submissionFile}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {uploadLoading ? 'Uploading...' : 'Submit Deliverable'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Enter Evaluation Scores */}
      <Modal
        isOpen={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        title="Enter Academic Review Marks"
      >
        <form onSubmit={handleSaveEvaluation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Evaluation Stage *
            </label>
            <select
              value={evalForm.reviewStage}
              onChange={(e) => setEvalForm({ ...evalForm, reviewStage: e.target.value })}
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900"
            >
              <option value="REVIEW_1">Review 1 (System Design & SRS)</option>
              <option value="REVIEW_2">Review 2 (Implementation & Code)</option>
              <option value="FINAL_VIVA">Final Viva Voce (Demo & Presentation)</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-2xs font-bold text-slate-600 uppercase mb-1">
                Technical (Max 30)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.5"
                required
                value={evalForm.technicalScore}
                onChange={(e) => setEvalForm({ ...evalForm, technicalScore: e.target.value })}
                className="block w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-600 uppercase mb-1">
                Documentation (Max 30)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.5"
                required
                value={evalForm.documentationScore}
                onChange={(e) => setEvalForm({ ...evalForm, documentationScore: e.target.value })}
                className="block w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-600 uppercase mb-1">
                Presentation (Max 40)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                step="0.5"
                required
                value={evalForm.presentationScore}
                onChange={(e) => setEvalForm({ ...evalForm, presentationScore: e.target.value })}
                className="block w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex justify-between items-center text-xs">
            <span className="font-semibold text-indigo-900">Total Calculated Score:</span>
            <span className="text-base font-black text-indigo-700">
              {(
                Number(evalForm.technicalScore || 0) +
                Number(evalForm.documentationScore || 0) +
                Number(evalForm.presentationScore || 0)
              ).toFixed(1)}{' '}
              / 100
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Constructive Evaluator Remarks
            </label>
            <textarea
              rows={3}
              value={evalForm.remarks}
              onChange={(e) => setEvalForm({ ...evalForm, remarks: e.target.value })}
              placeholder="Strengths observed, feedback for improvement, benchmark suggestions..."
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEvalModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Save Marks
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Status Update */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Project Lifecycle Status"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Status State
            </label>
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
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
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Save Status
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Assign Guide */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Allocate Faculty Guide"
      >
        <form onSubmit={handleAssignGuide} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Guide
            </label>
            <select
              required
              value={assignGuideId}
              onChange={(e) => setAssignGuideId(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
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
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Confirm Guide
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
