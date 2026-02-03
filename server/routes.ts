import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "public", "products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication
  setupAuth(app);

  // Image Upload Endpoint
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `/products/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // === Machines ===
  app.get(api.machines.list.path, async (req, res) => {
    // if (!req.isAuthenticated()) return res.sendStatus(401);
    const machines = await storage.getMachines();
    res.json(machines);
  });

  app.get(api.machines.get.path, async (req, res) => {
    const machine = await storage.getMachine(Number(req.params.id));
    if (!machine) return res.status(404).json({ message: "Machine not found" });
    res.json(machine);
  });

  app.post(api.machines.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.machines.create.input.parse(req.body);
      const machine = await storage.createMachine(input);
      res.status(201).json(machine);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        throw err;
      }
    }
  });

  app.patch(api.machines.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const machine = await storage.updateMachine(Number(req.params.id), req.body);
    res.json(machine);
  });

  app.delete(api.machines.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteMachine(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Suppliers ===
  app.get(api.suppliers.list.path, async (req, res) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });

  app.post(api.suppliers.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const supplier = await storage.createSupplier(req.body);
    res.status(201).json(supplier);
  });

  app.delete(api.suppliers.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteSupplier(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Customers ===
  app.get(api.customers.list.path, async (req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.post(api.customers.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const customer = await storage.createCustomer(req.body);
    res.status(201).json(customer);
  });

  app.delete(api.customers.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteCustomer(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Orders ===
  app.get(api.orders.list.path, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { customerId, items, poNo, poDate } = req.body;
    
    // Calculate total
    let total = 0;
    const orderItemsWithPrices = [];
    
    for (const item of items) {
      const machine = await storage.getMachine(item.machineId);
      if (!machine) return res.status(400).json({ message: `Machine ${item.machineId} not found` });
      if (machine.quantity < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${machine.name}` });
      
      const price = Number(machine.sellingPrice);
      total += price * item.quantity;
      orderItemsWithPrices.push({ ...item, price });
    }

    const order = await storage.createOrder({
      customerId,
      totalAmount: total.toString(),
      paymentStatus: 'pending',
      deliveryStatus: 'pending',
      poNo,
      poDate: poDate ? new Date(poDate) : null,
      createdBy: req.user!.id
    }, orderItemsWithPrices);

    res.status(201).json(order);
  });

  // Update order payment
  app.patch("/api/orders/:id/payment", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { amountPaid } = req.body;
    const orderId = Number(req.params.id);
    
    // Get the order to check total
    const allOrders = await storage.getOrders();
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    const total = Number(order.totalAmount);
    const paid = Number(amountPaid);
    
    let paymentStatus = 'pending';
    if (paid >= total) {
      paymentStatus = 'paid';
    } else if (paid > 0) {
      paymentStatus = 'partial';
    }
    
    const updated = await storage.updateOrderPayment(orderId, amountPaid, paymentStatus);
    res.json(updated);
  });

  // Update order delivery status
  app.patch("/api/orders/:id/delivery", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { deliveryStatus } = req.body;
    const orderId = Number(req.params.id);
    
    const updated = await storage.updateOrderDeliveryStatus(orderId, deliveryStatus);
    res.json(updated);
  });

  // Delete order
  app.delete(api.orders.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteOrder(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Stats ===
  app.get(api.stats.get.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Seed Data
  await seed();

  return httpServer;
}

async function seed() {
  const existingUsers = await storage.getUserByUsername("admin");
  if (!existingUsers) {
    const password = await hashPassword("admin123");
    await storage.createUser({
      name: "Admin User",
      username: "admin",
      password,
      role: "admin"
    });

    // Import products from CSV data
    const products = [
      { name: "Uniq Pack", price: 600000, image: "product_1_uniq-pack.jpg" },
      { name: "Biscuit Packaging Machine", price: 600000, image: "product_2_hotel-pack-high-speed-biscuit-packaging-machine.jpg" },
      { name: "6000 To 9000 Piece/Hour One Edge Biscuit Packaging Machine", price: 600000, image: "product_3_prod-20200726-0512211681997108-jpg.jpg" },
      { name: "4000 To 6000 Piece/Hour Automatic Rusk Packaging Machine", price: 650000, image: "product_5_prod-20200505-0907491227268149-jpg.jpg" },
      { name: "4000 To 6000 Pouch/Hour Automatic Soap Packaging Machine", price: 400000, image: "product_5_prod-20200505-0907491227268149-jpg.jpg" },
      { name: "4000 To 6000Piece/Hour 4 Servo Cookies Packaging Machine", price: 650000, image: "product_6_product-jpeg.jpg" },
      { name: "1000 Piece/Hour PLC Model Bread Packing Machine", price: 850000, image: "product_7_product-jpeg.jpg" },
      { name: "3000 Pouch/Hour Incense Stick Packaging Machine", price: 500000, image: "product_8_3000-pouch-hour-incense-stick-packaging-machine.jpeg" },
      { name: "8000 Piece/Hour Automatic Napkin Packaging Machine", price: 650000, image: "product_9_diaper-packaging-machine.png" },
      { name: "3000 To 6000 Piece/Hour Automatic Family Pack Biscuit Packaging Machines", price: 550000, image: "product_10_2000-piece-hour-automatic-family-pack-biscuit-packaging-machines.jpg" },
      { name: "5000 Piece/Hour Automatic Family Pack Biscuit Wrapping Machine", price: 6250000, image: "product_11_product-jpeg.jpg" },
      { name: "1500 Piece/Hour Cream Biscuit Packaging Machine", price: 700000, image: "product_12_cream-biscuit-packaging-machine.jpg" },
      { name: "5000 Piece/Hour Ice Cream Packaging Machine", price: 450000, image: "product_13_product-jpeg.jpg" },
      { name: "8000 Piece/Hour PLC Model Bun Paw Packaging Machine", price: 500000, image: "product_14_product.jpeg" },
      { name: "5000 To 6000 Piece/Hour Automatic Noodles Packaging Machine", price: 550000, image: "product_15_product-jpeg.jpg" },
      { name: "4000 pouch per hour Automatic Cream Roll Packaging Machine", price: 450000, image: "product_16_4000-pouch-per-hour-automatic-cream-roll-packaging-machine.jpg" },
      { name: "4000 To 6000 Piece/Hour Family Pack Rusk Packaging Machine", price: 550000, image: "product_18_3000-piece-hour-family-pack-rusk-packaging-machine.jpg" },
      { name: "4000 to 6000 Piece/Hour Automatic Napkin Packaging Machine", price: 550000, image: "product_19_automatic-napkins-packing-machine.jpeg" },
      { name: "7000 Piece/Hour Automatic Napkin Packing Machine", price: 550000, image: "product_20_automatic-baby-diapers-packing-machine.jpeg" },
      { name: "2000 Pouch Per Hour PLC Model Automatically Pouch Packaging Machine", price: 850000, image: "product_21_product-jpeg.jpg" },
      { name: "Vegetable Packing Machine", price: 550000, image: "product_22_product-jpeg.jpg" },
    ];

    for (const product of products) {
      await storage.createMachine({
        name: product.name,
        category: "Packaging Machine",
        brand: "Unique Pack",
        purchasePrice: String(Math.floor(product.price * 0.7)),
        sellingPrice: String(product.price),
        quantity: 5,
        location: "Warehouse",
        condition: "new",
        imageUrl: `/products/${product.image}`
      });
    }
  }
}
