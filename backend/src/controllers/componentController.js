const Component = require('../models/Component');
const PriceHistory = require('../models/PriceHistory');

const getComponents = async (req, res) => {
  try {
    const { category, search, activeOnly } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { specifications: { $regex: search, $options: 'i' } }
      ];
    }

    if (activeOnly === 'true') {
      filter.is_active = true;
    }

    const rawComponents = await Component.find(filter).sort({ category: 1, name: 1 });
    const components = rawComponents.map(c => ({
      ...c.toObject(),
      id: c._id
    }));

    res.json(components);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch components' });
  }
};

const getComponentById = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }

    const history = await PriceHistory.find({ component_id: req.params.id }).sort({ changed_at: -1 });

    res.json({
      ...component.toObject(),
      id: component._id,
      price_history: history
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading component' });
  }
};

const createComponent = async (req, res) => {
  try {
    const { name, category, brand, cost_price, selling_price, specifications } = req.body;

    if (!name || !category || cost_price === undefined || selling_price === undefined) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const component = await Component.create({
      name,
      category,
      brand: brand || '',
      cost_price: Number(cost_price),
      selling_price: Number(selling_price),
      specifications: specifications || ''
    });

    res.status(201).json({ ...component.toObject(), id: component._id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create component' });
  }
};

const updateComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, brand, cost_price, selling_price, specifications, is_active } = req.body;

    const existing = await Component.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Component not found' });
    }

    const newCost = Number(cost_price !== undefined ? cost_price : existing.cost_price);
    const newSelling = Number(selling_price !== undefined ? selling_price : existing.selling_price);

    // Audit log
    if (existing.cost_price !== newCost || existing.selling_price !== newSelling) {
      await PriceHistory.create({
        component_id: existing._id,
        component_name: existing.name,
        old_cost_price: existing.cost_price,
        new_cost_price: newCost,
        old_selling_price: existing.selling_price,
        new_selling_price: newSelling,
        changed_by: req.user ? req.user.name : 'System'
      });
    }

    existing.name = name || existing.name;
    existing.category = category || existing.category;
    existing.brand = brand !== undefined ? brand : existing.brand;
    existing.cost_price = newCost;
    existing.selling_price = newSelling;
    existing.specifications = specifications !== undefined ? specifications : existing.specifications;
    if (is_active !== undefined) existing.is_active = Boolean(is_active);

    await existing.save();

    res.json({ ...existing.toObject(), id: existing._id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update component' });
  }
};

const deleteComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Component.findByIdAndDelete(id);
    if (!existing) {
      return res.status(404).json({ message: 'Component not found' });
    }
    res.json({ message: 'Deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete' });
  }
};

module.exports = {
  getComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent
};
