import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { type Machine } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Truck, AlertCircle } from "lucide-react";

interface OrderItem {
  id: number;
  orderId: number;
  machineId: number;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  customerId?: number;
  totalAmount: string;
  amountPaid?: string;
  paymentStatus: string;
  deliveryStatus: string;
  invoiceNo?: string;
  items?: OrderItem[];
  createdAt?: string;
}

interface MachinesOrdersChartProps {
  machines: Machine[];
  orders: Order[];
}

export function MachinesOrdersChart({ machines, orders }: MachinesOrdersChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [hoveredMachineId, setHoveredMachineId] = useState<number | null>(null);

  // Build a map of machine ID to its orders
  const machineOrders = new Map<number, Order[]>();
  machines.forEach((m) => machineOrders.set(m.id, []));
  
  orders.forEach((order) => {
    if (order.items) {
      order.items.forEach((item) => {
        if (machineOrders.has(item.machineId)) {
          machineOrders.get(item.machineId)!.push(order);
        }
      });
    }
  });

  // Categorize machines by delivery status of their orders
  const pendingMachines: Machine[] = [];
  const shippedMachines: Machine[] = [];
  const deliveredMachines: Machine[] = [];

  machines.forEach((machine) => {
    const machineOrdersList = machineOrders.get(machine.id) || [];
    if (machineOrdersList.length === 0) return; // Skip if no orders

    // Determine primary status: if any pending, mark as pending; else if any shipped, mark as shipped; else delivered
    const hasDeliveryStatus = {
      pending: machineOrdersList.some((o) => o.deliveryStatus === "pending"),
      shipped: machineOrdersList.some((o) => o.deliveryStatus === "shipped"),
      delivered: machineOrdersList.some((o) => o.deliveryStatus === "delivered"),
    };

    if (hasDeliveryStatus.pending) {
      pendingMachines.push(machine);
    } else if (hasDeliveryStatus.shipped) {
      shippedMachines.push(machine);
    } else if (hasDeliveryStatus.delivered) {
      deliveredMachines.push(machine);
    }
  });

  const chartData = [
    {
      name: "Pending",
      value: pendingMachines.length,
      category: "pending",
      fill: "#f59e0b",
      items: pendingMachines,
    },
    {
      name: "Shipped",
      value: shippedMachines.length,
      category: "shipped",
      fill: "#3b82f6",
      items: shippedMachines,
    },
    {
      name: "Delivered",
      value: deliveredMachines.length,
      category: "delivered",
      fill: "#10b981",
      items: deliveredMachines,
    },
  ].filter((item) => item.value > 0);

  const getItemsByCategory = (category: string) => {
    const found = chartData.find((d) => d.category === category);
    return found ? found.items.sort((a, b) => b.quantity - a.quantity) : [];
  };

  // Custom tooltip
  const CustomTooltip = (props: any) => {
    if (!props.active || !props.payload?.[0]) return null;
    const data = props.payload[0];

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="font-semibold text-sm text-slate-900">{data.name}</p>
        <p className="text-xs text-slate-600 mt-1">Machines: {data.value}</p>
      </div>
    );
  };

  // Custom label renderer
  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    name,
    value,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="14"
        fontWeight="bold"
        className="pointer-events-none"
      >
        <tspan x={x} dy="0">
          {name}
        </tspan>
        <tspan x={x} dy="16" fontSize="12">
          ({value})
        </tspan>
      </text>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Chart */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={600}
              animationEasing="ease-out"
              onMouseEnter={(_, index) => {
                setHoveredSlice(chartData[index]?.category || null);
              }}
              onMouseLeave={() => {
                if (!selectedCategory) {
                  setHoveredSlice(null);
                }
              }}
              onClick={(_, index) => {
                const category = chartData[index]?.category;
                setSelectedCategory(selectedCategory === category ? null : category);
              }}
              style={{
                cursor: "pointer",
                outline: "none",
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  opacity={
                    hoveredSlice === null && selectedCategory === null
                      ? 1
                      : hoveredSlice === entry.category || selectedCategory === entry.category
                      ? 1
                      : 0.3
                  }
                  style={{
                    filter:
                      hoveredSlice === entry.category || selectedCategory === entry.category
                        ? "drop-shadow(0 0 16px rgba(0,0,0,0.4)) brightness(1.1)"
                        : "none",
                    transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    transform:
                      hoveredSlice === entry.category || selectedCategory === entry.category
                        ? "scale(1.03)"
                        : "scale(1)",
                    transformOrigin: "center",
                    outline: "none",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => <span className="text-xs sm:text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Item List Below Chart */}
      {selectedCategory && (
        <div className="mt-4 pt-4 border-t border-slate-200 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex items-center gap-2 mb-3">
            {selectedCategory === "pending" && (
              <Clock className="w-5 h-5 text-amber-600" />
            )}
            {selectedCategory === "shipped" && (
              <Truck className="w-5 h-5 text-blue-600" />
            )}
            {selectedCategory === "delivered" && (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            <h4 className="font-semibold text-sm text-slate-900">
              {selectedCategory === "pending" && "Pending Orders"}
              {selectedCategory === "shipped" && "Shipped Orders"}
              {selectedCategory === "delivered" && "Delivered Orders"}
            </h4>
            <span className="text-xs text-slate-500 ml-auto">
              ({getItemsByCategory(selectedCategory).length} machines)
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {getItemsByCategory(selectedCategory).map((machine) => (
              <div
                key={machine.id}
                onMouseEnter={() => setHoveredMachineId(machine.id)}
                onMouseLeave={() => setHoveredMachineId(null)}
                className="flex items-start justify-between gap-3 p-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 break-words">
                    {machine.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-slate-500">
                    <span>{machine.category}</span>
                    {machine.brand && <span>• {machine.brand}</span>}
                    {machine.model && <span>• {machine.model}</span>}
                  </div>
                </div>
                <Badge
                  variant="default"
                  className="ml-2 flex-shrink-0 whitespace-nowrap h-fit mt-0.5"
                >
                  ₹{Number(machine.sellingPrice).toLocaleString("en-IN")}
                </Badge>
              </div>
            ))}
          </div>

          {getItemsByCategory(selectedCategory).length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No items in this category</p>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {!selectedCategory && (
        <div className="grid grid-cols-3 gap-2 pt-2 text-xs animate-in fade-in duration-500">
          {chartData.map((item) => (
            <div
              key={item.category}
              className={`p-3 rounded-lg text-center cursor-default transition-all duration-300 border ${
                hoveredSlice === item.category
                  ? "bg-slate-100 border-slate-300"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <p className="font-semibold text-slate-900">{item.value}</p>
              <p className="text-slate-600 mt-1">{item.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}