import { useState, useRef } from "react";
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
import { Plus, Clock, CheckCircle, Truck, FileText, CreditCard, AlertCircle, Trash2, PackageCheck, Download } from "lucide-react";
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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Orders() {
  const { orders, isLoading, createOrder, updatePayment, updateDeliveryStatus, deleteOrder } = useOrders();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleCreate = async (data: any) => {
    await createOrder.mutateAsync(data);
    setIsCreateOpen(false);
  };

  const downloadInvoice = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${selectedOrderForInvoice.id}.pdf`);
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

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrderForInvoice(order)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Invoice
                      </Button>
                      
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
      <Dialog open={!!selectedOrderForInvoice} onOpenChange={(open) => !open && setSelectedOrderForInvoice(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>Preview and download tax invoice.</DialogDescription>
          </DialogHeader>
          
          <div ref={invoiceRef} className="bg-white p-8 text-black border shadow-sm font-sans" style={{ width: "210mm", margin: "0 auto", minHeight: "297mm" }}>
            <div className="border-2 border-black p-4">
              <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold">Uniq Pack</h1>
                  <p className="text-xs font-semibold uppercase">Packaging Machine Manufacturers</p>
                  <div className="mt-4 text-xs">
                    <p className="font-bold">Regd. Office:</p>
                    <p>At Post: Shrirampur, Taluka: Shrirampur</p>
                    <p>Dist: Ahmednagar, Maharashtra - 423603</p>
                    <p>Mobile: 08048955347</p>
                    <p>Email: info@uniqpack.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold border-2 border-black px-4 py-1 inline-block">TAX INVOICE</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b-2 border-black pb-4 mb-4">
                <div className="text-xs">
                  <p className="font-bold">M/s. {selectedOrderForInvoice?.customer?.businessName || selectedOrderForInvoice?.customer?.name}</p>
                  <p>{selectedOrderForInvoice?.customer?.address}</p>
                  <p className="mt-2 font-bold">GSTIN: {selectedOrderForInvoice?.customer?.gstin || selectedOrderForInvoice?.customer?.taxId || "N/A"}</p>
                </div>
                <div className="text-xs border-l-2 border-black pl-4">
                  <p><span className="font-bold inline-block w-24">Invoice No:</span> UP/2025-26/{selectedOrderForInvoice?.id.toString().padStart(4, '0')}</p>
                  <p><span className="font-bold inline-block w-24">Date:</span> {selectedOrderForInvoice?.createdAt && format(new Date(selectedOrderForInvoice.createdAt), "dd/MM/yyyy")}</p>
                  <p><span className="font-bold inline-block w-24">PO No:</span> {selectedOrderForInvoice?.poNo || "N/A"}</p>
                  <p><span className="font-bold inline-block w-24">PO Date:</span> {selectedOrderForInvoice?.poDate ? format(new Date(selectedOrderForInvoice.poDate), "dd/MM/yyyy") : "N/A"}</p>
                </div>
              </div>

              <table className="w-full text-xs border-collapse mb-4">
                <thead>
                  <tr className="border-y-2 border-black bg-slate-100">
                    <th className="border-x-2 border-black p-1 text-center w-12">Sr. No.</th>
                    <th className="border-x-2 border-black p-1 text-left">Description</th>
                    <th className="border-x-2 border-black p-1 text-center w-16">HSN</th>
                    <th className="border-x-2 border-black p-1 text-center w-12">Qty</th>
                    <th className="border-x-2 border-black p-1 text-center w-12">Unit</th>
                    <th className="border-x-2 border-black p-1 text-right w-24">Rate (₹)</th>
                    <th className="border-x-2 border-black p-1 text-right w-28">Taxable Amt (₹)</th>
                    <th className="border-x-2 border-black p-1 text-center w-16">GST %</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderForInvoice?.items?.map((item: any, index: number) => {
                    const rate = Number(item.price);
                    const taxableAmt = rate * item.quantity;
                    return (
                      <tr key={index} className="border-b border-black">
                        <td className="border-x-2 border-black p-1 text-center">{index + 1}</td>
                        <td className="border-x-2 border-black p-1">
                          <p className="font-bold">{item.machine?.name}</p>
                          <p className="text-[10px] text-slate-600">Model: {item.machine?.model || "Standard"}</p>
                        </td>
                        <td className="border-x-2 border-black p-1 text-center">{item.machine?.hsnCode || "8422"}</td>
                        <td className="border-x-2 border-black p-1 text-center">{item.quantity}</td>
                        <td className="border-x-2 border-black p-1 text-center">No.</td>
                        <td className="border-x-2 border-black p-1 text-right">{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="border-x-2 border-black p-1 text-right">{taxableAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="border-x-2 border-black p-1 text-center">18%</td>
                      </tr>
                    );
                  })}
                  <tr className="font-bold border-y-2 border-black">
                    <td colSpan={6} className="text-right p-1">TOTAL</td>
                    <td className="border-x-2 border-black p-1 text-right">
                      {Number(selectedOrderForInvoice?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border-x-2 border-black"></td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-4 text-xs mb-8">
                <div>
                  <p className="font-bold mb-1">Payment Terms:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>50% advance with purchase order</li>
                    <li>40% on dispatch of machinery</li>
                    <li>10% on successful installation and commissioning</li>
                  </ul>
                </div>
                <div className="border-2 border-black">
                  <div className="flex justify-between p-1 border-b border-black">
                    <span>CGST @ 9%</span>
                    <span>{(Number(selectedOrderForInvoice?.totalAmount || 0) * 0.09).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-1 border-b border-black">
                    <span>SGST @ 9%</span>
                    <span>{(Number(selectedOrderForInvoice?.totalAmount || 0) * 0.09).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-1 border-b border-black">
                    <span>IGST @ 0%</span>
                    <span>0.00</span>
                  </div>
                  <div className="flex justify-between p-1 bg-slate-100 font-bold text-sm">
                    <span>GRAND TOTAL</span>
                    <span>₹ {(Number(selectedOrderForInvoice?.totalAmount || 0) * 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end mt-12 text-xs">
                <div className="text-center">
                  <div className="border-b border-black w-32 mb-1"></div>
                  <p>Customer Signature</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">For Uniq Pack</p>
                  <div className="h-12"></div>
                  <p>Authorized Signatory</p>
                </div>
              </div>

              <div className="mt-8 text-[10px] border-t border-black pt-2">
                <p className="font-bold">Terms & Conditions:</p>
                <ol className="list-decimal list-inside">
                  <li>Goods once sold will not be taken back.</li>
                  <li>Warranty: 12 months from the date of installation.</li>
                  <li>Delivery: Within 30-45 days from receipt of advance payment.</li>
                  <li>Subject to Shrirampur jurisdiction.</li>
                </ol>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrderForInvoice(null)}>Close</Button>
            <Button onClick={downloadInvoice} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}