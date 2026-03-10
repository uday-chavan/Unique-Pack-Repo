import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMachineSchema, type InsertMachine } from "@shared/schema";
import { z } from "zod";
import { useState, useRef } from "react";
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
import { useSuppliers } from "@/hooks/use-crm";
import { Upload, X } from "lucide-react";

// Fix coercion for number fields - use string for decimal fields
const formSchema = insertMachineSchema.omit({
  purchasePrice: true,
  sellingPrice: true,
}).extend({
  price: z.union([z.coerce.string(), z.number()]),
  quantity: z.union([z.coerce.number(), z.number()]),
  warrantyMonths: z.union([z.coerce.number(), z.number()]).optional().nullable(),
  supplierId: z.union([z.coerce.number(), z.number()]).optional().nullable(),
});

interface MachineFormProps {
  onSubmit: (data: InsertMachine) => void;
  isLoading?: boolean;
  defaultValues?: Partial<InsertMachine>;
}

export function MachineForm({ onSubmit, isLoading, defaultValues }: MachineFormProps) {
  const { suppliers } = useSuppliers();
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues?.imageUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      category: "",
      brand: "",
      model: "",
      serialNumber: "",
      price: "0",
      quantity: 0,
      location: "",
      condition: "new",
      warrantyMonths: 12,
      imageUrl: "",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      const { imageUrl } = await res.json();
      form.setValue("imageUrl", imageUrl);
      setImagePreview(imageUrl);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    form.setValue("imageUrl", "");
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Clean empty numeric values before submitting
  const handleFormSubmit = (data: any) => {
    const cleanedData = { ...data };
    
    // Map single price field to both purchasePrice and sellingPrice
    if (!cleanedData.price || cleanedData.price === '') {
      cleanedData.purchasePrice = "0";
      cleanedData.sellingPrice = "0";
    } else {
      // Use single price for both purchase and selling
      cleanedData.purchasePrice = cleanedData.price;
      cleanedData.sellingPrice = cleanedData.price;
    }
    
    delete cleanedData.price; // Remove the temporary field
    
    if (!cleanedData.quantity || cleanedData.quantity === '') {
      cleanedData.quantity = 0;
    }
    if (cleanedData.warrantyMonths === '' || cleanedData.warrantyMonths === null) {
      delete cleanedData.warrantyMonths;
    }
    
    onSubmit(cleanedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="CNC Lathe X200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select or type category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Packaging Machine">Packaging Machine</SelectItem>
                    <SelectItem value="Lathe">Lathe</SelectItem>
                    <SelectItem value="Drill">Drill</SelectItem>
                    <SelectItem value="CNC">CNC</SelectItem>
                    <SelectItem value="spare part">Spare Part</SelectItem>
                    <SelectItem value="spare parts">Spare Parts</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                    <SelectItem value="component">Component</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Brand name" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="Model number" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Item price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Stock quantity" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Select 
                  onValueChange={(val) => field.onChange(Number(val))} 
                  defaultValue={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
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
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'new'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Machine Image</FormLabel>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 bg-slate-100 rounded-md flex items-center justify-center border-2 border-dashed border-slate-300">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
            )}
            <div className="flex-1">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {uploading ? "Uploading..." : "JPG, PNG, GIF, WebP (max 5MB)"}
              </p>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Item"}
        </Button>
      </form>
    </Form>
  );
}
