import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import {
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../api/api";

type Category = {
  id: number;
  name: string;
  description?: string | null;
  image_url?: string | null;
  courses_count?: number;
};

const ManageCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) =>
      [c.name, c.description || ""].some((v) => v.toLowerCase().includes(term))
    );
  }, [categories, search]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListCategories({ search });
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setShowDialog(true);
  };
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "" });
    setShowDialog(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      if (editing) {
        await adminUpdateCategory(editing.id, form);
      } else {
        await adminCreateCategory(form);
      }
      setShowDialog(false);
      await fetchData();
    } catch (err) {
      alert("Failed to save category");
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const id = confirmDeleteId;
      setConfirmDeleteId(null);
      await adminDeleteCategory(id);
      await fetchData();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Add Category
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-600 text-sm">
                    <th className="py-2 pr-2">Name</th>
                    <th className="py-2 pr-2">Description</th>
                    <th className="py-2 pr-2"># Courses</th>
                    <th className="py-2 pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="py-2 pr-2">{c.name}</td>
                      <td className="py-2 pr-2 max-w-[420px] truncate">
                        {c.description || "—"}
                      </td>
                      <td className="py-2 pr-2">{c.courses_count ?? 0}</td>
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="px-3 py-1.5 border rounded hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(c.id)}
                            className="px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-center text-gray-500"
                      >
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowDialog(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editing ? "Edit Category" : "Add Category"}
            </h3>
            <form className="space-y-3" onSubmit={submitForm}>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 rounded bg-indigo-600 text-white"
                >
                  {editing ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Category</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this category?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-2 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;

