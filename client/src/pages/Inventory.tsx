import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useMachines } from "@/hooks/use-machines";
import { useOrders } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MachineForm } from "@/components/forms/MachineForm";
import { SparePartsStockChart } from "@/components/charts/SparePartsStockChart";
import { MachinesOrdersChart } from "@/components/charts/MachinesOrdersChart";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Filter, Package, Cog, Wrench } from "lucide-react";
import { type InsertMachine } from "@shared/schema";
import { motion } from "framer-motion";

const SPARE_PARTS_CATEGORIES = ["spare part", "spare parts", "spares", "part", "parts", "spear part", "spear parts"];


/* ---------- Floating Orb ---------- */

function FloatingOrb({ x, y, size, color, duration }: {
  x: string; y: string; size: number; color: string; duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: color,
        filter: "blur(60px)",
        opacity: 0.12,
      }}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -25, 15, -10, 0],
        scale: [1, 1.12, 0.95, 1.05, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}


export default function Inventory() {
  const { machines, isLoading, createMachine, deleteMachine, updateMachine } = useMachines();
  const { orders } = useOrders();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"machineries" | "spare-parts">("machineries");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const isSparePart = (machine: typeof machines[0]) => {
    const categoryLower = machine.category.toLowerCase();
    return SPARE_PARTS_CATEGORIES.includes(categoryLower) ||
           /spear|spare|part|accessory|component|bolt|bearing|screw|component/.test(categoryLower);
  };

  const tabFilteredMachines = machines.filter((m) =>
    activeTab === "spare-parts" ? isSparePart(m) : !isSparePart(m)
  );

  const filteredMachines = tabFilteredMachines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase()) ||
    m.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: InsertMachine) => {
    try {
      await createMachine.mutateAsync(data);
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Failed to create machine:", error);
    }
  };

  const handleUpdate = async (data: InsertMachine) => {
    if (editingMachine) {
      try {
        await updateMachine.mutateAsync({ id: editingMachine, ...data });
        setEditingMachine(null);
      } catch (error) {
        console.error("Failed to update machine:", error);
      }
    }
  };

  const showChart =
    (activeTab === "machineries" && machines.filter(m => !isSparePart(m)).length > 0) ||
    (activeTab === "spare-parts" && machines.filter(m => isSparePart(m)).length > 0);

  return (
    <Shell>
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingOrb x="5%"  y="10%" size={420} color="#1e40af" duration={14} />
        <FloatingOrb x="70%" y="5%"  size={300} color="#1e3a5f" duration={18} />
        <FloatingOrb x="60%" y="60%" size={360} color="#0f4c75" duration={16} />
        <FloatingOrb x="15%" y="70%" size={280} color="#1a365d" duration={20} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Inventory</h2>
            <p className="text-muted-foreground mt-1">Manage machines and stock levels.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/10">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Machine / Item</DialogTitle>
                <DialogDescription>
                  Enter the details of the new machine OR item to add to inventory.
                </DialogDescription>
              </DialogHeader>
              <MachineForm onSubmit={handleCreate} isLoading={createMachine.isPending} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2 mb-4 bg-white p-2 rounded-lg border shadow-sm">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <Input
            placeholder="Search by name, brand, category..."
            className="border-none focus-visible:ring-0 shadow-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="ghost" size="icon">
            <Filter className="w-4 h-4 text-slate-500" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-1 mb-6 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => { setActiveTab("machineries"); setSearch(""); }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${activeTab === "machineries"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/60"
              }
            `}
          >
            <Cog className="w-4 h-4" />
            Machineries
            <span className={`
              ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold
              ${activeTab === "machineries" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"}
            `}>
              {machines.filter(m => !isSparePart(m)).length}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab("spare-parts"); setSearch(""); }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${activeTab === "spare-parts"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/60"
              }
            `}
          >
            <Wrench className="w-4 h-4" />
            Spare Parts
            <span className={`
              ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold
              ${activeTab === "spare-parts" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"}
            `}>
              {machines.filter(m => isSparePart(m)).length}
            </span>
          </button>
        </div>

        {/* Layout: Table + Chart */}
        <div className="flex gap-4 items-start max-h-[calc(100vh-300px)]">

          {/* Table */}
          <div className="flex-1 min-w-0 overflow-y-auto max-h-[calc(100vh-300px)]">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-slate-200">
                    <TableHead className="font-semibold text-slate-700 w-[80px]">Image</TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      {activeTab === "machineries" ? "Machine Name" : "Part Name"}
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Category</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Stock</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Price</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <>
                      {[...Array(6)].map((_, idx) => (
                        <TableRow key={`skeleton-${idx}`} className="border-b border-slate-200">
                          <TableCell className="p-4"><Skeleton className="h-12 w-12 rounded" /></TableCell>
                          <TableCell className="p-4"><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell className="p-4"><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell className="p-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                          <TableCell className="p-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          <TableCell className="p-4"><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell className="p-4"><Skeleton className="h-6 w-6" /></TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : filteredMachines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          {activeTab === "machineries"
                            ? <Package className="w-8 h-8 mb-2 opacity-20" />
                            : <Wrench className="w-8 h-8 mb-2 opacity-20" />
                          }
                          <p>No {activeTab === "machineries" ? "machines" : "spare parts"} found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMachines.map((machine) => (
                      <TableRow
                        key={machine.id}
                        className="group hover:bg-slate-50/50 transition-colors"
                        onMouseEnter={() => setHoveredRow(machine.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <TableCell className="relative overflow-visible">
                          <div className={`transition-all duration-300 ease-out ${hoveredRow === machine.id ? 'scale-110 z-10 relative' : 'scale-100'}`}>
                            {machine.imageUrl ? (
                              <img
                                src={machine.imageUrl}
                                alt={machine.name}
                                className={`w-16 h-12 object-cover rounded-md border transition-all duration-300 ease-out ${hoveredRow === machine.id ? 'shadow-md border-blue-300' : 'shadow-sm'}`}
                              />
                            ) : (
                              <div className={`w-16 h-12 bg-slate-100 rounded-md flex items-center justify-center transition-all duration-300 ease-out ${hoveredRow === machine.id ? 'shadow-md' : ''}`}>
                                <Package className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={`font-medium text-slate-900 max-w-[300px] transition-all duration-300 ease-out ${hoveredRow === machine.id ? 'translate-x-1' : 'translate-x-0'}`}>
                          <div className="truncate" title={machine.name}>{machine.name}</div>
                        </TableCell>
                        <TableCell className={`transition-all duration-300 ease-out ${hoveredRow === machine.id ? 'translate-x-1' : 'translate-x-0'}`}>
                          <Badge variant="outline" className="text-slate-500 font-normal">{machine.category}</Badge>
                        </TableCell>
                        <TableCell className={`text-right font-mono text-slate-600 transition-all duration-300 ease-out ${hoveredRow === machine.id ? 'translate-x-1' : 'translate-x-0'}`}>
                          {machine.quantity}
                        </TableCell>
                        <TableCell className={`text-right font-mono font-medium text-slate-900 transition-all duration-300 ease-out ${hoveredRow === machine.id ? 'translate-x-1' : 'translate-x-0'}`}>
                          ₹{Number(machine.sellingPrice).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className={`transition-all duration-300 ease-out ${hoveredRow === machine.id ? 'translate-x-1' : 'translate-x-0'}`}>
                          {machine.quantity < 3 ? (
                            <Badge variant="destructive" className="font-normal text-xs uppercase tracking-wide">Low Stock</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-normal text-xs uppercase tracking-wide">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell className={`transition-all duration-300 ease-out ${hoveredRow === machine.id ? 'translate-x-1' : 'translate-x-0'}`}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Dialog open={editingMachine === machine.id} onOpenChange={(open) => !open && setEditingMachine(null)}>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditingMachine(machine.id); }}>
                                    <Pencil className="w-4 h-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle>Edit Machine</DialogTitle>
                                  </DialogHeader>
                                  <MachineForm
                                    onSubmit={handleUpdate}
                                    isLoading={updateMachine.isPending}
                                    defaultValues={{
                                      ...machine,
                                      price: machine.sellingPrice,
                                      quantity: machine.quantity ? Number(machine.quantity) : 0,
                                      supplierId: machine.supplierId || undefined
                                    }}
                                  />
                                </DialogContent>
                              </Dialog>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => deleteMachine.mutate(machine.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
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
          </div>

          {/* Chart sidebar */}
          {showChart && (
            <div className="w-80 flex-shrink-0 overflow-y-auto max-h-[calc(100vh-300px)]">
              <div className="rounded-xl border bg-card shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-4 text-sm">
                  {activeTab === "machineries" ? "Order Status" : "Stock Distribution"}
                </h3>
                {activeTab === "machineries" ? (
                  <MachinesOrdersChart machines={machines.filter(m => !isSparePart(m))} orders={orders} />
                ) : (
                  <SparePartsStockChart spareParts={machines.filter(m => isSparePart(m))} lowStockThreshold={5} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}