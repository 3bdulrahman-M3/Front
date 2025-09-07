import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Notes from "../components/Notes";
import { getCourse, createCourseVideo } from "../api/api";
import { toast } from "react-hot-toast";
import {
  FileText,
  Video,
  SkipBack,
  SkipForward,
  PlayCircle,
  X,
} from "lucide-react";

// Simple reusable modal
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl p-6 relative w-full max-w-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

const CourseDetailsPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("notes");
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [videoForm, setVideoForm] = useState({
    title: "",
    url: "",
    description: "",
    order: 0,
  });
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const isOwnerInstructor =
    user?.role === "instructor" && course?.instructor === user?.id;

  const currentVideo = useMemo(() => {
    if (!Array.isArray(course?.videos) || course.videos.length === 0)
      return null;
    const index = Math.min(
      Math.max(currentVideoIndex, 0),
      course.videos.length - 1
    );
    return course.videos[index];
  }, [course, currentVideoIndex]);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const ytMatch = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
      );
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
      const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    } catch (_) {}
    return null;
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourse(id);
        setCourse(data);
      } catch (err) {
        console.error("Failed to load course", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: videoForm.title,
        url: videoForm.url,
        description: videoForm.description,
        order: parseInt(videoForm.order || 0, 10),
      };
      const created = await createCourseVideo(id, payload);
      setCourse((prev) => ({
        ...prev,
        videos: [...(prev.videos || []), created],
      }));
      setShowAddVideoModal(false);
      setVideoForm({ title: "", url: "", description: "", order: 0 });
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data
        ? JSON.stringify(e.response.data)
        : "Failed to add video.";
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-500 animate-pulse">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-red-500">Failed to load course.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
      {/* Top Navigation Tabs */}
      <div className="flex justify-center gap-4 mb-0">
        {[
          { key: "notes", label: "Notes", icon: FileText },
          { key: "lectures", label: "Lectures", icon: Video },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[70vh]">
        {activeTab === "notes" && <Notes courseId={course.id} />}

        {activeTab === "lectures" && (
          <div>
            {isOwnerInstructor && (
              <div className="mb-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowAddVideoModal(true)}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition"
                >
                  Add Video
                </button>
              </div>
            )}

            {/* Add Video Modal */}
            <Modal
              isOpen={showAddVideoModal}
              onClose={() => setShowAddVideoModal(false)}
            >
              <h2 className="text-lg font-semibold mb-4">Add New Video</h2>
              <form onSubmit={handleAddVideo} className="grid gap-4">
                <input
                  type="text"
                  placeholder="Video Title"
                  value={videoForm.title}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, title: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="url"
                  placeholder="Video URL"
                  value={videoForm.url}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, url: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={videoForm.description}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, description: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
                <input
                  type="number"
                  placeholder="Order (optional)"
                  value={videoForm.order}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, order: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  min={0}
                />
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition"
                >
                  Save Video
                </button>
              </form>
            </Modal>

            {Array.isArray(course.videos) && course.videos.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Player */}
                <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-4">
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-black/5">
                    {currentVideo?.file ? (
                      <video
                        key={currentVideo.file}
                        controls
                        className="w-full h-full"
                        src={currentVideo.file}
                      />
                    ) : currentVideo?.url && getEmbedUrl(currentVideo.url) ? (
                      <iframe
                        key={currentVideo.url}
                        src={getEmbedUrl(currentVideo.url)}
                        title={currentVideo.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : currentVideo?.url ? (
                      <video
                        key={currentVideo.url}
                        controls
                        className="w-full h-full"
                        src={currentVideo.url}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No video source
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      onClick={() =>
                        setCurrentVideoIndex((i) => Math.max(i - 1, 0))
                      }
                      disabled={currentVideoIndex === 0}
                    >
                      <SkipBack className="w-4 h-4" /> Previous
                    </button>
                    <div className="text-sm text-gray-600">
                      {currentVideoIndex + 1} / {course.videos.length}
                    </div>
                    <button
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      onClick={() =>
                        setCurrentVideoIndex((i) =>
                          Math.min(i + 1, course.videos.length - 1)
                        )
                      }
                      disabled={currentVideoIndex >= course.videos.length - 1}
                    >
                      Next <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Video details */}
                  <div className="mt-4 border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {currentVideo?.title || "Untitled video"}
                    </h3>
                    {currentVideo?.description && (
                      <p className="mt-1 text-gray-600">
                        {currentVideo.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Playlist */}
                <aside className="bg-white rounded-xl border shadow-sm p-3 max-h-[60vh] overflow-y-auto">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    Playlist
                  </div>
                  <div className="space-y-2">
                    {course.videos.map((v, idx) => {
                      const isActive = idx === currentVideoIndex;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setCurrentVideoIndex(idx)}
                          className={`w-full text-left p-2 rounded-lg border flex items-center gap-3 ${
                            isActive
                              ? "bg-blue-50 border-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${
                              isActive
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <PlayCircle className="w-4 h-4" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {v.title}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </aside>
              </div>
            ) : (
              <p className="text-gray-500">No videos yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailsPage;
