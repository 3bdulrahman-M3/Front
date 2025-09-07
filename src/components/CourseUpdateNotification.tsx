import React, { useState } from "react";
import { Bell, Send, X, AlertCircle, CheckCircle } from "lucide-react";
import {
  notificationService,
  CourseUpdateNotificationData,
} from "../services/notificationService";

interface CourseUpdateNotificationProps {
  courseId: number;
  courseTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CourseUpdateNotification: React.FC<CourseUpdateNotificationProps> = ({
  courseId,
  courseTitle,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [updateType, setUpdateType] = useState<
    "content" | "announcement" | "assignment" | "schedule"
  >("announcement");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsSending(true);
    setError("");

    try {
      const notificationData: CourseUpdateNotificationData = {
        course_id: courseId,
        title: title.trim(),
        message: message.trim(),
        update_type: updateType,
      };

      await notificationService.sendCourseUpdateNotification(
        courseId,
        notificationData
      );

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send notification");
    } finally {
      setIsSending(false);
    }
  };

  const getUpdateTypeIcon = (type: string) => {
    switch (type) {
      case "content":
        return "📚";
      case "announcement":
        return "📢";
      case "assignment":
        return "📝";
      case "schedule":
        return "📅";
      default:
        return "🔔";
    }
  };

  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case "content":
        return "Content Update";
      case "announcement":
        return "Announcement";
      case "assignment":
        return "Assignment";
      case "schedule":
        return "Schedule Change";
      default:
        return "Update";
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Notification Sent!
            </h3>
            <p className="text-gray-600">
              All enrolled students have been notified about the course update.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Notify Students
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Course:</strong> {courseTitle}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            This notification will be sent to all students enrolled in this
            course.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Update Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                ["content", "announcement", "assignment", "schedule"] as const
              ).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUpdateType(type)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    updateType === type
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getUpdateTypeIcon(type)}</span>
                    <span className="text-sm font-medium">
                      {getUpdateTypeLabel(type)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter notification title"
              maxLength={100}
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter notification message"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {message.length}/500
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !title.trim() || !message.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseUpdateNotification;
