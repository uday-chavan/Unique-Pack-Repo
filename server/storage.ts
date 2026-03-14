import { db } from "./db";
import { 
  users, machines, suppliers, customers, orders, orderItems, transactions, purchases,
  type User, type InsertUser, type Machine, type InsertMachine,
  type Supplier, type InsertSupplier, type Customer, type InsertCustomer,
  type Order, type InsertOrder, type InsertOrderItem,
  type Transaction, type InsertTransaction
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Machines
  getMachines(): Promise<Machine[]>;
  getMachine(id: number): Promise<Machine | undefined>;
  createMachine(machine: InsertMachine): Promise<Machine>;
  updateMachine(id: number, machine: Partial<InsertMachine>): Promise<Machine>;
  deleteMachine(id: number): Promise<void>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, updates: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: number): Promise<void>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Orders
  getOrders(): Promise<any[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderPayment(id: number, amountPaid: string, paymentStatus: string): Promise<Order>;
  updateOrderDeliveryStatus(id: number, deliveryStatus: string): Promise<Order>;
  updateOrderDetails(id: number, details: any): Promise<Order>;
  deleteOrder(id: number): Promise<void>;
  
  // Stats
  getDashboardStats(): Promise<any>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getMachines(): Promise<Machine[]> {
    return await db.select().from(machines).orderBy(desc(machines.createdAt));
  }

  async getMachine(id: number): Promise<Machine | undefined> {
    const [machine] = await db.select().from(machines).where(eq(machines.id, id));
    return machine;
  }

  async createMachine(machine: InsertMachine): Promise<Machine> {
    const [newMachine] = await db.insert(machines).values(machine).returning();
    return newMachine;
  }

  async updateMachine(id: number, updates: Partial<InsertMachine>): Promise<Machine> {
    const [updated] = await db.update(machines).set(updates).where(eq(machines.id, id)).returning();
    return updated;
  }

  async deleteMachine(id: number): Promise<void> {
    await db.delete(machines).where(eq(machines.id, id));
  }

  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(desc(suppliers.id));
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: number, updates: Partial<InsertSupplier>): Promise<Supplier> {
    const [updated] = await db
      .update(suppliers)
      .set(updates)
      .where(eq(suppliers.id, id))
      .returning();
    return updated;
  }

  async deleteSupplier(id: number): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.id));
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer> {
    const [updated] = await db
      .update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  async getOrders(): Promise<any[]> {
    return await db.query.orders.findMany({
      with: {
        customer: true,
        items: {
          with: {
            machine: true
          }
        },
        creator: true
      },
      orderBy: desc(orders.createdAt)
    });
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      // 1. Create Order
      const [newOrder] = await tx.insert(orders).values(order).returning();
      
      // 2. Create Items & Update Stock
      for (const item of items) {
        await tx.insert(orderItems).values({ ...item, orderId: newOrder.id });
        
        // Decrement stock
        await tx.execute(sql`
          UPDATE machines 
          SET quantity = quantity - ${item.quantity} 
          WHERE id = ${item.machineId}
        `);
      }
      
      // 3. Create Transaction Record
      await tx.insert(transactions).values({
        type: 'sale',
        referenceId: newOrder.id,
        amount: order.totalAmount,
        staffId: order.createdBy,
        notes: `Order #${newOrder.id} created`
      });

      return newOrder;
    });
  }

  async updateOrderPayment(id: number, amountPaid: string, paymentStatus: string): Promise<Order> {
    const [updated] = await db.update(orders)
      .set({ amountPaid, paymentStatus })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async updateOrderDeliveryStatus(id: number, deliveryStatus: string): Promise<Order> {
    const [updated] = await db.update(orders)
      .set({ deliveryStatus })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async updateOrderDetails(id: number, details: any): Promise<Order> {
    const allowedFields = [
      'invoiceNo', 'poNo', 'poDate', 'dcNo', 'discount', 'discountPercent',
      'bankName', 'bankBranch', 'accountNo', 'ifscCode', 'paymentTerms',
      'warrantyPeriod', 'eWayBillNo', 'modeOfTransport', 'dispatchedFrom',
      'placeOfSupply', 'paymentStatus', 'deliveryStatus', 'amountPaid',
      'vehicleNo', 'transporterGstin', 'transportMode', 'hsnCode',
      'placeOfDispatch', 'documentNo', 'transactionType', 'transportationReason',
      'fromLocation', 'enteredBy', 'toLocation',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in details) {
        updateData[field] = (details[field] === '' || details[field] === null) ? null : details[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      const [existing] = await db.select().from(orders).where(eq(orders.id, id));
      return existing;
    }

    const [updated] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    return updated;
  }

  async deleteOrder(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(orderItems).where(eq(orderItems.orderId, id));
      await tx.delete(transactions).where(eq(transactions.referenceId, id));
      await tx.delete(orders).where(eq(orders.id, id));
    });
  }

  async getDashboardStats(): Promise<any> {
    const [sales] = await db.select({ 
      total: sql<number>`sum(${orders.totalAmount})`,
      count: sql<number>`count(*)`
    }).from(orders);

    const [lowStock] = await db.select({
      count: sql<number>`count(*)`
    }).from(machines).where(sql`quantity < 5`);

    const monthlyRevenue = await db.select({
      month: sql<string>`to_char(${orders.createdAt}, 'Mon')`,
      revenue: sql<number>`sum(${orders.totalAmount})`,
      orderCount: sql<number>`count(*)`
    })
    .from(orders)
    .where(sql`${orders.createdAt} >= now() - interval '6 months'`)
    .groupBy(sql`to_char(${orders.createdAt}, 'Mon')`, sql`extract(month from ${orders.createdAt})`)
    .orderBy(sql`extract(month from ${orders.createdAt})`);

    const topSelling = await db.select({
      id: machines.id,
      name: machines.name,
      imageUrl: machines.imageUrl,
      count: sql<number>`sum(${orderItems.quantity})`
    })
    .from(orderItems)
    .innerJoin(machines, eq(orderItems.machineId, machines.id))
    .groupBy(machines.id, machines.name, machines.imageUrl)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(5);

    return {
      totalSales: Number(sales?.total || 0),
      totalOrders: Number(sales?.count || 0),
      lowStockCount: Number(lowStock?.count || 0),
      topSelling,
      monthlyRevenue: monthlyRevenue.map(m => ({
        month: m.month,
        revenue: Number(m.revenue || 0)
      }))
    };
  }
}

export const storage = new DatabaseStorage();