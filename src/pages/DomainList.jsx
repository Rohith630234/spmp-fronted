import React, { useEffect, useState } from 'react';
import { domainService } from '../services/domainService';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { Layers, Plus, CheckCircle, XCircle, Tag } from 'lucide-react';

export const DomainList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [domainForm, setDomainForm] = useState({ name: '', description: '', active: true });
  const [saving, setSaving] = useState(false);

  const fetchDomains = async () => {
    try {
      const res = await domainService.getAll(false);
      if (res.success) setDomains(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleCreateDomain = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await domainService.create(domainForm);
      if (res.success) {
        setSuccess('Domain created successfully');
        setModalOpen(false);
        setDomainForm({ name: '', description: '', active: true });
        fetchDomains();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create domain');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await domainService.toggleStatus(id);
      if (res.success) {
        fetchDomains();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  if (loading) return <Loader message="Loading technical domains..." size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Technical Domains & Specializations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Categories used for project classification and guide domain allocation
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Domain
          </button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {domains.map((d) => (
          <div
            key={d.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Tag className="w-5 h-5" />
                </div>
                <button
                  disabled={!isAdmin}
                  onClick={() => handleToggleStatus(d.id)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    d.active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                  title={isAdmin ? 'Click to toggle status' : undefined}
                >
                  {d.active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <h2 className="text-base font-bold text-slate-900">{d.name}</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {d.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Domain ID: #{d.id}</span>
              <span className="text-indigo-600 font-medium">Classified Category</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Create Domain */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Technical Domain">
        <form onSubmit={handleCreateDomain} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Domain Name *
            </label>
            <input
              type="text"
              required
              value={domainForm.name}
              onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })}
              placeholder="e.g. Blockchain & Distributed Ledgers"
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={domainForm.description}
              onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })}
              placeholder="Scope, key tools, and relevance..."
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Domain'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
