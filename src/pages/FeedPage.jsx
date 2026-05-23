/**
 * FeedPage — CampusConnect
 * Main social media feed with category filters, create post form, and PostCard list.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Newspaper,
  Code,
  MapPin,
  LayoutGrid,
  ImagePlus,
  Loader2,
  Inbox,
} from 'lucide-react';
import { useFeed } from '../contexts/FeedContext';
import PostCard from '../components/PostCard';
import ImageUploader from '../components/ImageUploader';
import './FeedPage.css';

/* ─── Category definitions ─── */
const CATEGORIES = [
  { key: 'all', label: 'All', icon: LayoutGrid },
  { key: 'news', label: 'News', icon: Newspaper },
  { key: 'projects', label: 'Projects', icon: Code },
  { key: 'gathering-spots', label: 'Gathering Spots', icon: MapPin },
];

/* ─── Mock current user (replace with auth context in production) ─── */
const CURRENT_USER = {
  id: 'user-1',
  name: 'APC Admin',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AA&backgroundColor=3b82f6',
  type: 'admin',
};

export default function FeedPage() {
  const {
    posts,
    loading,
    activeCategory,
    setCategory,
    createPost,
    likePost,
    addComment,
  } = useFeed();

  const [formOpen, setFormOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('news');
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* ─── Handle create post ─── */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!postContent.trim() || submitting) return;

      setSubmitting(true);
      try {
        await createPost({
          authorId: CURRENT_USER.id,
          authorName: CURRENT_USER.name,
          authorAvatar: CURRENT_USER.avatar,
          authorType: CURRENT_USER.type,
          content: postContent.trim(),
          category: postCategory,
          imageUrl: imageData?.previewUrl || null,
        });

        /* Reset form */
        setPostContent('');
        setPostCategory('news');
        setShowImageUploader(false);
        setImageData(null);
        setFormOpen(false);
      } catch (err) {
        console.error('Failed to create post:', err);
      } finally {
        setSubmitting(false);
      }
    },
    [postContent, postCategory, imageData, submitting, createPost]
  );

  /* ─── Image callbacks ─── */
  const handleImageReady = useCallback((file, previewUrl) => {
    setImageData({ file, previewUrl });
  }, []);

  const handleImageRemove = useCallback(() => {
    setImageData(null);
  }, []);

  /* ─── Like handler ─── */
  const handleLike = useCallback(
    (postId, userId) => {
      likePost(postId, userId);
    },
    [likePost]
  );

  /* ─── Comment handler ─── */
  const handleComment = useCallback(
    (postId, commentData) => {
      addComment(postId, commentData);
    },
    [addComment]
  );

  /* ─── Memoized post list ─── */
  const postCards = useMemo(
    () =>
      posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={CURRENT_USER.id}
          onLike={handleLike}
          onComment={handleComment}
          staggerIndex={index}
        />
      )),
    [posts, handleLike, handleComment]
  );

  return (
    <div className="feed-page">
      {/* ─── Header ─── */}
      <header className="feed-page__header">
        <h1 className="feed-page__title">Your Feed</h1>
        <p className="feed-page__subtitle">
          Stay updated with campus news, projects, and hangout spots
        </p>
      </header>

      {/* ─── Category Tabs ─── */}
      <nav className="feed-page__tabs" role="tablist">
        {CATEGORIES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeCategory === key}
            className={`feed-page__tab${
              activeCategory === key ? ' feed-page__tab--active' : ''
            }`}
            onClick={() => setCategory(key)}
            type="button"
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </nav>

      {/* ─── Create Post ─── */}
      <div className="feed-page__create-post">
        {!formOpen ? (
          <div
            className="feed-page__create-post-trigger"
            onClick={() => setFormOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setFormOpen(true)}
          >
            <img
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              className="feed-page__create-avatar"
            />
            <div className="feed-page__create-placeholder">
              What's on your mind?
            </div>
          </div>
        ) : (
          <form
            className="feed-page__create-form"
            onSubmit={handleSubmit}
          >
            <textarea
              className="feed-page__create-textarea"
              placeholder="Share something with your campus community…"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              autoFocus
              rows={3}
            />

            <div className="feed-page__create-options">
              <select
                className="feed-page__create-select"
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
              >
                <option value="news">📰 News</option>
                <option value="projects">💻 Projects</option>
                <option value="gathering-spots">📍 Gathering Spots</option>
              </select>

              <button
                type="button"
                className={`feed-page__create-image-btn${
                  showImageUploader
                    ? ' feed-page__create-image-btn--active'
                    : ''
                }`}
                onClick={() => setShowImageUploader((v) => !v)}
              >
                <ImagePlus size={16} />
                {showImageUploader ? 'Hide Image' : 'Add Image'}
              </button>
            </div>

            {/* Image uploader */}
            {showImageUploader && (
              <div className="feed-page__image-upload-section">
                <ImageUploader
                  onImageReady={handleImageReady}
                  onRemove={handleImageRemove}
                />
              </div>
            )}

            <div className="feed-page__create-actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setFormOpen(false);
                  setPostContent('');
                  setShowImageUploader(false);
                  setImageData(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn--primary btn--sm"
                disabled={!postContent.trim() || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="feed-page__loading-spinner" style={{ animation: 'spin 0.8s linear infinite', width: 14, height: 14, border: 'none' }} />
                    Posting…
                  </>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ─── Posts List ─── */}
      {loading ? (
        <div className="feed-page__loading">
          <div className="feed-page__loading-spinner" />
          <p className="feed-page__loading-text">Loading your feed…</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="feed-page__empty">
          <Inbox size={64} className="feed-page__empty-icon" />
          <h3 className="feed-page__empty-title">No posts yet</h3>
          <p className="feed-page__empty-text">
            {activeCategory === 'all'
              ? 'Be the first to share something with your campus community!'
              : `No ${CATEGORIES.find((c) => c.key === activeCategory)?.label || ''} posts yet. Be the first to share!`}
          </p>
        </div>
      ) : (
        <div className="feed-page__posts">{postCards}</div>
      )}
    </div>
  );
}
