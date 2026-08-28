import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import { useNotify } from "../components/Notification";
import { getErrorMessage } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const notify = useNotify();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      navigate("/dashboard");
    } catch (err) {
      notify("error", getErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-900">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
        />
        <button
          type="submit"
          disabled={login.isPending}
          className="rounded-xl bg-orange-500 px-4 py-3 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {login.isPending ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="text-sm text-slate-500">
        Don't have a TipJar yet?{" "}
        <Link to="/register" className="font-medium text-orange-600 hover:text-orange-700">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default Login;
