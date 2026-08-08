import React, { useState, useEffect } from 'react';
import { configService } from '../services/api';
import { X, Printer, ShieldCheck, AlertTriangle } from 'lucide-react';

export const QuoteDetailModal = ({ quoteId, onClose, onStatusChange }) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await configService.getById(quoteId);
        setQuote(data);
      } catch (err) {
        console.error('Failed to load quote details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (quoteId) fetchDetail();
  }, [quoteId]);

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await configService.updateStatus(quoteId, newStatus);
      setQuote(prev => ({ ...prev, status: newStatus }));
      if (onStatusChange) onStatusChange();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  if (!quoteId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-blue-600">{quote?.quote_number}</span>
            <h3 className="font-bold text-slate-900 text-lg">{quote?.config_name}</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-200 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              Print / Export Invoice
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading quotation snapshot...</div>
        ) : (
          <div id="printable-quote" className="space-y-6">
            
            {/* Invoice Header Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Customer Info</p>
                <p className="font-bold text-slate-900 mt-1">{quote.customer_name}</p>
                <p className="text-slate-500">{quote.customer_email}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Quotation Metadata</p>
                <p className="font-mono text-slate-700 mt-1">Date: {new Date(quote.created_at).toLocaleDateString('en-IN')}</p>
                <p className="text-slate-500">Issued by: {quote.created_by}</p>
              </div>
            </div>

            {/* Historical Protection Indicator Notice */}
            <div className="no-print p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-950">Historical Pricing Preservation Active</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  The prices shown below are snapshotted from when this quote was issued. If catalog prices change in the future, this quote remains 100% accurate to its original agreement.
                </p>
              </div>
            </div>

            {/* Snapshotted Items Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Component Breakdown</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Component Name</th>
                      <th className="py-3 px-4 font-semibold text-right">Snapshotted Price</th>
                      <th className="py-3 px-4 font-semibold text-right no-print">Current Catalog Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {quote.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-500 font-semibold text-[11px]">{item.snapshotted_category}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {item.snapshotted_name}
                          <p className="text-[10px] text-slate-500 font-normal">{item.snapshotted_specifications}</p>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          ₹{item.snapshotted_selling_price.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs no-print">
                          {item.price_has_changed ? (
                            <span className="text-amber-700 font-semibold flex items-center justify-end gap-1" title="Catalog price changed after quote was generated!">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              ₹{item.current_catalog_selling_price?.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-400">₹{item.snapshotted_selling_price.toLocaleString('en-IN')} (Unchanged)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Parts Base Selling Total:</span>
                <span className="font-mono font-semibold text-slate-900">₹{quote.total_selling_price?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Applied Margin / Markup:</span>
                <span className="font-mono font-semibold text-slate-900">+{quote.markup_percentage}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax ({quote.tax_percentage}%):</span>
                <span className="font-mono text-slate-700">Included</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Total Final Quotation Price:</span>
                <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                  ₹{quote.final_quote_price?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Status Switcher Controls (No Print) */}
            <div className="no-print pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Quotation Status:</span>
                <span className="font-bold text-blue-600 uppercase">{quote.status}</span>
              </div>
              <div className="flex items-center gap-2">
                {['Issued', 'Accepted', 'Rejected', 'Draft'].map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      quote.status === st
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Set {st}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

