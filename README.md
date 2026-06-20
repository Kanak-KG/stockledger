# StockLedger — Sales & Inventory Management System with AI Analytics

A full-stack web app matching your spec: React frontend, Node.js/Express backend,
MySQL database, JWT authentication, and three roles — **Admin**, **Inventory Manager**,
and **Sales Executive** — with the rules from your role discussion already built in
(only Admin can permanently delete products; Inventory Managers deactivate instead).

```
inventory-system/
├── client/      React frontend (Vite + Tailwind + Recharts)
├── server/      Express backend (REST API + JWT auth)
└── database/    MySQL schema + seed data
```

---

## 1. Prerequisites

- [Node.js](https://nodejs.org) v18+ and npm
- [MySQL](https://dev.mysql.com/downloads/) 8.x (or MariaDB) running locally or remotely
- A MySQL client (MySQL Workbench, DBeaver, or just the `mysql` CLI)

---

## 2. Set up the database

1. Open a MySQL shell and run the schema file — it creates the database, all tables,
   and seeds a default admin account + sample categories/suppliers:

   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. The seed admin login is:
   - **Email:** `admin@store.com`
   - **Password:** `Admin@123`

   (Change this immediately after first login via the Profile page, or regenerate
   it — see step 3.4 below.)

---

## 3. Set up the backend

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in your real MySQL credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=inventory_system
JWT_SECRET=replace_with_a_long_random_string
```

3.1 **Run it:**
```bash
npm run dev      # auto-restarts on changes (nodemon)
# or
npm start
```
You should see `✅ MySQL connected` and `🚀 Server running on http://localhost:5000`.

3.2 **Health check:** visit `http://localhost:5000/api/health` — should return `{"status":"ok"}`.

3.3 **AI Analytics:** works out of the box with a built-in rule-based engine (no API key
needed). To use real OpenAI-generated narrative reports instead, add your key to `.env`:
```
OPENAI_API_KEY=sk-...
```

3.4 **Reset/regenerate the admin password** any time:
```bash
npm run seed
```
(reads `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env` if set, otherwise
defaults to `admin@store.com` / `Admin@123`)

---

## 4. Set up the frontend

In a **second terminal**:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** — the Vite dev server proxies all `/api/*` calls to
your backend on port 5000 automatically (see `vite.config.js`), so no extra config
is needed.

Log in with the seed admin account, then use the **Employees** page to create your
Inventory Manager and Sales Executive accounts.

---

## 5. Roles & permissions (as built)

| Action | Admin | Inventory Manager | Sales Executive |
|---|:---:|:---:|:---:|
| View dashboard, reports cards | ✅ | partial | partial |
| Add / edit products, update stock | ✅ | ✅ | ❌ |
| **Deactivate** a product | ✅ | ✅ | ❌ |
| **Permanently delete** a product | ✅ | ❌ | ❌ |
| Sell products / generate bills | ✅ | ❌ | ✅ |
| View own sales history | ✅ | ❌ | ✅ |
| View all sales / reports / AI analytics | ✅ | ❌ | ❌ |
| Manage employees (add/remove/reset password) | ✅ | ❌ | ❌ |

This mirrors the design from your notes: storekeepers handle day-to-day inventory,
cashiers handle billing, and only the owner can do irreversible actions or see the
full picture.

---

## 6. What's implemented

- **Auth:** JWT login, role-based route guards on both frontend and backend, password change
- **Inventory:** full CRUD, restock flow, soft-deactivate vs. permanent delete (admin-only), low-stock highlighting
- **Sales/Billing:** cart-based POS flow, automatic stock deduction, transactional (won't oversell), receipt view
- **Reports:** daily/weekly/monthly/yearly/custom ranges, revenue & profit charts, top products, category breakdown, print-to-PDF
- **AI Analytics:** dead-stock detection, best sellers, low-stock restock suggestions, profit analysis, natural-language summary (rule-based by default, optional OpenAI)
- **Employee management:** create/deactivate accounts, role assignment, password resets
- **Dashboard:** live stat cards + charts, scoped to what each role should see

## 7. Suggested next steps (from your "Future Features" list)

These weren't built yet but the schema/structure supports adding them:
- Barcode scanner integration (the `barcode` column already exists on `products`)
- PDF invoice generation (`reports` page already has a print-to-PDF button as a starting point)
- GST/tax calculation on the billing screen
- Customer database (currently only `customer_name` is stored as free text)
- Dark mode

## 8. Troubleshooting

- **"MySQL connection failed"** — double check `.env` credentials and that MySQL is running (`mysql -u root -p` should connect from the same machine).
- **Login fails with correct password** — re-run `npm run seed` in `server/` to regenerate the admin account's hash.
- **CORS / network errors in the browser** — make sure the backend (`:5000`) is running before starting the frontend dev server, and that you're hitting `:5173`, not `:5000`, in your browser.
