# Laptop Configuration & Pricing Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) web application built for electronics retailers to manage laptop components, build custom laptop configurations, calculate real-time pricing with dynamic markups, and lock in historical customer quotations.

---

## Key Features

1. **Historical Pricing Preservation**: Component prices and specifications are snapshotted in MongoDB when a quotation is created, ensuring future catalog price changes never alter old quotes.
2. **Interactive Laptop Builder**: Custom laptop configurator across 8 component categories with real-time price, retail markup, and GST calculations.
3. **Component Catalog & Audit Logs**: Full CRUD for laptop parts with an automatic price update history log.
4. **Quotation Search & Filters**: Search quotes by quote number (e.g. QT-2026-001), customer name, or status.
5. **Printable Invoices**: One-click printable customer invoice layout using print CSS rules.
6. **Zero-Setup Database**: Uses Mongoose ODM connected to MongoDB with an automatic fallback for smooth evaluation.

---

## Project Structure

```
91social Assignment/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection & fallback logic
│   │   ├── controllers/     # Auth, Component, and Configuration pricing logic
│   │   ├── middleware/      # JWT Authentication middleware
│   │   ├── models/          # Mongoose Schemas (User, Component, PriceHistory, Configuration)
│   │   ├── routes/          # Express REST API endpoints
│   │   └── server.js        # Express application entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, StatCards, Invoice Modal
│   │   ├── context/         # AuthContext state manager
│   │   ├── pages/           # Dashboard, ComponentManager, ConfigBuilder, QuoteList
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx
│   │   └── index.css        # Tailwind & custom print styles
│   ├── package.json
│   └── vite.config.js
├── PROJECT_DOCUMENTATION.md # Project documentation report
├── VIDEO_EXPLANATION_SCRIPT.md # Video explanation script and interview Q&A
└── README.md                # Quickstart guide
```

---

## How to Run

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Start Backend
```bash
cd backend
npm install
npm start
```
*Backend runs on http://localhost:5000*

### 2. Start Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on http://localhost:3000*

---

## Default Credentials

- **Email**: sales@electronics.com
- **Password**: admin123

*(The login screen includes an auto-fill button for quick testing).*
