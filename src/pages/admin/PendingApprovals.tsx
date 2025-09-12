import React, { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import {
  listInstructorRequests,
  approveInstructor,
  rejectInstructor,
  listPendingCourses,
  approveCourse,
  rejectCourse,
} from "../../api/api";

type InstructorRequest = {
  id: number;
  user_id: number;
  email: string;
  name?: string;
  motivation: string;
  status: string;
  created_at?: string;
  full_name?: string;
  degree?: string;
  certifications?: string;
  documents?: string[];
  photo_url?: string;
};

type CourseRequest = {
  id: number;
  title: string;
  instructor?: number;
  instructor_profile?: { username?: string } | null;
  status: string;
};

const PendingApprovals: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [instructorRequests, setInstructorRequests] = useState<
    InstructorRequest[]
  >([]);
  const [courses, setCourses] = useState<CourseRequest[]>([]);
  const [viewItem, setViewItem] = useState<InstructorRequest | null>(null);

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
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[28%]" />
              <col className="w-[36%]" />
              <col className="w-[16%]" />
            </colgroup>
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
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {r.name || r.user_id}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.email}</td>
                  <td className="py-2 pr-3 truncate" title={r.motivation}>
                    {r.motivation}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                        onClick={() => setViewItem(r)}
                      >
                        View
                      </button>
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                        onClick={() => handleApproveInstructor(r.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                        onClick={() => handleRejectInstructor(r.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow p-6 w-[680px] max-w-[95vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Instructor Request Details
              </h3>
              <button
                className="text-gray-500"
                onClick={() => setViewItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {viewItem.photo_url && (
                <div className="col-span-2 flex justify-center mb-2">
                  <Zoom>
                    <img
                      src={viewItem.photo_url}
                      alt="Primary document"
                      className="w-24 h-24 object-cover rounded border cursor-zoom-in"
                    />
                  </Zoom>
                </div>
              )}
              <div>
                <div className="text-gray-500">User</div>
                <div className="font-medium">
                  {viewItem.name || viewItem.user_id}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Email</div>
                <div className="font-medium">{viewItem.email}</div>
              </div>
              <div>
                <div className="text-gray-500">Full Name</div>
                <div className="font-medium">{viewItem.full_name || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Degree</div>
                <div className="font-medium">{viewItem.degree || "—"}</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500">Certifications</div>
                <div className="font-medium break-words">
                  {viewItem.certifications || "—"}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500">Motivation</div>
                <div className="font-medium break-words">
                  {viewItem.motivation || "—"}
                </div>
              </div>
            </div>
            {Array.isArray(viewItem.documents) &&
              viewItem.documents.length > 0 && (
                <div className="mt-4">
                  <div className="text-gray-500 mb-2">Documents</div>
                  <div className="flex gap-3 flex-wrap">
                    {viewItem.documents.map((url: string, idx: number) =>
                      /\.pdf(\?|$)/i.test(url) ? (
                        <a
                          key={idx}
                          className="text-blue-600 underline"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          PDF {idx + 1}
                        </a>
                      ) : (
                        <Zoom key={idx}>
                          <img
                            src={url}
                            alt={`doc-${idx}`}
                            className="w-24 h-24 object-cover rounded border cursor-zoom-in"
                          />
                        </Zoom>
                      )
                    )}
                  </div>
                </div>
              )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-3 py-2 bg-gray-200 rounded"
                onClick={() => setViewItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
