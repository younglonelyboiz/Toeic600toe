import React, { useState } from 'react';
import { CloudUpload, CheckCircle, Sparkles, X } from 'lucide-react';
import { StorageService } from '../services/storageService';

export default function MigrationModal({ isOpen, onClose, userId, onMigrationComplete }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !userId) return null;

  const masteredCount = StorageService.getMasteredWords().length;
  const reviewCount = StorageService.getReviewWords().length;
  const stats = StorageService.getStats();

  const handleMigrate = async () => {
    setLoading(true);
    try {
      await StorageService.migrateGuestDataToCloud(userId);
      onMigrationComplete(true);
      onClose();
    } catch (err) {
      console.error('Migration error', err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onMigrationComplete(false);
    onClose();
  };

  return (
    <div className="completion-overlay" style={{ zIndex: 10001 }}>
      <div 
        className="glass-card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '28px',
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--accent-primary)',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          textAlign: 'center'
        }}
      >
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--grad-primary)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
        }}>
          <CloudUpload size={28} />
        </div>

        <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>
          Đồng bộ tiến độ học cũ?
        </h2>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
          Chúng tôi tìm thấy dữ liệu học tập trên máy này trước khi đăng nhập:
        </p>

        <div style={{
          background: 'var(--bg-tertiary)',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px'
        }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--success)' }}>{masteredCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Từ đã thuộc</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--warning)' }}>{reviewCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Từ cần ôn</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f97316' }}>{stats.streak || 1}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ngày streak</div>
          </div>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '22px' }}>
          Bạn có muốn lưu toàn bộ số từ này vào tài khoản đám mây của bạn không?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleMigrate}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            <CheckCircle size={18} />
            <span>{loading ? 'Đang tải lên mây...' : 'Đồng bộ vào tài khoản'}</span>
          </button>

          <button 
            type="button" 
            className="btn-secondary" 
            onClick={handleSkip}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            <span>Bắt đầu từ tài khoản mới</span>
          </button>
        </div>
      </div>
    </div>
  );
}
