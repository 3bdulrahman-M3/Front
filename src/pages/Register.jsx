import React, { useState } from "react";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { register, getGoogleAuthUrl } from "../api/api"; // ⬅️ from your api.js
import { useNavigate } from "react-router-dom";
import InterestsPopup from "../components/Interests";

const RegisterPage = () => {
  const [role] = useState("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showInterestsPopup, setShowInterestsPopup] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    non_field: "",
  });

  // Password policy: 8+ chars, one upper, one lower, one number, one special char
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const passwordPolicyMessage =
    "Password must be 8+ characters and include uppercase, lowercase, number, and special character.";

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset field errors
    setFieldErrors({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      non_field: "",
    });

    // Client-side password policy validation
    if (!passwordRegex.test(password)) {
      setFieldErrors((e) => ({ ...e, password: passwordPolicyMessage }));
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors((e) => ({
        ...e,
        confirm_password: "Passwords do not match",
      }));
      return;
    }

    try {
      setIsLoading(true); // ⬅️ Start loading
      setError("");
      const data = await register({
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password,
        confirm_password: confirmPassword,
        role,
      });
      localStorage.setItem("accessToken", data.tokens.access);
      localStorage.setItem("user", JSON.stringify(data.user));
      setShowInterestsPopup(true);
    } catch (err) {
      const data = err?.response?.data || {};
      const next = {
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        non_field: "",
      };
      if (typeof data === "object") {
        Object.entries(data).forEach(([k, v]) => {
          const msg = Array.isArray(v) ? v.join(" ") : String(v);
          if (k in next) next[k] = msg;
          else if (k === "detail" || k === "non_field_errors")
            next.non_field = msg;
        });
      } else {
        next.non_field = "Registration failed. Please check your inputs.";
      }
      setFieldErrors(next);
      setError("");
    } finally {
      setIsLoading(false); // ⬅️ End loading
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setGoogleLoading(true);
      setError("");
      // Persist chosen role across OAuth redirect
      sessionStorage.setItem("oauth_role", "student");
      const redirectUri = `${window.location.origin}/auth/callback`;
      const response = await getGoogleAuthUrl(redirectUri);
      window.location.href = response.auth_url;
    } catch (err) {
      setError("Failed to initiate Google sign up. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {/* Loading Overlay */}
      {/* {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
            <p className="text-white font-medium">Creating your account...</p>
          </div>
        </div>
      )} */}

      <section
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50"
        style={{ paddingTop: "120px", paddingBottom: "100px" }}
      >
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Create Account
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* First Name & Last Name */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  First Name
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full outline-none text-gray-700"
                    required
                  />
                </div>
              </div>
              {fieldErrors.first_name && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.first_name}
                </p>
              )}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Last Name
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full outline-none text-gray-700"
                    required
                  />
                </div>
              </div>
              {fieldErrors.last_name && (
                <p className="text-red-500 text-xs mt-1 w-1/2 ml-auto">
                  {fieldErrors.last_name}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Username
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full outline-none text-gray-700"
                  required
                />
              </div>
              {fieldErrors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Role selection removed: all new users register as student by default */}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full outline-none text-gray-700"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <Lock className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full outline-none text-gray-700"
                  required
                />
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.password}
                </p>
              )}
              {!fieldErrors.password && (
                <p className="text-gray-500 text-xs mt-1">
                  {passwordPolicyMessage}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Confirm Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <Lock className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full outline-none text-gray-700"
                  required
                />
              </div>
              {fieldErrors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.confirm_password}
                </p>
              )}
            </div>

            {/* Error message */}
            {(error || fieldErrors.non_field) && (
              <p className="text-red-500 text-sm">
                {fieldErrors.non_field || error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth2 Button */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={googleLoading}
              className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </section>
      <Footer />
      {showInterestsPopup && (
        <InterestsPopup
          onClose={() => {
            window.location.href = "/";
          }}
        />
      )}
    </>
  );
};

export default RegisterPage;
