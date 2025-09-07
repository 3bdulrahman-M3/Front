import React from "react";

interface SessionExpiredDialogProps {
  open: boolean;
  message?: string;
  onClose: () => void;
}

const SessionExpiredDialog: React.FC<SessionExpiredDialogProps> = ({
  open,
  message = "Your session has expired. Please log in again.",
  onClose,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 pt-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Session Expired
          </h3>
        </div>
        <div className="px-6 py-4 text-gray-700">{message}</div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              window.location.href = "/login";
            }}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 font-medium hover:opacity-95"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredDialog;
