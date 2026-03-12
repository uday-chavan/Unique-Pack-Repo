import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useCustomers } from "@/hooks/use-crm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CustomerForm } from "@/components/forms/CustomerForm";
import { CustomerEditForm } from "@/components/forms/CustomerEditForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Mail, Phone, Building, Plus, Trash2, Pencil } from "lucide-react";
import { type InsertCustomer, type Customer } from "@shared/schema";
import { motion } from "framer-motion";

/* ---------- Floating Orb ---------- */

function FloatingOrb({ x, y, size, color, duration }: {
  x: string; y: string; size: number; color: string; duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: color,
        filter: "blur(60px)",
        opacity: 0.12,
      }}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -25, 15, -10, 0],
        scale: [1, 1.12, 0.95, 1.05, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function Customers() {
  const { customers, isLoading, createCustomer, deleteCustomer } = useCustomers();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...data }: InsertCustomer & { id: number }) => {
      const res = await apiRequest("PATCH", `/api/customers/${id}`, data);
      return res.json();
    },
    onSuccess: async (updatedCustomer: Customer) => {
      // 1. Directly update the cache so UI reflects change immediately
      queryClient.setQueriesData(
        { predicate: (query) => String(query.queryKey[0]).includes("/api/customers") },
        (old: Customer[] | undefined) =>
          old ? old.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)) : old
      );
      // 2. Also invalidate so next background fetch stays fresh
      await queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
  });

  const handleCreate = async (data: InsertCustomer) => {
    await createCustomer.mutateAsync(data);
    setIsCreateOpen(false);
  };

  const handleEdit = async (data: InsertCustomer) => {
    if (!editingCustomer) return;
    try {
      await updateCustomer.mutateAsync({ id: editingCustomer.id, ...data });
      setEditingCustomer(null);
    } catch (err) {
      console.error("Failed to update customer:", err);
    }
  };

  return (
    <Shell>
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingOrb x="80%" y="15%" size={380} color="#1e40af" duration={17} />
        <FloatingOrb x="10%" y="50%" size={320} color="#1e3a5f" duration={20} />
      </div>

      <motion.div
        className="relative z-10 -mt-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
          }}
        >
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Customers</h2>
          <p className="text-muted-foreground mt-1">Directory of client relationships.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/10"
              data-testid="button-add-customer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter the customer's contact and business details.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              onSubmit={handleCreate}
              isLoading={createCustomer.isPending}
              allCustomers={customers}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      {isLoading ? (
        <motion.div
          className="grid gap-6 md:grid-cols-3 mb-8"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
          }}
        >
          {[...Array(3)].map((_, idx) => (
            <Card
              key={`skeleton-card-${idx}`}
              className="border-t-4 border-t-blue-500 shadow-sm animate-pulse"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="grid gap-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      ) : customers.length > 0 && (
        <motion.div
          className="grid gap-6 md:grid-cols-3 mb-8"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
          }}
        >
          {customers.slice(0, 3).map((customer) => (
            <Card key={customer.id} className="border-t-4 border-t-blue-500 shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12 bg-blue-100 text-blue-700">
                  <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <CardTitle className="text-base">{customer.name}</CardTitle>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Building className="w-3 h-3 mr-1" />
                    {customer.businessName || "Individual"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 mr-2" /> {customer.email || "No email"}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-2" /> {customer.phone || "No phone"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      <CustomerEditForm
        customer={editingCustomer}
        allCustomers={customers}
        open={!!editingCustomer}
        onOpenChange={(open) => { if (!open) setEditingCustomer(null); }}
        onSubmit={handleEdit}
        isLoading={updateCustomer.isPending}
      />

      <motion.div
        className="rounded-xl border bg-card shadow-sm overflow-hidden"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        }}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b-slate-200">
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {[...Array(5)].map((_, idx) => (
                  <TableRow key={`skeleton-${idx}`} className="border-b border-slate-200">
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-44" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="w-8 h-8 mb-2 opacity-20" />
                    <p>No customers yet. Add your first customer!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="transition-transform duration-300 group-hover:translate-x-1">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.businessName}</div>
                  </TableCell>
                  <TableCell className="transition-transform duration-300 group-hover:translate-x-1">
                    <div className="text-sm">{c.email}</div>
                    <div className="text-xs text-muted-foreground">{c.phone}</div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 max-w-[200px] truncate transition-transform duration-300 group-hover:translate-x-1">
                    {c.address}
                  </TableCell>
                  <TableCell className="font-mono text-xs transition-transform duration-300 group-hover:translate-x-1">{c.gstin || c.taxId || "N/A"}</TableCell>
                  <TableCell className="transition-transform duration-300 group-hover:translate-x-1">
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="transition-transform duration-300 group-hover:translate-x-1">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => setEditingCustomer(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Customer</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {c.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => deleteCustomer.mutate(c.id)}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
      </motion.div>
    </Shell>
  );
}