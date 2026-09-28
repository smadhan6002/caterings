import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, UploadCloud, Check, AlertTriangle } from 'lucide-react';
import { categories as staticCategories } from '../../data/menu';
import { dishService } from '../../services/dishService';
import type { AdminDish } from '../../types/admin';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB limit for base64 storage

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resizeImage(file: File, maxPx = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = reject;
    img.src = url;
  });
}

interface DishFormData {
  name: string;
  categoryId: string;
  imagePreview: string;
  imageFile: File | null;
}

const emptyForm = (): DishFormData => ({
  name: '',
  categoryId: staticCategories[0]?.id ?? '',
  imagePreview: '',
  imageFile: null,
});

export const AdminDishes: React.FC = () => {
  const [adminDishes, setAdminDishes] = useState<AdminDish[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DishFormData>(emptyForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const allCategories = staticCategories.map((c) => ({ id: c.id, name: c.name }));

  useEffect(() => {
    setAdminDishes(dishService.getAll());
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm());
    setFormError('');
    setShowForm(true);
  }

  function openEdit(dish: AdminDish) {
    setEditingId(dish.id);
    setForm({ name: dish.name, categoryId: dish.categoryId, imagePreview: dish.image, imageFile: null });
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setFormError('');
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    setFormError('');
    try {
      const preview = file.size > MAX_IMAGE_SIZE
        ? await resizeImage(file)
        : await fileToBase64(file);
      setForm((f) => ({ ...f, imagePreview: preview, imageFile: file }));
    } catch {
      setFormError('Failed to load image. Try a different file.');
    }
  }

  async function handleSave() {
    setFormError('');
    if (!form.name.trim()) { setFormError('Dish name is required.'); return; }
    if (!form.categoryId) { setFormError('Please select a category.'); return; }
    if (!form.imagePreview) { setFormError('Please upload a dish image.'); return; }

    setSaving(true);
    try {
      if (editingId) {
        dishService.update(editingId, {
          name: form.name.trim(),
          categoryId: form.categoryId,
          image: form.imagePreview,
        });
        showToast('Dish updated successfully.');
      } else {
        dishService.add({
          name: form.name.trim(),
          categoryId: form.categoryId,
          image: form.imagePreview,
        });
        showToast('Dish added successfully.');
      }
      setAdminDishes(dishService.getAll());
      closeForm();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string) {
    dishService.delete(id);
    setAdminDishes(dishService.getAll());
    setDeleteConfirm(null);
    showToast('Dish deleted.');
  }

  // Group admin dishes by category
  const grouped = allCategories
    .map((cat) => ({
      ...cat,
      dishes: adminDishes.filter((d) => d.categoryId === cat.id),
    }))
    .filter((g) => g.dishes.length > 0);

  return (
    <div className="p-4 md:p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          <Check size={16} />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dishes</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage custom dishes added by admin</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={16} />
          Add Dish
        </button>
      </div>

      {/* No admin dishes */}
      {grouped.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-400">
          <UtensilsIcon />
          <p className="mt-3 text-sm">No custom dishes added yet.</p>
          <p className="text-xs mt-1">Use "Add Dish" to add a new dish to any category.</p>
        </div>
      )}

      {/* Grouped Dish List */}
      {grouped.map((group) => (
        <div key={group.id} className="mb-6">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">{group.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {group.dishes.map((dish) => (
              <div key={dish.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex gap-3 p-3">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{dish.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{group.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => openEdit(dish)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <span className="text-slate-200">|</span>
                    <button
                      onClick={() => setDeleteConfirm(dish.id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Note about built-in dishes */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
        Built-in dishes (from the original menu) are displayed on the customer website but cannot be edited here. Only admin-added dishes appear in this panel.
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Edit Dish' : 'Add New Dish'}
              </h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4 flex items-center gap-2">
                <AlertTriangle size={14} /> {formError}
              </div>
            )}

            <div className="space-y-4">
              {/* Dish Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="e.g. Paneer Tikka"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white"
                >
                  {allCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dish Image *{editingId && ' (leave blank to keep current)'}
                </label>

                {form.imagePreview ? (
                  <div className="relative">
                    <img
                      src={form.imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-xl border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => { setForm((f) => ({ ...f, imagePreview: '', imageFile: null })); if (fileRef.current) fileRef.current.value = ''; }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border border-slate-200 text-slate-500 hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      Change image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary transition-colors"
                  >
                    <UploadCloud size={24} />
                    <span className="text-sm">Click to upload image</span>
                    <span className="text-xs">JPG, PNG, WEBP (max 2MB recommended)</span>
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeForm}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {saving ? 'Saving…' : editingId ? 'Update Dish' : 'Add Dish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Delete Dish</h3>
                <p className="text-sm text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 mb-5">
              Are you sure you want to delete this dish? Historical orders will not be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium"
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

// Simple icon component
const UtensilsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);
