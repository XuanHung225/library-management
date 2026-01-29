import { Link } from "react-router-dom";
import LandingHeader from "../../components/LandingHeader";

const fontClass = "font-sans";

export default function Home() {
  return (
    <div className={`bg-[#f9fafb] min-h-screen ${fontClass}`}>
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* HERO SECTION - OVERLAY STYLE */}
        <section className="mt-6 mb-24 relative h-[500px] md:h-[600px] overflow-hidden rounded-3xl shadow-2xl">
          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
            alt="Modern Library"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Dark Overlay - Giúp chữ nổi bật hơn */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

          {/* Content Container */}
          <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-20">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 max-w-2xl">
              Nơi tri thức hội tụ <br />
              <span className="text-primary-light">Mở lối tương lai</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-200 max-w-xl mb-8 leading-relaxed">
              ABC Library là nền tảng quản lý thư viện hiện đại giúp bạn tìm
              kiếm, mượn trả và quản lý sách một cách nhanh chóng, chính xác và
              tiện lợi.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/books"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold shadow-lg hover:bg-primary/90 transition transform hover:scale-105"
              >
                Khám phá tủ sách
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold border border-white/30 hover:bg-white/20 transition"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            Tính năng nổi bật
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: "search",
                title: "Tìm kiếm thông minh",
                desc: "Tra cứu sách theo tên, tác giả, thể loại hoặc ISBN nhanh chóng và chính xác.",
              },
              {
                icon: "event_available",
                title: "Mượn sách trực tuyến",
                desc: "Đặt lịch mượn sách online, theo dõi trạng thái và thời hạn mượn dễ dàng.",
              },
              {
                icon: "person",
                title: "Quản lý cá nhân",
                desc: "Quản lý tài khoản, lịch sử mượn và gia hạn sách ngay trên hệ thống.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center shadow-md
                           border border-gray-100 transition
                           hover:shadow-xl hover:-translate-y-1"
              >
                <span className="material-symbols-outlined text-5xl text-primary mb-4">
                  {item.icon}
                </span>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* STATISTICS */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              { value: "10+", label: "Người dùng đang hoạt động" },
              { value: "250+", label: "Đầu sách trong hệ thống" },
              { value: "10+", label: "Thể loại đa dạng" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-10 shadow-md
                           border border-gray-100 hover:shadow-xl transition"
              >
                <div className="text-4xl font-extrabold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="text-center bg-primary/5 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Sẵn sàng khám phá kho tri thức?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Đăng ký tài khoản để bắt đầu hành trình học tập và khám phá hàng
            ngàn đầu sách chất lượng ngay hôm nay.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-12 py-4
                       bg-primary text-white rounded-xl font-semibold
                       shadow-lg hover:bg-primary/90 transition
                       transform hover:scale-105"
          >
            Bắt đầu ngay
            <span className="material-symbols-outlined">rocket_launch</span>
          </Link>
        </section>
      </main>
    </div>
  );
}
