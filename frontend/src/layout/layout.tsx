import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
