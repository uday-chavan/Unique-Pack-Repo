import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useMachines } from "@/hooks/use-machines";
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
import { MachineForm } from "@/components/forms/MachineForm";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Filter, Package } from "lucide-react";
import { type InsertMachine } from "@shared/schema";

export default function Inventory() {
  const { machines, isLoading, createMachine, deleteMachine, updateMachine } = useMachines();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const filteredMachines = machines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.category.toLowerCase().includes(search.toLowerCase()) ||
    m.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: InsertMachine) => {
    await createMachine.mutateAsync(data);
    setIsCreateOpen(false);
  };

  const handleUpdate = async (data: InsertMachine) => {
    if (editingMachine) {
      await updateMachine.mutateAsync({ id: editingMachine, ...data });
      setEditingMachine(null);
    }
  };

  return (
    <Shell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Inventory</h2>
          <p className="text-muted-foreground mt-1">Manage machines and stock levels.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/10">
              <Plus className="w-4 h-4 mr-2" />
              Add Machine
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Machine</DialogTitle>
              <DialogDescription>
                Enter the details of the new machine to add to inventory.
              </DialogDescription>
            </DialogHeader>
            <MachineForm onSubmit={handleCreate} isLoading={createMachine.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 mb-6 bg-white p-2 rounded-lg border shadow-sm">
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

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-slate-200">
              <TableHead className="font-semibold text-slate-700 w-[80px]">Image</TableHead>
              <TableHead className="font-semibold text-slate-700">Machine Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Category</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Stock</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Price</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Loading inventory...
                </TableCell>
              </TableRow>
            ) : filteredMachines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="w-8 h-8 mb-2 opacity-20" />
                    <p>No machines found</p>
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
                    <div className={`
                      transition-all duration-300 ease-out
                      ${hoveredRow === machine.id ? 'scale-110 z-10 relative' : 'scale-100'}
                    `}>
                      {machine.imageUrl ? (
                        <img 
                          src={machine.imageUrl} 
                          alt={machine.name} 
                          className={`
                            w-16 h-12 object-cover rounded-md border
                            transition-all duration-300 ease-out
                            ${hoveredRow === machine.id ? 'shadow-md border-blue-300' : 'shadow-sm'}
                          `}
                        />
                      ) : (
                        <div className={`
                          w-16 h-12 bg-slate-100 rounded-md flex items-center justify-center
                          transition-all duration-300 ease-out
                          ${hoveredRow === machine.id ? 'shadow-md' : ''}
                        `}>
                          <Package className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={`
                    font-medium text-slate-900 max-w-[300px]
                    transition-all duration-300 ease-out
                    ${hoveredRow === machine.id ? 'translate-x-1' : 'translate-x-0'}
                  `}>
                    <div className="truncate" title={machine.name}>{machine.name}</div>
                  </TableCell>
                  <TableCell className={`
                    transition-all duration-300 ease-out
                    ${hoveredRow === machine.id ? 'translate-x-1' : 'translate-x-0'}
                  `}>
                    <Badge variant="outline" className="text-slate-500 font-normal">
                      {machine.category}
                    </Badge>
                  </TableCell>
                  <TableCell className={`
                    text-right font-mono text-slate-600
                    transition-all duration-300 ease-out
                    ${hoveredRow === machine.id ? 'translate-x-1' : 'translate-x-0'}
                  `}>
                    {machine.quantity}
                  </TableCell>
                  <TableCell className={`
                    text-right font-mono font-medium text-slate-900
                    transition-all duration-300 ease-out
                    ${hoveredRow === machine.id ? 'translate-x-1' : 'translate-x-0'}
                  `}>
                    ₹{Number(machine.sellingPrice).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className={`
                    transition-all duration-300 ease-out
                    ${hoveredRow === machine.id ? 'translate-x-1' : 'translate-x-0'}
                  `}>
                    {machine.quantity < 3 ? (
                      <Badge variant="destructive" className="font-normal text-xs uppercase tracking-wide">Low Stock</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-normal text-xs uppercase tracking-wide">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className={`
                    transition-all duration-300 ease-out
                    ${hoveredRow === machine.id ? 'translate-x-1' : 'translate-x-0'}
                  `}>
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
                                purchasePrice: machine.purchasePrice,
                                sellingPrice: machine.sellingPrice,
                                quantity: machine.quantity,
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
    </Shell>
  );
}