'use client';

import { useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vendly_recently_viewed';
const MAX_ITEMS = 20;

interface RecentlyViewedItem {
  id: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  // Add a listing to recently viewed
  const addToRecentlyViewed = useCallback((listingId: string) => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const items: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];

      // Remove if already exists
      const filtered = items.filter((item) => item.id !== listingId);

      // Add to beginning
      const updated = [
        { id: listingId, viewedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_ITEMS); // Keep only last MAX_ITEMS

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving to recently viewed:', error);
    }
  }, []);

  // Get recently viewed listing IDs
  const getRecentlyViewed = useCallback((): string[] => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const items: RecentlyViewedItem[] = JSON.parse(stored);
      
      // Filter out items older than 30 days
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recent = items.filter((item) => item.viewedAt > thirtyDaysAgo);

      // Update storage with filtered items
      if (recent.length !== items.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
      }

      return recent.map((item) => item.id);
    } catch (error) {
      console.error('Error reading recently viewed:', error);
      return [];
    }
  }, []);

  // Clear recently viewed
  const clearRecentlyViewed = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    addToRecentlyViewed,
    getRecentlyViewed,
    clearRecentlyViewed,
  };
}
