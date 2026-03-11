-- ========================================
-- Sample Orders Dataset
-- ========================================
-- This script inserts sample customer and order data
-- Compatible with the database schema

-- First, insert sample customers (if not already present)
INSERT INTO customers (name, business_name, phone, email, address, tax_id, gstin) 
VALUES 
  ('Rajesh Kumar', 'Kumar Industries', '9876543210', 'rajesh@kumarin.com', '123 Industrial Park, Bangalore', '12ABCDE1234F1Z5', '29ABCDE1234F1Z0'),
  ('Priya Sharma', 'Sharma Manufacturing', '9876543211', 'priya@sharma.com', '456 Tech Zone, Hyderabad', '18DEFGH5678D1Z6', '36DEFGH5678D1Z0'),
  ('Amit Patel', 'Patel & Co.', '9876543212', 'amit@patel.com', '789 Business Complex, Ahmedabad', '22GHIJK9012E1Z7', '24GHIJK9012E1Z0'),
  ('Sneha Gupta', 'Gupta Enterprises', '9876543213', 'sneha@gupta.com', '321 Commerce Street, Delhi', '07JKLMN3456F1Z8', '07JKLMN3456F1Z0'),
  ('Vikram Singh', 'Singh Brothers Ltd', '9876543214', 'vikram@singh.com', '654 Export Zone, Mumbai', '27PQRST7890G1Z9', '27PQRST7890G1Z0'),
  ('Anita Verma', 'Verma Trading', '9876543215', 'anita@verma.com', '987 Market Road, Chennai', '33UVWXY2345H1Z0', '33UVWXY2345H1Z0');

-- Insert sample orders with mixed delivery statuses
-- These will be linked to machinery items
INSERT INTO orders (customer_id, total_amount, amount_paid, payment_status, delivery_status, invoice_no, po_no, po_date, dc_no, discount, discount_percent, payment_terms, warranty_period, mode_of_transport, dispatched_from, place_of_supply, vehicle_no, created_by, created_at)
VALUES
  -- PENDING DELIVERY ORDERS (Machines)
  (1, 550000.00, 0.00, 'pending', 'pending', 'INV-2026-001', 'PO-001', '2026-03-01', 'DC-001', 0.00, 0.00, '30 days', '12 months', 'Road', 'Bangalore Warehouse', 'Bangalore', 'KA-01-AB-1234', 1, NOW()),
  (2, 850000.00, 425000.00, 'partial', 'pending', 'INV-2026-002', 'PO-002', '2026-03-02', 'DC-002', 10000.00, 0.00, '15 days', '12 months', 'Road', 'Bangalore Warehouse', 'Hyderabad', 'TS-01-CD-5678', 1, NOW() - INTERVAL '5 days'),
  (3, 1200000.00, 0.00, 'pending', 'pending', 'INV-2026-003', 'PO-003', '2026-02-28', 'DC-003', 50000.00, 0.00, '45 days', '18 months', 'Rail', 'Bangalore Warehouse', 'Ahmedabad', 'GJ-01-EF-9012', 1, NOW() - INTERVAL '10 days'),
  
  -- SHIPPED ORDERS (In Transit)
  (4, 650000.00, 650000.00, 'paid', 'shipped', 'INV-2026-004', 'PO-004', '2026-02-20', 'DC-004', 0.00, 0.00, 'Payment on Delivery', '12 months', 'Road', 'Bangalore Warehouse', 'Delhi', 'DL-01-GH-3456', 1, NOW() - INTERVAL '15 days'),
  (5, 750000.00, 750000.00, 'paid', 'shipped', 'INV-2026-005', 'PO-005', '2026-02-15', 'DC-005', 25000.00, 0.00, 'Advance', '12 months', 'Air', 'Bangalore Warehouse', 'Mumbai', 'MH-01-IJ-7890', 1, NOW() - INTERVAL '20 days'),
  (1, 900000.00, 900000.00, 'paid', 'shipped', 'INV-2026-006', 'PO-006', '2026-02-10', 'DC-006', 35000.00, 4.17, '7 days', '12 months', 'Road', 'Bangalore Warehouse', 'Bangalore', 'KA-01-KL-1234', 1, NOW() - INTERVAL '25 days'),
  
  -- DELIVERED ORDERS (Completed)
  (2, 500000.00, 500000.00, 'paid', 'delivered', 'INV-2026-007', 'PO-007', '2026-01-30', 'DC-007', 0.00, 0.00, 'Net 30', '12 months', 'Road', 'Bangalore Warehouse', 'Hyderabad', 'TS-01-MN-5678', 1, NOW() - INTERVAL '35 days'),
  (3, 650000.00, 650000.00, 'paid', 'delivered', 'INV-2026-008', 'PO-008', '2026-01-25', 'DC-008', 15000.00, 0.00, 'Advance', '12 months', 'Road', 'Bangalore Warehouse', 'Ahmedabad', 'GJ-01-OP-9012', 1, NOW() - INTERVAL '40 days'),
  (4, 550000.00, 550000.00, 'paid', 'delivered', 'INV-2026-009', 'PO-009', '2026-01-20', 'DC-009', 0.00, 0.00, '15 days', '12 months', 'Road', 'Bangalore Warehouse', 'Delhi', 'DL-01-QR-3456', 1, NOW() - INTERVAL '45 days'),
  (5, 750000.00, 750000.00, 'paid', 'delivered', 'INV-2026-010', 'PO-010', '2026-01-15', 'DC-010', 20000.00, 0.00, 'Advance', '18 months', 'Air', 'Bangalore Warehouse', 'Mumbai', 'MH-01-ST-7890', 1, NOW() - INTERVAL '50 days'),
  (6, 450000.00, 450000.00, 'paid', 'delivered', 'INV-2026-011', 'PO-011', '2026-01-10', 'DC-011', 0.00, 0.00, 'Net 30', '12 months', 'Road', 'Bangalore Warehouse', 'Chennai', 'TN-01-UV-2345', 1, NOW() - INTERVAL '55 days');

-- Link orders to machines via order_items
-- Machine IDs (these should exist in your machines table)
-- We'll use machine IDs 1-10 assuming they exist

-- PENDING ORDERS - Order 1
INSERT INTO order_items (order_id, machine_id, quantity, price)
VALUES (1, 1, 1, 550000.00);

-- PENDING ORDERS - Order 2
INSERT INTO order_items (order_id, machine_id, quantity, price)
VALUES (2, 2, 1, 850000.00);

-- PENDING ORDERS - Order 3
INSERT INTO order_items (order_id, machine_id, quantity, price)
VALUES (3, 3, 2, 600000.00);

-- SHIPPED ORDERS - Order 4
INSERT INTO order_items (order_id, machine_id, quantity, price)
VALUES (4, 4, 1, 650000.00);

-- SHIPPED ORDERS - Order 5
INSERT INTO order_items (order_id, machine_id, quantity, price)
VALUES (5, 5, 1, 750000.00);

-- SHIPPED ORDERS - Order 6
INSERT INTO order_items (order_id, machine_id, quantity, price)
VALUES (6, 6, 1, 900000.00);

-- DELIVERED ORDERS - Order 7
INSERT INTO order_items (order_id, machine_id, quantity, price)
VALUES (7, 7, 1, 500000.00);

-- DELIVERED ORDERS - Order 8
INSERT INTO order_items (order_id, machine_id, quantity, price)
VALUES (8, 8, 1, 650000.00);

-- DELIVERED ORDERS - Order 9
INSERT INTO order_items (order_id, machine_id, quantity, price)
VALUES (9, 9, 1, 550000.00);

-- DELIVERED ORDERS - Order 10
INSERT INTO order_items (order_id, machine_id, quantity, price)
VALUES (10, 10, 1, 750000.00);

-- DELIVERED ORDERS - Order 11
INSERT INTO order_items (order_id, machine_id, quantity, price)
VALUES (11, 1, 1, 450000.00);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify customers inserted
SELECT COUNT(*) as total_customers FROM customers;

-- Verify orders inserted with status distribution
SELECT delivery_status, COUNT(*) as count 
FROM orders 
GROUP BY delivery_status 
ORDER BY delivery_status;

-- Verify payment status distribution
SELECT payment_status, COUNT(*) as count 
FROM orders 
GROUP BY payment_status 
ORDER BY payment_status;

-- Verify order items linked correctly
SELECT 
  o.id as order_id,
  o.invoice_no,
  o.delivery_status,
  oi.machine_id,
  oi.quantity,
  oi.price,
  c.name as customer_name
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN customers c ON o.customer_id = c.id
ORDER BY o.created_at DESC;

-- Check machines that have orders
SELECT 
  m.id,
  m.name,
  COUNT(DISTINCT oi.order_id) as total_orders,
  SUM(oi.quantity) as total_quantity_ordered
FROM machines m
LEFT JOIN order_items oi ON m.id = oi.machine_id
WHERE oi.order_id IS NOT NULL
GROUP BY m.id, m.name
ORDER BY total_orders DESC;
