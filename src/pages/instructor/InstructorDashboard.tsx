import React, { useEffect, useMemo, useState } from "react";
import { getInstructorDashboard } from "../../api/api";
import StatCard from "../../components/admin/StatCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DollarSign, Users, TrendingUp } from "lucide-react";

type CourseRow = {
  course_id: number;
  course: string;
  students: number;
  completed: number;
  sales: number;
  revenue: number;
};

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

const InstructorDashboard: React.FC = () => {
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const instructorId = user?.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    balance: number;
    total_revenue: number;
    total_students: number;
  } | null>(null);
  const [rows, setRows] = useState<CourseRow[]>([]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!instructorId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getInstructorDashboard(instructorId);
        if (!ignore) {
          setSummary(
            data?.summary || { balance: 0, total_revenue: 0, total_students: 0 }
          );
          setRows(Array.isArray(data?.by_course) ? data.by_course : []);
        }
      } catch (e) {
        if (!ignore) setError("Failed to load dashboard");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [instructorId]);

  const completionPie = useMemo(() => {
    return rows.map((r) => ({ name: r.course, value: r.completed || 0 }));
  }, [rows]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Balance"
          value={summary ? `$${summary.balance.toLocaleString()}` : "$0"}
          icon={<DollarSign className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard
          title="Total Students"
          value={summary ? summary.total_students : 0}
          icon={<Users className="h-5 w-5" />}
          color="sky"
        />
        <StatCard
          title="Total Revenue"
          value={summary ? `$${summary.total_revenue.toLocaleString()}` : "$0"}
          icon={<TrendingUp className="h-5 w-5" />}
          color="indigo"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Sales by Course</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : rows.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ left: 8, right: 8, top: 8 }}>
                <XAxis
                  dataKey="course"
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="sales"
                  name="Sales"
                  radius={[6, 6, 0, 0]}
                  fill="#6366F1"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Completion by Course</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : completionPie.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={completionPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {completionPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
