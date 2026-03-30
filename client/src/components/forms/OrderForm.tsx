import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MachineForm } from "@/components/forms/MachineForm";
import { useCustomers } from "@/hooks/use-crm";
import { useMachines } from "@/hooks/use-machines";
import { Trash2, Plus, PackagePlus } from "lucide-react";
import { useState } from "react";

// Same spare parts detection logic as Inventory.tsx
const SPARE_PARTS_CATEGORIES = [
  "spare part", "spare parts", "spares", "part", "parts", "spear part", "spear parts",
];

function isSparePart(category: string): boolean {
  const lower = category.toLowerCase();
  return (
    SPARE_PARTS_CATEGORIES.includes(lower) ||
    /spear|spare|part|accessory|component|bolt|bearing|screw/.test(lower)
  );
}

// Matches API input requirement
const createOrderSchema = z.object({
  customerId: z.coerce.number().min(1, "Customer is required"),
  poNo: z.string().optional(),
  poDate: z.string().optional(),
  cgstPercent: z.coerce.number().min(0).default(9.0),
  sgstPercent: z.coerce.number().min(0).default(9.0),
  items: z
    .array(
      z.object({
        machineId: z.coerce.number().min(1, "Machine is required"),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),
});

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

interface OrderFormProps {
  onSubmit: (data: CreateOrderFormValues) => void;
  isLoading?: boolean;
}

export function OrderForm({ onSubmit, isLoading }: OrderFormProps) {
  const { customers } = useCustomers();
  const { machines, createMachine } = useMachines();
  const [stockError, setStockError] = useState<string | null>(null);
  const [addItemOpen, setAddItemOpen] = useState(false);

  // Only show actual machines — exclude spare parts
  const orderableMachines = machines.filter((m) => !isSparePart(m.category));

  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      items: [{ machineId: 0, quantity: 1 }],
      cgstPercent: 9.0,
      sgstPercent: 9.0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const calculateSubtotal = () => {
    return watchedItems.reduce((acc, item) => {
      const machine = orderableMachines.find((m) => m.id === Number(item.machineId));
      return acc + (machine ? Number(machine.sellingPrice) * item.quantity : 0);
    }, 0);
  };

  const cgstPercent = form.watch("cgstPercent");
  const sgstPercent = form.watch("sgstPercent");

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const gstMultiplier = 1 + (Number(cgstPercent || 0) + Number(sgstPercent || 0)) / 100;
    return subtotal * gstMultiplier;
  };

  const handleFormSubmit = (data: CreateOrderFormValues) => {
    for (const item of data.items) {
      const machine = orderableMachines.find((m) => m.id === Number(item.machineId));
      if (machine && item.quantity > machine.quantity) {
        setStockError(
          `Insufficient quantity for ${machine.name}. Only ${machine.quantity} available.`
        );
        return;
      }
    }
    onSubmit(data);
  };



  const handleAddNewMachine = async (data: any) => {
    try {
      await createMachine.mutateAsync(data);
      setAddItemOpen(false);
    } catch {
      // error toast handled inside useMachines
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} {c.businessName ? `(${c.businessName})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="poNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PO Number</FormLabel>
                  <FormControl>
                    <Input placeholder="PO/XXX/202X/XXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="poDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PO Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cgstPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CGST %</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sgstPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SGST %</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Order Items</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ machineId: 0, quantity: 1 })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex gap-4 items-end bg-muted/20 p-4 rounded-lg border"
              >
                <FormField
                  control={form.control}
                  name={`items.${index}.machineId`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">Machine</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select machine" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Add new item shortcut at the top */}
                          <div className="flex items-center justify-end px-2 py-1 border-b border-border/60">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setAddItemOpen(true);
                              }}
                              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                              <PackagePlus className="w-3 h-3" />
                              Add new item
                            </button>
                          </div>

                          {orderableMachines.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-center text-muted-foreground">
                              No machines available
                            </div>
                          ) : (
                            orderableMachines.map((m) => (
                              <SelectItem
                                key={m.id}
                                value={String(m.id)}
                                disabled={m.quantity < 1}
                              >
                                {m.name} — ₹{Number(m.sellingPrice).toLocaleString("en-IN")}{" "}
                                (Qty: {m.quantity})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormLabel className="text-xs">Qty</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-col border-t pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">
                ₹{calculateSubtotal().toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-muted-foreground">Estimated Total (incl. GST):</span>
                <span className="ml-2 text-lg font-bold text-primary">
                  ₹{calculateTotal().toLocaleString("en-IN")}
                </span>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Stock error dialog */}
      <AlertDialog open={!!stockError} onOpenChange={() => setStockError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Quantity</AlertDialogTitle>
            <AlertDialogDescription>{stockError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setStockError(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add new machine dialog */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
          </DialogHeader>
          <MachineForm
            onSubmit={handleAddNewMachine}
            isLoading={createMachine.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}