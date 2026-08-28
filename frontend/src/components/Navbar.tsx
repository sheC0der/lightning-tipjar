import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Zap } from "lucide-react";
import { isAuthenticated, useLogout } from "../hooks/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const logout = useLogout();
  const authed = isAuthenticated();

  return (
    <header className="border-b border-slate-100 bg-white">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <Zap className="h-5 w-5 text-orange-500" />
          Lightning TipJar
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {authed ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-slate-900">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-orange-500 px-3 py-1.5 font-medium text-white hover:bg-orange-600"
              >
                Create your TipJar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
