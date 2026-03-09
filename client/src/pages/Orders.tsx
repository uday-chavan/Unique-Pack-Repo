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
  AlertCircle, Trash2, PackageCheck, Download, MoreHorizontal, Pencil
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
  const { orders, isLoading, createOrder, updatePayment, updateDeliveryStatus, updateOrderDetails, deleteOrder } = useOrders();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any>(null);
  const [selectedOrderForEWayBill, setSelectedOrderForEWayBill] = useState<any>(null);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<any>({});
  const [eWayBillDetails, setEWayBillDetails] = useState<any>({});
  const [isInvoiceEditMode, setIsInvoiceEditMode] = useState(false);
  const [isEWayBillEditMode, setIsEWayBillEditMode] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const eWayBillRef = useRef<HTMLDivElement>(null);

  const handleInvoiceDetailsChange = (field: string, value: any) => {
    setInvoiceDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleEWayBillDetailsChange = (field: string, value: any) => {
    setEWayBillDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveInvoiceDetails = async () => {
    if (!selectedOrderForInvoice) return;
    await updateOrderDetails.mutateAsync({
      orderId: selectedOrderForInvoice.id,
      details: invoiceDetails,
    });
    setIsInvoiceEditMode(false);
  };

  const handleSaveEWayBillDetails = async () => {
    if (!selectedOrderForEWayBill) return;
    await updateOrderDetails.mutateAsync({
      orderId: selectedOrderForEWayBill.id,
      details: eWayBillDetails,
    });
    setIsEWayBillEditMode(false);
  };

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
    if (!eWayBillRef.current) return;
    const canvas = await html2canvas(eWayBillRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`EWayBill_${selectedOrderForEWayBill.id}.pdf`);
  };

  const renderEWayBillHTML = (order: any, details: any = {}) => {
    const billNo = String(order?.id * 1000 + 2221).padEnd(13, '0');
    const createdDate = order?.createdAt ? new Date(order.createdAt) : new Date();
    const validUntil = new Date(createdDate.getTime() + 48*60*60*1000);
    
    return `
      <div style="border: 2px solid black; padding: 24px; font-family: Arial, sans-serif; color: black;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: bold; margin: 0;">e-Way Bill</h2>
          <p style="font-size: 12px; margin-top: 8px;">GST E-Way Bill for Transportation of Goods</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; font-size: 12px; margin-bottom: 24px; border-bottom: 2px solid black; padding-bottom: 16px;">
          <div>
            <p><span style="font-weight: bold; display: inline-block; width: 128px;">E-Way Bill No:</span> ${billNo}</p>
            <p><span style="font-weight: bold; display: inline-block; width: 128px;">E-Way Bill Date:</span> ${createdDate.toLocaleDateString('en-IN')} ${createdDate.toLocaleTimeString('en-IN')}</p>
            <p><span style="font-weight: bold; display: inline-block; width: 128px;">Generated By:</span> UNIQ PACK</p>
          </div>
          <div style="text-align: right;">
            <p><span style="font-weight: bold;">Valid From:</span> ${createdDate.toLocaleDateString('en-IN')} ${createdDate.toLocaleTimeString('en-IN')}</p>
            <p><span style="font-weight: bold;">Valid Until:</span> ${validUntil.toLocaleDateString('en-IN')}</p>
            <p><span style="font-weight: bold;">Portal:</span> 1</p>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-weight: bold; font-size: 14px; margin: 0 0 12px 0; border-bottom: 2px solid black; padding-bottom: 8px;">Part - A</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tbody>
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="font-weight: bold; width: 160px; padding: 8px;">GSTIN of Supplier</td>
                <td style="padding: 8px;">27AGJPJ6286A1ZD, UNIQ PACK</td>
              </tr>
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="font-weight: bold; width: 160px; padding: 8px;">Place of Dispatch</td>
                <td style="padding: 8px;">${details.placeOfDispatch || "Shrirampur, MAHARASHTRA-423603"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="font-weight: bold; width: 160px; padding: 8px;">GSTIN of Recipient</td>
                <td style="padding: 8px;">${order?.customer?.gstin || order?.customer?.taxId || "N/A"}, ${order?.customer?.businessName || order?.customer?.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="font-weight: bold; width: 160px; padding: 8px;">Place of Delivery</td>
                <td style="padding: 8px;">${details.toLocation || order?.customer?.address || "N/A"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="font-weight: bold; width: 160px; padding: 8px;">Document No.</td>
                <td style="padding: 8px;">${details.documentNo || `UP/2025-26/${order?.id?.toString().padStart(4, "0")}`}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="font-weight: bold; width: 160px; padding: 8px;">Document Date</td>
                <td style="padding: 8px;">${createdDate.toLocaleDateString('en-IN')}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="font-weight: bold; width: 160px; padding: 8px;">Transaction Type</td>
                <td style="padding: 8px;">${details.transactionType || "Regular"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="font-weight: bold; width: 160px; padding: 8px;">Value of Goods</td>
                <td style="padding: 8px;">₹${Number(order?.totalAmount || 0).toLocaleString("en-IN")}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="font-weight: bold; width: 160px; padding: 8px;">HSN Code</td>
                <td style="padding: 8px;">${details.hsnCode || "8422"} - PACKING MACHINE</td>
              </tr>
              <tr>
                <td style="font-weight: bold; width: 160px; padding: 8px;">Reason for Transportation</td>
                <td style="padding: 8px;">${details.transportationReason || "Outward - Supply"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-weight: bold; font-size: 14px; margin: 0 0 12px 0; border-bottom: 2px solid black; padding-bottom: 8px;">Part - B</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse; border: 1px solid #999;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #999; padding: 8px; text-align: left;">Vehicle / Trans Mode</th>
                <th style="border: 1px solid #999; padding: 8px; text-align: left;">From</th>
                <th style="border: 1px solid #999; padding: 8px; text-align: left;">Entered Date</th>
                <th style="border: 1px solid #999; padding: 8px; text-align: left;">Entered By</th>
                <th style="border: 1px solid #999; padding: 8px; text-align: left;">CEWB No.</th>
                <th style="border: 1px solid #999; padding: 8px; text-align: left;">Portal</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border: 1px solid #999;">
                <td style="border: 1px solid #999; padding: 8px;">${details.transportMode || "Road"} - ${details.vehicleNo || "MH09CU6678"}</td>
                <td style="border: 1px solid #999; padding: 8px;">${details.fromLocation || "Shrirampur"}</td>
                <td style="border: 1px solid #999; padding: 8px;">${createdDate.toLocaleDateString('en-IN')} ${createdDate.toLocaleTimeString('en-IN')}</td>
                <td style="border: 1px solid #999; padding: 8px;">${details.enteredBy || "27AGJPJ6286A1ZD"}</td>
                <td style="border: 1px solid #999; padding: 8px;">-</td>
                <td style="border: 1px solid #999; padding: 8px;">1</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="text-align: center; padding-top: 24px; border-top: 2px solid black;">
          <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">${billNo}</div>
          <p style="font-size: 10px; color: #999; margin-top: 16px;">Note: If any discrepancy in information, please try after some time.</p>
        </div>
      </div>
    `;
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

  const openInvoiceDialog = (order: any) => {
    // Load saved invoice details from order
    setInvoiceDetails({
      invoiceNo: order.invoiceNo || "",
      poNo: order.poNo || "",
      dcNo: order.dcNo || "",
      eWayBillNo: order.eWayBillNo || "",
      discountPercent: order.discountPercent || "0",
      bankName: order.bankName || "Bank of Baroda",
      bankBranch: order.bankBranch || "Kopargaon",
      accountNo: order.accountNo || "",
      ifscCode: order.ifscCode || "",
      modeOfTransport: order.modeOfTransport || "Road",
      dispatchedFrom: order.dispatchedFrom || "Kopargaon",
      placeOfSupply: order.placeOfSupply || "Kopargaon",
    });
    setSelectedOrderForInvoice(order);
  };

  const openEWayBillDialog = (order: any) => {
    // Load saved eway bill details from order
    setEWayBillDetails({
      vehicleNo: order.vehicleNo || "MH09CU6678",
      transporterGstin: order.transporterGstin || "",
      transportMode: order.transportMode || "Road",
      hsnCode: order.hsnCode || "8422",
      placeOfDispatch: order.placeOfDispatch || "Shrirampur, MAHARASHTRA-423603",
      documentNo: order.documentNo || "",
      transactionType: order.transactionType || "Regular",
      transportationReason: order.transportationReason || "Outward - Supply",
      fromLocation: order.fromLocation || "Shrirampur",
      enteredBy: order.enteredBy || "27AGJPJ6286A1ZD",
      toLocation: order.toLocation || "Kopargaon",
    });
    setSelectedOrderForEWayBill(order);
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
                          onClick={() => openInvoiceDialog(order)}
                          className="cursor-pointer text-blue-600 focus:text-blue-600"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Invoice
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => openEWayBillDialog(order)}
                          className="cursor-pointer text-green-600 focus:text-green-600"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View e-Way Bill
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

      {/* e-Way Bill Dialog */}
      <Dialog
        open={!!selectedOrderForEWayBill}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrderForEWayBill(null);
            setIsEWayBillEditMode(false);
            setEWayBillDetails({});
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>e-Way Bill Preview</DialogTitle>
              <DialogDescription>Preview and download e-Way bill.</DialogDescription>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEWayBillEditMode(!isEWayBillEditMode)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>

          {isEWayBillEditMode && (
            <div className="grid grid-cols-2 gap-4 text-xs mb-4 max-h-80 overflow-y-auto border rounded p-4 bg-slate-50">
              <div>
                <Label>Vehicle No</Label>
                <Input value={eWayBillDetails.vehicleNo || ""} onChange={(e) => handleEWayBillDetailsChange("vehicleNo", e.target.value)} placeholder="Vehicle Number" />
              </div>
              <div>
                <Label>Transporter GSTIN</Label>
                <Input value={eWayBillDetails.transporterGstin || ""} onChange={(e) => handleEWayBillDetailsChange("transporterGstin", e.target.value)} placeholder="Transporter GSTIN" />
              </div>
              <div>
                <Label>Transport Mode</Label>
                <Input value={eWayBillDetails.transportMode || ""} onChange={(e) => handleEWayBillDetailsChange("transportMode", e.target.value)} placeholder="Road" />
              </div>
              <div>
                <Label>HSN Code</Label>
                <Input value={eWayBillDetails.hsnCode || ""} onChange={(e) => handleEWayBillDetailsChange("hsnCode", e.target.value)} placeholder="HSN Code" />
              </div>
              <div>
                <Label>Place of Dispatch</Label>
                <Input value={eWayBillDetails.placeOfDispatch || ""} onChange={(e) => handleEWayBillDetailsChange("placeOfDispatch", e.target.value)} placeholder="Place of Dispatch" />
              </div>
              <div>
                <Label>Document No</Label>
                <Input value={eWayBillDetails.documentNo || ""} onChange={(e) => handleEWayBillDetailsChange("documentNo", e.target.value)} placeholder="Document Number" />
              </div>
              <div>
                <Label>Transaction Type</Label>
                <Input value={eWayBillDetails.transactionType || ""} onChange={(e) => handleEWayBillDetailsChange("transactionType", e.target.value)} placeholder="Regular" />
              </div>
              <div>
                <Label>Reason for Transportation</Label>
                <Input value={eWayBillDetails.transportationReason || ""} onChange={(e) => handleEWayBillDetailsChange("transportationReason", e.target.value)} placeholder="Outward - Supply" />
              </div>
              <div>
                <Label>From Location</Label>
                <Input value={eWayBillDetails.fromLocation || ""} onChange={(e) => handleEWayBillDetailsChange("fromLocation", e.target.value)} placeholder="From Location" />
              </div>
              <div>
                <Label>Entered By (GSTIN)</Label>
                <Input value={eWayBillDetails.enteredBy || ""} onChange={(e) => handleEWayBillDetailsChange("enteredBy", e.target.value)} placeholder="GSTIN" />
              </div>
                            <div>
                <Label>Enter Place to Deliver</Label>
                <Input value={eWayBillDetails.toLocation || ""} onChange={(e) => handleEWayBillDetailsChange("toLocation", e.target.value)} placeholder="Place of Delivery" />
              </div>
            </div>
          )}

          <div className="overflow-x-hidden w-full">
            <div
              ref={eWayBillRef}
              className="bg-white p-8 text-black border shadow-sm font-sans"
              style={{
                width: "100%",
                maxWidth: "210mm",
                margin: "0 auto",
                boxSizing: "border-box",
              }}
              dangerouslySetInnerHTML={{ __html: renderEWayBillHTML(selectedOrderForEWayBill, eWayBillDetails) }}
            ></div>
          </div>

          <DialogFooter>
            {isEWayBillEditMode ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEWayBillEditMode(false);
                  setEWayBillDetails({});
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEWayBillDetails} 
                  disabled={updateOrderDetails.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {updateOrderDetails.isPending ? "Saving..." : "Save Details"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setSelectedOrderForEWayBill(null);
                  setIsEWayBillEditMode(false);
                  setEWayBillDetails({});
                }}>
                  Close
                </Button>
                <Button onClick={downloadEWayBill} className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog with Editable Details */}
      <Dialog
        open={!!selectedOrderForInvoice}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrderForInvoice(null);
            setInvoiceDetails({});
            setIsInvoiceEditMode(false);
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Tax Invoice</DialogTitle>
              <DialogDescription>View and download invoice</DialogDescription>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsInvoiceEditMode(!isInvoiceEditMode)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>

          {isInvoiceEditMode && (
            <div className="grid grid-cols-2 gap-4 text-xs mb-4 max-h-64 overflow-y-auto border rounded p-4 bg-slate-50">
              <div>
                <Label>Invoice No</Label>
                <Input value={invoiceDetails.invoiceNo || ""} onChange={(e) => handleInvoiceDetailsChange("invoiceNo", e.target.value)} placeholder="UP/2025-26/0001" />
              </div>
              <div>
                <Label>PO Number</Label>
                <Input value={invoiceDetails.poNo || ""} onChange={(e) => handleInvoiceDetailsChange("poNo", e.target.value)} placeholder="PO Number" />
              </div>
              <div>
                <Label>DC Number</Label>
                <Input value={invoiceDetails.dcNo || ""} onChange={(e) => handleInvoiceDetailsChange("dcNo", e.target.value)} placeholder="DC Number" />
              </div>
              <div>
                <Label>E-Way Bill No</Label>
                <Input value={invoiceDetails.eWayBillNo || ""} onChange={(e) => handleInvoiceDetailsChange("eWayBillNo", e.target.value)} placeholder="E-Way Bill No" />
              </div>
              <div>
                <Label>Discount %</Label>
                <Input type="number" value={invoiceDetails.discountPercent || ""} onChange={(e) => handleInvoiceDetailsChange("discountPercent", e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label>Bank Name</Label>
                <Input value={invoiceDetails.bankName || ""} onChange={(e) => handleInvoiceDetailsChange("bankName", e.target.value)} placeholder="Bank of Baroda" />
              </div>
              <div>
                <Label>Bank Branch</Label>
                <Input value={invoiceDetails.bankBranch || ""} onChange={(e) => handleInvoiceDetailsChange("bankBranch", e.target.value)} placeholder="Kopargaon" />
              </div>
              <div>
                <Label>Account No</Label>
                <Input value={invoiceDetails.accountNo || ""} onChange={(e) => handleInvoiceDetailsChange("accountNo", e.target.value)} placeholder="Account Number" />
              </div>
              <div>
                <Label>IFSC Code</Label>
                <Input value={invoiceDetails.ifscCode || ""} onChange={(e) => handleInvoiceDetailsChange("ifscCode", e.target.value)} placeholder="IFSC Code" />
              </div>
              <div>
                <Label>Mode of Transport</Label>
                <Input value={invoiceDetails.modeOfTransport || ""} onChange={(e) => handleInvoiceDetailsChange("modeOfTransport", e.target.value)} placeholder="Road" />
              </div>
              <div>
                <Label>Dispatched From</Label>
                <Input value={invoiceDetails.dispatchedFrom || ""} onChange={(e) => handleInvoiceDetailsChange("dispatchedFrom", e.target.value)} placeholder="Kopargaon" />
              </div>
              <div>
                <Label>Place of Supply</Label>
                <Input value={invoiceDetails.placeOfSupply || ""} onChange={(e) => handleInvoiceDetailsChange("placeOfSupply", e.target.value)} placeholder="Kopargaon" />
              </div>
            </div>
          )}

          <div className="overflow-x-hidden w-full mt-4 border-t pt-4">
            <div
              ref={invoiceRef}
              className="bg-white p-6 text-black border shadow-sm font-sans text-[11px]"
              style={{
                width: "100%",
                maxWidth: "210mm",
                margin: "0 auto",
                boxSizing: "border-box",
              }}
            >
              <div className="border-2 border-black p-3">
                {/* Header with Company Info */}
                <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-3">
                  <div>
                    <h1 className="text-lg font-bold">UNIQ PACK</h1>
                    <p className="text-[9px] font-semibold">TAX INVOICE</p>
                    <div className="mt-2 text-[9px] space-y-0.5">
                      <p><strong>Factory Address:</strong></p>
                      <p>Industrial Estate, Plot No.A-73, A/P. Shingnapur</p>
                      <p>Tal. Kopargaon, Dist. Ahmednagar 423 601</p>
                      <p><strong>Office Address:</strong></p>
                      <p>A/P. Karanji BK, Tal. Kopargaon, Dist. Ahmednagar 423 603</p>
                      <p>Mobile: 09423227355, 08329155152</p>
                    </div>
                  </div>
                  <div className="text-right text-[9px]">
                    <p><strong>Company's GSTIN:</strong> 27AGJPJ6286A1ZD</p>
                    <p><strong>Company's PAN:</strong> AGJPJ6286A</p>
                    <p><strong>Company's State Code:</strong> 27</p>
                  </div>
                </div>

                {/* Invoice Header Details */}
                <div className="grid grid-cols-3 gap-3 text-[9px] border-b-2 border-black pb-2 mb-2">
                  <div>
                    <p><strong>Invoice No:</strong> {invoiceDetails.invoiceNo || `UP/2025-26/${selectedOrderForInvoice?.id?.toString().padStart(4, "0")}`}</p>
                    <p><strong>Date:</strong> {selectedOrderForInvoice?.createdAt ? format(new Date(selectedOrderForInvoice.createdAt), "dd/MM/yyyy") : "N/A"}</p>
                  </div>
                  <div>
                    <p><strong>P.O.No:</strong> {invoiceDetails.poNo || "N/A"}</p>
                    <p><strong>DC No:</strong> {invoiceDetails.dcNo || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p><strong>E-Way Bill:</strong> {invoiceDetails.eWayBillNo || "N/A"}</p>
                    <p><strong>Mode:</strong> {invoiceDetails.modeOfTransport || "Road"}</p>
                  </div>
                </div>

                {/* Bill To Section */}
                <div className="border-b-2 border-black pb-2 mb-2 text-[9px]">
                  <p><strong>To:</strong></p>
                  <p><strong>Name:</strong> {selectedOrderForInvoice?.customer?.businessName || selectedOrderForInvoice?.customer?.name}</p>
                  <p>{selectedOrderForInvoice?.customer?.address}</p>
                  <p><strong>GST:</strong> {selectedOrderForInvoice?.customer?.gstin || "N/A"}</p>
                  <p><strong>Dispatched From:</strong> {invoiceDetails.dispatchedFrom || "Kopargaon"}</p>
                  <p><strong>Place of Supply:</strong> {invoiceDetails.placeOfSupply || "Kopargaon"}</p>
                </div>

                {/* Items Table */}
                <table className="w-full text-[9px] border-collapse mb-2">
                  <thead>
                    <tr className="border-b-2 border-black bg-gray-100">
                      <th className="border-r border-black p-1 text-center w-8">Sr.No</th>
                      <th className="border-r border-black p-1 text-center w-12">HSN Code</th>
                      <th className="border-r border-black p-1 text-left">Description</th>
                      <th className="border-r border-black p-1 text-center w-12">Qty</th>
                      <th className="border-r border-black p-1 text-center w-12">Unit</th>
                      <th className="border-r border-black p-1 text-right w-20">Rate</th>
                      <th className="border-r border-black p-1 text-right w-20">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderForInvoice?.items?.map((item: any, index: number) => {
                      const rate = Number(item.price);
                      const amount = rate * item.quantity;
                      return (
                        <tr key={index} className="border-b border-black">
                          <td className="border-r border-black p-1 text-center">{String(index + 1).padStart(2, "0")}</td>
                          <td className="border-r border-black p-1 text-center">{item.machine?.hsnCode || "8422"}</td>
                          <td className="border-r border-black p-1">{item.machine?.name}</td>
                          <td className="border-r border-black p-1 text-center">{item.quantity}</td>
                          <td className="border-r border-black p-1 text-center">No.</td>
                          <td className="border-r border-black p-1 text-right">{rate.toLocaleString("en-IN")}</td>
                          <td className="p-1 text-right">{amount.toLocaleString("en-IN")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Amounts Section */}
                <div className="grid grid-cols-2 gap-2 text-[9px] border-t-2 border-black pt-2">
                  <div>
                    <p><strong>BANK DETAILS FOR PAYMENT</strong></p>
                    <p><strong>Bank Name:</strong> {invoiceDetails.bankName || "Bank of Baroda"}</p>
                    <p><strong>Branch:</strong> {invoiceDetails.bankBranch || "Kopargaon"}</p>
                    <p><strong>Account No:</strong> {invoiceDetails.accountNo || "N/A"}</p>
                    <p><strong>IFSC Code:</strong> {invoiceDetails.ifscCode || "N/A"}</p>
                  </div>
                  <div className="border-2 border-black">
                    <div className="flex justify-between p-1 border-b border-black">
                      <span>Sub Total</span>
                      <span>₹{Number(selectedOrderForInvoice?.totalAmount || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-black">
                      <span>Discount @{invoiceDetails.discountPercent || "0"}%</span>
                      <span>₹0</span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-black">
                      <span>CGST @ 9%</span>
                      <span>₹{(Number(selectedOrderForInvoice?.totalAmount || 0) * 0.09).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-black">
                      <span>SGST @ 9%</span>
                      <span>₹{(Number(selectedOrderForInvoice?.totalAmount || 0) * 0.09).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between p-1 font-bold bg-gray-100">
                      <span>TOTAL AMOUNT</span>
                      <span>₹{(Number(selectedOrderForInvoice?.totalAmount || 0) * 1.18).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="mt-3 text-[8px] border-t-2 border-black pt-2">
                  <p><strong>Terms & Conditions:</strong></p>
                  <ol className="list-decimal list-inside space-y-0">
                    <li>Goods once sold will not be taken back</li>
                    <li>Warranty: One year from installation date</li>
                    <li>Subject to Kopargaon jurisdiction</li>
                    <li>Payment: 50% advance, 40% on dispatch, 10% on installation</li>
                  </ol>
                </div>

                {/* Signature */}
                <div className="flex justify-between items-end mt-6 text-[9px]">
                  <div className="text-center">
                    <div className="border-t border-black w-32"></div>
                    <p>Customer Signature</p>
                  </div>
                  <div className="text-right">
                    <p><strong>For UNIQ PACK</strong></p>
                    <div className="h-8"></div>
                    <p>Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            {isInvoiceEditMode ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsInvoiceEditMode(false);
                  setInvoiceDetails({});
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveInvoiceDetails} 
                  disabled={updateOrderDetails.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {updateOrderDetails.isPending ? "Saving..." : "Save Details"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setSelectedOrderForInvoice(null);
                  setInvoiceDetails({});
                  setIsInvoiceEditMode(false);
                }}>
                  Close
                </Button>
                <Button onClick={downloadInvoice} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}