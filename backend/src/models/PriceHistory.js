const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  component_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Component', required: true },
  component_name: { type: String },
  old_cost_price: { type: Number, required: true },
  new_cost_price: { type: Number, required: true },
  old_selling_price: { type: Number, required: true },
  new_selling_price: { type: Number, required: true },
  changed_by: { type: String, default: 'Sales Executive' },
  changed_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
