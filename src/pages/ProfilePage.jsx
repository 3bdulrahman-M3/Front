import React, { useEffect, useState } from "react";
import {
  getProfile,
  updateProfile,
  requestIdentityVerification,
  getMyIdentityVerification,
} from "../api/api";
import ImageCropper from "../components/ui/ImageCropper";
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
  const [verificationFile, setVerificationFile] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [myVerification, setMyVerification] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [verificationPreview, setVerificationPreview] = useState(null);

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
  useEffect(() => {
    const loadVerification = async () => {
      try {
        const res = await getMyIdentityVerification();
        setMyVerification(res);
      } catch (_) {
        setMyVerification(null);
      }
    };
    loadVerification();
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
              <span className="inline-flex items-center gap-2">
                {profile.username}
                {profile.verified === "verified" && (
                  <BadgeCheck
                    className="h-5 w-5 text-green-500"
                    aria-label="Verified user"
                    title="Verified"
                  />
                )}
              </span>
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

        {/* Request Verification */}
        {profile.verified !== "verified" && (
          <div className="mt-10 p-6 bg-gray-50 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <BadgeCheck
                  className={`h-5 w-5 ${
                    profile.verified === "verified"
                      ? "text-green-600"
                      : profile.verified === "pending"
                      ? "text-yellow-600"
                      : "text-gray-400"
                  }`}
                />
                <span className="text-gray-800 font-semibold">
                  Request Verification
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  profile.verified === "verified"
                    ? "bg-green-100 text-green-700"
                    : profile.verified === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {profile.verified === "verified"
                  ? "Verified"
                  : profile.verified === "pending"
                  ? "Pending"
                  : "Not Verified"}
              </span>
            </div>
            {profile.verified !== "verified" && (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Hidden native input */}
                <input
                  id="id-photo-input"
                  type="file"
                  accept="image/*"
                  disabled={profile.verified === "pending"}
                  onChange={(e) => {
                    if (profile.verified === "pending") return;
                    const f = e.target.files?.[0] || null;
                    if (!f) {
                      setVerificationFile(null);
                      setVerificationPreview(null);
                      setCropSrc(null);
                      return;
                    }
                    // Open crop modal with data URL
                    const reader = new FileReader();
                    reader.onload = () => setCropSrc(reader.result);
                    reader.readAsDataURL(f);
                  }}
                  className="hidden"
                />

                {/* Styled choose file button */}
                <label
                  htmlFor="id-photo-input"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold shadow cursor-pointer select-none ${
                    profile.verified === "pending"
                      ? "bg-gray-300 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg"
                  }`}
                  aria-disabled={profile.verified === "pending"}
                >
                  <Upload className="h-4 w-4" /> Choose ID Photo
                </label>

                {/* Inline preview thumbnail */}
                {verificationPreview && (
                  <div className="flex items-center gap-3">
                    <img
                      src={verificationPreview}
                      alt="ID preview"
                      className="h-14 w-20 object-cover rounded border"
                    />
                    <button
                      onClick={() => cropSrc || setCropSrc(verificationPreview)}
                      className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300"
                    >
                      Adjust
                    </button>
                  </div>
                )}

                {/* Submit */}
                <button
                  disabled={
                    !verificationFile ||
                    verificationLoading ||
                    profile.verified === "pending"
                  }
                  onClick={async () => {
                    if (!verificationFile) return;
                    try {
                      setVerificationLoading(true);
                      await requestIdentityVerification(verificationFile);
                      toast.success("Verification request submitted.");
                      const updated = await getProfile();
                      setProfile(updated);
                      try {
                        const vr = await getMyIdentityVerification();
                        setMyVerification(vr);
                      } catch (_) {}
                      setVerificationFile(null);
                      setVerificationPreview(null);
                      setCropSrc(null);
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to submit verification.");
                    } finally {
                      setVerificationLoading(false);
                    }
                  }}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50"
                >
                  {verificationLoading ? "Submitting..." : "Submit ID Photo"}
                </button>
              </div>
            )}
            {cropSrc && (
              <ImageCropper
                src={cropSrc}
                aspect={4 / 3}
                round={false}
                title="Adjust ID Photo"
                onClose={() => {
                  setCropSrc(null);
                }}
                onComplete={(file) => {
                  setVerificationFile(file);
                  const url = URL.createObjectURL(file);
                  setVerificationPreview(url);
                }}
              />
            )}
            {myVerification?.id_photo_url && (
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={myVerification.id_photo_url}
                  alt="ID"
                  className="h-16 w-16 object-cover rounded border"
                />
                <div className="text-sm text-gray-600">
                  <div>
                    Status:{" "}
                    <span className="font-medium">{myVerification.status}</span>
                  </div>
                  {myVerification.notes ? (
                    <div>Notes: {myVerification.notes}</div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
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
