import React, { useState } from 'react';
import { 
  THEMES, 
  UNITS, 
  TIERS, 
  getAllWords, 
  getWordsByTier, 
  getWordsByUnit, 
  getWordsByTheme,
  getUnitsByTheme 
} from '../data/vocabData';
import { 
  CheckCircle2, 
  RotateCcw, 
  ShieldAlert, 
  Zap, 
  Briefcase, 
  TrendingUp, 
  Award, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Check 
} from 'lucide-react';

export default function DashboardView({ 
  masteredIds = [], 
  reviewIds = [], 
  stats = {}, 
  onSelectTier, 
  onSelectUnit, 
  onStartReview 
}) {
  const [viewMode, setViewMode] = useState('units'); // 'units' (50 Units Roadmap) or 'tiers' (Tiers 0-4)
  const [expandedThemes, setExpandedThemes] = useState({
    general_business: true,
    office_technology: true,
    personnel: false,
    purchasing: false,
    finances: false,
    management: false,
    restaurants_events: false,
    travel: false,
    entertainment: false,
    health: false
  });

  const safeMasteredIds = Array.isArray(masteredIds) ? masteredIds : [];
  const safeReviewIds = Array.isArray(reviewIds) ? reviewIds : [];

  const toggleThemeExpand = (themeId) => {
    setExpandedThemes(prev => ({
      ...prev,
      [themeId]: !prev[themeId]
    }));
  };

  const expandAll = () => {
    const all = {};
    (THEMES || []).forEach(t => { all[t.id] = true; });
    setExpandedThemes(all);
  };

  const collapseAll = () => {
    const none = {};
    (THEMES || []).forEach(t => { none[t.id] = false; });
    setExpandedThemes(none);
  };

  const allWords = getAllWords() || [];
  const totalCount = allWords.length;
  const masteredCount = safeMasteredIds.length;
  const reviewCount = safeReviewIds.length;
  const progressPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  // Find next unit to study (first unit with < 12 words mastered)
  let nextSuggestedUnit = (UNITS && UNITS.length > 0) ? UNITS[0] : { id: 1, name: 'Contracts', nameVi: 'Hợp đồng' };
  if (UNITS && UNITS.length > 0) {
    for (const u of UNITS) {
      const uWords = getWordsByUnit(u.id) || [];
      const mCount = uWords.filter(w => safeMasteredIds.includes(w.id)).length;
      if (mCount < uWords.length) {
        nextSuggestedUnit = u;
        break;
      }
    }
  }

  // Tier icons mapping
  const renderTierIcon = (iconName, color) => {
    const props = { size: 28, color: color };
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Briefcase': return <Briefcase {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'Award': return <Award {...props} />;
      default: return <Zap {...props} />;
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Welcome & Global Progress */}
      <div 
        className="glass-card" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.25)',
          padding: '32px 28px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '14px' }}>
              <Sparkles size={16} color="#818cf8" />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#c7d2fe', letterSpacing: '0.04em' }}>
                TRỌN BỘ 600 TỪ VỰNG TOEIC CĂN BẢN (50 CHỦ ĐIỂM BARRON'S)
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', lineHeight: '1.2', marginBottom: '12px' }}>
              Chinh phục <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TOEIC 800+</span> từ gốc rễ
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Chuẩn hóa 50 chủ điểm từ vựng kinh điển của Dr. Lin Lougheed (12 từ/unit) kết hợp bẫy liên từ/giới từ Part 5 và mạng lưới cụm từ đồng nghĩa để giải đề phản xạ tự nhiên.
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px 20px', minWidth: '130px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--success)', marginBottom: '4px' }}>
                <CheckCircle2 size={18} />
                <span style={{ fontSize: '1.6rem', fontWeight: '800' }}>{masteredCount}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Từ đã thuộc</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px 20px', minWidth: '130px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--warning)', marginBottom: '4px' }}>
                <RotateCcw size={18} />
                <span style={{ fontSize: '1.6rem', fontWeight: '800' }}>{reviewCount}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Cần ôn lại</div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div style={{ marginTop: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tiến độ làm chủ toàn bộ kho từ vựng (600 Từ + Bẫy Part 5)</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{masteredCount} / {totalCount} từ ({progressPercent}%)</span>
          </div>
          <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${progressPercent}%`, 
                background: 'var(--grad-primary)', 
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.6s ease'
              }} 
            />
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary"
            onClick={() => onSelectUnit && onSelectUnit(nextSuggestedUnit.id)}
          >
            <Play size={18} />
            <span>Học tiếp: Unit {nextSuggestedUnit.id} ({nextSuggestedUnit.nameVi || nextSuggestedUnit.titleVi})</span>
          </button>

          {reviewCount > 0 && (
            <button 
              className="btn-secondary"
              onClick={onStartReview}
              style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
            >
              <RotateCcw size={18} />
              <span>Ôn tập {reviewCount} từ yếu</span>
            </button>
          )}

          <button 
            className="btn-secondary"
            onClick={() => onSelectTier && onSelectTier(0)}
            style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
          >
            <ShieldAlert size={18} />
            <span>Luyện bẫy Liên/Giới từ (Tier 0)</span>
          </button>
        </div>
      </div>

      {/* Navigation View Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', marginBottom: '4px' }}>Khám phá lộ trình học</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Học tuần tự 50 chủ điểm hoặc học theo tầng từ vựng và bẫy đề thi
          </p>
        </div>

        <div className="view-mode-tabs">
          <button 
            className={`view-mode-btn ${viewMode === 'units' ? 'active' : ''}`}
            onClick={() => setViewMode('units')}
          >
            <BookOpen size={16} />
            <span>50 Chủ điểm (Units)</span>
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'tiers' ? 'active' : ''}`}
            onClick={() => setViewMode('tiers')}
          >
            <Layers size={16} />
            <span>Cấp độ & Bẫy (Tiers)</span>
          </button>
        </div>
      </div>

      {/* MODE 1: 50 UNITS ACCORDION ROADMAP */}
      {viewMode === 'units' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Quick theme control buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              onClick={expandAll} 
              style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '600', padding: '4px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            >
              Mở rộng tất cả
            </button>
            <button 
              onClick={collapseAll} 
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', padding: '4px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            >
              Thu gọn
            </button>
          </div>

          {/* 10 Themes List */}
          {(THEMES || []).map((theme, tIdx) => {
            const themeUnits = (theme.units && theme.units.length > 0) ? theme.units : (getUnitsByTheme(theme.id) || []);
            const themeWords = getWordsByTheme(theme.id) || [];
            const themeMastered = themeWords.filter(w => safeMasteredIds.includes(w.id)).length;
            const themeProgress = themeWords.length > 0 ? Math.round((themeMastered / themeWords.length) * 100) : 0;
            const isExpanded = expandedThemes[theme.id] ?? false;

            const firstUnitId = themeUnits[0]?.id || 1;
            const lastUnitId = themeUnits[themeUnits.length - 1]?.id || 5;

            return (
              <div key={theme.id} className="theme-card">
                {/* Theme Accordion Header */}
                <div 
                  className="theme-header"
                  onClick={() => toggleThemeExpand(theme.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: 'var(--radius-md)', 
                      background: `${theme.color}20`, 
                      color: theme.color,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '1.1rem'
                    }}>
                      {tIdx + 1}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.15rem' }}>{theme.name || theme.title}</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({theme.nameVi || theme.titleVi})</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Units {firstUnitId} – {lastUnitId} • 60 từ vựng cốt lõi
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: theme.color }}>
                        {themeMastered} / {themeWords.length} từ
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {themeProgress}% hoàn thành
                      </div>
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Units Grid */}
                {isExpanded && (
                  <div className="units-grid">
                    {themeUnits.map((unit) => {
                      const uWords = getWordsByUnit(unit.id) || [];
                      const uMastered = uWords.filter(w => safeMasteredIds.includes(w.id)).length;
                      const uProgress = uWords.length > 0 ? Math.round((uMastered / uWords.length) * 100) : 0;
                      const isComplete = uMastered === uWords.length && uWords.length > 0;

                      return (
                        <div 
                          key={unit.id}
                          className={`unit-card ${isComplete ? 'completed' : ''}`}
                          onClick={() => onSelectUnit && onSelectUnit(unit.id)}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: theme.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                UNIT {unit.id}
                              </span>
                              {isComplete ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: 'var(--success)', fontWeight: '700' }}>
                                  <Check size={14} /> Hoàn thành
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {uMastered}/{uWords.length} từ
                                </span>
                              )}
                            </div>

                            <h4 style={{ fontSize: '1rem', marginBottom: '2px', color: 'var(--text-primary)' }}>
                              {unit.name || unit.title}
                            </h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {unit.nameVi || unit.titleVi}
                            </p>
                          </div>

                          <div>
                            <div className="unit-progress-bar">
                              <div 
                                className="unit-progress-fill" 
                                style={{ 
                                  width: `${uProgress}%`, 
                                  background: isComplete ? 'var(--success)' : theme.color 
                                }} 
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: theme.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>Học Unit</span>
                                <ArrowRight size={13} />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODE 2: TIERS GRID (0 to 4) */}
      {viewMode === 'tiers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {(TIERS || []).map((tier) => {
            const tierWords = getWordsByTier(tier.id) || [];
            const tierMastered = tierWords.filter(w => safeMasteredIds.includes(w.id)).length;
            const tierProgress = tierWords.length > 0 ? Math.round((tierMastered / tierWords.length) * 100) : 0;

            return (
              <div 
                key={tier.id}
                className="glass-card"
                onClick={() => onSelectTier && onSelectTier(tier.id)}
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${tier.color}`,
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: 'var(--radius-md)', 
                      background: `${tier.color}15`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {renderTierIcon(tier.icon, tier.color)}
                    </div>
                    <span className={`badge badge-tier${tier.id}`}>
                      {tier.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{tier.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', minHeight: '44px', lineHeight: '1.5' }}>
                    {tier.desc}
                  </p>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    <span>Tiến độ: {tierMastered}/{tierWords.length} từ</span>
                    <span style={{ fontWeight: '700', color: tier.color }}>{tierProgress}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '14px' }}>
                    <div style={{ height: '100%', width: `${tierProgress}%`, background: tier.color, borderRadius: 'var(--radius-full)' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: tier.color, fontSize: '0.9rem', fontWeight: '700' }}>
                    <span>Vào học</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pro Study Tips for TOEIC */}
      <div 
        className="glass-card"
        style={{ 
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}
      >
        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{ color: '#f59e0b', marginTop: '2px' }}>
            <Lightbulb size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Bí kíp Paraphrase Part 3, 4, 7</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Đừng chỉ học 1 từ đơn lẻ! Hãy bấm vào các chip từ đồng nghĩa trên thẻ từ để thuộc cả cụm (Ví dụ: <em>cancel = call off</em>, <em>attend = participate in</em>). Đề thi luôn nói 1 đằng nhưng đáp án viết 1 nẻo!
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{ color: '#ec4899', marginTop: '2px' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Quy tắc 5 giây Part 5 (Tier 0)</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Gặp chỗ trống cần điền: Nhìn ngay phía sau! Nếu thấy có động từ chia thì (S + V) ➔ Chọn <strong>Liên từ</strong> (*Although, Because*). Nếu chỉ có Cụm danh từ / V-ing ➔ Chọn <strong>Giới từ</strong> (*Despite, Due to*).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
