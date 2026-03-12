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
  Save,
  X,
  AlertCircle,
  Truck
} from "lucide-react";
import { type Supplier, type InsertSupplier } from "@shared/schema";

interface SupplierEditFormProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertSupplier) => Promise<void>;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
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

export function SupplierEditForm({
  supplier,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: SupplierEditFormProps) {
  const [form, setForm] = useState<FormData>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name ?? "",
        contactPerson: supplier.contactPerson ?? "",
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        address: supplier.address ?? "",
        active: supplier.active ?? true,
      });
      setErrors({});
    }
  }, [supplier]);

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof FormErrors])
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Supplier Name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email address";
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
      contactPerson: form.contactPerson.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      active: form.active,
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
                  {form.name || "Edit Supplier"}
                </DialogTitle>
                <p className="text-slate-400 text-sm mt-0.5 truncate">
                  {form.contactPerson ? `Contact: ${form.contactPerson}` : "Update supplier details below"}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6 max-h-[62vh] overflow-y-auto bg-white">
          <section className="space-y-4">
            <SectionHeading>Company Details</SectionHeading>
            <Field icon={Building2} label="Supplier Name" error={errors.name}>
              <Input
                value={form.name}
                onChange={set("name")}
                placeholder="Acme Supplies"
                className={inputCls(!!errors.name)}
              />
            </Field>
          </section>

          <Separator className="bg-slate-100" />

          {/* Contact Info */}
          <section className="space-y-4">
            <SectionHeading>Contact Information</SectionHeading>
            <Field icon={User} label="Contact Person">
              <Input
                value={form.contactPerson}
                onChange={set("contactPerson")}
                placeholder="John Smith"
                className={inputCls()}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field icon={Mail} label="Email Address" error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="john@example.com"
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

          {/* Location */}
          <section className="space-y-4">
            <SectionHeading>Location & Logistics</SectionHeading>
            <Field icon={MapPin} label="Full Address">
              <Input
                value={form.address}
                onChange={set("address")}
                placeholder="123 Industrial Park, City, State"
                className={inputCls()}
              />
            </Field>
            
            <div className="flex items-center gap-2 mt-4">
               <input
                 type="checkbox"
                 id="active-supplier"
                 checked={form.active}
                 onChange={set("active")}
                 className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
               />
               <label htmlFor="active-supplier" className="text-sm text-slate-700">
                 Active Supplier
               </label>
            </div>

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
