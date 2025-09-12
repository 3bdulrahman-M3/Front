import React, { useState } from "react";
import { requestInstructorWithDocs } from "../api/api";

type Props = {
  onSubmitted?: () => void;
};

const BecomeInstructor: React.FC<Props> = ({ onSubmitted }) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    degree: "",
    certifications: "",
    motivation: "",
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setFiles(list);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await requestInstructorWithDocs({
        full_name: form.full_name,
        degree: form.degree,
        certifications: form.certifications,
        motivation: form.motivation,
        files,
      });
      setOpen(false);
      setFiles([]);
      setForm({
        full_name: "",
        degree: "",
        certifications: "",
        motivation: "",
      });
      onSubmitted && onSubmitted();
    } catch (err) {
      console.error("Failed to submit instructor request", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setOpen(true)}
      >
        Become Instructor
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={onSubmit}
            className="bg-white p-6 rounded shadow-lg w-96 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Become Instructor</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border p-2 rounded"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Degree"
              className="w-full border p-2 rounded"
              value={form.degree}
              onChange={(e) => setForm({ ...form, degree: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Certifications (comma-separated)"
              className="w-full border p-2 rounded"
              value={form.certifications}
              onChange={(e) =>
                setForm({ ...form, certifications: e.target.value })
              }
            />
            <textarea
              placeholder="Motivation / Extra details"
              className="w-full border p-2 rounded"
              value={form.motivation}
              onChange={(e) => setForm({ ...form, motivation: e.target.value })}
              rows={3}
            />
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={onFileChange}
              className="w-full"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded w-full"
              disabled={saving}
            >
              {saving ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BecomeInstructor;
