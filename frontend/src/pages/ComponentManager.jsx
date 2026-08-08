import React, { useState, useEffect } from 'react';
import { componentService } from '../services/api';
import { Plus, Search, Edit2, Trash2, History, X } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Processor',
  'RAM',
  'Storage',
  'Graphics Card',
  'Display',
  'Battery',
  'Keyboard',
  'Operating System'
];

export const ComponentManager = () => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Processor',
    brand: '',
    cost_price: '',
    selling_price: '',
    specifications: '',
    is_active: 1
  });
  const [formError, setFormError] = useState('');

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const data = await componentService.getAll({ category: selectedCategory, search });
      setComponents(data);
    } catch (err) {
      console.error('Failed to load components:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [selectedCategory, search]);

  const handleOpenAddModal = () => {
    setEditingComp(null);
    setFormData({
      name: '',
      category: 'Processor',
      brand: '',
      cost_price: '',
      selling_price: '',
      specifications: '',
      is_active: 1
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp) => {
    setEditingComp(comp);
    setFormData({
      name: comp.name,
      category: comp.category,
      brand: comp.brand || '',
      cost_price: comp.cost_price,
      selling_price: comp.selling_price,
      specifications: comp.specifications || '',
      is_active: comp.is_active
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleViewHistory = async (comp) => {
    try {
      const data = await componentService.getById(comp.id);
      setHistoryData(data.price_history || []);
      setEditingComp(comp);
      setIsHistoryModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch price history:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.category || formData.cost_price === '' || formData.selling_price === '') {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingComp) {
        await componentService.update(editingComp.id, formData);
      } else {
        await componentService.create(formData);
      }
      setIsModalOpen(false);
      fetchComponents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving component.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this component?')) {
      try {
        await componentService.delete(id);
        fetchComponents();
      } catch (err) {
        alert('Failed to delete component.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-xl shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Component Catalog</h2>
          <p className="text-xs text-slate-500 mt-1">Manage laptop parts, base cost, selling prices & specifications</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Component
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parts or specs..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Components Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading component catalog...</div>
        ) : components.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No components found matching your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Component Name</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Brand</th>
                  <th className="py-3.5 px-4 font-semibold">Cost Price</th>
                  <th className="py-3.5 px-4 font-semibold">Selling Price</th>
                  <th className="py-3.5 px-4 font-semibold">Margin</th>
                  <th className="py-3.5 px-4 font-semibold">Specifications</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {components.map((comp) => {
                  const margin = comp.selling_price - comp.cost_price;
                  const marginPercent = comp.cost_price > 0 ? ((margin / comp.cost_price) * 100).toFixed(1) : 0;
                  return (
                    <tr key={comp.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{comp.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                          {comp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{comp.brand || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">₹{comp.cost_price.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 font-bold font-mono text-emerald-700">₹{comp.selling_price.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        +₹{margin.toLocaleString('en-IN')} ({marginPercent}%)
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{comp.specifications || '-'}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewHistory(comp)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-amber-700 rounded-lg border border-slate-200 transition cursor-pointer"
                          title="Price Update History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(comp)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-blue-600 rounded-lg border border-slate-200 transition cursor-pointer"
                          title="Edit Component"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(comp.id)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-red-600 rounded-lg border border-slate-200 transition cursor-pointer"
                          title="Delete Component"
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingComp ? 'Edit Component Details' : 'Add New Laptop Component'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Component Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Intel Core i7-13700H"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Intel, NVIDIA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cost Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    placeholder="26000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Base Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    placeholder="32000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Technical Specifications</label>
                <textarea
                  rows="3"
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  placeholder="e.g. 14 Cores / 20 Threads, 24MB Cache..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  {editingComp ? 'Update Price & Part' : 'Create Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price Audit History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Price Audit Log</h3>
                <p className="text-xs text-slate-500">{editingComp?.name}</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {historyData.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No price updates recorded for this component yet.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2">
                {historyData.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Updated by: {log.changed_by || 'Admin'}</span>
                      <span>{new Date(log.changed_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-600">
                        Cost: ₹{log.old_cost_price} → <strong className="text-slate-900">₹{log.new_cost_price}</strong>
                      </span>
                      <span className="text-slate-600">
                        Selling: ₹{log.old_selling_price} → <strong className="text-emerald-700">₹{log.new_selling_price}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

