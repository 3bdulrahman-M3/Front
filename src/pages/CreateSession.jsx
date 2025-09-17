import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSession } from "../api/api";
import { Video, Loader2, ArrowLeft } from "lucide-react";

const CreateSession = () => {
  const [title, setTitle] = useState("");
  const [endDate, setEndDate] = useState("");
  const [titleError, setTitleError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState(null);

  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const validateTitle = () => {
    if (!title.trim()) {
      setTitleError("Title is required.");
      return false;
    }
    setTitleError("");
    return true;
  };

  const validateEndDate = () => {
    if (!endDate) {
      setEndDateError("End date is required.");
      return false;
    }
    const selectedDate = new Date(endDate);
    if (selectedDate < new Date()) {
      setEndDateError("End date must be in the future.");
      return false;
    }
    setEndDateError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const isTitleValid = validateTitle();
    const isEndDateValid = validateEndDate();
    if (!isTitleValid || !isEndDateValid) return;

    setCreating(true);
    try {
      const roomName = `session-${crypto.randomUUID()}`;
      const isoEndDate = new Date(endDate).toISOString();
      const newSession = await createSession({
        title,
        room_name: roomName,
        end_date: isoEndDate,
      });
      navigate(`/sessions/${newSession.id}`);
    } catch (err) {
      console.error("Failed to create session", err);
      setFormError(
        "Something went wrong while creating the session. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-12 mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 mb-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Video className="h-7 w-7 text-blue-600" /> Create a New Session
      </h1>

      {formError && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={validateTitle}
            placeholder="e.g. React Study Group"
            className={`w-full px-4 py-3 rounded-xl border ${
              titleError ? "border-red-400" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm`}
          />
          {titleError && (
            <p className="text-red-600 text-sm mt-1">{titleError}</p>
          )}
        </div>

        {/* End Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onBlur={validateEndDate}
            className={`w-full px-4 py-3 rounded-xl border ${
              endDateError ? "border-red-400" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm`}
          />
          {endDateError && (
            <p className="text-red-600 text-sm mt-1">{endDateError}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={creating}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition"
        >
          {creating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <Video className="h-5 w-5" /> Create Session
            </>
          )}
        </button>
      </form>

      {/* Go Back Button */}
      <button
        onClick={() => navigate("/sessions")}
        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Sessions
      </button>
    </div>
  );
};

export default CreateSession;
