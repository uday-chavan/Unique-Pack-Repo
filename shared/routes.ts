import { z } from 'zod';
import { 
  insertUserSchema, insertMachineSchema, insertSupplierSchema, insertCustomerSchema, 
  insertOrderSchema, insertOrderItemSchema, insertTransactionSchema,
  users, machines, suppliers, customers, orders, transactions
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.object({ message: z.string() }),
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.void(),
      }
    }
  },
  machines: {
    list: {
      method: 'GET' as const,
      path: '/api/machines',
      responses: {
        200: z.array(z.custom<typeof machines.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/machines',
      input: insertMachineSchema,
      responses: {
        201: z.custom<typeof machines.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/machines/:id',
      responses: {
        200: z.custom<typeof machines.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/machines/:id',
      input: insertMachineSchema.partial(),
      responses: {
        200: z.custom<typeof machines.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/machines/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  suppliers: {
    list: {
      method: 'GET' as const,
      path: '/api/suppliers',
      responses: {
        200: z.array(z.custom<typeof suppliers.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/suppliers',
      input: insertSupplierSchema,
      responses: {
        201: z.custom<typeof suppliers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/suppliers/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  customers: {
    list: {
      method: 'GET' as const,
      path: '/api/customers',
      responses: {
        200: z.array(z.custom<typeof customers.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/customers',
      input: insertCustomerSchema,
      responses: {
        201: z.custom<typeof customers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/customers/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.any()), // Complex relation type, using any for simplicity in routes definition
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: z.object({
        customerId: z.number(),
        items: z.array(z.object({
          machineId: z.number(),
          quantity: z.number(),
        })),
      }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/orders/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.object({
          totalSales: z.number(),
          totalOrders: z.number(),
          lowStockCount: z.number(),
          topSelling: z.array(z.object({ name: z.string(), imageUrl: z.string().nullable(), count: z.union([z.number(), z.string()]) })),
          monthlyRevenue: z.array(z.object({ month: z.string(), revenue: z.number() })),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
