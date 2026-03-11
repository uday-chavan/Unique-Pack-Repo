-- ========================================
-- Quick Insert: Sample Orders Data (Copy-Paste Ready)
-- ========================================
-- Just run this script to add 6 customers and 11 orders with order items

-- Insert 6 Sample Customers
INSERT INTO customers (name, business_name, phone, email, address, tax_id, gstin) VALUES ('Rajesh Kumar', 'Kumar Industries', '9876543210', 'rajesh@kumarin.com', '123 Industrial Park, Bangalore', '12ABCDE1234F1Z5', '29ABCDE1234F1Z0');
INSERT INTO customers (name, business_name, phone, email, address, tax_id, gstin) VALUES ('Priya Sharma', 'Sharma Manufacturing', '9876543211', 'priya@sharma.com', '456 Tech Zone, Hyderabad', '18DEFGH5678D1Z6', '36DEFGH5678D1Z0');
INSERT INTO customers (name, business_name, phone, email, address, tax_id, gstin) VALUES ('Amit Patel', 'Patel & Co.', '9876543212', 'amit@patel.com', '789 Business Complex, Ahmedabad', '22GHIJK9012E1Z7', '24GHIJK9012E1Z0');
INSERT INTO customers (name, business_name, phone, email, address, tax_id, gstin) VALUES ('Sneha Gupta', 'Gupta Enterprises', '9876543213', 'sneha@gupta.com', '321 Commerce Street, Delhi', '07JKLMN3456F1Z8', '07JKLMN3456F1Z0');
INSERT INTO customers (name, business_name, phone, email, address, tax_id, gstin) VALUES ('Vikram Singh', 'Singh Brothers Ltd', '9876543214', 'vikram@singh.com', '654 Export Zone, Mumbai', '27PQRST7890G1Z9', '27PQRST7890G1Z0');
INSERT INTO customers (name, business_name, phone, email, address, tax_id, gstin) VALUES ('Anita Verma', 'Verma Trading', '9876543215', 'anita@verma.com', '987 Market Road, Chennai', '33UVWXY2345H1Z0', '33UVWXY2345H1Z0');

-- Insert 11 Sample Orders (3 Pending, 3 Shipped, 5 Delivered)
INSERT INTO orders (customer_id, total_amount, amount_paid, payment_status, delivery_status, invoice_no, po_no, po_date, dc_no, discount, discount_percent, payment_terms, warranty_period, mode_of_transport, dispatched_from, place_of_supply, vehicle_no, created_by, created_at) VALUES (1, 550000.00, 0.00, 'pending', 'pending', 'INV-2026-001', 'PO-001', '2026-03-01', 'DC-001', 0.00, 0.00, '30 days', '12 months', 'Road', 'Bangalore Warehouse', 'Bangalore', 'KA-01-AB-1234', 1, NOW());
INSERT INTO orders (customer_id, total_amount, amount_paid, payment_status, delivery_status, invoice_no, po_no, po_date, dc_no, discount, discount_percent, payment_terms, warranty_period, mode_of_transport, dispatched_from, place_of_supply, vehicle_no, created_by, created_at) VALUES (2, 850000.00, 425000.00, 'partial', 'pending', 'INV-2026-002', 'PO-002', '2026-03-02', 'DC-002', 10000.00, 0.00, '15 days', '12 months', 'Road', 'Bangalore Warehouse', 'Hyderabad', 'TS-01-CD-5678', 1, NOW() - INTERVAL '5 days');
INSERT INTO orders (customer_id, total_amount, amount_paid, payment_status, delivery_status, invoice_no, po_no, po_date, dc_no, discount, discount_percent, payment_terms, warranty_period, mode_of_transport, dispatched_from, place_of_supply, vehicle_no, created_by, created_at) VALUES (3, 1200000.00, 0.00, 'pending', 'pending', 'INV-2026-003', 'PO-003', '2026-02-28', 'DC-003', 50000.00, 0.00, '45 days', '18 months', 'Rail', 'Bangalore Warehouse', 'Ahmedabad', 'GJ-01-EF-9012', 1, NOW() - INTERVAL '10 days');
INSERT INTO orders (customer_id, total_amount, amount_paid, payment_status, delivery_status, invoice_no, po_no, po_date, dc_no, discount, discount_percent, payment_terms, warranty_period, mode_of_transport, dispatched_from, place_of_supply, vehicle_no, created_by, created_at) VALUES (4, 650000.00, 650000.00, 'paid', 'shipped', 'INV-2026-004', 'PO-004', '2026-02-20', 'DC-004', 0.00, 0.00, 'Payment on Delivery', '12 months', 'Road', 'Bangalore Warehouse', 'Delhi', 'DL-01-GH-3456', 1, NOW() - INTERVAL '15 days');
INSERT INTO orders (customer_id, total_amount, amount_paid, payment_status, delivery_status, invoice_no, po_no, po_date, dc_no, discount, discount_percent, payment_terms, warranty_period, mode_of_transport, dispatched_from, place_of_supply, vehicle_no, created_by, created_at) VALUES (5, 750000.00, 750000.00, 'paid', 'shipped', 'INV-2026-005', 'PO-005', '2026-02-15', 'DC-005', 25000.00, 0.00, 'Advance', '12 months', 'Air', 'Bangalore Warehouse', 'Mumbai', 'MH-01-IJ-7890', 1, NOW() - INTERVAL '20 days');
INSERT INTO orders (customer_id, total_amount, amount_paid, payment_status, delivery_status, invoice_no, po_no, po_date, dc_no, discount, discount_percent, payment_terms, warranty_period, mode_of_transport, dispatched_from, place_of_supply, vehicle_no, created_by, created_at) VALUES (1, 900000.00, 900000.00, 'paid', 'shipped', 'INV-2026-006', 'PO-006', '2026-02-10', 'DC-006', 35000.00, 4.17, '7 days', '12 months', 'Road', 'Bangalore Warehouse', 'Bangalore', 'KA-01-KL-1234', 1, NOW() - INTERVAL '25 days');
INSERT INTO orders (customer_id, total_amount, amount_paid, payment_status, delivery_status, invoice_no, po_no, po_date, dc_no, discount, discount_percent, payment_terms, warranty_period, mode_of_transport, dispatched_from, place_of_supply, vehicle_no, created_by, created_at) VALUES (2, 500000.00, 500000.00, 'paid', 'delivered', 'INV-2026-007', 'PO-007', '2026-01-30', 'DC-007', 0.00, 0.00, 'Net 30', '12 months', 'Road', 'Bangalore Warehouse', 'Hyderabad', 'TS-01-MN-5678', 1, NOW() - INTERVAL '35 days');
INSERT INTO orders (customer_id, total_amount, amount_paid, payment_status, delivery_status, invoice_no, po_no, po_date, dc_no, discount, discount_percent, payment_terms, warranty_period, mode_of_transport, dispatched_from, place_of_supply, vehicle_no, created_by, created_at) VALUES (3, 650000.00, 650000.00, 'paid', 'delivered', 'INV-2026-008', 'PO-008', '2026-01-25', 'DC-008', 15000.00, 0.00, 'Advance', '12 months', 'Road', 'Bangalore Warehouse', 'Ahmedabad', 'GJ-01-OP-9012', 1, NOW() - INTERVAL '40 days');
INSERT INTO orders (customer_id, total_amount, amount_paid, payment_status, delivery_status, invoice_no, po_no, po_date, dc_no, discount, discount_percent, payment_terms, warranty_period, mode_of_transport, dispatched_from, place_of_supply, vehicle_no, created_by, created_at) VALUES (4, 550000.00, 550000.00, 'paid', 'delivered', 'INV-2026-009', 'PO-009', '2026-01-20', 'DC-009', 0.00, 0.00, '15 days', '12 months', 'Road', 'Bangalore Warehouse', 'Delhi', 'DL-01-QR-3456', 1, NOW() - INTERVAL '45 days');
INSERT INTO orders (customer_id, total_amount, amount_paid, payment_status, delivery_status, invoice_no, po_no, po_date, dc_no, discount, discount_percent, payment_terms, warranty_period, mode_of_transport, dispatched_from, place_of_supply, vehicle_no, created_by, created_at) VALUES (5, 750000.00, 750000.00, 'paid', 'delivered', 'INV-2026-010', 'PO-010', '2026-01-15', 'DC-010', 20000.00, 0.00, 'Advance', '18 months', 'Air', 'Bangalore Warehouse', 'Mumbai', 'MH-01-ST-7890', 1, NOW() - INTERVAL '50 days');
INSERT INTO orders (customer_id, total_amount, amount_paid, payment_status, delivery_status, invoice_no, po_no, po_date, dc_no, discount, discount_percent, payment_terms, warranty_period, mode_of_transport, dispatched_from, place_of_supply, vehicle_no, created_by, created_at) VALUES (6, 450000.00, 450000.00, 'paid', 'delivered', 'INV-2026-011', 'PO-011', '2026-01-10', 'DC-011', 0.00, 0.00, 'Net 30', '12 months', 'Road', 'Bangalore Warehouse', 'Chennai', 'TN-01-UV-2345', 1, NOW() - INTERVAL '55 days');

-- Insert Order Items (linking orders to machines)
INSERT INTO order_items (order_id, machine_id, quantity, price) VALUES (1, 1, 1, 550000.00);
INSERT INTO order_items (order_id, machine_id, quantity, price) VALUES (2, 2, 1, 850000.00);
INSERT INTO order_items (order_id, machine_id, quantity, price) VALUES (3, 3, 2, 600000.00);
INSERT INTO order_items (order_id, machine_id, quantity, price) VALUES (4, 4, 1, 650000.00);
INSERT INTO order_items (order_id, machine_id, quantity, price) VALUES (5, 5, 1, 750000.00);
INSERT INTO order_items (order_id, machine_id, quantity, price) VALUES (6, 6, 1, 900000.00);
INSERT INTO order_items (order_id, machine_id, quantity, price) VALUES (7, 7, 1, 500000.00);
INSERT INTO order_items (order_id, machine_id, quantity, price) VALUES (8, 8, 1, 650000.00);
INSERT INTO order_items (order_id, machine_id, quantity, price) VALUES (9, 9, 1, 550000.00);
INSERT INTO order_items (order_id, machine_id, quantity, price) VALUES (10, 10, 1, 750000.00);
INSERT INTO order_items (order_id, machine_id, quantity, price) VALUES (11, 1, 1, 450000.00);

-- ========================================
-- VERIFICATION: Check all data
-- ========================================
SELECT 'Customers' as entity, COUNT(*) as total FROM customers
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items;

-- View orders by status
SELECT 
  CONCAT(delivery_status, ' - ', payment_status) as status, 
  COUNT(*) as count 
FROM orders 
GROUP BY delivery_status, payment_status;
