/**
 * ImageUploader Component — CampusConnect
 * Drag-and-drop image upload with watermark preview, progress bar, and validation.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { getWatermarkedUrl } from '../utils/watermark';
import './ImageUploader.css';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ImageUploader({ onImageReady, onRemove }) {
  const [preview, setPreview] = useState(null);
  const [watermarkedBlob, setWatermarkedBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  /* ─── Validation ─── */
  const validateFile = useCallback((file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Unsupported format. Please use JPEG, PNG, or WebP.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  }, []);

  /* ─── Process file: validate → watermark → preview ─── */
  const processFile = useCallback(
    async (file) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setUploading(true);
      setProgress(0);

      /* Simulate upload progress while watermarking */
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
      }, 120);

      try {
        const dataUrl = await getWatermarkedUrl(file);
        clearInterval(progressInterval);
        setProgress(100);

        /* Short delay to show 100% */
        setTimeout(() => {
          setPreview(dataUrl);
          setWatermarkedBlob(file);
          setUploading(false);

          if (onImageReady) onImageReady(file, dataUrl);
        }, 300);
      } catch (err) {
        clearInterval(progressInterval);
        setUploading(false);
        setError('Failed to process image. Please try again.');
        console.error('Watermark error:', err);
      }
    },
    [validateFile, onImageReady]
  );

  /* ─── Drag handlers ─── */
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  /* ─── Click to browse ─── */
  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      /* Reset input so the same file can be selected again */
      e.target.value = '';
    },
    [processFile]
  );

  /* ─── Remove image ─── */
  const handleRemove = useCallback(() => {
    setPreview(null);
    setWatermarkedBlob(null);
    setError(null);
    setProgress(0);
    if (onRemove) onRemove();
  }, [onRemove]);

  /* ─── Render: Progress state ─── */
  if (uploading) {
    return (
      <div className="image-uploader">
        <div className="image-uploader__progress">
          <Upload size={28} className="image-uploader__icon" />
          <div className="image-uploader__progress-bar">
            <div
              className="image-uploader__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="image-uploader__progress-text">
            Processing image… {Math.round(progress)}%
          </span>
        </div>
      </div>
    );
  }

  /* ─── Render: Preview state ─── */
  if (preview) {
    return (
      <div className="image-uploader">
        <div className="image-uploader__preview">
          <img
            src={preview}
            alt="Upload preview"
            className="image-uploader__preview-img"
          />
          <div className="image-uploader__preview-overlay">
            <button
              className="image-uploader__remove-btn"
              onClick={handleRemove}
              type="button"
            >
              <X size={14} />
              Remove
            </button>
          </div>
          <div className="image-uploader__watermark-badge">
            <ShieldCheck size={12} />
            Watermarked
          </div>
        </div>
        {error && (
          <div className="image-uploader__error">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>
    );
  }

  /* ─── Render: Drop zone state ─── */
  return (
    <div className="image-uploader">
      <div
        className={`image-uploader__dropzone${dragActive ? ' image-uploader__dropzone--active' : ''}`}
        onClick={handleClick}
        onDragEnter={handleDragIn}
        onDragOver={handleDrag}
        onDragLeave={handleDragOut}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      >
        <Upload size={32} className="image-uploader__icon" />
        <p className="image-uploader__label">
          {dragActive ? (
            'Drop your image here'
          ) : (
            <>
              Drag & drop or <span>click to browse</span>
            </>
          )}
        </p>
        <p className="image-uploader__hint">
          JPEG, PNG, or WebP — max {MAX_SIZE_MB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileChange}
          className="image-uploader__input"
        />
      </div>
      {error && (
        <div className="image-uploader__error">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
