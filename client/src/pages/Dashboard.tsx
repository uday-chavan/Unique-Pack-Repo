import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { 
  IndianRupee, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Trophy
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedOrders, setAnimatedOrders] = useState(0);

  // Get top seller (first item is the most sold)
  const topSeller = stats?.topSelling?.[0];

  useEffect(() => {
    if (topSeller) {
      const end = Number(topSeller.count) || 0;
      let start = 0;
      const duration = 2000;
      const increment = Math.max(end / (duration / 16), 0.1);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setAnimatedOrders(end);
          clearInterval(timer);
        } else {
          setAnimatedOrders(start);
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [topSeller]);

  // Performance data for the graph (monthly revenue data from database)
  const performanceData = stats?.monthlyRevenue || [];

  // Animate the performance percentage on mount (still using a fixed value or based on latest revenue?)
  // Keeping the animated value for UI feel
  useEffect(() => {
    let start = 0;
    const end = 98.2;
    const duration = 2000; // 2 seconds
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedValue(end);
        clearInterval(timer);
      } else {
        setAnimatedValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return <Shell><div>Loading stats...</div></Shell>;
  }

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Overview of your industrial operations.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-slate-600">System Operational</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow duration-200 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ₹{stats?.totalSales.toLocaleString('en-IN') || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" />
              From completed orders
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats?.totalOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" />
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats?.lowStockCount || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowDownRight className="w-3 h-3 text-amber-500 mr-1" />
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4 border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <CardTitle>Top Selling Product</CardTitle>
            </div>
            <CardDescription>Most ordered product</CardDescription>
          </CardHeader>
          <CardContent>
            {topSeller ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-amber-200 shadow-lg">
                    <img 
                      src={topSeller.imageUrl || '/placeholder.png'} 
                      alt={topSeller.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                      #{1}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                    {topSeller.name}
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {Math.floor(animatedOrders)} sold
                  </p>
                </div>
                
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Other Top Products</p>
                  {stats?.topSelling?.slice(1, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                        <img 
                          src={item.imageUrl || '/placeholder.png'} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">Rank #{index + 2}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{Number(item.count)} sold</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-16 h-16 mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium">No sales yet</p>
                <p className="text-sm">Products will appear here once orders are placed</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <CardTitle>Revenue Trend</CardTitle>
            </div>
            <CardDescription>Monthly revenue growth</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={performanceData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length && payload[0].payload) {
                        return (
                          <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-medium text-slate-600">{payload[0].payload.month}</p>
                            <p className="text-sm font-bold text-blue-600">₹{payload[0].value.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}