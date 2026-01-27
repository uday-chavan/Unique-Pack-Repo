import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useSuppliers } from "@/hooks/use-crm";
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
import { Truck, Plus, Trash2 } from "lucide-react";
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
import { type InsertSupplier } from "@shared/schema";

export default function Suppliers() {
  const { suppliers, isLoading, createSupplier, deleteSupplier } = useSuppliers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async (data: InsertSupplier) => {
    await createSupplier.mutateAsync(data);
    setIsCreateOpen(false);
  };

  return (
    <Shell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
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
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
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
              <TableRow key={s.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-900">{s.name}</TableCell>
                <TableCell>{s.contactPerson}</TableCell>
                <TableCell>
                  <div className="text-sm">{s.email}</div>
                  <div className="text-xs text-muted-foreground">{s.phone}</div>
                </TableCell>
                <TableCell className="text-sm text-slate-600 max-w-[250px] truncate">
                  {s.address}
                </TableCell>
                <TableCell>
                  {s.active ? (
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Shell>
  );
}
