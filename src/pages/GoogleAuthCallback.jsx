import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { googleAuthCallback, updateProfile } from "../api/api";
import RoleSelectionModal from "../components/RoleSelectionModal";

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [googleUserInfo, setGoogleUserInfo] = useState(null);
  const [processed, setProcessed] = useState(false); // Prevent duplicate processing
  const hasRun = useRef(false); // Extra protection against React Strict Mode

  useEffect(() => {
    // Prevent duplicate processing of the same code
    if (processed || hasRun.current) return;

    hasRun.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setError("Authentication failed. Please try again.");
      setLoading(false);
      return;
    }

    if (!code) {
      setError("No authorization code received.");
      setLoading(false);
      return;
    }

    // Mark as processed to prevent duplicate calls
    setProcessed(true);
    setAuthCode(code);

    // Try exchanging code without role first; backend should return user with role if exists
    (async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/callback`;
        // Include pre-selected role from registration page if present
        const preselectedRole =
          sessionStorage.getItem("oauth_role") || undefined;
        const response = await googleAuthCallback(
          code,
          redirectUri,
          preselectedRole
        );
        // Save tokens and user info
        if (response.access_token)
          localStorage.setItem("accessToken", response.access_token);
        if (response.refresh_token)
          localStorage.setItem("refreshToken", response.refresh_token);
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
          // Dispatch custom event to notify navbar and other components
          window.dispatchEvent(new CustomEvent("userUpdated"));
        }

        // If role was provided during registration, cleanup the session storage
        if (preselectedRole) sessionStorage.removeItem("oauth_role");

        const user = response.user;
        if (user?.role) {
          // Redirect by role
          navigate(user.role === "instructor" ? "/mycourses" : "/");
        } else {
          // Fallback: get user info from query for modal context
          const email = searchParams.get("email") || user?.email || "";
          const name = searchParams.get("name") || user?.first_name || "";
          setGoogleUserInfo({ email, name });
          setShowRoleModal(true);
        }
      } catch (e) {
        console.error("Google OAuth callback error:", e);

        // Extract error details for better user feedback
        let errorMessage = "Authentication failed. Please try again.";

        if (e.response?.data?.error) {
          errorMessage = e.response.data.error;

          // Special handling for specific errors
          if (
            e.response.data.error.includes("Malformed auth code") ||
            e.response.data.error.includes("invalid_grant")
          ) {
            errorMessage =
              "The authorization code has expired or been used already. Please try logging in again.";
          } else if (e.response.data.error.includes("not configured")) {
            errorMessage = "Google authentication is not properly configured.";
          }
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams, processed]); // Include processed in dependencies

  const handleRoleSelect = async (role) => {
    try {
      setLoading(true);
      setError("");

      // Create FormData for role update
      const formData = new FormData();
      formData.append("role", role);

      // Persist role to profile
      const result = await updateProfile(formData);

      // Update localStorage with the new role
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = result?.user || { ...currentUser, role: role };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Dispatch custom event to notify navbar and other components
      window.dispatchEvent(new CustomEvent("userUpdated"));

      setShowRoleModal(false);
      navigate(role === "instructor" ? "/mycourses" : "/");
    } catch (err) {
      console.error("Failed to save role:", err);
      setError("Failed to save role. Please try again.");
      setShowRoleModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowRoleModal(false);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <RoleSelectionModal
        isOpen={showRoleModal}
        onRoleSelect={handleRoleSelect}
        onClose={handleCloseModal}
        userEmail={googleUserInfo?.email || ""}
        userName={googleUserInfo?.name || ""}
      />
    </>
  );
};

export default GoogleAuthCallback;
