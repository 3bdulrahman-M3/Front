import React, { useState } from "react";
import { Bell, Plus } from "lucide-react";
import CourseUpdateNotification from "./CourseUpdateNotification";

interface CourseUpdateButtonProps {
  courseId: number;
  courseTitle: string;
  isInstructor: boolean;
}

const CourseUpdateButton: React.FC<CourseUpdateButtonProps> = ({
  courseId,
  courseTitle,
  isInstructor,
}) => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  if (!isInstructor) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowNotificationModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
      >
        <Bell className="h-4 w-4" />
        <span>Notify Students</span>
      </button>

      {showNotificationModal && (
        <CourseUpdateNotification
          courseId={courseId}
          courseTitle={courseTitle}
          onClose={() => setShowNotificationModal(false)}
          onSuccess={() => {
            // You can add any success handling here
            console.log("Notification sent successfully");
          }}
        />
      )}
    </>
  );
};

export default CourseUpdateButton;
