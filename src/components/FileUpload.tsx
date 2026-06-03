"use client";

import { useState, useRef } from "react";
import { uploadFile } from "@/lib/upload";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  onUploading?: (isUploading: boolean) => void;
  initialValue?: string;
  folder?: string;
  label?: string;
  aspectRatio?: number; // Optional aspect ratio (width/height) for image cropping
}

export default function FileUpload({
  onUploadComplete,
  onUploading,
  initialValue,
  folder = "general",
  label = "Upload Image",
  aspectRatio,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialValue || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cropping workspace states
  const [cropMode, setCropMode] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [baseSize, setBaseSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Helper to constrain position when dragging or zooming
  const constrainPosition = (x: number, y: number, currentZoom: number) => {
    const viewport = viewportRef.current;
    if (!viewport || baseSize.width === 0) return { x, y };
    const vRect = viewport.getBoundingClientRect();
    const W_v = vRect.width;
    const H_v = vRect.height;
    const W_zoom = baseSize.width * currentZoom;
    const H_zoom = baseSize.height * currentZoom;
    const maxX = Math.max(0, (W_zoom - W_v) / 2);
    const maxY = Math.max(0, (H_zoom - H_v) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("File size exceeds the 2MB limit.");
      return;
    }

    setError(null);

    // If an aspect ratio is provided, enter crop mode
    if (aspectRatio) {
      const localUrl = URL.createObjectURL(file);
      setImgSrc(localUrl);
      setSelectedFile(file);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setBaseSize({ width: 0, height: 0 });
      setCropMode(true);
    } else {
      // Direct upload
      uploadDirect(file);
    }
  };

  const uploadDirect = async (file: File) => {
    setUploading(true);
    onUploading?.(true);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const url = await uploadFile(file, folder);
      onUploadComplete(url);
    } catch (err: any) {
      console.error(err);
      setError("Upload failed: " + err.message);
      setPreview(initialValue || null);
    } finally {
      setUploading(false);
      onUploading?.(false);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const vRect = viewport.getBoundingClientRect();
    const R_i = img.naturalWidth / img.naturalHeight;
    const R_v = vRect.width / vRect.height;
    let w = 0;
    let h = 0;
    if (R_i > R_v) {
      h = vRect.height;
      w = vRect.height * R_i;
    } else {
      w = vRect.width;
      h = vRect.width / R_i;
    }
    setBaseSize({ width: w, height: h });
    setPosition({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (baseSize.width === 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const bounded = constrainPosition(newX, newY, zoom);
    setPosition(bounded);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setZoom(val);
    setPosition(prev => constrainPosition(prev.x, prev.y, val));
  };

  const handleCancelCrop = () => {
    if (imgSrc) {
      URL.revokeObjectURL(imgSrc);
    }
    setCropMode(false);
    setImgSrc(null);
    setSelectedFile(null);
  };

  const handleSaveCrop = () => {
    const viewport = viewportRef.current;
    const img = imgRef.current;
    if (!viewport || !img || !selectedFile || baseSize.width === 0) return;

    // Use a high resolution crop target: base it on 680px width (e.g., 680x340 for 2:1)
    const targetWidth = 680;
    const targetHeight = targetWidth / (aspectRatio || 1);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Transparent background
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const vRect = viewport.getBoundingClientRect();
    const scaleFactor = targetWidth / vRect.width;

    const W_v = vRect.width;
    const H_v = vRect.height;
    const W_zoom = baseSize.width * zoom;
    const H_zoom = baseSize.height * zoom;

    const X_left = (W_v - W_zoom) / 2 + position.x;
    const Y_top = (H_v - H_zoom) / 2 + position.y;

    const dx = X_left * scaleFactor;
    const dy = Y_top * scaleFactor;
    const dw = W_zoom * scaleFactor;
    const dh = H_zoom * scaleFactor;

    ctx.drawImage(img, dx, dy, dw, dh);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setError("Failed to generate cropped image.");
          return;
        }

        const croppedFile = new File([blob], selectedFile.name, {
          type: "image/jpeg",
        });

        // Clean up memory
        if (imgSrc) {
          URL.revokeObjectURL(imgSrc);
        }
        setCropMode(false);
        setImgSrc(null);
        setSelectedFile(null);

        // Upload
        uploadDirect(croppedFile);
      },
      "image/jpeg",
      0.95
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  if (cropMode && imgSrc && aspectRatio) {
    return (
      <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label className="form-label">{label} — Adjust & Crop</label>
        
        {/* Aspect Ratio Viewport */}
        <div
          ref={viewportRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: aspectRatio,
            overflow: "hidden",
            borderRadius: "12px",
            background: "rgba(0,0,0,0.4)",
            border: "1px solid var(--border-color)",
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imgSrc}
            alt="To Crop"
            onLoad={handleImageLoad}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              userSelect: "none",
              pointerEvents: "none",
              maxWidth: "none",
              maxHeight: "none",
              width: baseSize.width > 0 ? `${baseSize.width}px` : "auto",
              height: baseSize.height > 0 ? `${baseSize.height}px` : "auto",
            }}
          />

          {/* Grid lines overlay for user guidance */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              border: "2px solid rgba(0, 153, 255, 0.4)",
              borderRadius: "12px",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "33.33%",
              top: 0,
              bottom: 0,
              width: "1px",
              background: "rgba(255,255,255,0.15)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "66.66%",
              top: 0,
              bottom: 0,
              width: "1px",
              background: "rgba(255,255,255,0.15)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "33.33%",
              left: 0,
              right: 0,
              height: "1px",
              background: "rgba(255,255,255,0.15)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "66.66%",
              left: 0,
              right: 0,
              height: "1px",
              background: "rgba(255,255,255,0.15)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Zoom Control */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            <span>Zoom</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={handleZoomChange}
            style={{
              width: "100%",
              accentColor: "var(--primary)",
              cursor: "pointer",
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancelCrop}
            style={{ flex: 1, padding: "0.5rem 1rem", fontSize: "0.9rem" }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveCrop}
            style={{ flex: 1, padding: "0.5rem 1rem", fontSize: "0.9rem" }}
          >
            Save & Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div
        className={`file-dropzone ${dragActive ? "dragging" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleChange}
        />

        {preview ? (
          <div style={{ width: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="file-dropzone-preview" />
            <div className="file-dropzone-text">
              {uploading ? "Uploading adjusted image..." : "Click or drag to change image"}
            </div>
          </div>
        ) : (
          <>
            <div className="file-dropzone-icon">📁</div>
            <div className="file-dropzone-text">
              {uploading ? "Uploading..." : "Drag and drop or click to upload"}
            </div>
          </>
        )}
      </div>
      {error && <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.5rem" }}>{error}</div>}
    </div>
  );
}
