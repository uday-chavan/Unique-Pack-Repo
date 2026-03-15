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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";


/* ---------- Animated rotating conic border for top seller ---------- */

function SpinningRing() {
  const rotation = useMotionValue(0);

  useAnimationFrame((t) => {
    rotation.set((t / 20) % 360);
  });

  const rotate = useTransform(rotation, (r) => `${r}deg`);

  return (
    <motion.div
      className="absolute inset-0 rounded-lg z-0"
      style={{
        background: "conic-gradient(from var(--r), #f59e0b, #ef4444, #8b5cf6, #3b82f6, #10b981, #f59e0b)",
        ["--r" as any]: rotate,
        padding: 3,
      }}
    >
      <div className="w-full h-full rounded-lg bg-white" />
    </motion.div>
  );
}


/* ---------- Pulsing live dot ---------- */

function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
    </span>
  );
}


/* ---------- Animated stat card ---------- */

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  iconColor,
  arrowUp,
  delay,
  accentColor,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: any;
  iconColor: string;
  arrowUp: boolean;
  delay: number;
  accentColor: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={itemVariant}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden border-slate-600 hover:shadow-xl transition-shadow duration-300 group">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)",
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
        />
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentColor}`} />

        <motion.div variants={titleVariant}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={`p-2 rounded-lg bg-slate-50 ${iconColor}`}>
              <Icon className="h-4 w-4" />
            </div>
          </CardHeader>
        </motion.div>

        <motion.div variants={contentVariant}>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {arrowUp ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-amber-500" />}
              {sub}
            </p>
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
}


/* ---------- Animation variants ---------- */

const containerVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const titleVariant = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const contentVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.2 } }
};


/* ---------- Dashboard ---------- */

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const [animatedOrders, setAnimatedOrders] = useState(0);
  const [animatedValue, setAnimatedValue] = useState(0);

  const topSeller = stats?.topSelling?.[0];

  useEffect(() => {
    if (topSeller) {
      const end = Number(topSeller.count) || 0;
      let start = 0;
      const increment = Math.max(end / (2000 / 16), 0.1);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) { setAnimatedOrders(end); clearInterval(timer); }
        else setAnimatedOrders(start);
      }, 16);
      return () => clearInterval(timer);
    }
  }, [topSeller]);

  useEffect(() => {
    let start = 0;
    const end = 98.2;
    const increment = end / (2000 / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setAnimatedValue(end); clearInterval(timer); }
      else setAnimatedValue(start);
    }, 16);
    return () => clearInterval(timer);
  }, []);

  const [chartKey, setChartKey] = useState(0);
  const performanceData = stats?.monthlyRevenue || [];

  useEffect(() => {
    setChartKey(prev => prev + 1);
  }, []);

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <Shell>
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-slate-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {[0, 1].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Shell>
    );
  }

  /* ---------- Main render ---------- */
  return (
    <Shell>
      <div className="relative min-h-full">

        {/* 
          Edge fades — positioned only on left/right edges, 
          starting BELOW the header row (top-[80px]) so they 
          don't bleed into the header/title area 
        */}
        <div className="absolute top-[80px] bottom-0 left-0 w-48 pointer-events-none z-0"
          style={{
            background: "linear-gradient(to right, rgba(59,130,246,0.12) 0%, transparent 100%)",
          }}
        />
        <div className="absolute top-[80px] bottom-0 right-0 w-48 pointer-events-none z-0"
          style={{
            background: "linear-gradient(to left, rgba(245,158,11,0.12) 0%, transparent 100%)",
          }}
        />

        <motion.div
          variants={containerVariant}
          initial="hidden"
          animate="show"
          className="relative z-10 space-y-8"
        >

          {/* Header */}
          <motion.div variants={itemVariant} className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
              <p className="text-muted-foreground mt-1">Overview of your industrial operations.</p>
            </div>

            <motion.div
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm"
              animate={{ boxShadow: ["0 1px 3px rgba(0,0,0,0.1)", "0 4px 20px rgba(16,185,129,0.2)", "0 1px 3px rgba(0,0,0,0.1)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <LiveDot />
              <span className="text-sm font-medium text-slate-600">System Operational</span>
            </motion.div>
          </motion.div>


          {/* Stat Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Revenue"
              value={`₹${stats?.totalSales.toLocaleString("en-IN") || "0"}`}
              sub="From completed orders"
              icon={IndianRupee}
              iconColor="text-emerald-600"
              arrowUp
              delay={0.1}
              accentColor="bg-gradient-to-r from-emerald-400 to-teal-500"
            />
            <StatCard
              title="Total Orders"
              value={stats?.totalOrders || 0}
              sub="All time orders"
              icon={Package}
              iconColor="text-blue-600"
              arrowUp
              delay={0.2}
              accentColor="bg-gradient-to-r from-blue-400 to-indigo-500"
            />
            <StatCard
              title="Low Stock Items"
              value={stats?.lowStockCount || 0}
              sub="Needs attention"
              icon={AlertTriangle}
              iconColor="text-amber-500"
              arrowUp={false}
              delay={0.3}
              accentColor="bg-gradient-to-r from-amber-400 to-orange-500"
            />
          </div>


          {/* Main section */}
          <motion.div variants={containerVariant} className="grid gap-6 md:grid-cols-7">

            {/* Top Selling */}
            <motion.div variants={itemVariant} className="col-span-4">
              <Card className="border-slate-500 shadow-sm overflow-hidden">
                <motion.div variants={titleVariant}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, -15, 15, -8, 8, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Trophy className="w-5 h-5 text-amber-500" />
                      </motion.div>
                      <CardTitle>Top Selling Product</CardTitle>
                    </div>
                    <CardDescription>Most ordered product</CardDescription>
                  </CardHeader>
                </motion.div>

                <motion.div variants={contentVariant}>
                  <CardContent>
                    {topSeller ? (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="relative w-48 h-48">
                            <SpinningRing />
                            <div className="absolute inset-[3px] rounded-lg overflow-hidden z-10">
                              <motion.img
                                src={topSeller.imageUrl || "/placeholder.png"}
                                alt={topSeller.name}
                                className="w-full h-full object-cover"
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                              />
                            </div>
                            <motion.div
                              className="absolute top-2 right-2 z-20 bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
                              animate={{ scale: [1, 1.12, 1] }}
                              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                            >
                              #1
                            </motion.div>
                          </div>
                        </div>

                        <div className="text-center">
                          <h3 className="font-semibold text-slate-900 text-lg">{topSeller.name}</h3>
                          <motion.p
                            className="text-3xl font-bold text-blue-600 mt-2"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                          >
                            {Math.floor(animatedOrders)} sold
                          </motion.p>
                        </div>

                        <div className="mt-6 space-y-3">
                          <p className="text-sm font-semibold text-slate-700 mb-3">Other Top Products</p>
                          {stats?.topSelling?.slice(1, 5).map((item: any, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ x: 4, backgroundColor: "rgb(241 245 249)", transition: { duration: 0.15 } }}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg transition-colors cursor-default"
                            >
                              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-slate-500">
                                <img src={item.imageUrl || "/placeholder.png"} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                                <p className="text-xs text-slate-500">Rank #{index + 2}</p>
                              </div>
                              <span className="text-sm font-bold text-slate-900">{Number(item.count)} sold</span>
                            </motion.div>
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
                </motion.div>
              </Card>
            </motion.div>


            {/* Revenue Trend */}
            <motion.div variants={itemVariant} className="col-span-3">
              <Card className="border-slate-500 shadow-sm overflow-hidden">
                <motion.div variants={titleVariant}>
                  <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 pb-4">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </motion.div>
                      <CardTitle>Revenue Chart</CardTitle>
                    </div>
                    <CardDescription>Monthly revenue growth</CardDescription>
                  </CardHeader>
                </motion.div>

                <motion.div variants={contentVariant}>
                  <CardContent className="pt-6">
                    <div className="h-[250px] w-full mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart key={chartKey} data={performanceData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v.toLocaleString()}`} />
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
                </motion.div>
              </Card>
            </motion.div>

          </motion.div>
        </motion.div>

      </div>
    </Shell>
  );
}