import React from "react";
import { GraduationCap, User } from "lucide-react";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onRoleSelect: (role: 'student' | 'instructor') => void;
  onClose: () => void;
  userEmail: string;
  userName: string;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onRoleSelect,
  onClose,
  userEmail,
  userName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {userName}!
          </h2>
          <p className="text-gray-600 text-sm">
            {userEmail}
          </p>
          <p className="text-gray-700 mt-4">
            Please select your role to continue:
          </p>
        </div>

        <div className="space-y-4">
          {/* Student Option */}
          <button
            onClick={() => onRoleSelect('student')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <GraduationCap className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                  Student
                </h3>
                <p className="text-sm text-gray-600">
                  Enroll in courses, attend live sessions, and track your progress
                </p>
              </div>
            </div>
          </button>

          {/* Instructor Option */}
          <button
            onClick={() => onRoleSelect('instructor')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-purple-600 group-hover:text-purple-700" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">
                  Instructor
                </h3>
                <p className="text-sm text-gray-600">
                  Create courses, host live sessions, and manage your content
                </p>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
