import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { configService } from '../services/api';
import { QuoteDetailModal } from './QuoteDetailModal';
import { Search, Eye, Trash2, ShieldCheck } from 'lucide-react';

export const QuoteList = () => {
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);

  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get('highlight');

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const data = await configService.getAll({ search, status: statusFilter });
      setConfigurations(data);
      if (highlightedId) {
        setSelectedQuoteId(Number(highlightedId));
      }
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quotation record?')) {
      try {
        await configService.delete(id);
        fetchQuotations();
      } catch (err) {
        alert('Failed to delete quotation.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-xl shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Saved Laptop Quotations</h2>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter & review historical laptop configurations generated for customers
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Historical Price Lock Engaged</span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quote #, customer, config..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5">
          {['All', 'Issued', 'Accepted', 'Draft', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotation Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading quotations...</div>
        ) : configurations.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No saved quotations found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Quote #</th>
                  <th className="py-3.5 px-4 font-semibold">Configuration Name</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Parts Count</th>
                  <th className="py-3.5 px-4 font-semibold">Date Issued</th>
                  <th className="py-3.5 px-4 font-semibold">Final Price</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {configurations.map((cfg) => {
                  const isHighlighted = Number(highlightedId) === cfg.id;
                  return (
                    <tr
                      key={cfg.id}
                      className={`transition ${
                        isHighlighted ? 'bg-blue-50/70 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{cfg.quote_number}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{cfg.config_name}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-900 font-medium">{cfg.customer_name}</span>
                        <p className="text-[10px] text-slate-500">{cfg.customer_email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{cfg.item_count || 8} Parts</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(cfg.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-emerald-700">
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
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedQuoteId(cfg.id)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-blue-600 rounded-lg border border-slate-200 transition cursor-pointer"
                          title="View Snapshotted Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cfg.id)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-red-600 rounded-lg border border-slate-200 transition cursor-pointer"
                          title="Delete Quote"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quote Detail Modal */}
      {selectedQuoteId && (
        <QuoteDetailModal
          quoteId={selectedQuoteId}
          onClose={() => setSelectedQuoteId(null)}
          onStatusChange={fetchQuotations}
        />
      )}
    </div>
  );
};

