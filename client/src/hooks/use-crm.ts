import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertCustomer, type InsertSupplier } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCustomers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const customersQuery = useQuery({
    queryKey: [api.customers.list.path],
    queryFn: async () => {
      const res = await fetch(api.customers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch customers");
      return api.customers.list.responses[200].parse(await res.json());
    },
  });

  const createCustomer = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const res = await fetch(api.customers.create.path, {
        method: api.customers.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create customer");
      return api.customers.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.customers.list.path] });
      toast({ title: "Success", description: "Customer added successfully" });
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete customer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.customers.list.path] });
      toast({ title: "Success", description: "Customer removed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove customer", variant: "destructive" });
    },
  });

  return {
    customers: customersQuery.data || [],
    isLoading: customersQuery.isLoading,
    createCustomer,
    deleteCustomer,
  };
}

export function useSuppliers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const suppliersQuery = useQuery({
    queryKey: [api.suppliers.list.path],
    queryFn: async () => {
      const res = await fetch(api.suppliers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      return api.suppliers.list.responses[200].parse(await res.json());
    },
  });

  const createSupplier = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      const res = await fetch(api.suppliers.create.path, {
        method: api.suppliers.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create supplier");
      return api.suppliers.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.suppliers.list.path] });
      toast({ title: "Success", description: "Supplier added successfully" });
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete supplier");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.suppliers.list.path] });
      toast({ title: "Success", description: "Supplier removed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove supplier", variant: "destructive" });
    },
  });

  return {
    suppliers: suppliersQuery.data || [],
    isLoading: suppliersQuery.isLoading,
    createSupplier,
    deleteSupplier,
  };
}
