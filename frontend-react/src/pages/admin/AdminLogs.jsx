import { useEffect, useState } from "react";
import { Clock, Activity, Search, RefreshCw, History } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    setLoading(true);
    axiosInstance
      .get("/logs")
      .then((res) => setLogs(res.data))
      .catch(() => setError("Không lấy được dữ liệu lịch sử hệ thống"))
      .finally(() => setLoading(false));
  };

  const formatToLocalTime = (logStr) => {
    const timeMatch = logStr.match(/\[(.*?)\]/);
    if (!timeMatch) return { time: "N/A", message: logStr };

    const rawTime = timeMatch[1]; // Ví dụ: "2026-01-13 08:00:00"
    const message = logStr.replace(/\[.*?\]/, "").trim();

    try {
      // GIẢI PHÁP: Thay đổi khoảng trắng thành 'T' và thêm 'Z' để ép về chuẩn UTC
      // Điều này giúp hàm Date() luôn coi rawTime là giờ gốc (00:00)
      const isoTime = rawTime.replace(" ", "T") + "Z";
      const dateObj = new Date(isoTime);

      if (isNaN(dateObj.getTime())) return { time: rawTime, message };

      // CỘNG TAY 7 TIẾNG
      const gmt7Date = new Date(dateObj.getTime() + 7 * 60 * 60 * 1000);

      return {
        time: gmt7Date.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        message,
      };
    } catch (e) {
      return { time: rawTime, message };
    }
  };

  const getActionStyle = (message) => {
    const msg = message.toUpperCase();
    if (msg.includes("LOGIN"))
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (msg.includes("DELETE"))
      return "bg-rose-100 text-rose-700 border-rose-200";
    if (msg.includes("UPDATE"))
      return "bg-amber-100 text-amber-700 border-amber-200";
    if (msg.includes("CREATE")) return "bg-sky-100 text-sky-700 border-sky-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const filteredLogs = logs.filter((log) =>
    log.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 pb-12 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
              <History className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">
              Nhật ký Hệ thống
            </h2>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm hành động..."
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-full md:w-80 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchLogs}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-64">
                  Thời gian (GMT+7)
                </th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Nội dung hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((logStr, index) => {
                  const { time, message } = formatToLocalTime(logStr);
                  return (
                    <tr
                      key={index}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                          <Clock size={14} className="text-indigo-500" />
                          {time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-tighter ${getActionStyle(message)}`}
                          >
                            {message.split(" ")[2] || "SYSTEM"}
                          </span>
                          <span className="text-slate-700 text-sm font-medium">
                            {message}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="2"
                    className="px-6 py-20 text-center text-slate-400 italic"
                  >
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
