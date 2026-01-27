import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertMachine } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useMachines() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const machinesQuery = useQuery({
    queryKey: [api.machines.list.path],
    queryFn: async () => {
      const res = await fetch(api.machines.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch machines");
      return api.machines.list.responses[200].parse(await res.json());
    },
  });

  const createMachine = useMutation({
    mutationFn: async (data: InsertMachine) => {
      const res = await fetch(api.machines.create.path, {
        method: api.machines.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create machine");
      }
      return api.machines.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.machines.list.path] });
      toast({ title: "Success", description: "Machine added to inventory" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateMachine = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertMachine>) => {
      const url = buildUrl(api.machines.update.path, { id });
      const res = await fetch(url, {
        method: api.machines.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update machine");
      return api.machines.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.machines.list.path] });
      toast({ title: "Success", description: "Machine updated successfully" });
    },
  });

  const deleteMachine = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.machines.delete.path, { id });
      const res = await fetch(url, {
        method: api.machines.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete machine");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.machines.list.path] });
      toast({ title: "Success", description: "Machine removed from inventory" });
    },
  });

  return {
    machines: machinesQuery.data || [],
    isLoading: machinesQuery.isLoading,
    createMachine,
    updateMachine,
    deleteMachine,
  };
}
