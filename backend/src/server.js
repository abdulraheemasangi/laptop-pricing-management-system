require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Component = require('./models/Component');
const Configuration = require('./models/Configuration');

const authRoutes = require('./routes/authRoutes');
const componentRoutes = require('./routes/componentRoutes');
const configRoutes = require('./routes/configRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/configurations', configRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const initialData = async () => {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'sales@electronics.com';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.DEFAULT_ADMIN_NAME || 'Rahul Sharma';

  let user = await User.findOne({ email: adminEmail });
  if (!user) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    user = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });
  }

  const count = await Component.countDocuments();
  if (count === 0) {
    await Component.insertMany([
      { name: 'Intel Core i5-13500H (12 Cores, up to 4.7GHz)', category: 'Processor', brand: 'Intel', cost_price: 18000, selling_price: 22500, specifications: '12 Cores / 16 Threads, 18MB Cache' },
      { name: 'Intel Core i7-13700H (14 Cores, up to 5.0GHz)', category: 'Processor', brand: 'Intel', cost_price: 26000, selling_price: 32000, specifications: '14 Cores / 20 Threads, 24MB Cache' },
      { name: 'AMD Ryzen 7 7840HS (8 Cores, up to 5.1GHz)', category: 'Processor', brand: 'AMD', cost_price: 24000, selling_price: 29500, specifications: '8 Cores / 16 Threads, Radeon 780M iGPU' },
      { name: '8GB DDR5 4800MHz SODIMM', category: 'RAM', brand: 'Crucial', cost_price: 2200, selling_price: 3000, specifications: 'Single Channel, 1.1V, CL40' },
      { name: '16GB DDR5 5600MHz SODIMM', category: 'RAM', brand: 'Corsair', cost_price: 4500, selling_price: 5800, specifications: 'Dual Channel Kit (1x16GB)' },
      { name: '512GB NVMe M.2 Gen4 SSD', category: 'Storage', brand: 'Samsung', cost_price: 3200, selling_price: 4200, specifications: 'Read: 5000MB/s, Write: 4200MB/s' },
      { name: '1TB NVMe M.2 Gen4 SSD', category: 'Storage', brand: 'Western Digital', cost_price: 5800, selling_price: 7500, specifications: 'Read: 7300MB/s, Write: 6300MB/s' },
      { name: 'Integrated Intel Iris Xe Graphics', category: 'Graphics Card', brand: 'Intel', cost_price: 0, selling_price: 0, specifications: 'Shared System Memory' },
      { name: 'NVIDIA GeForce RTX 4060 8GB GDDR6', category: 'Graphics Card', brand: 'NVIDIA', cost_price: 31000, selling_price: 38000, specifications: '8GB GDDR6, 105W TGP, Ray Tracing' },
      { name: '15.6" FHD (1920x1080) 144Hz IPS Panel', category: 'Display', brand: 'LG Display', cost_price: 6500, selling_price: 8500, specifications: '250 nits, 45% NTSC, Anti-glare' },
      { name: '4-Cell 56Wh Li-ion Battery', category: 'Battery', brand: 'Simplo', cost_price: 2800, selling_price: 3600, specifications: 'Fast charging support' },
      { name: 'Standard Membrane Backlit Keyboard', category: 'Keyboard', brand: 'Chicony', cost_price: 1200, selling_price: 1800, specifications: 'Single color white backlight' },
      { name: 'Windows 11 Home 64-bit', category: 'Operating System', brand: 'Microsoft', cost_price: 3200, selling_price: 4500, specifications: 'OEM license pre-installed' }
    ]);
  }
};

const start = async () => {
  try {
    await connectDB();
    await initialData();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
