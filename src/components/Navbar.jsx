import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Layers, 
  Sparkles, 
  BookOpen, 
  Flame, 
  Sun, 
  Moon, 
  Download, 
  Upload,
  User,
  CloudCheck,
  Cloud
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  stats, 
  theme, 
  toggleTheme, 
  onExport, 
  onImport,
  currentUser,
  onOpenAuth,
  onOpenProfile
}) {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content) {
        onImport(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0];
  const userInitial = displayName ? displayName[0].toUpperCase() : 'U';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <a href="#home" className="brand-logo" onClick={(e) => { e.preventDefault(); setCurrentTab('dashboard'); }}>
          <div className="logo-badge">
            <GraduationCap size={22} />
          </div>
          <div>
            <span>TOEIC Mastery</span>
            <span className="brand-name-sub">600 Essential Words & Synonyms</span>
          </div>
        </a>

        {/* Navigation Tabs (Desktop) */}
        <nav className="nav-links desktop-only-nav">
          <button 
            className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Tổng quan</span>
          </button>

          <button 
            className={`nav-item ${currentTab === 'study' ? 'active' : ''}`}
            onClick={() => setCurrentTab('study')}
          >
            <Layers size={18} />
            <span>Thẻ học</span>
          </button>

          <button 
            className={`nav-item ${currentTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setCurrentTab('quiz')}
          >
            <Sparkles size={18} />
            <span>Luyện phản xạ</span>
          </button>

          <button 
            className={`nav-item ${currentTab === 'explorer' ? 'active' : ''}`}
            onClick={() => setCurrentTab('explorer')}
          >
            <BookOpen size={18} />
            <span>Từ điển</span>
          </button>
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          {/* Daily Streak */}
          <div className="streak-badge" title="Chuỗi ngày học liên tục">
            <Flame size={16} />
            <span>{stats.streak || 1} ngày</span>
          </div>

          {/* Backup / Export */}
          <button 
            className="icon-btn backup-btn-desktop" 
            title="Xuất file sao lưu tiến độ (JSON)"
            onClick={onExport}
          >
            <Download size={18} />
          </button>

          {/* Restore / Import */}
          <button 
            className="icon-btn backup-btn-desktop" 
            title="Khôi phục dữ liệu từ file JSON"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".json" 
            onChange={handleFileChange}
          />

          {/* Dark / Light Mode Toggle */}
          <button 
            className="icon-btn" 
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Account / Profile Button */}
          {currentUser ? (
            <button 
              className="user-profile-badge"
              onClick={onOpenProfile}
              title={`Tài khoản: ${currentUser.email}`}
            >
              <div className="user-avatar-circle">
                {userInitial}
              </div>
              <span className="user-name-text">{displayName}</span>
              <Cloud size={14} color="var(--success)" className="cloud-synced-icon" />
            </button>
          ) : (
            <button 
              className="btn-primary auth-btn-nav"
              onClick={onOpenAuth}
              style={{ padding: '6px 14px', fontSize: '0.82rem', gap: '6px' }}
            >
              <User size={15} />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
