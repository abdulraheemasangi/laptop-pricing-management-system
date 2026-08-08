# Laptop Configuration and Pricing System
## Project Documentation

**Name**: Candidate Submission  
**Role**: Full-Stack Engineer (Fresher)  
**Tech Stack**: MongoDB, Express.js, React.js, Node.js, Tailwind CSS  

---

## 1. Questions I Asked Before Starting

When I first read the problem statement, I spent time understanding how a real electronics store handles laptop customization and quote generation. Here are the core questions I thought through before writing any code:

1. **How do component price changes affect old customer quotes?**  
   If a supplier raises the price of an Intel i7 processor today, what happens to a quote I gave a customer yesterday? If the quote price changes automatically, the customer will complain. So, the saved quotation must lock in the exact component prices at the time it was created.

2. **How should pricing be calculated?**  
   Is it just the sum of part prices, or do we need margins and taxes? I decided the formula should be:  
   `Final Quote Price = (Sum of Selected Component Selling Prices) * (1 + Retail Markup %) * (1 + GST Tax %)`

3. **What happens if a user misses selecting a component?**  
   Laptops need all core parts to function. The builder UI should guide the user across all 8 categories (Processor, RAM, Storage, Graphics Card, Display, Battery, Keyboard, OS) so incomplete builds aren't saved accidentally.

4. **How should price updates be tracked?**  
   If an admin changes a component price in the catalog, we need a history log showing the old price, new price, who changed it, and when, for auditing purposes.

---

## 2. Assumptions Made

* Basic JWT login is enough to identify which sales executive created a quote.
* A standard laptop build consists of 8 core categories: Processor, RAM, Storage, Graphics Card, Display, Battery, Keyboard, and Operating System.
* Default markup is set to 15% and GST to 18%, but sales executives can adjust these sliders live while creating a quote.
* Component catalog price updates should create an audit log entry in a `pricehistories` collection.

---

## 3. Overall Solution Approach

I built a full-stack MERN web application with three main parts:

1. **Database (MongoDB)**: Stores component inventory, price change audit logs, sales executive users, and saved laptop configurations.
2. **Backend API (Node.js & Express)**: Handles login, component CRUD, price history logging, and price calculations. When saving a quote, it snapshots the current prices into the quote record so future catalog price changes don't affect old quotes.
3. **Frontend Portal (React & Tailwind CSS)**: A clean enterprise dashboard optimized for laptop displays with an interactive laptop customizer, real-time price calculations, component management table, quote search/filter, and a printable invoice view.

---

## 4. System Architecture

The application uses a standard 3-tier architecture:

* **Frontend**: React.js with Vite and Tailwind CSS. Communicates with the backend using Axios. Handles live state calculations as components are selected. Optimized for fixed desktop/laptop screens (`min-w-[1200px]`).
* **Backend**: Express.js server running on Node.js. Handles API routes, JWT authentication, and business logic for quotes and price snapshotting.
* **Database**: MongoDB with Mongoose ODM. Holds collections for components, users, price logs, and configurations with embedded snapshot items.

---

## 5. Database Design & Schemas

### MongoDB Collections

1. **users**:
   - `_id`: ObjectId
   - `name`: String
   - `email`: String (Unique)
   - `password`: Hashed String
   - `role`: String ('admin' or 'sales_exec')

2. **components**:
   - `_id`: ObjectId
   - `name`: String
   - `category`: String (Processor, RAM, Storage, etc.)
   - `brand`: String
   - `cost_price`: Number
   - `selling_price`: Number
   - `specifications`: String
   - `is_active`: Boolean

3. **pricehistories**:
   - `_id`: ObjectId
   - `component_id`: ObjectId (Ref to components)
   - `old_cost_price`: Number
   - `new_cost_price`: Number
   - `old_selling_price`: Number
   - `new_selling_price`: Number
   - `changed_by`: String
   - `changed_at`: Date

4. **configurations** (Preserves Historical Prices):
   - `_id`: ObjectId
   - `quote_number`: String (e.g. QT-2026-001)
   - `config_name`: String
   - `customer_name`: String
   - `customer_email`: String
   - `total_cost_price`: Number
   - `total_selling_price`: Number
   - `markup_percentage`: Number
   - `tax_percentage`: Number
   - `final_quote_price`: Number
   - `status`: String ('Draft', 'Issued', 'Accepted', 'Rejected')
   - `items`: Array of embedded subdocuments storing `component_id`, `snapshotted_name`, `snapshotted_category`, `snapshotted_cost_price`, `snapshotted_selling_price`, and `snapshotted_specifications`.

---

## 6. Service & API Design

| Method | Endpoint | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Login for sales team & return JWT | No |
| **GET** | `/api/auth/me` | Verify logged in user | Yes |
| **GET** | `/api/components` | Get catalog components with category filter & search | No |
| **GET** | `/api/components/:id` | Get single component details and price audit history | No |
| **POST** | `/api/components` | Add a new component to catalog | Yes |
| **PUT** | `/api/components/:id` | Update component details or price | Yes |
| **DELETE**| `/api/components/:id` | Delete a component | Yes |
| **GET** | `/api/configurations` | Search and filter saved quotes | No |
| **GET** | `/api/configurations/:id` | Get quote details and compare snapshotted vs current price | No |
| **POST** | `/api/configurations` | Save a laptop configuration & snapshot prices | Yes |
| **PATCH**| `/api/configurations/:id/status`| Update quote status | Yes |

---

## 7. UI/UX Approach

* **Clean Enterprise Laptop Layout**: Built with Tailwind CSS using a clean light slate palette, white card containers, and crisp typography for enterprise sales executives.
* **Live Calculation**: As components are clicked or the markup slider is moved, the final quote price updates instantly without page refreshes.
* **Printable Invoices**: Added print CSS rules so clicking "Print Invoice" formats the quote cleanly for customer printing.
* **Price Drift Badge**: In quote details, if a catalog item's price has changed since the quote was created, a small badge highlights the price difference to show that the saved quote price remained locked.

---

## 8. Technical Decisions & Trade-offs

1. **Embedded Array vs Separate Collection for Quote Items**:  
   I chose to embed snapshotted items directly inside the configuration document in MongoDB instead of referencing component IDs. This trade-off duplicates some text data, but it guarantees that old quotes will never break or change price if component items are edited or deleted later in the catalog.

2. **MongoDB Connection Fallback**:  
   I added a fallback to MongoMemoryServer in `db.js` so that if local MongoDB isn't running on the reviewer's laptop, the project still boots and runs seamlessly without throwing connection errors.

---

## 9. Challenges Faced & Solutions

* **Challenge 1**: Preserving historical quote prices when catalog prices are updated.  
  * *Solution*: When saving a configuration, I read the current component prices and copy them directly into the quote document (`items` array).
* **Challenge 2**: Calculating live totals in React across 8 separate component categories.  
  * *Solution*: Managed component selections in a state object indexed by category name, making total price aggregation fast and clean.

---

## 10. Future Improvements

* PDF export feature using `pdfkit` or `html2pdf`.
* Hardware compatibility checks (e.g. checking CPU socket type against motherboard socket).
* Customer email notification when a quote status changes to 'Accepted'.
