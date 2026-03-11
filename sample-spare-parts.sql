-- Sample Spare Parts Data for Inventory
-- This includes items with various stock levels for the pie chart

-- IN STOCK (quantity > 5)
INSERT INTO machines (name, category, brand, model, purchase_price, selling_price, quantity, location, condition, hsn_code)
VALUES
  ('Ball Bearing 6205', 'spare part', 'SKF', '6205-2Z', '150.00', '250.00', 45, 'Warehouse A - Shelf 1', 'new', '8482.10.10.20'),
  ('Drive Belt', 'spare part', 'Dunlop', 'X-Series', '200.00', '350.00', 32, 'Warehouse A - Shelf 2', 'new', '4010.12.00.00'),
  ('Motor Coupling', 'spare part', 'Lovejoy', 'L-075', '300.00', '500.00', 28, 'Warehouse B - Section A', 'new', '8483.20.40.00'),
  ('Roller Chain', 'spare part', 'Renold', '#40', '120.00', '200.00', 56, 'Warehouse A - Shelf 3', 'new', '7318.15.10.00'),
  ('Gear Set', 'spare parts', 'Flender', 'MV-60', '450.00', '800.00', 15, 'Warehouse B - Shelf 1', 'new', '8483.40.60.00'),
  ('Oil Seal Kit', 'spare part', 'Freudenberg', 'Standard', '80.00', '150.00', 72, 'Warehouse A - Cabinet 1', 'new', '4016.99.90.00'),
  ('Bearing Bracket', 'spare parts', 'Viking', 'UCP-208', '250.00', '450.00', 22, 'Warehouse B - Shelf 2', 'new', '7326.90.10.00'),
  ('Shaft Coupling', 'spare part', 'Rexnord', 'Style RC', '180.00', '320.00', 38, 'Warehouse A - Shelf 1', 'used', '8483.20.40.00'),
  ('Pulley 75mm', 'spare part', 'Martin', 'PS', '95.00', '180.00', 64, 'Warehouse C - Shelf 1', 'new', '8483.50.10.00'),
  ('Thrust Washer', 'spare parts', 'INA', '', '25.00', '50.00', 120, 'Warehouse A - Cabinet 2', 'new', '7318.16.10.00');

-- LOW STOCK (1 <= quantity <= 5)
INSERT INTO machines (name, category, brand, model, purchase_price, selling_price, quantity, location, condition, hsn_code)
VALUES
  ('Precision Shaft', 'spare part', 'Timken', 'PS-260', '1200.00', '2000.00', 3, 'Warehouse B - Shelf 3', 'new', '7320.20.80.00'),
  ('Gearbox Seal', 'spare parts', 'Corteco', 'HQ820', '165.00', '300.00', 2, 'Warehouse C - Cabinet 1', 'new', '4016.99.90.00'),
  ('Spring Assembly', 'spare part', 'Lesjöfors', 'Compression', '140.00', '250.00', 5, 'Warehouse A - Shelf 4', 'new', '7320.90.20.00'),
  ('Motor Brush Set', 'spare parts', 'Mersen', 'Carbon', '220.00', '400.00', 4, 'Warehouse B - Cabinet 2', 'new', '8504.40.20.00'),
  ('Filter Element', 'spare part', 'Hydac', 'FES-160', '320.00', '550.00', 1, 'Warehouse C - Shelf 2', 'new', '8421.21.10.00');

-- OUT OF STOCK (quantity = 0)
INSERT INTO machines (name, category, brand, model, purchase_price, selling_price, quantity, location, condition, hsn_code)
VALUES
  ('Hydraulic Pump', 'spare parts', 'Bosch Rexroth', 'A2FO', '2500.00', '4200.00', 0, 'Warehouse B - Shelf 4', 'new', '8412.10.10.00'),
  ('Solenoid Valve', 'spare part', 'Moog', 'D956-2025', '450.00', '750.00', 0, 'Warehouse D - Cabinet 1', 'new', '9030.82.00.00'),
  ('Contactor Coil', 'spare parts', 'ABB', 'ZA95', '180.00', '320.00', 0, 'Warehouse C - Shelf 3', 'new', '8534.30.20.00'),
  ('Circuit Breaker', 'spare part', 'Siemens', '3SL1', '280.00', '500.00', 0, 'Warehouse D - Shelf 1', 'refurbished', '8536.50.20.00');

-- Additional IN STOCK items for better distribution
INSERT INTO machines (name, category, brand, model, purchase_price, selling_price, quantity, location, condition, hsn_code)
VALUES
  ('V-Belt A-Section', 'spare part', 'Bando', 'A-3600', '75.00', '140.00', 85, 'Warehouse A - Shelf 5', 'new', '4010.12.00.00'),
  ('Grease Cartridge', 'spare parts', 'Shell', 'Gadus S2', '65.00', '120.00', 150, 'Warehouse A - Cabinet 3', 'new', '2710.19.99.00'),
  ('Power Cord 10A', 'spare part', 'Crompton', 'Industrial', '110.00', '200.00', 42, 'Warehouse C - Cabinet 2', 'new', '8537.10.30.00'),
  ('Connector Box', 'spare parts', 'Legrand', 'Plexo', '95.00', '170.00', 68, 'Warehouse B - Shelf 2', 'new', '6917.80.00.00'),
  ('Thermostat Switch', 'spare part', 'Honeywell', 'T87-series', '135.00', '250.00', 19, 'Warehouse D - Shelf 2', 'new', '9032.89.10.00');

-- Verify the data
SELECT 
  category, 
  COUNT(*) as item_count,
  SUM(quantity) as total_quantity,
  AVG(quantity) as avg_quantity
FROM machines 
WHERE LOWER(category) LIKE '%spare%' OR LOWER(category) LIKE '%part%'
GROUP BY category
ORDER BY item_count DESC;

-- Show all inserted spare parts
SELECT 
  id,
  name,
  category,
  brand,
  quantity,
  selling_price,
  location,
  condition
FROM machines 
WHERE LOWER(category) LIKE '%spare%' OR LOWER(category) LIKE '%part%'
ORDER BY category, quantity DESC;
