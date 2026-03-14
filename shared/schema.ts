import { pgTable, text, serial, integer, boolean, timestamp, numeric, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(), // Used for login
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"), // owner, admin, sales, inventory, accountant
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  gstin: text("gstin"), // Added for e-Way bill
  state: text("state"), // Added for e-Way bill
  city: text("city"), // Added for e-Way bill
  active: boolean("active").default(true),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  businessName: text("business_name"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  taxId: text("tax_id"),
  gstin: text("gstin"), // Added for invoice
  createdAt: timestamp("created_at").defaultNow(),
});

export const machines = pgTable("machines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // Lathe, Drill, CNC, etc.
  brand: text("brand"),
  model: text("model"),
  hsnCode: text("hsn_code"), // Added for invoice
  serialNumber: text("serial_number"),
  purchasePrice: decimal("purchase_price").notNull(),
  sellingPrice: decimal("selling_price").notNull(),
  quantity: integer("quantity").notNull().default(0),
  location: text("location"), // Warehouse A, Shelf B
  supplierId: integer("supplier_id").references(() => suppliers.id),
  warrantyMonths: integer("warranty_months"),
  condition: text("condition").default("new"), // New, Used, Refurbished
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  totalAmount: decimal("total_amount").notNull(),
  amountPaid: decimal("amount_paid").default("0"),
  paymentStatus: text("payment_status").default("pending"), // pending, paid, partial
  deliveryStatus: text("delivery_status").default("pending"), // pending, shipped, delivered
  invoiceNo: text("invoice_no"),
  poNo: text("po_no"),
  poDate: timestamp("po_date"),
  dcNo: text("dc_no"), // Delivery Challan Number
  discount: decimal("discount").default("0"),
  discountPercent: decimal("discount_percent").default("0"),
  bankName: text("bank_name"),
  bankBranch: text("bank_branch"),
  accountNo: text("account_no"),
  ifscCode: text("ifsc_code"),
  paymentTerms: text("payment_terms"),
  warrantyPeriod: text("warranty_period"),
  eWayBillNo: text("eway_bill_no"),
  modeOfTransport: text("mode_of_transport"),
  dispatchedFrom: text("dispatched_from"),
  placeOfSupply: text("place_of_supply"),
  // E-Way Bill Fields
  vehicleNo: text("vehicle_no"),
  transporterGstin: text("transporter_gstin"),
  transportMode: text("transport_mode"),
  hsnCode: text("hsn_code"),
  placeOfDispatch: text("place_of_dispatch"),
  documentNo: text("document_no"),
  transactionType: text("transaction_type"),
  transportationReason: text("transportation_reason"),
  fromLocation: text("from_location"),
  enteredBy: text("entered_by"),
  toLocation: text("to_location"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  machineId: integer("machine_id").references(() => machines.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price").notNull(), // Price at time of sale
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // sale, purchase, refund, adjustment
  referenceId: integer("reference_id"), // Order ID or Purchase ID
  amount: decimal("amount").notNull(),
  paymentMethod: text("payment_method"),
  staffId: integer("staff_id").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  totalCost: decimal("total_cost").notNull(),
  status: text("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const machinesRelations = relations(machines, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [machines.supplierId],
    references: [suppliers.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
  creator: one(users, {
    fields: [orders.createdBy],
    references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  machine: one(machines, {
    fields: [orderItems.machineId],
    references: [machines.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  staff: one(users, {
    fields: [transactions.staffId],
    references: [users.id],
  }),
}));

// === INSERTS & TYPES ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertMachineSchema = createInsertSchema(machines).omit({ id: true, createdAt: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true }).extend({
  gstin: z.string().nullable().optional(),
});
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true }).extend({
  gstin: z.string().nullable().optional(),
});
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertPurchaseSchema = createInsertSchema(purchases).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type Machine = typeof machines.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMachine = z.infer<typeof insertMachineSchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
