import { Outlet } from "react-router-dom";
import LandingHeader from "../components/LandingHeader";
import LandingFooter from "../components/LandingFooter";
import AboutModal from "../components/AboutModal";

const fontClass = "font-sans";
export default function PublicLayout() {
  return (
    <div className={`bg-[#f9fafb] min-h-screen ${fontClass}`}>
      {/* Header, Footer, ... */}
      <LandingHeader />

      <AboutModal />
      <main className="flex-grow">
        <Outlet />
      </main>

      <LandingFooter />
    </div>
  );
}
