// Hybrid LocalStorage & Supabase Service for TOEIC Vocab Mastery
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  MASTERED: 'toeic_mastered_words_v1',
  REVIEW: 'toeic_review_words_v1',
  FAVORITES: 'toeic_favorites_v1',
  STATS: 'toeic_study_stats_v1',
  CURRENT_TIER: 'toeic_current_tier_v1',
  THEME: 'toeic_app_theme_v1',
  SYNC_STATUS: 'toeic_sync_status_v1'
};

let currentUserId = null;

export const StorageService = {
  // Set current logged in user
  setCurrentUser(userId) {
    currentUserId = userId || null;
  },

  getCurrentUserId() {
    return currentUserId;
  },

  // Get all mastered word IDs
  getMasteredWords() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MASTERED);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading mastered words', e);
      return [];
    }
  },

  // Mark word as mastered
  setWordMastered(wordId, isMastered = true) {
    const list = this.getMasteredWords();
    const set = new Set(list);
    if (isMastered) {
      set.add(wordId);
      this.setWordReview(wordId, false);
    } else {
      set.delete(wordId);
    }
    const updated = Array.from(set);
    localStorage.setItem(STORAGE_KEYS.MASTERED, JSON.stringify(updated));
    this.updateStatsMasteredCount(updated.length);

    // Sync to Cloud asynchronously if user is logged in
    if (currentUserId && isSupabaseConfigured()) {
      if (isMastered) {
        supabase
          .from('user_word_progress')
          .upsert({
            user_id: currentUserId,
            word_id: wordId,
            status: 'mastered',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,word_id' })
          .then(({ error }) => {
            if (error) console.warn('Supabase sync error (mastered):', error);
          });
      } else {
        supabase
          .from('user_word_progress')
          .delete()
          .match({ user_id: currentUserId, word_id: wordId })
          .then(({ error }) => {
            if (error) console.warn('Supabase delete error (mastered):', error);
          });
      }
    }

    return updated;
  },

  // Get words needing review
  getReviewWords() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEW);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Add or remove from review queue
  setWordReview(wordId, needsReview = true) {
    const list = this.getReviewWords();
    const set = new Set(list);
    if (needsReview) {
      set.add(wordId);
      // Remove from mastered if it needs review
      const mastered = new Set(this.getMasteredWords());
      mastered.delete(wordId);
      localStorage.setItem(STORAGE_KEYS.MASTERED, JSON.stringify(Array.from(mastered)));
    } else {
      set.delete(wordId);
    }
    const updated = Array.from(set);
    localStorage.setItem(STORAGE_KEYS.REVIEW, JSON.stringify(updated));

    // Sync to Cloud asynchronously
    if (currentUserId && isSupabaseConfigured()) {
      if (needsReview) {
        supabase
          .from('user_word_progress')
          .upsert({
            user_id: currentUserId,
            word_id: wordId,
            status: 'review',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,word_id' })
          .then(({ error }) => {
            if (error) console.warn('Supabase sync error (review):', error);
          });
      } else {
        supabase
          .from('user_word_progress')
          .delete()
          .match({ user_id: currentUserId, word_id: wordId })
          .then(({ error }) => {
            if (error) console.warn('Supabase delete error (review):', error);
          });
      }
    }

    return updated;
  },

  // Favorites
  getFavorites() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  toggleFavorite(wordId) {
    const list = this.getFavorites();
    const set = new Set(list);
    const isAdding = !set.has(wordId);
    if (isAdding) {
      set.add(wordId);
    } else {
      set.delete(wordId);
    }
    const updated = Array.from(set);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));

    // Sync to Cloud asynchronously
    if (currentUserId && isSupabaseConfigured()) {
      if (isAdding) {
        supabase
          .from('user_favorites')
          .upsert({ user_id: currentUserId, word_id: wordId })
          .then(({ error }) => {
            if (error) console.warn('Supabase sync error (favorite):', error);
          });
      } else {
        supabase
          .from('user_favorites')
          .delete()
          .match({ user_id: currentUserId, word_id: wordId })
          .then(({ error }) => {
            if (error) console.warn('Supabase delete error (favorite):', error);
          });
      }
    }

    return updated;
  },

  // User Stats and Daily Streak
  getStats() {
    const today = new Date().toISOString().split('T')[0];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      const defaultStats = {
        streak: 1,
        lastStudyDate: today,
        quizScoreTotal: 0,
        quizQuestionsAnswered: 0,
        cardsReviewedToday: 0
      };
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(defaultStats));
        return defaultStats;
      }
      const parsed = JSON.parse(data);
      // Check streak calculation
      if (parsed.lastStudyDate !== today) {
        const lastDate = new Date(parsed.lastStudyDate);
        const currentDate = new Date(today);
        const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          parsed.streak = (parsed.streak || 1) + 1;
        } else if (diffDays > 1) {
          parsed.streak = 1;
        }
        parsed.lastStudyDate = today;
        parsed.cardsReviewedToday = 0;
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(parsed));
        this.syncStatsToCloud(parsed);
      }
      return parsed;
    } catch (e) {
      return { streak: 1, lastStudyDate: today, quizScoreTotal: 0, quizQuestionsAnswered: 0, cardsReviewedToday: 0 };
    }
  },

  incrementCardReviewed() {
    const stats = this.getStats();
    stats.cardsReviewedToday = (stats.cardsReviewedToday || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    this.syncStatsToCloud(stats);
    return stats;
  },

  recordQuizResult(correctCount, totalQuestions) {
    const stats = this.getStats();
    stats.quizScoreTotal = (stats.quizScoreTotal || 0) + correctCount;
    stats.quizQuestionsAnswered = (stats.quizQuestionsAnswered || 0) + totalQuestions;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    this.syncStatsToCloud(stats);
    return stats;
  },

  updateStatsMasteredCount(count) {
    const stats = this.getStats();
    stats.masteredCount = count;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    this.syncStatsToCloud(stats);
  },

  syncStatsToCloud(stats) {
    if (!currentUserId || !isSupabaseConfigured()) return;
    supabase
      .from('user_stats')
      .upsert({
        user_id: currentUserId,
        streak: stats.streak || 1,
        last_study_date: stats.lastStudyDate || new Date().toISOString().split('T')[0],
        quiz_score_total: stats.quizScoreTotal || 0,
        quiz_questions_answered: stats.quizQuestionsAnswered || 0,
        cards_reviewed_today: stats.cardsReviewedToday || 0,
        updated_at: new Date().toISOString()
      })
      .then(({ error }) => {
        if (error) console.warn('Supabase sync stats error:', error);
      });
  },

  // Theme
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  // CLOUD SYNC & HYBRID DATA LOADING
  async loadFromCloud(userId) {
    if (!userId || !isSupabaseConfigured()) return null;
    this.setCurrentUser(userId);

    try {
      // 1. Fetch word progress
      const { data: progressData, error: progressErr } = await supabase
        .from('user_word_progress')
        .select('word_id, status')
        .eq('user_id', userId);

      // 2. Fetch favorites
      const { data: favData, error: favErr } = await supabase
        .from('user_favorites')
        .select('word_id')
        .eq('user_id', userId);

      // 3. Fetch user stats
      const { data: statsData, error: statsErr } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (progressErr || favErr || statsErr) {
        console.warn('Error loading cloud data, keeping local cache', { progressErr, favErr, statsErr });
        return null;
      }

      const masteredList = [];
      const reviewList = [];

      (progressData || []).forEach(item => {
        if (item.status === 'mastered') masteredList.push(item.word_id);
        else if (item.status === 'review') reviewList.push(item.word_id);
      });

      const favList = (favData || []).map(f => f.word_id);

      // Update local storage with cloud truth
      localStorage.setItem(STORAGE_KEYS.MASTERED, JSON.stringify(masteredList));
      localStorage.setItem(STORAGE_KEYS.REVIEW, JSON.stringify(reviewList));
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favList));

      let currentStats = this.getStats();
      if (statsData) {
        currentStats = {
          streak: statsData.streak || 1,
          lastStudyDate: statsData.last_study_date || new Date().toISOString().split('T')[0],
          quizScoreTotal: statsData.quiz_score_total || 0,
          quizQuestionsAnswered: statsData.quiz_questions_answered || 0,
          cardsReviewedToday: statsData.cards_reviewed_today || 0
        };
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(currentStats));
      }

      return {
        masteredIds: masteredList,
        reviewIds: reviewList,
        favorites: favList,
        stats: currentStats
      };
    } catch (e) {
      console.error('Failed to load from cloud:', e);
      return null;
    }
  },

  // Check if guest has data that can be migrated
  hasGuestData() {
    const mastered = this.getMasteredWords();
    const review = this.getReviewWords();
    const favs = this.getFavorites();
    const stats = this.getStats();
    return mastered.length > 0 || review.length > 0 || favs.length > 0 || stats.cardsReviewedToday > 0;
  },

  // Migrate local guest data to Supabase account
  async migrateGuestDataToCloud(userId) {
    if (!userId || !isSupabaseConfigured()) return { success: false };

    try {
      const mastered = this.getMasteredWords();
      const review = this.getReviewWords();
      const favs = this.getFavorites();
      const stats = this.getStats();

      // Batch insert progress
      const progressRows = [
        ...mastered.map(id => ({ user_id: userId, word_id: id, status: 'mastered' })),
        ...review.map(id => ({ user_id: userId, word_id: id, status: 'review' }))
      ];

      if (progressRows.length > 0) {
        await supabase
          .from('user_word_progress')
          .upsert(progressRows, { onConflict: 'user_id,word_id' });
      }

      // Batch insert favorites
      if (favs.length > 0) {
        const favRows = favs.map(id => ({ user_id: userId, word_id: id }));
        await supabase
          .from('user_favorites')
          .upsert(favRows, { onConflict: 'user_id,word_id' });
      }

      // Upsert stats
      await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          streak: stats.streak || 1,
          last_study_date: stats.lastStudyDate || new Date().toISOString().split('T')[0],
          quiz_score_total: stats.quizScoreTotal || 0,
          quiz_questions_answered: stats.quizQuestionsAnswered || 0,
          cards_reviewed_today: stats.cardsReviewedToday || 0,
          updated_at: new Date().toISOString()
        });

      return { success: true };
    } catch (e) {
      console.error('Migration failed:', e);
      return { success: false, error: e.message };
    }
  },

  // Clear data on sign out (reset to clean state)
  clearUserData() {
    this.setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.MASTERED);
    localStorage.removeItem(STORAGE_KEYS.REVIEW);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.STATS);
  },

  // Export and Import JSON backup
  exportBackup() {
    const backupData = {
      version: 1,
      exportDate: new Date().toISOString(),
      masteredWords: this.getMasteredWords(),
      reviewWords: this.getReviewWords(),
      favorites: this.getFavorites(),
      stats: this.getStats()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toeic_vocab_progress_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importBackup(fileContent) {
    try {
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed.masteredWords)) {
        localStorage.setItem(STORAGE_KEYS.MASTERED, JSON.stringify(parsed.masteredWords));
      }
      if (Array.isArray(parsed.reviewWords)) {
        localStorage.setItem(STORAGE_KEYS.REVIEW, JSON.stringify(parsed.reviewWords));
      }
      if (Array.isArray(parsed.favorites)) {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(parsed.favorites));
      }
      if (parsed.stats) {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(parsed.stats));
      }

      // If logged in, also sync the imported backup to Supabase
      if (currentUserId && isSupabaseConfigured()) {
        this.migrateGuestDataToCloud(currentUserId);
      }

      return { success: true };
    } catch (e) {
      console.error('Failed to import backup', e);
      return { success: false, error: e.message };
    }
  }
};
