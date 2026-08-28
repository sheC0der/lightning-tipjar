import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/useAuth";
import { useNotify } from "../components/Notification";
import { getErrorMessage } from "../services/api";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    displayName: "",
    mobileMoneyNetwork: "MTN" as "MTN" | "MPS",
    mobileMoneyNumber: "",
  });
  const register = useRegister();
  const notify = useNotify();
  const navigate = useNavigate();

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await register.mutateAsync(form);
      navigate("/dashboard");
    } catch (err) {
      notify("error", getErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-900">Create your TipJar</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          required
          placeholder="Username (e.g. jane-dev)"
          value={form.username}
          onChange={(e) => update("username", e.target.value.toLowerCase())}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
        />
        <input
          type="text"
          required
          placeholder="Display name"
          value={form.displayName}
          onChange={(e) => update("displayName", e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
        />
        <div className="flex gap-2">
          <select
            value={form.mobileMoneyNetwork}
            onChange={(e) => update("mobileMoneyNetwork", e.target.value as "MTN" | "MPS")}
            className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400"
          >
            <option value="MTN">MTN Mobile Money</option>
            <option value="MPS">Other Mobile Money</option>
          </select>
          <input
            type="tel"
            required
            placeholder="Mobile Money number"
            value={form.mobileMoneyNumber}
            onChange={(e) => update("mobileMoneyNumber", e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
          />
        </div>
        <button
          type="submit"
          disabled={register.isPending}
          className="rounded-xl bg-orange-500 px-4 py-3 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {register.isPending ? "Creating..." : "Create my TipJar"}
        </button>
      </form>
      <p className="text-sm text-slate-500">
        Already have a TipJar?{" "}
        <Link to="/login" className="font-medium text-orange-600 hover:text-orange-700">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default Register;
