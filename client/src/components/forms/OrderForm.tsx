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
import { useCustomers } from "@/hooks/use-crm";
import { useMachines } from "@/hooks/use-machines";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";

// Matches API input requirement
const createOrderSchema = z.object({
  customerId: z.coerce.number().min(1, "Customer is required"),
  items: z.array(z.object({
    machineId: z.coerce.number().min(1, "Machine is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  })).min(1, "At least one item is required"),
});

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

interface OrderFormProps {
  onSubmit: (data: CreateOrderFormValues) => void;
  isLoading?: boolean;
}

export function OrderForm({ onSubmit, isLoading }: OrderFormProps) {
  const { customers } = useCustomers();
  const { machines } = useMachines();
  const [stockError, setStockError] = useState<string | null>(null);

  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      items: [{ machineId: 0, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Calculate rough total for preview
  const watchedItems = form.watch("items");
  const calculateTotal = () => {
    return watchedItems.reduce((acc, item) => {
      const machine = machines.find(m => m.id === Number(item.machineId));
      return acc + (machine ? Number(machine.sellingPrice) * item.quantity : 0);
    }, 0);
  };

  const handleFormSubmit = (data: CreateOrderFormValues) => {
    // Check stock for each item
    for (const item of data.items) {
      const machine = machines.find(m => m.id === Number(item.machineId));
      if (machine && item.quantity > machine.quantity) {
        setStockError(`Insufficient quantity for ${machine.name}. Only ${machine.quantity} available.`);
        return;
      }
    }
    onSubmit(data);
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
                        {c.name} {c.businessName ? `(${c.businessName})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
              <div key={field.id} className="flex gap-4 items-end bg-muted/20 p-4 rounded-lg border">
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
                          {machines.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)} disabled={m.quantity < 1}>
                              {m.name} - ₹{Number(m.sellingPrice).toLocaleString('en-IN')} (Qty: {m.quantity})
                            </SelectItem>
                          ))}
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
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                        />
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

          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Estimated Total:</span>
              <span className="ml-2 text-lg font-bold text-primary">
                ₹{calculateTotal().toLocaleString('en-IN')}
              </span>
            </div>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={!!stockError} onOpenChange={() => setStockError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Quantity</AlertDialogTitle>
            <AlertDialogDescription>
              {stockError}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setStockError(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

