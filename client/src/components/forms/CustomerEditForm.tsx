import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  Save,
  X,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { type Customer, type InsertCustomer } from "@shared/schema";

interface CustomerEditFormProps {
  customer: Customer | null;
  allCustomers: Customer[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertCustomer) => Promise<void>;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  address: string;
  taxId: string;
  gstin: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  gstin?: string;
}

function Field({
  icon: Icon,
  label,
  error,
  children,
}: {
  icon: React.ElementType;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
      <span className="w-4 h-px bg-slate-200 inline-block" />
      {children}
      <span className="flex-1 h-px bg-slate-200 inline-block" />
    </h3>
  );
}

export function CustomerEditForm({
  customer,
  allCustomers,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CustomerEditFormProps) {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    address: "",
    taxId: "",
    gstin: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        businessName: customer.businessName ?? "",
        address: customer.address ?? "",
        taxId: customer.taxId ?? "",
        gstin: customer.gstin ?? "",
      });
      setErrors({});
    }
  }, [customer]);

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "gstin"
          ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
          : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof FormErrors])
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validateGstin = (gstin: string): string | undefined => {
    if (!gstin) return undefined;

    const gstinRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(gstin)) {
      return "Invalid GSTIN format (e.g. 24AAAAA0000A1Z5)";
    }

    // Allow same GSTIN only if businessName matches (same corporation, different contact person)
    const normalizedBusiness = form.businessName.trim().toLowerCase();
    const conflict = allCustomers.find((c) => {
      if (c.id === customer?.id) return false;
      if (!c.gstin) return false;
      if (c.gstin.toUpperCase() !== gstin) return false;
      const otherBusiness = (c.businessName ?? "").trim().toLowerCase();
      return otherBusiness !== normalizedBusiness;
    });

    if (conflict) {
      return `Already registered to "${conflict.businessName || conflict.name}". Use a different GSTIN, or set the same business name if they belong to the same company.`;
    }

    return undefined;
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email address";
    const gstinError = validateGstin(form.gstin.trim());
    if (gstinError) e.gstin = gstinError;
    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    await onSubmit({
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      businessName: form.businessName.trim() || null,
      address: form.address.trim() || null,
      taxId: form.taxId.trim() || null,
      gstin: form.gstin.trim() || null,
    });
  };

  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const inputCls = (hasError?: boolean) =>
    `h-10 ${
      hasError
        ? "border-red-400 focus-visible:ring-red-300"
        : "border-slate-200 focus-visible:ring-blue-200"
    }`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Header */}
        <div
          className="relative px-8 pt-7 pb-6"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 60%, #3b82f6 0%, transparent 45%), radial-gradient(circle at 85% 20%, #6366f1 0%, transparent 40%)",
            }}
          />
          <DialogHeader className="relative">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-white/20 shrink-0">
                <AvatarFallback className="bg-blue-500 text-white text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold text-white truncate">
                  {form.name || "Edit Customer"}
                </DialogTitle>
                <p className="text-slate-400 text-sm mt-0.5 truncate">
                  {form.businessName || "Update customer details below"}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6 max-h-[62vh] overflow-y-auto bg-white">
          {/* Personal Info */}
          <section className="space-y-4">
            <SectionHeading>Personal Information</SectionHeading>
            <Field icon={User} label="Full Name" error={errors.name}>
              <Input
                value={form.name}
                onChange={set("name")}
                placeholder="John Smith"
                className={inputCls(!!errors.name)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field icon={Mail} label="Email Address" error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="john@company.com"
                  className={inputCls(!!errors.email)}
                />
              </Field>
              <Field icon={Phone} label="Phone Number">
                <Input
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+91 98765 43210"
                  className={inputCls()}
                />
              </Field>
            </div>
          </section>

          <Separator className="bg-slate-100" />

          {/* Business Details */}
          <section className="space-y-4">
            <SectionHeading>Business Details</SectionHeading>
            <Field icon={Building2} label="Business / Company Name">
              <Input
                value={form.businessName}
                onChange={set("businessName")}
                placeholder="Acme Corp"
                className={inputCls()}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field icon={Hash} label="Tax ID">
                <Input
                  value={form.taxId}
                  onChange={set("taxId")}
                  placeholder="07JKLMN3456F1Z8"
                  className={`${inputCls()} font-mono text-sm`}
                />
              </Field>
              <Field icon={Receipt} label="GSTIN" error={errors.gstin}>
                <Input
                  value={form.gstin}
                  onChange={set("gstin")}
                  placeholder="24AAAAA0000A1Z5"
                  className={`${inputCls(!!errors.gstin)} font-mono text-sm`}
                  maxLength={15}
                />
              </Field>
            </div>

            {/* GSTIN conflict warning banner */}
            {errors.gstin && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex gap-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <div>
                  <p className="font-semibold text-red-700 mb-0.5">GSTIN Already in Use</p>
                  <p className="text-red-600 text-xs">{errors.gstin}</p>
                </div>
              </div>
            )}
          </section>

          <Separator className="bg-slate-100" />

          {/* Address */}
          <section className="space-y-4">
            <SectionHeading>Address</SectionHeading>
            <Field icon={MapPin} label="Full Address">
              <Input
                value={form.address}
                onChange={set("address")}
                placeholder="123 Main Street, City, State"
                className={inputCls()}
              />
            </Field>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-4 h-4 mr-1.5" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/15 px-6"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isLoading ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}