/**
 * Feed Context — CampusConnect
 * Provides global feed state: posts, loading, activeCategory,
 * and actions: createPost, deletePost, likePost, addComment, setCategory.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as feedService from '../services/feedService';

const FeedContext = createContext(null);

export function FeedProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  /* ─── Load posts on mount & when category changes ─── */
  const fetchPosts = useCallback(async (category) => {
    setLoading(true);
    try {
      const data = await feedService.getPosts(category);
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeCategory);
  }, [activeCategory, fetchPosts]);

  /* ─── Actions ─── */
  const createPost = useCallback(async (postData) => {
    const newPost = await feedService.createPost(postData);
    setPosts((prev) => [newPost, ...prev]);
    return newPost;
  }, []);

  const deletePost = useCallback(async (postId) => {
    await feedService.deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const likePost = useCallback(async (postId, userId) => {
    /* Optimistic update */
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const liked = p.likes.includes(userId);
        return {
          ...p,
          likes: liked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId],
        };
      })
    );
    try {
      await feedService.likePost(postId, userId);
    } catch {
      /* Revert on failure */
      fetchPosts(activeCategory);
    }
  }, [activeCategory, fetchPosts]);

  const addComment = useCallback(async (postId, commentData) => {
    const updatedPost = await feedService.addComment(postId, commentData);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
    return updatedPost;
  }, []);

  const setCategory = useCallback((category) => {
    setActiveCategory(category);
  }, []);

  const value = {
    posts,
    loading,
    activeCategory,
    createPost,
    deletePost,
    likePost,
    addComment,
    setCategory,
  };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error('useFeed must be used within a FeedProvider');
  return ctx;
}

export default FeedContext;
