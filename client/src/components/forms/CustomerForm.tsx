import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, type InsertCustomer, type Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, AlertCircle } from "lucide-react";

interface CustomerFormProps {
  onSubmit: (data: InsertCustomer) => void;
  isLoading?: boolean;
  defaultValues?: Partial<InsertCustomer>;
  allCustomers?: Customer[];
  editingId?: number; // id of customer being edited (undefined when creating)
}

export function CustomerForm({
  onSubmit,
  isLoading,
  defaultValues,
  allCustomers = [],
  editingId,
}: CustomerFormProps) {
  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      businessName: "",
      phone: "",
      email: "",
      address: "",
      taxId: "",
      gstin: "",
      ...defaultValues,
    },
  });

  const gstinValue = form.watch("gstin");
  const businessNameValue = form.watch("businessName");

  // Check for GSTIN conflict in real time
  const getGstinConflict = (): Customer | null => {
    const gstin = (gstinValue ?? "").trim().toUpperCase();
    if (!gstin || gstin.length < 15) return null;

    const normalizedBusiness = (businessNameValue ?? "").trim().toLowerCase();

    return allCustomers.find((c) => {
      if (c.id === editingId) return false; // skip self when editing
      if (!c.gstin) return false;
      if (c.gstin.toUpperCase() !== gstin) return false;
      // Same GSTIN — only conflict if business name is different
      const otherBusiness = (c.businessName ?? "").trim().toLowerCase();
      // If the incoming form doesn't have a business name, or the other doesn't, OR they differ
      if (!otherBusiness && !normalizedBusiness) return true; // Two individuals, same GSTIN => conflict
      if (!otherBusiness || !normalizedBusiness) return true; // One has business, one doesn't => conflict
      return otherBusiness !== normalizedBusiness; // Different business names => conflict
    }) ?? null;
  };

  const gstinConflict = getGstinConflict();

  const handleSubmit = (data: InsertCustomer) => {
    // Block submission if GSTIN conflict exists
    if (gstinConflict) return;
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} data-testid="input-customer-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Company name"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-customer-business"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-customer-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+91 XXXXX XXXXX"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-customer-phone"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="Full address"
                  {...field}
                  value={field.value || ""}
                  data-testid="input-customer-address"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tax ID"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-customer-taxid"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gstin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GSTIN</FormLabel>
                <FormControl>
                  <Input
                    placeholder="24AAAAA0000A1Z5"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/gi, "").slice(0, 15)
                      );
                    }}
                    maxLength={15}
                    className={
                      gstinConflict
                        ? "border-red-400 focus-visible:ring-red-300 font-mono text-sm"
                        : "font-mono text-sm"
                    }
                    data-testid="input-customer-gstin"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* GSTIN conflict error banner */}
        {gstinConflict && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex gap-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold text-red-700 mb-0.5">GSTIN Already Registered</p>
              <p className="text-red-600 text-xs">
                This GSTIN is already registered to{" "}
                <span className="font-semibold">
                  {gstinConflict.businessName || gstinConflict.name}
                </span>
                . Please check your GSTIN or set the same business name if they belong to the same company.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isLoading || !!gstinConflict}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            data-testid="button-save-customer"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Customer
          </Button>
        </div>
      </form>
    </Form>
  );
}