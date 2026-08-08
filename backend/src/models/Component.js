const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Processor', 'RAM', 'Storage', 'Graphics Card', 'Display', 'Battery', 'Keyboard', 'Operating System']
  },
  brand: { type: String, default: '' },
  cost_price: { type: Number, required: true },
  selling_price: { type: Number, required: true },
  specifications: { type: String, default: '' },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Component', componentSchema);
