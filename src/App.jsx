import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import DashboardView from './components/DashboardView';
import StudyDeckView from './components/StudyDeckView';
import QuizView from './components/QuizView';
import ExplorerView from './components/ExplorerView';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import MigrationModal from './components/MigrationModal';
import { StorageService } from './services/storageService';
import { authService } from './services/authService';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedUnit, setSelectedUnit] = useState(1); // Default to Unit 1 (Contracts)
  const [selectedTier, setSelectedTier] = useState(null);
  const [quizScope, setQuizScope] = useState('all');

  const [masteredIds, setMasteredIds] = useState([]);
  const [reviewIds, setReviewIds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({ streak: 1, quizScoreTotal: 0, cardsReviewedToday: 0 });
  const [theme, setTheme] = useState('dark');
  const [toastMessage, setToastMessage] = useState(null);

  // Auth and Modals
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [pendingMigrateUserId, setPendingMigrateUserId] = useState(null);

  // Initialize data from LocalStorage
  useEffect(() => {
    setMasteredIds(StorageService.getMasteredWords());
    setReviewIds(StorageService.getReviewWords());
    setFavorites(StorageService.getFavorites());
    setStats(StorageService.getStats());
    const savedTheme = StorageService.getTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Check existing auth session
    authService.getCurrentUser().then(user => {
      if (user) {
        handleUserLoggedIn(user, false);
      }
    });

    // Listen to Auth State Changes
    const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        handleUserLoggedIn(session.user, event === 'SIGNED_IN');
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        StorageService.setCurrentUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleUserLoggedIn = async (user, isNewSignIn = false) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user.id);

    // If newly signed in and has local guest data, ask to migrate
    if (isNewSignIn && StorageService.hasGuestData()) {
      setPendingMigrateUserId(user.id);
      setShowMigrationModal(true);
    } else {
      // Otherwise load latest from cloud
      const cloudData = await StorageService.loadFromCloud(user.id);
      if (cloudData) {
        setMasteredIds(cloudData.masteredIds);
        setReviewIds(cloudData.reviewIds);
        setFavorites(cloudData.favorites);
        setStats(cloudData.stats);
      }
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    StorageService.setTheme(nextTheme);
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    StorageService.clearUserData();
    setMasteredIds([]);
    setReviewIds([]);
    setFavorites([]);
    setStats(StorageService.getStats());
    setShowProfileModal(false);
    showToast('Đã đăng xuất tài khoản thành công');
  };

  // State handlers
  const handleToggleMastered = (wordId, isMastered = true) => {
    const updated = StorageService.setWordMastered(wordId, isMastered);
    setMasteredIds(updated);
    setReviewIds(StorageService.getReviewWords());
  };

  const handleToggleReview = (wordId, needsReview = true) => {
    const updated = StorageService.setWordReview(wordId, needsReview);
    setReviewIds(updated);
    setMasteredIds(StorageService.getMasteredWords());
  };

  const handleToggleFavorite = (wordId) => {
    const updated = StorageService.toggleFavorite(wordId);
    setFavorites(updated);
  };

  const handleCardReviewed = () => {
    const updatedStats = StorageService.incrementCardReviewed();
    setStats(updatedStats);
  };

  const handleRecordQuizResult = (score, total) => {
    const updatedStats = StorageService.recordQuizResult(score, total);
    setStats(updatedStats);
  };

  const handleSelectUnit = (unitId) => {
    setSelectedUnit(unitId);
    setSelectedTier(null);
    setCurrentTab('study');
  };

  const handleSelectTier = (tierId) => {
    setSelectedTier(tierId);
    setSelectedUnit(null);
    setCurrentTab('study');
  };

  const handleStartReview = () => {
    setSelectedTier('review');
    setSelectedUnit(null);
    setCurrentTab('study');
  };

  const handleStartQuizForUnit = (unitId) => {
    setQuizScope(`unit_${unitId}`);
    setCurrentTab('quiz');
  };

  const handleExport = () => {
    StorageService.exportBackup();
    showToast('Đã xuất file sao lưu tiến độ thành công!');
  };

  const handleImport = (fileContent) => {
    const res = StorageService.importBackup(fileContent);
    if (res.success) {
      setMasteredIds(StorageService.getMasteredWords());
      setReviewIds(StorageService.getReviewWords());
      setFavorites(StorageService.getFavorites());
      setStats(StorageService.getStats());
      showToast('Đã khôi phục dữ liệu thành công!');
    } else {
      showToast('Lỗi: File sao lưu không hợp lệ!');
    }
  };

  const handleMigrationDone = async (wasMigrated) => {
    if (wasMigrated) {
      showToast('Đã đồng bộ tiến độ học cũ vào tài khoản đám mây!');
    }
    if (pendingMigrateUserId) {
      const cloudData = await StorageService.loadFromCloud(pendingMigrateUserId);
      if (cloudData) {
        setMasteredIds(cloudData.masteredIds);
        setReviewIds(cloudData.reviewIds);
        setFavorites(cloudData.favorites);
        setStats(cloudData.stats);
      }
    }
    setPendingMigrateUserId(null);
  };

  return (
    <div className="app-container has-bottom-nav">
      {/* Navbar (Top Header) */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        stats={stats}
        theme={theme}
        toggleTheme={toggleTheme}
        onExport={handleExport}
        onImport={handleImport}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {currentTab === 'dashboard' && (
          <DashboardView 
            masteredIds={masteredIds}
            reviewIds={reviewIds}
            stats={stats}
            onSelectTier={handleSelectTier}
            onSelectUnit={handleSelectUnit}
            onStartReview={handleStartReview}
          />
        )}

        {currentTab === 'study' && (
          <StudyDeckView 
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            selectedTier={selectedTier}
            setSelectedTier={setSelectedTier}
            masteredIds={masteredIds}
            reviewIds={reviewIds}
            favorites={favorites}
            onToggleMastered={handleToggleMastered}
            onToggleReview={handleToggleReview}
            onToggleFavorite={handleToggleFavorite}
            onCardReviewed={handleCardReviewed}
            onStartQuizForUnit={handleStartQuizForUnit}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizView 
            initialScope={quizScope}
            onRecordResult={handleRecordQuizResult}
            onToggleMastered={handleToggleMastered}
            onToggleReview={handleToggleReview}
          />
        )}

        {currentTab === 'explorer' && (
          <ExplorerView 
            masteredIds={masteredIds}
            reviewIds={reviewIds}
            favorites={favorites}
            onToggleMastered={handleToggleMastered}
            onToggleReview={handleToggleReview}
            onToggleFavorite={handleToggleFavorite}
            onExport={handleExport}
            onImport={handleImport}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        streak={stats.streak}
      />

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Xin chào ${user.user_metadata?.full_name || user.email}!`);
        }}
        onNeedMigrationCheck={(userId) => {
          if (StorageService.hasGuestData()) {
            setPendingMigrateUserId(userId);
            setShowMigrationModal(true);
          }
        }}
      />

      {/* User Profile & Personalization Modal */}
      <UserProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
        onSignOut={handleSignOut}
        stats={stats}
        masteredCount={masteredIds.length}
        onProfileUpdated={(updatedProfile) => {
          showToast('Đã lưu thiết lập mục tiêu cá nhân hóa!');
        }}
      />

      {/* Guest Data Migration Modal */}
      <MigrationModal 
        isOpen={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        userId={pendingMigrateUserId}
        onMigrationComplete={handleMigrationDone}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
