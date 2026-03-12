import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useSuppliers } from "@/hooks/use-crm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { SupplierForm } from "@/components/forms/SupplierForm";
import { SupplierEditForm } from "@/components/forms/SupplierEditForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, Plus, Trash2, Pencil } from "lucide-react";
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
import { type InsertSupplier, type Supplier } from "@shared/schema";
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

export default function Suppliers() {
  const { suppliers, isLoading, createSupplier, deleteSupplier } = useSuppliers();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...data }: InsertSupplier & { id: number }) => {
      const res = await apiRequest("PATCH", `/api/suppliers/${id}`, data);
      return res.json();
    },
    onSuccess: async (updatedSupplier: Supplier) => {
      queryClient.setQueriesData(
        { predicate: (query) => String(query.queryKey[0]).includes("/api/suppliers") },
        (old: Supplier[] | undefined) =>
          old ? old.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s)) : old
      );
      await queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
    },
  });

  const handleCreate = async (data: InsertSupplier) => {
    await createSupplier.mutateAsync(data);
    setIsCreateOpen(false);
  };

  const handleEdit = async (data: InsertSupplier) => {
    if (!editingSupplier) return;
    try {
      await updateSupplier.mutateAsync({ id: editingSupplier.id, ...data });
      setEditingSupplier(null);
    } catch (err) {
      console.error("Failed to update supplier:", err);
    }
  };

  return (
    <Shell>
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingOrb x="15%" y="45%" size={350} color="#1e40af" duration={19} />
        <FloatingOrb x="70%" y="20%" size={280} color="#0f4c75" duration={21} />
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Suppliers</h2>
          <p className="text-muted-foreground mt-1">Manage vendor relationships and contacts.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/10" data-testid="button-add-supplier">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Enter the supplier's contact and business details.
              </DialogDescription>
            </DialogHeader>
            <SupplierForm onSubmit={handleCreate} isLoading={createSupplier.isPending} />
          </DialogContent>
        </Dialog>
      </motion.div>

      <SupplierEditForm
        supplier={editingSupplier}
        open={!!editingSupplier}
        onOpenChange={(open) => { if (!open) setEditingSupplier(null); }}
        onSubmit={handleEdit}
        isLoading={updateSupplier.isPending}
      />

      <motion.div
        className="rounded-xl border bg-card shadow-sm overflow-hidden mt-8"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        }}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b-slate-200">
              <TableHead>Supplier Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Contact Details</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {[...Array(5)].map((_, idx) => (
                  <TableRow key={`skeleton-${idx}`} className="border-b border-slate-200">
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-40" />
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
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Truck className="w-8 h-8 mb-2 opacity-20" />
                    <p>No suppliers yet. Add your first supplier!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : suppliers.map((s) => (
              <TableRow key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-medium text-slate-900 transition-transform duration-300 group-hover:translate-x-1">{s.name}</TableCell>
                <TableCell className="transition-transform duration-300 group-hover:translate-x-1">{s.contactPerson}</TableCell>
                <TableCell className="transition-transform duration-300 group-hover:translate-x-1">
                  <div className="text-sm">{s.email}</div>
                  <div className="text-xs text-muted-foreground">{s.phone}</div>
                </TableCell>
                <TableCell className="text-sm text-slate-600 max-w-[250px] truncate transition-transform duration-300 group-hover:translate-x-1">
                  {s.address}
                </TableCell>
                <TableCell className="transition-transform duration-300 group-hover:translate-x-1">
                  {s.active ? (
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="transition-transform duration-300 group-hover:translate-x-1">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => setEditingSupplier(s)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-delete-supplier-${s.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{s.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteSupplier.mutateAsync(s.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
      </motion.div>
    </Shell>
  );
}
