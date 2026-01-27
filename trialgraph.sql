-- First, insert the customer
INSERT INTO "customers" ("id", "name", "email", "phone", "address")
VALUES (43, 'Customer Name', 'email@example.com', '1234567890', 'Customer Address');

-- Then insert the order
INSERT INTO "orders" (
  "id",
  "customer_id",
  "total_amount",
  "amount_paid",
  "payment_status",
  "delivery_status",
  "created_by",
  "created_at"
) OVERRIDING SYSTEM VALUE
VALUES (
  34,
  43,
  544344,
  435567,
  'paid',
  'delivered',  -- Fixed typo: 'delevered' → 'delivered'
  3,
  '2025-12-16 04:00:03'
);