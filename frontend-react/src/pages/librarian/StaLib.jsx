import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  BookOpen,
  Clock,
  AlertCircle,
  TrendingUp,
  Flame,
  LayoutDashboard,
  Layers, // Icon mới: Tổng cuốn
  XCircle, // Icon mới: Sách mất
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
);

export default function StatisticsLibrarian() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/stats/librarian")
      .then((res) => setStats(res.data))
      .catch(() => setError("Không lấy được thống kê"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // --- XỬ LÝ DỮ LIỆU BIỂU ĐỒ ---
  const getLast3Months = () => {
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      months.push(`${month}/${year}`);
    }
    return months;
  };

  const last3MonthsLabels = getLast3Months();
  const monthlyMap = {};
  stats.activity.monthlyLoans.forEach((item) => {
    monthlyMap[item.month] = item.count;
  });

  const monthlyData = {
    labels: last3MonthsLabels,
    datasets: [
      {
        label: "Lượt mượn",
        data: last3MonthsLabels.map((m) => monthlyMap[m] || 0),
        backgroundColor: "#3b82f6",
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: (val) => val,
        font: { weight: "bold", size: 12 },
        color: "#1e40af",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grace: "20%",
        ticks: { precision: 0 },
        grid: { color: "#f1f5f9" },
      },
      x: { grid: { display: false } },
    },
  };

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

  const last7DaysLabels = getLast7Days();
  const trendMap = {};
  stats.activity.trends.forEach((i) => {
    trendMap[i.date] = i.count;
  });

  const trendData = {
    labels: last7DaysLabels,
    datasets: [
      {
        label: "Lượt mượn",
        data: last7DaysLabels.map((d) => trendMap[d] || 0),
        fill: true,
        tension: 0.4,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.1)",
        pointBackgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="text-blue-600" size={32} />
        <h1 className="text-2xl font-bold text-slate-800">
          Báo cáo Thống kê Thủ thư
        </h1>
      </div>

      {/* STAT CARDS: Grid 4 cột cho 8 item */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Đầu sách"
          value={stats.overview.totalTitles}
          icon={<BookOpen size={20} />}
        />
        <StatCard
          title="Tổng cuốn"
          value={stats.overview.totalBooks}
          icon={<Layers size={20} />}
          color="text-indigo-600"
        />
        <StatCard
          title="Đang mượn"
          value={stats.overview.totalLoans}
          icon={<Clock size={20} />}
        />
        <StatCard
          title="Mượn hôm nay"
          value={stats.overview.todayLoans}
          icon={<Flame size={20} />}
          color="text-orange-500"
        />
        <StatCard
          title="Chờ duyệt"
          value={stats.overview.pendingLoans}
          icon={<Clock size={20} />}
          color="text-blue-500"
        />
        <StatCard
          title="Sắp quá hạn"
          value={stats.overview.dueSoonLoans}
          icon={<TrendingUp size={20} />}
          color="text-amber-500"
        />
        <StatCard
          title="Quá hạn"
          value={stats.overview.overdueLoans}
          icon={<AlertCircle size={20} />}
          color="text-red-500"
        />
        <StatCard
          title="Sách đã mất"
          value={stats.overview.lostBooks}
          icon={<XCircle size={20} />}
          color="text-gray-600"
        />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-600 uppercase mb-6">
            Xu hướng 7 ngày gần nhất
          </h3>
          <div className="h-64">
            <Line
              data={trendData}
              options={{
                ...barOptions,
                plugins: {
                  ...barOptions.plugins,
                  datalabels: { display: false },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-600 uppercase mb-6">
            Mượn theo tháng (3 tháng gần nhất)
          </h3>
          <div className="h-64">
            <Bar data={monthlyData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = "text-blue-600" }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all">
      <div className={`${color} mb-2 opacity-80`}>{icon}</div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        {title}
      </p>
      <p className="text-xl font-black text-slate-800">{value}</p>
    </div>
  );
}
