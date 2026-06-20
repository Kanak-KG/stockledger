-- ============================================================
-- Sales & Inventory Management System with AI Analytics
-- MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS inventory_system;
USE inventory_system;

-- ---------------- Users (Admin / Inventory Manager / Sales Executive) ----------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'inventory_manager', 'sales_executive') NOT NULL DEFAULT 'sales_executive',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------- Categories ----------------
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- ---------------- Suppliers ----------------
CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(30),
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- Products ----------------
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category_id INT,
  supplier_id INT,
  purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 0,
  min_quantity INT NOT NULL DEFAULT 10,
  barcode VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ---------------- Sales (one sale = one bill, can contain many products) ----------------
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  profit DECIMAL(10,2) NOT NULL DEFAULT 0,
  customer_name VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- ---------------- Sale Items ----------------
CREATE TABLE sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ---------------- Login Logs ----------------
CREATE TABLE login_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================
-- Seed data
-- ============================================================

-- Default admin account -> email: admin@store.com / password: Admin@123
-- (password hash generated with bcrypt, see server/utils/seed.js to regenerate)
INSERT INTO users (name, email, password, role) VALUES
('Store Owner', 'admin@store.com', '$2b$10$y5p9qB08pws57sq9GKcOGeuTRtgZHAWwauYVTvIJ6lKu7jSCMqLha', 'admin');

INSERT INTO categories (name) VALUES ('Beverages'), ('Snacks'), ('Electronics'), ('Groceries'), ('Stationery');

INSERT INTO suppliers (name, contact_person, phone, email) VALUES
('Fresh Foods Pvt Ltd', 'Ramesh Gupta', '9876543210', 'ramesh@freshfoods.com'),
('Tech Distributors', 'Anita Sharma', '9876501234', 'anita@techdist.com');
