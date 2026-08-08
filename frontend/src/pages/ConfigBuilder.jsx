import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { componentService, configService } from '../services/api';
import { Cpu, CheckCircle, Calculator, Save, AlertCircle, Sparkles } from 'lucide-react';

const REQUIRED_CATEGORIES = [
  'Processor',
  'RAM',
  'Storage',
  'Graphics Card',
  'Display',
  'Battery',
  'Keyboard',
  'Operating System'
];

export const ConfigBuilder = () => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected component for each category: { category: componentObj }
  const [selections, setSelections] = useState({});
  
  // Config Metadata & Markup
  const [configName, setConfigName] = useState('Custom High-Performance Laptop Configuration');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [markupPercentage, setMarkupPercentage] = useState(15);
  const [taxPercentage, setTaxPercentage] = useState(18);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const data = await componentService.getAll({ activeOnly: true });
        setComponents(data);
        
        // Auto-select first item in each category for quick start
        const initial = {};
        REQUIRED_CATEGORIES.forEach(cat => {
          const match = data.find(c => c.category === cat);
          if (match) initial[cat] = match;
        });
        setSelections(initial);
      } catch (err) {
        console.error('Failed to load components for builder:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  const handleSelectComponent = (category, component) => {
    setSelections(prev => ({
      ...prev,
      [category]: component
    }));
  };

  // Calculations
  const selectedList = Object.values(selections);
  const totalCostPrice = selectedList.reduce((sum, item) => sum + (item.cost_price || 0), 0);
  const totalSellingPrice = selectedList.reduce((sum, item) => sum + (item.selling_price || 0), 0);
  
  const priceWithMarkup = totalSellingPrice * (1 + markupPercentage / 100);
  const finalPrice = Math.round(priceWithMarkup * (1 + taxPercentage / 100));
  const estimatedProfit = finalPrice - totalCostPrice;

  const handleSaveQuotation = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerName || !customerEmail) {
      setError('Please provide customer name and email address.');
      return;
    }

    if (selectedList.length === 0) {
      setError('Please select components for your laptop build.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        config_name: configName,
        customer_name: customerName,
        customer_email: customerEmail,
        notes,
        component_ids: selectedList.map(item => item.id),
        markup_percentage: markupPercentage,
        tax_percentage: taxPercentage
      };

      const result = await configService.create(payload);
      navigate(`/quotations?highlight=${result.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving quotation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Laptop Customizer & Price Calculator
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-xs text-slate-500 mt-1">Select laptop components across 8 mandatory categories to calculate real-time pricing</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Initializing Laptop Builder...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          
          {/* Left Column: 8 Component Selection Cards (2 Cols wide) */}
          <div className="col-span-2 space-y-4">
            {REQUIRED_CATEGORIES.map((category) => {
              const categoryComps = components.filter(c => c.category === category);
              const currentSelected = selections[category];

              return (
                <div key={category} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      {category}
                    </span>
                    {currentSelected && (
                      <span className="text-xs font-bold text-emerald-700 font-mono">
                        +₹{currentSelected.selling_price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {categoryComps.map((comp) => {
                      const isSelected = currentSelected?.id === comp.id;
                      return (
                        <div
                          key={comp.id}
                          onClick={() => handleSelectComponent(category, comp)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-slate-900 leading-tight">{comp.name}</span>
                            {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{comp.specifications || 'Standard specifications'}</p>
                          <div className="mt-2.5 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-mono">Cost: ₹{comp.cost_price.toLocaleString('en-IN')}</span>
                            <span className="font-bold text-slate-900 font-mono">₹{comp.selling_price.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Live Price Breakdown & Customer Form (1 Col wide sticky) */}
          <div className="space-y-6">
            
            {/* Live Pricing Summary Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 sticky top-20 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Quote Pricing Breakdown</h3>
              </div>

              {/* Component Cost List */}
              <div className="space-y-2 text-xs border-b border-slate-200 pb-3 max-h-48 overflow-y-auto pr-1">
                {selectedList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-slate-700">
                    <span className="truncate max-w-[170px] text-slate-500">{item.category}: {item.name}</span>
                    <span className="font-mono font-semibold text-slate-900">₹{item.selling_price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Subtotal & Margin Controls */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Parts Total:</span>
                  <span className="font-mono font-semibold text-slate-900">₹{totalSellingPrice.toLocaleString('en-IN')}</span>
                </div>

                {/* Markup Slider */}
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Retail Margin / Markup:</span>
                    <span className="font-bold text-blue-600">{markupPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={markupPercentage}
                    onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Tax % */}
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax Rate:</span>
                  <span className="font-semibold text-slate-800">{taxPercentage}%</span>
                </div>

                {/* Final Calculation Result */}
                <div className="pt-3 border-t border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Final Quote Price:</span>
                    <span className="text-xl font-extrabold text-emerald-700 font-mono">
                      ₹{finalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Estimated Net Profit:</span>
                    <span className="font-mono text-emerald-700 font-semibold">₹{estimatedProfit.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details Form */}
              <form onSubmit={handleSaveQuotation} className="pt-4 border-t border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900">Customer & Quote Info</h4>
                
                <div>
                  <input
                    type="text"
                    required
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    placeholder="Configuration Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Full Name *"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Customer Email Address *"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes or special requests..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Snapshotting Quote...' : 'Save & Issue Quotation'}
                </button>
              </form>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

