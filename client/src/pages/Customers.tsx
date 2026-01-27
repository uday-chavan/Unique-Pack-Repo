import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useCustomers } from "@/hooks/use-crm";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
import { Users, Mail, Phone, Building, Plus, Trash2 } from "lucide-react";
import { type InsertCustomer } from "@shared/schema";

export default function Customers() {
  const { customers, isLoading, createCustomer, deleteCustomer } = useCustomers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async (data: InsertCustomer) => {
    await createCustomer.mutateAsync(data);
    setIsCreateOpen(false);
  };

  return (
    <Shell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Customers</h2>
          <p className="text-muted-foreground mt-1">Directory of client relationships.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/10" data-testid="button-add-customer">
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
            <CustomerForm onSubmit={handleCreate} isLoading={createCustomer.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {customers.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3 mb-8">
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
        </div>
      )}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b-slate-200">
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Tax ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="w-8 h-8 mb-2 opacity-20" />
                    <p>No customers yet. Add your first customer!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : customers.map((c) => (
              <TableRow key={c.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.businessName}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{c.email}</div>
                  <div className="text-xs text-muted-foreground">{c.phone}</div>
                </TableCell>
                <TableCell className="text-sm text-slate-600 max-w-[200px] truncate">
                  {c.address}
                </TableCell>
                <TableCell className="font-mono text-xs">{c.taxId || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Shell>
  );
}
