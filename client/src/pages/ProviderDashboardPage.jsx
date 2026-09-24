import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Briefcase, Wrench, BookOpen, Clock, PlusCircle, ShieldCheck } from 'lucide-react';

export const ProviderDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/20 bg-emerald-950/10 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="glass-badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Provider Hub
              </span>
              <span className="text-xs text-slate-400">Additive Account Capability</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {user?.name}&apos;s Provider Dashboard
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Manage your offered services, shared resources, and respond to incoming matched requests.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Role Verified: [provider]</span>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Offered Services</span>
            <Wrench className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">0</div>
          <p className="text-xs text-slate-400 mt-2">e.g. Electrical, Repairs, Tuition</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Shared Resources</span>
            <BookOpen className="w-5 h-5 text-primary-400" />
          </div>
          <div className="text-3xl font-bold text-white">0</div>
          <p className="text-xs text-slate-400 mt-2">Books, Notes, Study materials</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Incoming Inquiries</span>
            <Clock className="w-5 h-5 text-accent-500" />
          </div>
          <div className="text-3xl font-bold text-white">0</div>
          <p className="text-xs text-slate-400 mt-2">Matching needs from requesters</p>
        </div>
      </div>

      {/* Provider Services Placeholder */}
      <div className="glass-card rounded-3xl p-8 border border-white/10 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
          <Briefcase className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Provider Capability Active</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          Your account is fully authorized to provide services and resources. Service listing creation and booking management will be connected in the next stage.
        </p>
        <button
          disabled
          className="glass-btn-primary py-2.5 px-5 text-sm opacity-60 cursor-not-allowed mx-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Service (Next Stage)</span>
        </button>
      </div>
    </div>
  );
};
