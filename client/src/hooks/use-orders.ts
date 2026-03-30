import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type CreateOrderInput = z.infer<typeof api.orders.create.input>;

export function useOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const ordersQuery = useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
  });

  const createOrder = useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create order");
      }
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.machines.list.path] }); // Inventory changes
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] }); // Stats change
      toast({ title: "Order Created", description: "The order has been processed successfully." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Order Failed", description: error.message });
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ orderId, amountPaid }: { orderId: number; amountPaid: string }) => {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaid }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update payment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      toast({ title: "Payment Updated", description: "Payment has been recorded successfully." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Payment Failed", description: error.message });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to delete order");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.machines.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      toast({ title: "Order Deleted", description: "The order has been deleted successfully." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Delete Failed", description: error.message });
    },
  });

  const updateDeliveryStatus = useMutation({
    mutationFn: async ({ orderId, deliveryStatus }: { orderId: number; deliveryStatus: string }) => {
      const res = await fetch(`/api/orders/${orderId}/delivery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update delivery status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "Delivery Updated", description: "Delivery status has been updated successfully." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    },
  });

  const updateOrderDetails = useMutation({
    mutationFn: async ({ orderId, details }: { orderId: number; details: any }) => {
      const res = await fetch(`/api/orders/${orderId}/details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update order details");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "Details Saved", description: "Invoice details have been saved successfully." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Save Failed", description: error.message });
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    createOrder,
    updatePayment,
    updateDeliveryStatus,
    updateOrderDetails,
    deleteOrder,
  };
}
