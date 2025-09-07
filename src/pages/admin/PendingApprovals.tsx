import React, { useEffect, useState } from "react";
import {
  listInstructorRequests,
  approveInstructor,
  rejectInstructor,
  listPendingCourses,
  approveCourse,
  rejectCourse,
} from "../../api/api";

const PendingApprovals: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [instructorRequests, setInstructorRequests] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [reqs, pendingCourses] = await Promise.all([
        listInstructorRequests(),
        listPendingCourses(),
      ]);
      setInstructorRequests(reqs);
      setCourses(pendingCourses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApproveInstructor = async (id: number) => {
    await approveInstructor(id);
    await load();
  };
  const handleRejectInstructor = async (id: number) => {
    const reason = prompt("Reason?") || "";
    await rejectInstructor(id, reason);
    await load();
  };

  const handleApproveCourse = async (id: number) => {
    await approveCourse(id);
    await load();
  };
  const handleRejectCourse = async (id: number) => {
    const reason = prompt("Reason?") || "";
    await rejectCourse(id, reason);
    await load();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Pending Approvals</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Instructor Requests</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-600 text-sm">
              <th className="py-2">User</th>
              <th className="py-2">Email</th>
              <th className="py-2">Motivation</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {instructorRequests.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">{r.name || r.user_id}</td>
                <td className="py-2">{r.email}</td>
                <td className="py-2 max-w-xl truncate" title={r.motivation}>
                  {r.motivation}
                </td>
                <td className="py-2 space-x-2">
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded"
                    onClick={() => handleApproveInstructor(r.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => handleRejectInstructor(r.id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Courses</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-600 text-sm">
              <th className="py-2">Title</th>
              <th className="py-2">Instructor</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="py-2">{c.title}</td>
                <td className="py-2">
                  {c.instructor_profile?.username || c.instructor}
                </td>
                <td className="py-2">{c.status}</td>
                <td className="py-2 space-x-2">
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded"
                    onClick={() => handleApproveCourse(c.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => handleRejectCourse(c.id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingApprovals;
