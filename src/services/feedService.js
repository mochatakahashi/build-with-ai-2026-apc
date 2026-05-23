/**
 * Feed Service — CampusConnect
 * Mock feed service with localStorage persistence and simulated network latency.
 */

import mockPosts from '../data/mockPosts';

const STORAGE_KEY = 'campusconnect_posts';
const DELAY_MS = 300;

/* ─── Helpers ─── */

function delay(ms = DELAY_MS) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* corrupted data — reset */
  }
  /* First load: seed from mock data */
  savePosts(mockPosts);
  return [...mockPosts];
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

/* ─── Public API ─── */

/**
 * Get all posts, optionally filtered by category.
 * @param {string} [category] — 'news' | 'projects' | 'gathering-spots' | undefined for all
 * @returns {Promise<Array>}
 */
export async function getPosts(category) {
  await delay();
  let posts = loadPosts();
  if (category && category !== 'all') {
    posts = posts.filter((p) => p.category === category);
  }
  /* Sort newest first */
  return posts.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Create a new post.
 * @param {object} postData — { authorId, authorName, authorAvatar, authorType, content, category, imageUrl? }
 * @returns {Promise<object>} — The created post
 */
export async function createPost(postData) {
  await delay(500);
  const posts = loadPosts();
  const newPost = {
    id: `post-${Date.now()}`,
    ...postData,
    likes: [],
    comments: [],
    createdAt: Date.now(),
  };
  posts.unshift(newPost);
  savePosts(posts);
  return newPost;
}

/**
 * Delete a post by ID.
 * @param {string} postId
 * @returns {Promise<{ success: boolean }>}
 */
export async function deletePost(postId) {
  await delay();
  let posts = loadPosts();
  posts = posts.filter((p) => p.id !== postId);
  savePosts(posts);
  return { success: true };
}

/**
 * Toggle a like on a post.
 * @param {string} postId
 * @param {string} userId
 * @returns {Promise<object>} — Updated post
 */
export async function likePost(postId, userId) {
  await delay(150);
  const posts = loadPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) throw new Error('Post not found');

  const idx = post.likes.indexOf(userId);
  if (idx === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(idx, 1);
  }
  savePosts(posts);
  return { ...post };
}

/**
 * Add a comment to a post.
 * @param {string} postId
 * @param {object} commentData — { authorId, authorName, authorAvatar, text }
 * @returns {Promise<object>} — Updated post
 */
export async function addComment(postId, commentData) {
  await delay(400);
  const posts = loadPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) throw new Error('Post not found');

  const newComment = {
    id: `comment-${Date.now()}`,
    ...commentData,
    createdAt: Date.now(),
  };
  post.comments.push(newComment);
  savePosts(posts);
  return { ...post };
}
