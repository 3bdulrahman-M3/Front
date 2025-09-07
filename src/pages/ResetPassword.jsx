import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { confirmPasswordReset } from "../api/api";

const passwordRules = [
  { test: (v) => v.length >= 8, label: "At least 8 characters" },
  { test: (v) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v) => /[0-9]/.test(v), label: "One number" },
  { test: (v) => /[^A-Za-z0-9]/.test(v), label: "One symbol" },
];

const ResetPassword = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const checks = useMemo(
    () => passwordRules.map((r) => ({ label: r.label, ok: r.test(password) })),
    [password]
  );

  const allGood = checks.every((c) => c.ok) && password === confirm && token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await confirmPasswordReset({
        token,
        new_password: password,
        confirm_password: confirm,
      });
      setMessage("Password updated. You can now log in.");
    } catch (err) {
      const detail = err?.response?.data;
      setError(
        typeof detail === "string" ? detail : "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Reset your password
          </h2>
          {!token && (
            <p className="text-red-600 text-center mb-4">
              Missing or invalid token.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              {checks.map((c) => (
                <li
                  key={c.label}
                  className={c.ok ? "text-green-600" : "text-gray-500"}
                >
                  {c.label}
                </li>
              ))}
              <li
                className={
                  password === confirm ? "text-green-600" : "text-gray-500"
                }
              >
                Passwords must match
              </li>
            </ul>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && (
              <p className="text-green-600 text-sm">
                {message}{" "}
                <a href="/login" className="text-blue-600 underline">
                  Sign in
                </a>
              </p>
            )}

            <button
              type="submit"
              disabled={!allGood || loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default ResetPassword;



