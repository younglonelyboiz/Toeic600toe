import React, { useState, useEffect } from 'react';
import { X, User, Target, Flame, Volume2, LogOut, CheckCircle, Cloud, Sparkles, BookOpen } from 'lucide-react';
import { authService } from '../services/authService';

export default function UserProfileModal({ 
  isOpen, 
  onClose, 
  user, 
  onSignOut, 
  stats, 
  masteredCount,
  onProfileUpdated 
}) {
  const [profile, setProfile] = useState({
    target_score: 650,
    daily_goal: 15,
    sound_accent: 'en-US',
    display_name: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.id) {
      authService.getProfile(user.id).then(data => {
        if (data) {
          setProfile({
            target_score: data.target_score || 650,
            daily_goal: data.daily_goal || 15,
            sound_accent: data.sound_accent || 'en-US',
            display_name: data.display_name || user.user_metadata?.full_name || ''
          });
        } else {
          setProfile(prev => ({
            ...prev,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || ''
          }));
        }
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await authService.updateProfile(user.id, profile);
      setSaveSuccess(true);
      if (onProfileUpdated) onProfileUpdated(profile);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile.display_name || user.user_metadata?.full_name || user.email?.split('@')[0];
  const initial = (displayName?.[0] || 'U').toUpperCase();

  return (
    <div className="completion-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '28px',
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-glow)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <button 
          onClick={onClose}
          className="icon-btn"
          style={{ position: 'absolute', top: '16px', right: '16px' }}
        >
          <X size={18} />
        </button>

        {/* User Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--grad-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: '800',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            {initial}
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '2px' }}>{displayName}</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px', background: 'var(--success-bg)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              <Cloud size={12} /> Đã đồng bộ tài khoản đám mây
            </div>
          </div>
        </div>

        {/* Mini stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <Flame size={20} color="#f97316" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.streak || 1}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ngày Streak</div>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <CheckCircle size={20} color="var(--success)" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{masteredCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Từ đã thuộc</div>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <BookOpen size={20} color="var(--accent-primary)" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>600</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tổng từ vựng</div>
          </div>
        </div>

        {/* Personalization Section */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--accent-primary)" />
            Cá nhân hóa lộ trình học
          </h3>

          {/* Target Score */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Mục tiêu điểm thi TOEIC
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { score: 450, label: '450+ Cơ bản' },
                { score: 650, label: '650+ Chuẩn' },
                { score: 800, label: '800+ Cao cấp' }
              ].map(item => (
                <button
                  key={item.score}
                  type="button"
                  onClick={() => setProfile({ ...profile, target_score: item.score })}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 'var(--radius-md)',
                    border: profile.target_score === item.score ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    background: profile.target_score === item.score ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
                    color: profile.target_score === item.score ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: profile.target_score === item.score ? '700' : '500',
                    fontSize: '0.82rem'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Goal */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Số từ mới mục tiêu mỗi ngày
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[10, 15, 25].map(words => (
                <button
                  key={words}
                  type="button"
                  onClick={() => setProfile({ ...profile, daily_goal: words })}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 'var(--radius-md)',
                    border: profile.daily_goal === words ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    background: profile.daily_goal === words ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
                    color: profile.daily_goal === words ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: profile.daily_goal === words ? '700' : '500',
                    fontSize: '0.82rem'
                  }}
                >
                  {words} từ / ngày
                </button>
              ))}
            </div>
          </div>

          {/* Sound Accent */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Giọng phát âm Audio mặc định
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { code: 'en-US', label: '🇺🇸 Giọng Mỹ (US)' },
                { code: 'en-GB', label: '🇬🇧 Giọng Anh (UK)' }
              ].map(accent => (
                <button
                  key={accent.code}
                  type="button"
                  onClick={() => setProfile({ ...profile, sound_accent: accent.code })}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: profile.sound_accent === accent.code ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    background: profile.sound_accent === accent.code ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
                    color: profile.sound_accent === accent.code ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: profile.sound_accent === accent.code ? '700' : '500',
                    fontSize: '0.82rem'
                  }}
                >
                  {accent.label}
                </button>
              ))}
            </div>
          </div>

          {saveSuccess && (
            <div style={{ color: 'var(--success)', fontSize: '0.82rem', marginBottom: '12px', textAlign: 'center' }}>
              ✅ Đã cập nhật mục tiêu cá nhân thành công!
            </div>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            <span>{saving ? 'Đang lưu...' : 'Lưu cài đặt'}</span>
          </button>
        </div>

        {/* Sign out */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={onSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'var(--danger)',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '0.88rem'
            }}
          >
            <LogOut size={16} />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
}
