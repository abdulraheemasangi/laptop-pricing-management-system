const Configuration = require('../models/Configuration');
const Component = require('../models/Component');

const generateQuoteNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Configuration.countDocuments();
  return `QT-${year}-${String(count + 1).padStart(3, '0')}`;
};

const createConfiguration = async (req, res) => {
  try {
    const { config_name, customer_name, customer_email, notes, component_ids, markup_percentage, tax_percentage } = req.body;

    if (!config_name || !customer_name || !customer_email || !Array.isArray(component_ids) || component_ids.length === 0) {
      return res.status(400).json({ message: 'Missing required configuration fields' });
    }

    const selectedComponents = await Component.find({ _id: { $in: component_ids } });
    if (selectedComponents.length === 0) {
      return res.status(400).json({ message: 'Selected components not found' });
    }

    let totalCostPrice = 0;
    let totalSellingPrice = 0;

    // Snapshot item details at quote creation time
    const snapshottedItems = selectedComponents.map(comp => {
      totalCostPrice += comp.cost_price;
      totalSellingPrice += comp.selling_price;
      return {
        component_id: comp._id,
        snapshotted_name: comp.name,
        snapshotted_category: comp.category,
        snapshotted_cost_price: comp.cost_price,
        snapshotted_selling_price: comp.selling_price,
        snapshotted_specifications: comp.specifications
      };
    });

    const markup = markup_percentage !== undefined ? Number(markup_percentage) : 15.0;
    const tax = tax_percentage !== undefined ? Number(tax_percentage) : 18.0;

    const priceWithMarkup = totalSellingPrice * (1 + markup / 100);
    const finalQuotePrice = Math.round(priceWithMarkup * (1 + tax / 100));

    const quoteNumber = await generateQuoteNumber();
    const createdBy = req.user ? req.user.name : 'Sales Executive';

    const configuration = await Configuration.create({
      quote_number: quoteNumber,
      config_name,
      customer_name,
      customer_email,
      notes: notes || '',
      total_cost_price: totalCostPrice,
      total_selling_price: totalSellingPrice,
      markup_percentage: markup,
      tax_percentage: tax,
      final_quote_price: finalQuotePrice,
      status: 'Issued',
      created_by: createdBy,
      items: snapshottedItems
    });

    res.status(201).json({
      ...configuration.toObject(),
      id: configuration._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save configuration' });
  }
};

const getConfigurations = async (req, res) => {
  try {
    const { search, status, dateFrom, dateTo } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { quote_number: { $regex: search, $options: 'i' } },
        { config_name: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } },
        { customer_email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const configs = await Configuration.find(filter).sort({ createdAt: -1 });

    const formatted = configs.map(cfg => ({
      ...cfg.toObject(),
      id: cfg._id,
      created_at: cfg.createdAt,
      item_count: cfg.items ? cfg.items.length : 0
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quotations' });
  }
};

const getConfigurationById = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await Configuration.findById(id);
    if (!config) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    const itemsWithComparison = await Promise.all(
      config.items.map(async (item) => {
        let currentCatalogComp = null;
        if (item.component_id) {
          currentCatalogComp = await Component.findById(item.component_id);
        }

        const currentSelling = currentCatalogComp ? currentCatalogComp.selling_price : null;
        const currentCost = currentCatalogComp ? currentCatalogComp.cost_price : null;

        return {
          ...item.toObject(),
          id: item._id,
          current_catalog_cost_price: currentCost,
          current_catalog_selling_price: currentSelling,
          price_has_changed: currentSelling !== null ? (currentSelling !== item.snapshotted_selling_price) : false
        };
      })
    );

    res.json({
      ...config.toObject(),
      id: config._id,
      created_at: config.createdAt,
      items: itemsWithComparison
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load quotation details' });
  }
};

const updateConfigurationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Draft', 'Issued', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await Configuration.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    res.json({ ...updated.toObject(), id: updated._id });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status' });
  }
};

const deleteConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    await Configuration.findByIdAndDelete(id);
    res.json({ message: 'Deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete' });
  }
};

module.exports = {
  createConfiguration,
  getConfigurations,
  getConfigurationById,
  updateConfigurationStatus,
  deleteConfiguration
};
