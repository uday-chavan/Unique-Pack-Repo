import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useOrders } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { OrderForm } from "@/components/forms/OrderForm";
import { Plus, Clock, CheckCircle, Truck, FileText, CreditCard, AlertCircle, Trash2, PackageCheck } from "lucide-react";
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
import { format } from "date-fns";

export default function Orders() {
  const { orders, isLoading, createOrder, updatePayment, updateDeliveryStatus, deleteOrder } = useOrders();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const handleCreate = async (data: any) => {
    await createOrder.mutateAsync(data);
    setIsCreateOpen(false);
  };

  const handlePayment = async () => {
    if (!paymentOrder || !paymentAmount) return;
    await updatePayment.mutateAsync({
      orderId: paymentOrder.id,
      amountPaid: paymentAmount
    });
    setPaymentOrder(null);
    setPaymentAmount("");
  };

  const handleDeliveryStatusUpdate = async (orderId: number, status: string) => {
    await updateDeliveryStatus.mutateAsync({
      orderId,
      deliveryStatus: status
    });
  };

  const openPaymentDialog = (order: any) => {
    setPaymentOrder(order);
    setPaymentAmount(order.amountPaid || "0");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>;
      case 'partial':
        return <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50"><AlertCircle className="w-3 h-3 mr-1" /> Partial</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600">
            <PackageCheck className="w-3 h-3 mr-1" /> Delivered
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
            <Truck className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case 'in-transit':
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
            <Truck className="w-3 h-3 mr-1" /> In Transit
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Truck className="w-3 h-3 mr-1" /> {status || 'Pending'}
          </Badge>
        );
    }
  };

  return (
    <Shell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h2>
          <p className="text-muted-foreground mt-1">Track and manage customer orders.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/10" data-testid="button-new-order">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                Select a customer and add machines to the order.
              </DialogDescription>
            </DialogHeader>
            <OrderForm onSubmit={handleCreate} isLoading={createOrder.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b-slate-200">
              <TableHead className="font-semibold text-slate-700">Order ID</TableHead>
              <TableHead className="font-semibold text-slate-700">Customer</TableHead>
              <TableHead className="font-semibold text-slate-700">Date</TableHead>
              <TableHead className="font-semibold text-slate-700">Items</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Total Amount</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Amount Paid</TableHead>
              <TableHead className="font-semibold text-slate-700">Payment</TableHead>
              <TableHead className="font-semibold text-slate-700">Delivery</TableHead>
              <TableHead className="font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="w-8 h-8 mb-2 opacity-20" />
                    <p>No orders found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`row-order-${order.id}`}>
                  <TableCell className="font-mono text-slate-500">#{order.id.toString().padStart(5, '0')}</TableCell>
                  <TableCell className="font-medium text-slate-900">{order.customer?.name}</TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {order.createdAt && format(new Date(order.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    <div className="flex flex-col gap-1">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="whitespace-nowrap">
                          <span className="font-medium text-slate-900">{item.quantity}x</span> {item.machine?.name}
                        </div>
                      ))}
                      {(!order.items || order.items.length === 0) && (
                        <span className="text-slate-400 italic">No items</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-slate-900">
                    ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right font-mono text-slate-600">
                    ₹{Number(order.amountPaid || 0).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                  <TableCell>
                    {getDeliveryBadge(order.deliveryStatus)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPaymentDialog(order)}
                        disabled={order.paymentStatus === 'paid'}
                        data-testid={`button-payment-${order.id}`}
                      >
                        <CreditCard className="w-3 h-3 mr-1" />
                        {order.paymentStatus === 'paid' ? 'Paid' : 'Record Payment'}
                      </Button>
                      
                      {order.deliveryStatus?.toLowerCase() !== 'delivered' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeliveryStatusUpdate(order.id, 'delivered')}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          data-testid={`button-deliver-${order.id}`}
                        >
                          <PackageCheck className="w-3 h-3 mr-1" />
                          Mark Delivered
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-delete-${order.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Order</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete Order #{order.id.toString().padStart(5, '0')}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteOrder.mutateAsync(order.id)}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!paymentOrder} onOpenChange={(open) => !open && setPaymentOrder(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter the amount paid for Order #{paymentOrder?.id?.toString().padStart(5, '0')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold">₹{Number(paymentOrder?.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Previously Paid:</span>
              <span>₹{Number(paymentOrder?.amountPaid || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Balance Due:</span>
              <span className="text-red-600 font-medium">
                ₹{(Number(paymentOrder?.totalAmount || 0) - Number(paymentOrder?.amountPaid || 0)).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Amount to Pay (₹)</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                data-testid="input-payment-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOrder(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={updatePayment.isPending || !paymentAmount}
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="button-confirm-payment"
            >
              {updatePayment.isPending ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}