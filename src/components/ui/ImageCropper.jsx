import React, { useCallback } from "react";

/**
 * Minimal ImageCropper placeholder to unblock the app.
 * Shows a preview and allows using the selected image as-is.
 *
 * Props:
 * - src: data URL or image URL
 * - aspect: number (ignored in this minimal implementation)
 * - round: boolean (ignored; preview remains rectangular)
 * - title: string
 * - onClose: () => void
 * - onComplete: (file: File) => void
 */
const ImageCropper = ({ src, title = "Adjust Image", onClose, onComplete }) => {
  const handleUseAsIs = useCallback(async () => {
    try {
      let blob;
      if (typeof src === "string" && src.startsWith("data:")) {
        // data URL → Blob
        const res = await fetch(src);
        blob = await res.blob();
      } else {
        // URL → fetch → Blob
        const res = await fetch(src, { mode: "cors" });
        blob = await res.blob();
      }
      const file = new File([blob], "image.jpg", {
        type: blob.type || "image/jpeg",
      });
      onComplete?.(file);
      onClose?.();
    } catch (_) {
      onClose?.();
    }
  }, [src, onComplete, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 px-2 py-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-5">
          <div className="w-full flex items-center justify-center">
            {/* Preview only (no interactive crop in this minimal version) */}
            <img
              src={src}
              alt="Preview"
              className="max-h-96 w-auto rounded-lg object-contain border"
            />
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleUseAsIs}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
            >
              Use as-is
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
