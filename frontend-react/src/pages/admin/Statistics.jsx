import { useEffect, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  BookOpen,
  Users,
  AlertTriangle,
  Banknote,
  TrendingUp,
  BarChart3,
  PieChart,
  RefreshCcw,
  ArrowRight,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

export default function StatisticsAdmin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    setLoading(true);
    axiosInstance
      .get("/stats/admin")
      .then((res) => setStats(res.data))
      .catch(() => setError("Không lấy được dữ liệu thống kê"))
      .finally(() => setLoading(false));
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v || 0);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // --- LOGIC XỬ LÝ DỮ LIỆU ---

  // 1. Dữ liệu Xu hướng 7 ngày (Line Chart)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(
        `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      );
    }
    return days;
  };

  const trendData = {
    labels: getLast7Days(),
    datasets: [
      {
        label: "Lượt mượn",
        data: getLast7Days().map(
          (d) => stats.activity.trends.find((t) => t.date === d)?.count || 0,
        ),
        fill: true,
        tension: 0.4, // Đường cong mềm mại
        borderColor: "#3b82f6",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(59,130,246,0.2)");
          gradient.addColorStop(1, "rgba(59,130,246,0)");
          return gradient;
        },
        pointBackgroundColor: "#fff",
        pointBorderColor: "#3b82f6",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  // 2. Dữ liệu Thu phạt (Doughnut Chart - Đã làm đẹp)
  const collected = stats.fines?.collected || 0;
  const pending = stats.fines?.pending || 0;
  const totalFines = collected + pending;
  const collectionRate =
    totalFines > 0 ? Math.round((collected / totalFines) * 100) : 0;

  const fineStatusData = {
    labels: ["Đã thu", "Chưa thu"],
    datasets: [
      {
        data: [collected, pending],
        backgroundColor: [
          "#10b981", // Emerald 500 (Thành công)
          "#f59e0b", // Amber 500 (Cảnh báo)
        ],
        hoverBackgroundColor: ["#059669", "#d97706"],
        borderWidth: 0,
        borderRadius: 20, // Bo tròn các đoạn
        cutout: "85%", // Vòng tròn mỏng
        spacing: 5, // Khoảng cách giữa các đoạn
      },
    ],
  };

  const fineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Tắt legend mặc định
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) =>
            ` ${context.label}: ${formatCurrency(context.raw)}`,
        },
      },
    },
  };

  // --- RENDER ---
  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-700 font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard Admin
          </h1>
          <p className="text-slate-500 mt-1">
            Tổng quan về hiệu suất hoạt động và tài chính thư viện
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition shadow-sm font-medium"
        >
          <RefreshCcw size={18} /> Làm mới dữ liệu
        </button>
      </div>

      {/* 4 Cards Thống Kê Chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng Người dùng"
          value={stats.overview.totalUsers}
          icon={<Users />}
          color="cyan"
        />
        <StatCard
          title="Tổng đầu sách"
          value={stats.overview.totalBooks}
          icon={<BookOpen />}
          color="blue"
        />
        <StatCard
          title="Sách bị mất"
          value={stats.overview.lostBooks}
          icon={<AlertTriangle />}
          color="red"
        />
        <StatCard
          title="Tổng tiền phạt"
          value={formatCurrency(stats.overview.totalFines)}
          icon={<Banknote />}
          color="violet"
        />
      </div>

      {/* Hàng 1: Biểu đồ Xu hướng & Thu phạt */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Biểu đồ Line */}
        <ChartCard
          title="Xu hướng mượn 7 ngày"
          icon={<TrendingUp size={20} className="text-blue-500" />}
        >
          <Line
            data={trendData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  grid: { borderDash: [4, 4], color: "#f1f5f9" },
                  beginAtZero: true,
                },
                x: { grid: { display: false } },
              },
            }}
          />
        </ChartCard>

        {/* Biểu đồ Tròn (Đã được làm đẹp) */}
        <ChartCard
          title="Tình trạng thu tiền phạt"
          icon={<PieChart size={20} className="text-emerald-500" />}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center h-full gap-8">
            {/* Chart */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <Doughnut data={fineStatusData} options={fineChartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">
                  {collectionRate}%
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  Hoàn thành
                </span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex-1 w-full space-y-4">
              <FineLegendItem
                label="Đã thu tiền"
                amount={collected}
                color="bg-emerald-500"
                percent={collectionRate}
                format={formatCurrency}
              />
              <FineLegendItem
                label="Chờ thanh toán"
                amount={pending}
                color="bg-amber-500"
                percent={100 - collectionRate}
                format={formatCurrency}
              />
              <div className="pt-3 border-t border-slate-100 flex justify-between text-xs mt-2">
                <span className="text-slate-400">Tổng phát sinh:</span>
                <span className="font-bold text-slate-700">
                  {formatCurrency(totalFines)}
                </span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Hàng 2: Top Books & Top Users */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top 5 Sách */}
        <ChartCard
          title="Top 5 sách phổ biến"
          icon={<BarChart3 size={20} className="text-indigo-500" />}
        >
          <Bar
            data={{
              labels: stats.books.topBooks.map((b) =>
                b.title.length > 20
                  ? b.title.substring(0, 20) + "..."
                  : b.title,
              ),
              datasets: [
                {
                  label: "Lượt mượn",
                  data: stats.books.topBooks.map((b) => b.count),
                  backgroundColor: "#6366f1",
                  borderRadius: 4,
                  barThickness: 24,
                },
              ],
            }}
            options={{
              indexAxis: "y", // Biểu đồ ngang cho dễ đọc tên sách
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y: { grid: { display: false } },
              },
            }}
          />
        </ChartCard>

        {/* Top Độc Giả */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users size={20} className="text-orange-500" />
            Top độc giả tích cực
          </h3>
          <div className="flex-1 overflow-auto pr-2">
            <ul className="space-y-3">
              {stats.users.topBorrowers.map((u, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center p-3 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition border border-transparent hover:border-slate-100 cursor-default group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-yellow-100 text-yellow-700" : "bg-slate-200 text-slate-600"}`}
                    >
                      {i + 1}
                    </div>
                    <span className="font-medium text-slate-700 group-hover:text-blue-600 transition">
                      {u.full_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      {u.count}
                    </span>
                    <span className="text-xs text-slate-400">lượt</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button className="text-sm text-blue-600 font-medium hover:underline flex items-center justify-center gap-1 mx-auto">
              Xem tất cả người dùng <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ title, value, icon, color }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    violet: "bg-violet-50 text-violet-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-xl ${styles[color] || "bg-slate-100 text-slate-600"}`}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
          {title}
        </p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, icon, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[350px]">
      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="flex-1 min-h-0 w-full">{children}</div>
    </div>
  );
}

function FineLegendItem({ label, amount, color, percent, format }) {
  return (
    <div className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-lg transition">
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${color} ring-2 ring-white shadow-sm`}
        />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500">{label}</span>
          <span className="text-sm font-bold text-slate-800">
            {format(amount)}
          </span>
        </div>
      </div>
      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
        {percent}%
      </span>
    </div>
  );
}
