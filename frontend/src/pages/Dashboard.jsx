import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { componentService, configService } from '../services/api';
import { StatCard } from '../components/StatCard';
import { Cpu, FileText, IndianRupee, PlusCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export const Dashboard = () => {
  const [components, setComponents] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [comps, configs] = await Promise.all([
        componentService.getAll({ activeOnly: true }),
        configService.getAll()
      ]);
      setComponents(comps);
      setConfigurations(configs);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalQuoteValue = configurations.reduce((sum, cfg) => sum + (cfg.final_quote_price || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-xl shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sales Overview & Pricing Metrics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time laptop component catalog & quotation management portal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/builder"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            Build New Laptop Config
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid - Desktop 4 Columns */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Active Components"
          value={components.length}
          subtitle="Across 8 mandatory categories"
          icon={Cpu}
          color="blue"
        />
        <StatCard
          title="Total Quotations"
          value={configurations.length}
          subtitle="Issued customer quotations"
          icon={FileText}
          color="emerald"
        />
        <StatCard
          title="Total Revenue Value"
          value={`₹${totalQuoteValue.toLocaleString('en-IN')}`}
          subtitle="Combined quotation portfolio"
          icon={IndianRupee}
          color="amber"
        />
        <StatCard
          title="Price Lock Status"
          value="100% Active"
          subtitle="Snapshotted historical pricing"
          icon={ShieldCheck}
          color="purple"
        />
      </div>

      {/* Recent Quotations Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Sales Quotations</h3>
            <p className="text-xs text-slate-500">Latest custom laptop configurations generated for clients</p>
          </div>
          <Link
            to="/quotations"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading metrics & quotations...</div>
        ) : configurations.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No quotations created yet. Click "Build New Laptop Config" to generate your first quotation.</div>
        ) : (
          <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Quote #</th>
                  <th className="py-3 px-4 font-semibold">Configuration Name</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Final Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {configurations.slice(0, 5).map((cfg) => (
                  <tr key={cfg.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{cfg.quote_number}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{cfg.config_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{cfg.customer_name}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(cfg.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                      ₹{cfg.final_quote_price?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        cfg.status === 'Issued' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        cfg.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        cfg.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {cfg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

