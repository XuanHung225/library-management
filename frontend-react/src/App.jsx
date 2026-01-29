// src/App.jsx
import AppRoutes from "./routes/AppRoutes";
import DarkModeToggle from "./components/DarkModeToggle";

export default function App() {
  return (
    <>
      <AppRoutes />
      <DarkModeToggle />
    </>
  );
}
