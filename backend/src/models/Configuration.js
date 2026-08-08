const mongoose = require('mongoose');

const snapshottedItemSchema = new mongoose.Schema({
  component_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Component' },
  snapshotted_name: { type: String, required: true },
  snapshotted_category: { type: String, required: true },
  snapshotted_cost_price: { type: Number, required: true },
  snapshotted_selling_price: { type: Number, required: true },
  snapshotted_specifications: { type: String }
});

const configurationSchema = new mongoose.Schema({
  quote_number: { type: String, required: true, unique: true },
  config_name: { type: String, required: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  notes: { type: String, default: '' },
  total_cost_price: { type: Number, required: true },
  total_selling_price: { type: Number, required: true },
  markup_percentage: { type: Number, default: 15.0 },
  tax_percentage: { type: Number, default: 18.0 },
  final_quote_price: { type: Number, required: true },
  status: { type: String, enum: ['Draft', 'Issued', 'Accepted', 'Rejected'], default: 'Issued' },
  created_by: { type: String, required: true },
  items: [snapshottedItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Configuration', configurationSchema);
