import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layout/layout";
import Home from "./pages/Home";
import Creator from "./pages/Creator";
import Tip from "./pages/Tip";
import Success from "./pages/Success";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { isAuthenticated } from "./hooks/useAuth";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path=":username" element={<Creator />} />
        <Route path=":username/tip" element={<Tip />} />
        <Route path=":username/success" element={<Success />} />
        <Route path="*" element={<p className="text-center text-slate-500">Page not found.</p>} />
      </Route>
    </Routes>
  );
}

export default App;
