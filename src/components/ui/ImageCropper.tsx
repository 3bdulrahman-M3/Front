import React, { useCallback, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

interface ImageCropperProps {
  src: string;
  onClose: () => void;
  onComplete: (file: File) => void;
  aspect?: number; // default 1 (square)
  round?: boolean; // if true, output circle cropped png
  title?: string;
}

// Utility to crop the image into a blob using canvas
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  round = false
): Promise<Blob> {
  const image: HTMLImageElement = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const safeArea = Math.max(image.width, image.height) * 2;
  canvas.width = safeArea;
  canvas.height = safeArea;

  // move the origin to the center for rotation around center
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // draw the image
  ctx.drawImage(
    image,
    (safeArea - image.width) / 2,
    (safeArea - image.height) / 2
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // set canvas back to the desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // draw the cropped area
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
  );

  if (round) {
    // mask into circle
    const size = Math.min(canvas.width, canvas.height);
    const circleCanvas = document.createElement("canvas");
    circleCanvas.width = size;
    circleCanvas.height = size;
    const cctx = circleCanvas.getContext("2d");
    if (!cctx) throw new Error("Canvas not supported");
    cctx.beginPath();
    cctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    cctx.closePath();
    cctx.clip();
    cctx.drawImage(
      canvas,
      (canvas.width - size) / 2,
      (canvas.height - size) / 2,
      size,
      size,
      0,
      0,
      size,
      size
    );
    return await new Promise<Blob>((resolve) =>
      circleCanvas.toBlob((b) => resolve(b as Blob), "image/png", 0.95)
    );
  }

  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.9)
  );
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  onClose,
  onComplete,
  aspect = 1,
  round = false,
  title = "Adjust photo",
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const workingRef = useRef(false);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleDone = useCallback(async () => {
    if (!croppedAreaPixels || workingRef.current) return;
    workingRef.current = true;
    try {
      const blob = await getCroppedImg(src, croppedAreaPixels, rotation, round);
      const file = new File([blob], "cropped.jpg", { type: blob.type });
      onComplete(file);
      onClose();
    } catch {
      workingRef.current = false;
    }
  }, [croppedAreaPixels, onComplete, onClose, rotation, round, src]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-[92vw] max-w-[720px] p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-gray-500" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="relative w-full h-[52vw] max-h-[420px] bg-gray-100 rounded overflow-hidden">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            cropShape={round ? "round" : "rect"}
            showGrid={false}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-12">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-12">Rotate</span>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
              onClick={handleDone}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
