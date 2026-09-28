import React from 'react';
import { LayoutDashboard, Layers, Sparkles, BookOpen, User, Flame } from 'lucide-react';

export default function BottomNav({ 
  currentTab, 
  setCurrentTab, 
  currentUser, 
  onOpenAuth, 
  onOpenProfile,
  streak = 1 
}) {
  const handleUserClick = () => {
    if (currentUser) {
      onOpenProfile();
    } else {
      onOpenAuth();
    }
  };

  return (
    <nav className="mobile-bottom-nav">
      <button 
        type="button"
        className={`mobile-nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setCurrentTab('dashboard')}
      >
        <LayoutDashboard size={20} />
        <span>Tổng quan</span>
      </button>

      <button 
        type="button"
        className={`mobile-nav-btn ${currentTab === 'study' ? 'active' : ''}`}
        onClick={() => setCurrentTab('study')}
      >
        <Layers size={20} />
        <span>Thẻ học</span>
      </button>

      <button 
        type="button"
        className={`mobile-nav-btn ${currentTab === 'quiz' ? 'active' : ''}`}
        onClick={() => setCurrentTab('quiz')}
      >
        <Sparkles size={20} />
        <span>Phản xạ</span>
      </button>

      <button 
        type="button"
        className={`mobile-nav-btn ${currentTab === 'explorer' ? 'active' : ''}`}
        onClick={() => setCurrentTab('explorer')}
      >
        <BookOpen size={20} />
        <span>Từ điển</span>
      </button>

      <button 
        type="button"
        className={`mobile-nav-btn ${currentUser ? 'has-user' : ''}`}
        onClick={handleUserClick}
      >
        <div style={{ position: 'relative' }}>
          <User size={20} />
          {currentUser && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--success)',
              border: '1.5px solid var(--bg-secondary)'
            }} />
          )}
        </div>
        <span>{currentUser ? 'Học viên' : 'Đăng nhập'}</span>
      </button>
    </nav>
  );
}
