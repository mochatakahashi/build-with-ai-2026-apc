/**
 * PostCard Component — CampusConnect
 * Premium glass-card post display with like animation, expandable comments, and image zoom.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Heart, MessageCircle, Share2, Send, ChevronDown } from 'lucide-react';
import './PostCard.css';

/* ─── Helpers ─── */

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    ) : (
      part
    )
  );
}

const CATEGORY_LABELS = {
  news: 'News',
  projects: 'Projects',
  'gathering-spots': 'Spots',
};

const MAX_CONTENT_LENGTH = 200;
const VISIBLE_COMMENTS = 2;

/* ─── Component ─── */

export default function PostCard({
  post,
  currentUserId = 'user-1',
  onLike,
  onComment,
  staggerIndex = 0,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [likeAnimating, setLikeAnimating] = useState(false);

  const isLiked = post.likes.includes(currentUserId);
  const isLong = post.content.length > MAX_CONTENT_LENGTH;

  const displayContent = useMemo(() => {
    if (!isLong || expanded) return post.content;
    return post.content.slice(0, MAX_CONTENT_LENGTH) + '…';
  }, [post.content, isLong, expanded]);

  /* ─── Like handler with animation ─── */
  const handleLike = useCallback(() => {
    setLikeAnimating(true);
    if (onLike) onLike(post.id, currentUserId);
    setTimeout(() => setLikeAnimating(false), 500);
  }, [onLike, post.id, currentUserId]);

  /* ─── Comment submit ─── */
  const handleCommentSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!commentText.trim()) return;

      if (onComment) {
        onComment(post.id, {
          authorId: currentUserId,
          authorName: 'You',
          authorAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=You&backgroundColor=3b82f6`,
          text: commentText.trim(),
        });
      }
      setCommentText('');
    },
    [commentText, onComment, post.id, currentUserId]
  );

  /* ─── Visible comments ─── */
  const visibleComments = showComments
    ? post.comments
    : post.comments.slice(-VISIBLE_COMMENTS);
  const hiddenCount = post.comments.length - VISIBLE_COMMENTS;

  return (
    <article
      className={`post-card post-card--stagger-${Math.min(staggerIndex, 9)}`}
    >
      {/* Header */}
      <div className="post-card__header">
        <img
          src={post.authorAvatar}
          alt={post.authorName}
          className="post-card__avatar"
        />
        <div className="post-card__author-info">
          <div className="post-card__author-row">
            <span className="post-card__author-name">{post.authorName}</span>
            {post.authorType && post.authorType !== 'student' && (
              <span
                className={`post-card__author-badge post-card__author-badge--${post.authorType}`}
              >
                {post.authorType}
              </span>
            )}
          </div>
          <div className="post-card__meta">
            <span className="post-card__timestamp">
              {timeAgo(post.createdAt)}
            </span>
            <span className="post-card__meta-dot" />
            <span
              className={`post-card__category-badge post-card__category-badge--${post.category}`}
            >
              {CATEGORY_LABELS[post.category] || post.category}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="post-card__content">
        <p className="post-card__text">
          {linkify(displayContent)}
          {isLong && !expanded && (
            <button
              className="post-card__read-more"
              onClick={() => setExpanded(true)}
              type="button"
            >
              Read more
            </button>
          )}
          {isLong && expanded && (
            <button
              className="post-card__read-more"
              onClick={() => setExpanded(false)}
              type="button"
            >
              Show less
            </button>
          )}
        </p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="post-card__image-wrapper">
          <img
            src={post.imageUrl}
            alt="Post"
            className="post-card__image"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions Bar */}
      <div className="post-card__actions">
        <button
          className={`post-card__action-btn post-card__action-btn--like${
            isLiked ? ' post-card__action-btn--liked' : ''
          }${likeAnimating ? ' post-card__action-btn--animating' : ''}`}
          onClick={handleLike}
          type="button"
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart
            size={18}
            className="post-card__like-icon"
            fill={isLiked ? 'currentColor' : 'none'}
          />
          {post.likes.length > 0 && <span>{post.likes.length}</span>}
        </button>

        <button
          className="post-card__action-btn post-card__action-btn--comment"
          onClick={() => setShowComments((v) => !v)}
          type="button"
          aria-label="Comments"
        >
          <MessageCircle size={18} />
          {post.comments.length > 0 && <span>{post.comments.length}</span>}
        </button>

        <button
          className="post-card__action-btn post-card__action-btn--share"
          type="button"
          aria-label="Share"
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Comments Section */}
      {(showComments || post.comments.length > 0) && showComments && (
        <div className="post-card__comments">
          {hiddenCount > 0 && !showComments && (
            <button
              className="post-card__view-all-comments"
              onClick={() => setShowComments(true)}
              type="button"
            >
              View all {post.comments.length} comments
            </button>
          )}

          {showComments && hiddenCount > 0 && (
            <button
              className="post-card__view-all-comments"
              onClick={() => setShowComments(false)}
              type="button"
            >
              <ChevronDown size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
              Hide comments
            </button>
          )}

          {visibleComments.map((comment) => (
            <div key={comment.id} className="post-card__comment">
              <img
                src={comment.authorAvatar}
                alt={comment.authorName}
                className="post-card__comment-avatar"
              />
              <div className="post-card__comment-body">
                <div className="post-card__comment-bubble">
                  <p className="post-card__comment-author">
                    {comment.authorName}
                  </p>
                  <p className="post-card__comment-text">{comment.text}</p>
                </div>
                <span className="post-card__comment-time">
                  {timeAgo(comment.createdAt)}
                </span>
              </div>
            </div>
          ))}

          {/* Add Comment Input */}
          <form
            className="post-card__add-comment"
            onSubmit={handleCommentSubmit}
          >
            <input
              type="text"
              className="post-card__comment-input"
              placeholder="Write a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              className="post-card__comment-submit"
              disabled={!commentText.trim()}
              aria-label="Send comment"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
