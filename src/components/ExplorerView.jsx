import React, { useState, useMemo } from 'react';
import { 
  getAllWords, 
  THEMES, 
  UNITS, 
  TIERS 
} from '../data/vocabData';
import { audioService } from '../services/audioService';
import { 
  Search, 
  Volume2, 
  CheckCircle, 
  XCircle, 
  Star, 
  Download, 
  BookOpen, 
  Layers 
} from 'lucide-react';

export default function ExplorerView({ 
  masteredIds, 
  reviewIds, 
  favorites, 
  onToggleMastered, 
  onToggleReview, 
  onToggleFavorite, 
  onExport 
}) {
  const allWords = getAllWords();
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'mastered', 'review', 'fav'

  // Filtered words
  const filteredWords = useMemo(() => {
    return allWords.filter(item => {
      // Unit filter
      if (unitFilter !== 'all') {
        if (item.unitId !== Number(unitFilter)) return false;
      }

      // Tier filter
      if (tierFilter !== 'all') {
        if (item.tier !== Number(tierFilter)) return false;
      }

      // Status filter
      if (statusFilter === 'mastered' && !masteredIds.includes(item.id)) return false;
      if (statusFilter === 'review' && !reviewIds.includes(item.id)) return false;
      if (statusFilter === 'fav' && !favorites.includes(item.id)) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchWord = item.word.toLowerCase().includes(q);
        const matchMeaning = item.meaning.toLowerCase().includes(q);
        const matchSynonyms = item.synonyms && item.synonyms.some(s => s.toLowerCase().includes(q));
        const matchTopic = item.topic && item.topic.toLowerCase().includes(q);
        const matchExample = item.example && item.example.toLowerCase().includes(q);
        return matchWord || matchMeaning || matchSynonyms || matchTopic || matchExample;
      }

      return true;
    });
  }, [allWords, searchTerm, unitFilter, tierFilter, statusFilter, masteredIds, reviewIds, favorites]);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Controls */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Tra cứu Từ điển & Cụm Paraphrase</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Tra cứu tức thì toàn bộ 600 từ vựng TOEIC (50 Units), bẫy liên từ Part 5 và cụm từ đồng nghĩa
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={onExport} title="Sao lưu tiến độ">
              <Download size={16} />
              <span>Sao lưu JSON</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            placeholder="Tìm kiếm từ tiếng Anh, nghĩa tiếng Việt, chủ điểm, hoặc từ đồng nghĩa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Filters Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* Unit Dropdown Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Chủ điểm:</span>
              <select 
                value={unitFilter} 
                onChange={(e) => setUnitFilter(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tất cả 50 Chủ điểm</option>
                {(THEMES || []).map(theme => (
                  <optgroup key={theme.id} label={`${theme.name || theme.title} (${theme.nameVi || theme.titleVi})`}>
                    {(theme.units || []).map(u => (
                      <option key={u.id} value={u.id}>Unit {u.id}: {u.name || u.title} ({u.nameVi || u.titleVi})</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Status buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Trạng thái:</span>
              <button 
                onClick={() => setStatusFilter('all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: statusFilter === 'all' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: statusFilter === 'all' ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setStatusFilter('mastered')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: statusFilter === 'mastered' ? 'var(--success)' : 'var(--bg-secondary)',
                  color: statusFilter === 'mastered' ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                Đã thuộc ({masteredIds.length})
              </button>
              <button 
                onClick={() => setStatusFilter('review')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: statusFilter === 'review' ? 'var(--warning)' : 'var(--bg-secondary)',
                  color: statusFilter === 'review' ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                Cần ôn ({reviewIds.length})
              </button>
              <button 
                onClick={() => setStatusFilter('fav')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: statusFilter === 'fav' ? '#f59e0b' : 'var(--bg-secondary)',
                  color: statusFilter === 'fav' ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                Yêu thích ({favorites.length})
              </button>
            </div>
          </div>

          {/* Tier buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Tầng:</span>
            <button 
              onClick={() => setTierFilter('all')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: '600',
                background: tierFilter === 'all' ? 'var(--grad-primary)' : 'var(--bg-secondary)',
                color: tierFilter === 'all' ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              Tất cả tầng
            </button>
            {TIERS.map(t => (
              <button 
                key={t.id}
                onClick={() => setTierFilter(t.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  background: tierFilter === t.id ? t.color : 'var(--bg-secondary)',
                  color: tierFilter === t.id ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                Tier {t.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Count */}
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Hiển thị <strong>{filteredWords.length}</strong> từ vựng phù hợp
      </div>

      {/* Words Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {filteredWords.map((item) => {
          const isMastered = masteredIds.includes(item.id);
          const isReview = reviewIds.includes(item.id);
          const isFav = favorites.includes(item.id);

          return (
            <div 
              key={item.id} 
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                borderLeft: `4px solid ${item.tier === 0 ? '#ec4899' : item.tier === 1 ? '#6366f1' : item.tier === 2 ? '#06b6d4' : item.tier === 3 ? '#10b981' : '#f59e0b'}`
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {item.word.includes('/') ? (
                        item.word.split('/').map(w => w.trim()).map((w, widx, arr) => (
                          <span key={widx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{w}</h3>
                            <button 
                              className="icon-btn"
                              style={{ width: '24px', height: '24px' }}
                              onClick={() => audioService.speak(w)}
                              title={`Nghe riêng từ "${w}"`}
                            >
                              <Volume2 size={13} />
                            </button>
                            {widx < arr.length - 1 && <span style={{ color: 'var(--text-muted)' }}>/</span>}
                          </span>
                        ))
                      ) : (
                        <>
                          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{item.word}</h3>
                          <button 
                            className="icon-btn"
                            style={{ width: '28px', height: '28px' }}
                            onClick={() => audioService.speak(item.word)}
                            title="Nghe phát âm"
                          >
                            <Volume2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {item.ipa} {item.pos && `• ${item.pos}`}
                    </div>
                  </div>

                  {item.unitId ? (
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.75rem' }}>
                      Unit {item.unitId}
                    </span>
                  ) : (
                    <span className={`badge badge-tier${item.tier}`}>
                      Tier {item.tier}
                    </span>
                  )}
                </div>

                {/* Meaning */}
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#10b981', margin: '8px 0 12px' }}>
                  {item.meaning}
                </div>

                {/* Tier 0 rule */}
                {item.tier === 0 && (
                  <div style={{ fontSize: '0.82rem', background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185', padding: '6px 10px', borderRadius: 'var(--radius-sm)', marginBottom: '10px' }}>
                    <strong>Quy tắc:</strong> {item.rule}
                  </div>
                )}

                {/* Synonyms Chips */}
                {item.synonyms && item.synonyms.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {item.synonyms.map((syn, idx) => (
                      <span 
                        key={idx}
                        className="synonym-chip"
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                        onClick={() => audioService.speak(syn)}
                        title={`Bấm để nghe phát âm "${syn}"`}
                      >
                        <Volume2 size={11} />
                        <span>{syn}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Example sentence */}
                {item.example && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--accent-primary)' }}>
                    "{item.example}"
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  onClick={() => onToggleFavorite(item.id)}
                  style={{ color: isFav ? '#f59e0b' : 'var(--text-muted)' }}
                  title="Yêu thích"
                >
                  <Star size={18} fill={isFav ? '#f59e0b' : 'none'} />
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => onToggleReview(item.id, !isReview)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isReview ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-secondary)',
                      color: isReview ? '#f59e0b' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <XCircle size={14} />
                    <span>{isReview ? 'Cần ôn' : 'Đánh dấu ôn'}</span>
                  </button>

                  <button 
                    onClick={() => onToggleMastered(item.id, !isMastered)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isMastered ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
                      color: isMastered ? '#10b981' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <CheckCircle size={14} />
                    <span>{isMastered ? 'Đã thuộc' : 'Thuộc'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
