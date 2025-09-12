import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api/api";
import BecomeInstructor from "../components/BecomeInstructor";
import { User, Mail, BadgeCheck, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import InterestsPopup from "../components/Interests";

const ProfilePage = () => {
  const PLACEHOLDER_IMAGE = "https://www.gravatar.com/avatar/?d=mp";
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false); // ✅ new state
  const [showInterestsPopup, setShowInterestsPopup] = useState(false);

  // useEffect(() => {
  //   if (showInterestsPopup) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "auto";
  //   }
  // }, [showInterestsPopup]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        console.log(data);
        setFormData(data); // initialize formData with profile
      } catch (err) {
        console.log("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageError = (e) => {
    try {
      e.target.onerror = null;
      e.target.src = PLACEHOLDER_IMAGE;
    } catch (_) {}
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const form = new FormData();

      for (let key in formData) {
        if (key === "interests") continue;
        if (key === "image") {
          // Only append if it's a File object
          if (formData.image instanceof File) {
            form.append("image", formData.image);
          }
        } else {
          form.append(key, formData[key]);
        }
      }

      await updateProfile(form);
      window.location.reload();
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Failed to update profile.");
      setSaving(false);
    }
  };

  const handleBecomeInstructor = async () => {
    try {
      setSaving(true);
      await requestInstructor("I would like to teach.");
      toast.success("Request submitted. Admin will review it.");
    } catch (err) {
      console.error("Failed to request instructor", err);
      toast.error("Failed to submit request.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-red-500">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 mt-16">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                onError={handleImageError}
              />
            ) : profile.image ? (
              <img
                src={profile.image}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                onError={handleImageError}
              />
            ) : (
              <img
                src={PLACEHOLDER_IMAGE}
                alt="Placeholder avatar"
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                onError={handleImageError}
              />
            )}

            {editing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700">
                <Upload className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {editing ? (
              <input
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                className="border rounded-lg px-3 py-1"
              />
            ) : (
              profile.username
            )}
          </h2>
          <p className="text-gray-500">{profile.email}</p>
        </div>

        {/* Info Grid */}
        {/* Bio */}
        <div className="my-8 p-5 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-2">
            <BadgeCheck className="h-5 w-5 text-indigo-600" />
            <span className="text-gray-700 font-semibold">Bio</span>
          </div>
          {editing ? (
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 resize-none"
              placeholder="Tell us a little about yourself..."
            />
          ) : (
            <p className="text-gray-800 whitespace-pre-line">
              {profile.bio || "No bio added yet."}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <BadgeCheck className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700 font-semibold">First Name</span>
            </div>
            {editing ? (
              <input
                type="text"
                name="first_name"
                value={formData.first_name || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-800">{profile.first_name || "—"}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <BadgeCheck className="h-5 w-5 text-purple-600" />
              <span className="text-gray-700 font-semibold">Last Name</span>
            </div>
            {editing ? (
              <input
                type="text"
                name="last_name"
                value={formData.last_name || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-800">{profile.last_name || "—"}</p>
            )}
          </div>

          {/* Email */}
          <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 font-semibold">Email</span>
            </div>
            {editing ? (
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-800">{profile.email}</p>
            )}
          </div>

          {/* Role */}
          <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition md:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <BadgeCheck className="h-5 w-5 text-indigo-600" />
              <span className="text-gray-700 font-semibold">Role</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 capitalize">
                {profile.role}
              </span>
              {profile.role === "student" && (
                <BecomeInstructor
                  onSubmitted={() => {
                    /* Optionally refresh or toast */
                  }}
                />
              )}
            </div>
          </div>

          {/* Username */}
          <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-5 w-5 text-orange-600" />
              <span className="text-gray-700 font-semibold">Username</span>
            </div>
            {editing ? (
              <input
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-800">{profile.username}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => setShowInterestsPopup(true)}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold shadow-md hover:shadow-lg"
          >
            Manage Interests
          </button>
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg"
            >
              Edit Profile
            </button>
          )}
        </div>
        {showInterestsPopup && (
          <InterestsPopup
            onClose={() => setShowInterestsPopup(false)}
            // user={profile}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
