import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

type CourseSales = { course: string; sales: number; revenue?: number };
type CategorySales = { name: string; value: number };
type RevenuePoint = { date: string; revenue: number };

const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
];

type AnyRecord = Record<string, unknown>;
const getString = (obj: AnyRecord, keys: string[], fallback = ""): string => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return fallback;
};
const getNumber = (obj: AnyRecord, keys: string[]): number => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.length > 0) {
      const n = Number(value);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
};

const API_BASE = "https://educational-platform-production.up.railway.app/api/";
const fetchJson = async (
  path: string,
  params?: Record<string, string | number | boolean>
): Promise<unknown> => {
  const url = new URL(path, API_BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.set(k, String(v))
    );
  }
  const token = localStorage.getItem("accessToken");
  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

// Start with empty datasets; we'll hydrate from API
const EMPTY_COURSES: CourseSales[] = [];
const EMPTY_CATEGORIES: CategorySales[] = [];
const EMPTY_REVENUE: RevenuePoint[] = [];

type RangeKey = "last_month" | "last_3_months";

const SalesAnalytics: React.FC = () => {
  const [range, setRange] = useState<RangeKey>("last_month");
  const [courseSales, setCourseSales] = useState<CourseSales[]>(EMPTY_COURSES);
  const [categorySales, setCategorySales] =
    useState<CategorySales[]>(EMPTY_CATEGORIES);
  const [revenueSeries, setRevenueSeries] =
    useState<RevenuePoint[]>(EMPTY_REVENUE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalRevenue = useMemo(() => {
    return revenueSeries.reduce((sum, p) => sum + p.revenue, 0);
  }, [revenueSeries]);

  const prevRevenue = useMemo(() => {
    const data = revenueSeries;
    const firstHalf = data
      .slice(0, Math.floor(data.length / 2))
      .reduce((s, p) => s + p.revenue, 0);
    const secondHalf = data
      .slice(Math.floor(data.length / 2))
      .reduce((s, p) => s + p.revenue, 0);
    return { firstHalf, secondHalf };
  }, [revenueSeries]);

  const growthPercent = useMemo(() => {
    if (prevRevenue.firstHalf === 0) return 0;
    return Math.round(
      ((prevRevenue.secondHalf - prevRevenue.firstHalf) /
        prevRevenue.firstHalf) *
        100
    );
  }, [prevRevenue]);

  useEffect(() => {
    let ignore = false;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [coursesRes, categoriesRes, revenueRes] = await Promise.all([
          fetchJson("admin/sales/courses/").catch(() => null),
          fetchJson("admin/sales/categories/").catch(() => null),
          fetchJson("admin/sales/revenue/", { range }).catch(() => null),
        ]);

        if (!ignore) {
          // Normalize course sales: expect [{ course/name/title, sales/revenue }]
          if (coursesRes && Array.isArray(coursesRes)) {
            const normalized: CourseSales[] = (coursesRes as AnyRecord[]).map(
              (c) => ({
                course: getString(c, ["course", "name", "title"], "Unknown"),
                sales: getNumber(c, ["sales", "count", "revenue"]),
                revenue: getNumber(c, ["revenue"]) || undefined,
              })
            );
            setCourseSales(normalized);
          } else {
            setCourseSales(EMPTY_COURSES);
          }

          // Normalize category sales: expect [{ category/name, value/sales/percent }]
          if (categoriesRes && Array.isArray(categoriesRes)) {
            const normalizedCat: CategorySales[] = (
              categoriesRes as AnyRecord[]
            ).map((cat) => ({
              name: getString(cat, ["category", "name"], "Unknown"),
              value: getNumber(cat, ["value", "sales", "percent"]),
            }));
            setCategorySales(normalizedCat);
          } else {
            setCategorySales(EMPTY_CATEGORIES);
          }

          // Normalize revenue trends: expect { points: [{date, revenue}], total?, growth? } or array
          if (revenueRes) {
            const rev = revenueRes as AnyRecord;
            let points: AnyRecord[] = [];
            if (Array.isArray(rev)) {
              points = rev as AnyRecord[];
            } else if (
              rev &&
              Array.isArray((rev as AnyRecord)["points"] as unknown[])
            ) {
              points = (rev as AnyRecord)["points"] as AnyRecord[];
            }
            const normalizedRev: RevenuePoint[] = points.map((p, idx) => ({
              date: getString(p, ["date", "day", "week"], String(idx + 1)),
              revenue: getNumber(p, ["revenue", "amount", "value"]),
            }));
            setRevenueSeries(normalizedRev);
          } else {
            setRevenueSeries(EMPTY_REVENUE);
          }
        }
      } catch {
        if (!ignore) {
          setError("Failed to load analytics.");
          setCourseSales(EMPTY_COURSES);
          setCategorySales(EMPTY_CATEGORIES);
          setRevenueSeries(EMPTY_REVENUE);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      ignore = true;
    };
  }, [range, refreshKey]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle>Sales per Course</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : courseSales.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={courseSales}
                margin={{ left: 8, right: 8, top: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis
                  dataKey="course"
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="sales"
                  name="Sales"
                  radius={[6, 6, 0, 0]}
                  fill="#6366F1"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
          {error && (
            <div className="mt-3 text-sm text-red-600 flex items-center gap-3">
              {error}
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="ml-2 px-2 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Retry
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Sales per Category</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : categorySales.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={categorySales}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {categorySales.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
          {error && (
            <div className="mt-3 text-sm text-red-600 flex items-center gap-3">
              {error}
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="ml-2 px-2 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Retry
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Revenue Trends</CardTitle>
            <div className="mt-1 text-sm text-gray-500">
              Total Revenue: ${totalRevenue.toLocaleString()}{" "}
              <span
                className={
                  growthPercent >= 0 ? "text-emerald-600" : "text-red-600"
                }
              >
                {growthPercent >= 0 ? "↑" : "↓"} {Math.abs(growthPercent)}% from
                previous period
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setRange("last_month")}
              className={`px-3 py-1.5 rounded-lg border transition ${
                range === "last_month"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setRange("last_3_months")}
              className={`px-3 py-1.5 rounded-lg border transition ${
                range === "last_3_months"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Last 3 Months
            </button>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : revenueSeries.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {range === "last_month" ? (
                <AreaChart
                  data={revenueSeries}
                  margin={{ left: 8, right: 8, top: 8 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#6366F1"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="#6366F1"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#6366F1"
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <LineChart
                  data={revenueSeries}
                  margin={{ left: 8, right: 8, top: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#22C55E"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
          {error && (
            <div className="mt-3 text-sm text-red-600 flex items-center gap-3">
              {error}
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="ml-2 px-2 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Retry
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesAnalytics;
