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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { OrderForm } from "@/components/forms/OrderForm";
import {
  Plus, Clock, CheckCircle, Truck, FileText, CreditCard,
  AlertCircle, Trash2, PackageCheck, Download, MoreHorizontal
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [showEWayBill, setShowEWayBill] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const ewayBillRef = useRef<HTMLDivElement>(null);

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

  const downloadEWayBill = async () => {
    if (!ewayBillRef.current) return;
    const canvas = await html2canvas(ewayBillRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`EWayBill_${selectedOrderForInvoice.id}.pdf`);
  };

  const handlePayment = async () => {
    if (!paymentOrder || !paymentAmount) return;
    await updatePayment.mutateAsync({
      orderId: paymentOrder.id,
      amountPaid: paymentAmount,
    });
    setPaymentOrder(null);
    setPaymentAmount("");
  };

  const handleDeliveryStatusUpdate = async (orderId: number, status: string) => {
    await updateDeliveryStatus.mutateAsync({ orderId, deliveryStatus: status });
  };

  const openPaymentDialog = (order: any) => {
    setPaymentOrder(order);
    setPaymentAmount(order.amountPaid || "0");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600">
            <CheckCircle className="w-3 h-3 mr-1" /> Paid
          </Badge>
        );
      case "partial":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
            <AlertCircle className="w-3 h-3 mr-1" /> Partial
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600">
            <PackageCheck className="w-3 h-3 mr-1" /> Delivered
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
            <Truck className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "in-transit":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
            <Truck className="w-3 h-3 mr-1" /> In Transit
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Truck className="w-3 h-3 mr-1" /> {status || "Pending"}
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
            <Button
              className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/10"
              data-testid="button-new-order"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>Select a customer and add machines to the order.</DialogDescription>
            </DialogHeader>
            <OrderForm onSubmit={handleCreate} isLoading={createOrder.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* table-fixed + carefully sized columns ensures no horizontal scroll */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="bg-slate-50 border-b-slate-200">
              <TableHead className="font-semibold text-slate-700 w-[80px]">Order ID</TableHead>
              <TableHead className="font-semibold text-slate-700 w-[120px]">Customer</TableHead>
              <TableHead className="font-semibold text-slate-700 w-[85px]">Date</TableHead>
              <TableHead className="font-semibold text-slate-700">Items</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right w-[115px]">Total</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right w-[100px]">Paid</TableHead>
              <TableHead className="font-semibold text-slate-700 w-[88px]">Payment</TableHead>
              <TableHead className="font-semibold text-slate-700 w-[105px]">Delivery</TableHead>
              <TableHead className="font-semibold text-slate-700 w-[44px]"></TableHead>
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
                <TableRow
                  key={order.id}
                  className="hover:bg-slate-50/50 transition-colors"
                  data-testid={`row-order-${order.id}`}
                >
                  <TableCell className="font-mono text-slate-500 text-sm">
                    #{order.id.toString().padStart(5, "0")}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 text-sm">
                    {order.customer?.name}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {order.createdAt && format(new Date(order.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    <div className="flex flex-col gap-1">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex items-start gap-1 min-w-0">
                          <span className="font-medium text-slate-900 shrink-0">{item.quantity}x</span>
                          <span className="truncate" title={item.machine?.name}>
                            {item.machine?.name}
                          </span>
                        </div>
                      ))}
                      {(!order.items || order.items.length === 0) && (
                        <span className="text-slate-400 italic">No items</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-900 text-sm">
                    ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right text-slate-600 text-sm">
                    ₹{Number(order.amountPaid || 0).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                  <TableCell>{getDeliveryBadge(order.deliveryStatus)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          data-testid={`button-actions-${order.id}`}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => openPaymentDialog(order)}
                          disabled={order.paymentStatus === "paid"}
                          data-testid={`button-payment-${order.id}`}
                          className="cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 mr-2 text-slate-500" />
                          {order.paymentStatus === "paid" ? "Already Paid" : "Record Payment"}
                        </DropdownMenuItem>

                        {order.deliveryStatus?.toLowerCase() !== "delivered" && (
                          <DropdownMenuItem
                            onClick={() => handleDeliveryStatusUpdate(order.id, "delivered")}
                            className="cursor-pointer text-emerald-600 focus:text-emerald-600"
                            data-testid={`button-deliver-${order.id}`}
                          >
                            <PackageCheck className="w-4 h-4 mr-2" />
                            Mark Delivered
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="cursor-pointer text-blue-600 focus:text-blue-600"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Invoice
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => setOrderToDelete(order)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          data-testid={`button-delete-${order.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Order #{orderToDelete?.id?.toString().padStart(5, "0")}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteOrder.mutateAsync(orderToDelete.id);
                setOrderToDelete(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog */}
      <Dialog open={!!paymentOrder} onOpenChange={(open) => !open && setPaymentOrder(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter the amount paid for Order #{paymentOrder?.id?.toString().padStart(5, "0")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold">
                ₹{Number(paymentOrder?.totalAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Previously Paid:</span>
              <span>₹{Number(paymentOrder?.amountPaid || 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Balance Due:</span>
              <span className="text-red-600 font-medium">
                ₹{(
                  Number(paymentOrder?.totalAmount || 0) - Number(paymentOrder?.amountPaid || 0)
                ).toLocaleString("en-IN")}
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

      {/* Invoice Dialog */}
      <Dialog
        open={!!selectedOrderForInvoice}
        onOpenChange={(open) => !open && setSelectedOrderForInvoice(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>Preview and download tax invoice.</DialogDescription>
          </DialogHeader>

          <div className="overflow-x-hidden w-full">
            <div
              ref={invoiceRef}
              className="bg-white p-8 text-black border shadow-sm font-sans"
              style={{
                width: "100%",
                maxWidth: "210mm",
                margin: "0 auto",
                minHeight: "297mm",
                boxSizing: "border-box",
              }}
            >
              <div className="border-2 border-black p-4">
                {/* Header */}
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
                    <h2 className="text-xl font-bold border-2 border-black px-4 py-1 inline-block">
                      TAX INVOICE
                    </h2>
                  </div>
                </div>

                {/* Bill To + Invoice Details */}
                <div className="grid grid-cols-2 gap-4 border-b-2 border-black pb-4 mb-4">
                  <div className="text-xs">
                    <p className="font-bold">
                      M/s.{" "}
                      {selectedOrderForInvoice?.customer?.businessName ||
                        selectedOrderForInvoice?.customer?.name}
                    </p>
                    <p>{selectedOrderForInvoice?.customer?.address}</p>
                    <p className="mt-2 font-bold">
                      GSTIN:{" "}
                      {selectedOrderForInvoice?.customer?.gstin ||
                        selectedOrderForInvoice?.customer?.taxId ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="text-xs border-l-2 border-black pl-4">
                    <p>
                      <span className="font-bold inline-block w-24">Invoice No:</span>{" "}
                      UP/2025-26/{selectedOrderForInvoice?.id.toString().padStart(4, "0")}
                    </p>
                    <p>
                      <span className="font-bold inline-block w-24">Date:</span>{" "}
                      {selectedOrderForInvoice?.createdAt &&
                        format(new Date(selectedOrderForInvoice.createdAt), "dd/MM/yyyy")}
                    </p>
                    <p>
                      <span className="font-bold inline-block w-24">PO No:</span>{" "}
                      {selectedOrderForInvoice?.poNo || "N/A"}
                    </p>
                    <p>
                      <span className="font-bold inline-block w-24">PO Date:</span>{" "}
                      {selectedOrderForInvoice?.poDate
                        ? format(new Date(selectedOrderForInvoice.poDate), "dd/MM/yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
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
                            <p className="text-[10px] text-slate-600">
                              Model: {item.machine?.model || "Standard"}
                            </p>
                          </td>
                          <td className="border-x-2 border-black p-1 text-center">
                            {item.machine?.hsnCode || "8422"}
                          </td>
                          <td className="border-x-2 border-black p-1 text-center">{item.quantity}</td>
                          <td className="border-x-2 border-black p-1 text-center">No.</td>
                          <td className="border-x-2 border-black p-1 text-right">
                            {rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="border-x-2 border-black p-1 text-right">
                            {taxableAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="border-x-2 border-black p-1 text-center">18%</td>
                        </tr>
                      );
                    })}
                    <tr className="font-bold border-y-2 border-black">
                      <td colSpan={6} className="text-right p-1">
                        TOTAL
                      </td>
                      <td className="border-x-2 border-black p-1 text-right">
                        {Number(selectedOrderForInvoice?.totalAmount || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="border-x-2 border-black"></td>
                    </tr>
                  </tbody>
                </table>

                {/* Payment Terms + GST Summary */}
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
                      <span>
                        {(Number(selectedOrderForInvoice?.totalAmount || 0) * 0.09).toLocaleString(
                          "en-IN",
                          { minimumFractionDigits: 2 }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-black">
                      <span>SGST @ 9%</span>
                      <span>
                        {(Number(selectedOrderForInvoice?.totalAmount || 0) * 0.09).toLocaleString(
                          "en-IN",
                          { minimumFractionDigits: 2 }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-black">
                      <span>IGST @ 0%</span>
                      <span>0.00</span>
                    </div>
                    <div className="flex justify-between p-1 bg-slate-100 font-bold text-sm">
                      <span>GRAND TOTAL</span>
                      <span>
                        ₹{" "}
                        {(Number(selectedOrderForInvoice?.totalAmount || 0) * 1.18).toLocaleString(
                          "en-IN",
                          { minimumFractionDigits: 2 }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
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

                {/* Terms & Conditions */}
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
          </div>

          <div className="flex gap-2 justify-between items-center">
            <Button variant="outline" onClick={() => setShowEWayBill(!showEWayBill)}>
              {showEWayBill ? 'Show Invoice' : 'Show e-Way Bill'}
            </Button>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedOrderForInvoice(null)}>
                Close
              </Button>
              {!showEWayBill ? (
                <Button onClick={downloadInvoice} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
              ) : (
                <Button onClick={downloadEWayBill} className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" /> Download e-Way Bill
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* e-Way Bill Dialog */}
      {showEWayBill && selectedOrderForInvoice && (
        <div className="hidden">
          <div
            ref={ewayBillRef}
            className="bg-white p-8 text-black border shadow-sm font-sans"
            style={{
              width: "210mm",
              minHeight: "297mm",
              boxSizing: "border-box",
            }}
          >
            <div className="border-2 border-black p-6">
              {/* e-Way Bill Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">e-Way Bill</h2>
                <p className="text-xs mt-2">GST E-Way Bill for Transportation of Goods</p>
              </div>

              {/* e-Way Details */}
              <div className="grid grid-cols-2 gap-6 text-xs mb-6 border-b-2 border-black pb-4">
                <div>
                  <p><span className="font-bold inline-block w-32">E-Way Bill No:</span> {String(selectedOrderForInvoice?.id * 1000 + 2221).padEnd(13, '0')}</p>
                  <p><span className="font-bold inline-block w-32">E-Way Bill Date:</span> {selectedOrderForInvoice?.createdAt ? format(new Date(selectedOrderForInvoice.createdAt), "dd/MM/yyyy hh:mm a") : "N/A"}</p>
                  <p><span className="font-bold inline-block w-32">Generated By:</span> UNIQ PACK</p>
                </div>
                <div className="text-right">
                  <p><span className="font-bold">Valid From:</span> {selectedOrderForInvoice?.createdAt ? format(new Date(selectedOrderForInvoice.createdAt), "dd/MM/yyyy hh:mm a") : "N/A"}</p>
                  <p><span className="font-bold">Valid Until:</span> {selectedOrderForInvoice?.createdAt ? format(new Date(new Date(selectedOrderForInvoice.createdAt).getTime() + 48*60*60*1000), "dd/MM/yyyy") : "N/A"}</p>
                  <p><span className="font-bold">Portal:</span> 1</p>
                </div>
              </div>

              {/* Part A */}
              <div className="mb-6">
                <h3 className="font-bold text-sm mb-3 border-b-2 border-black pb-1">Part - A</h3>
                <table className="w-full text-xs border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="font-bold w-40 p-2">GSTIN of Supplier</td>
                      <td className="p-2">27AGJPJ6286A1ZD, UNIQ PACK</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="font-bold w-40 p-2">Place of Dispatch</td>
                      <td className="p-2">Shrirampur, MAHARASHTRA-423603</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="font-bold w-40 p-2">GSTIN of Recipient</td>
                      <td className="p-2">{selectedOrderForInvoice?.customer?.gstin || selectedOrderForInvoice?.customer?.taxId || "N/A"}, {selectedOrderForInvoice?.customer?.businessName || selectedOrderForInvoice?.customer?.name}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="font-bold w-40 p-2">Place of Delivery</td>
                      <td className="p-2">{selectedOrderForInvoice?.customer?.address || "N/A"}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="font-bold w-40 p-2">Document No.</td>
                      <td className="p-2">UP/2025-26/{selectedOrderForInvoice?.id.toString().padStart(4, "0")}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="font-bold w-40 p-2">Document Date</td>
                      <td className="p-2">{selectedOrderForInvoice?.createdAt ? format(new Date(selectedOrderForInvoice.createdAt), "dd/MM/yyyy") : "N/A"}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="font-bold w-40 p-2">Transaction Type</td>
                      <td className="p-2">Regular</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="font-bold w-40 p-2">Value of Goods</td>
                      <td className="p-2">₹{Number(selectedOrderForInvoice?.totalAmount || 0).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="font-bold w-40 p-2">HSN Code</td>
                      <td className="p-2">8422 - PACKING MACHINE</td>
                    </tr>
                    <tr>
                      <td className="font-bold w-40 p-2">Reason for Transportation</td>
                      <td className="p-2">Outward - Supply</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Part B */}
              <div className="mb-6">
                <h3 className="font-bold text-sm mb-3 border-b-2 border-black pb-1">Part - B</h3>
                <table className="w-full text-xs border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Vehicle / Trans Mode</th>
                      <th className="border p-2 text-left">From</th>
                      <th className="border p-2 text-left">Entered Date</th>
                      <th className="border p-2 text-left">Entered By</th>
                      <th className="border p-2 text-left">CEWB No.</th>
                      <th className="border p-2 text-left">Portal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border">
                      <td className="border p-2">Road - MH09CU6678</td>
                      <td className="border p-2">Shrirampur</td>
                      <td className="border p-2">{selectedOrderForInvoice?.createdAt ? format(new Date(selectedOrderForInvoice.createdAt), "dd/MM/yyyy hh:mm a") : "N/A"}</td>
                      <td className="border p-2">27AGJPJ6286A1ZD</td>
                      <td className="border p-2">-</td>
                      <td className="border p-2">1</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* QR Code Area */}
              <div className="text-center py-6 border-t-2 border-black">
                <div className="text-xs font-bold mb-2">
                  {String(selectedOrderForInvoice?.id * 1000 + 2221).padEnd(13, '0')}
                </div>
                <p className="text-[10px] text-gray-500 mt-4">Note: If any discrepancy in information, please try after some time.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}