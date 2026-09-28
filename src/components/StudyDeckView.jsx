import React, { useState, useEffect, useCallback } from 'react';
import { 
  getWordsByTier, 
  getWordsByUnit, 
  getUnitById, 
  getTierInfo, 
  THEMES, 
  UNITS, 
  TIERS 
} from '../data/vocabData';
import { audioService } from '../services/audioService';
import { 
  Volume2, 
  RotateCw, 
  CheckCircle, 
  XCircle, 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert, 
  Shuffle, 
  Layers, 
  BookOpen, 
  Trophy, 
  Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StudyDeckView({ 
  selectedUnit, 
  setSelectedUnit, 
  selectedTier, 
  setSelectedTier, 
  masteredIds, 
  reviewIds, 
  favorites, 
  onToggleMastered, 
  onToggleReview, 
  onToggleFavorite, 
  onCardReviewed, 
  onStartQuizForUnit 
}) {
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlayAudio, setIsAutoPlayAudio] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // Touch swipe states for mobile ergonomics
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);

  // Load words when selectedUnit or selectedTier changes
  useEffect(() => {
    let list = [];
    if (selectedUnit) {
      list = getWordsByUnit(selectedUnit);
    } else if (selectedTier === 'review') {
      const allWords = getWordsByTier('all');
      list = allWords.filter(w => reviewIds.includes(w.id));
    } else if (selectedTier === 'favorites') {
      const allWords = getWordsByTier('all');
      list = allWords.filter(w => favorites.includes(w.id));
    } else {
      list = getWordsByTier(selectedTier || 1);
    }

    setDeck(list);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowCompletionModal(false);
  }, [selectedUnit, selectedTier]);

  const currentWord = deck[currentIndex];
  const unitInfo = selectedUnit ? getUnitById(selectedUnit) : null;
  const tierInfo = !selectedUnit && selectedTier !== 'review' && selectedTier !== 'favorites' 
    ? getTierInfo(selectedTier) 
    : null;

  // Auto-play audio when advancing to next word
  useEffect(() => {
    if (currentWord && isAutoPlayAudio && !isFlipped && !showCompletionModal) {
      const firstWord = currentWord.word.split('/')[0].trim();
      audioService.speak(firstWord);
    }
  }, [currentIndex, isAutoPlayAudio, currentWord, showCompletionModal]);

  // Handle Flip
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Next card handler
  const handleNext = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev < deck.length - 1) {
        setIsFlipped(false);
        return prev + 1;
      } else {
        // Completed the deck!
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
        setShowCompletionModal(true);
        return prev;
      }
    });
  }, [deck.length]);

  // Previous card handler
  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev > 0) {
        setIsFlipped(false);
        return prev - 1;
      }
      return 0;
    });
  }, []);

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Mark as Mastered
  const handleMarkMastered = () => {
    if (!currentWord) return;
    onToggleMastered(currentWord.id, true);
    onCardReviewed();
    handleNext();
  };

  // Mark as Need Review
  const handleMarkNeedReview = () => {
    if (!currentWord) return;
    onToggleReview(currentWord.id, true);
    onCardReviewed();
    handleNext();
  };

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // Only apply horizontal swipe if not scrolling vertically
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setTouchDeltaX(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    if (touchDeltaX > 70) {
      // Swiped right -> Mastered
      handleMarkMastered();
    } else if (touchDeltaX < -70) {
      // Swiped left -> Need Review
      handleMarkNeedReview();
    }
    setTouchDeltaX(0);
  };

  // Switch to next Unit
  const handleGoNextUnit = () => {
    if (selectedUnit && selectedUnit < 50) {
      setSelectedUnit(selectedUnit + 1);
      setSelectedTier(null);
    }
    setShowCompletionModal(false);
  };

  // Restart current deck
  const handleRestartDeck = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowCompletionModal(false);
  };

  // Keyboard Shortcuts (Space, 1, 2, A, Arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['input', 'textarea', 'select'].includes(document.activeElement.tagName.toLowerCase())) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1') {
        e.preventDefault();
        handleMarkNeedReview();
      } else if (e.key === '2') {
        e.preventDefault();
        handleMarkMastered();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (currentWord) audioService.speak(currentWord.word);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleMarkNeedReview, handleMarkMastered, handleNext, handlePrev, currentWord]);

  if (!currentWord) {
    return (
      <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '40px auto' }}>
        <Layers size={48} color="var(--accent-primary)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ marginBottom: '12px' }}>Không có thẻ nào trong mục này</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {selectedTier === 'review' 
            ? 'Tuyệt vời! Bạn không có từ nào trong danh sách cần ôn lại.' 
            : selectedTier === 'favorites' 
            ? 'Bạn chưa đánh dấu sao từ vựng nào.' 
            : 'Vui lòng chọn một Unit hoặc Tầng từ vựng khác.'}
        </p>
        <button 
          className="btn-primary" 
          onClick={() => { setSelectedUnit(1); setSelectedTier(null); }}
        >
          Học Unit 1 (Contracts)
        </button>
      </div>
    );
  }

  const isMastered = masteredIds.includes(currentWord.id);
  const isReview = reviewIds.includes(currentWord.id);
  const isFav = favorites.includes(currentWord.id);
  const wordParts = currentWord ? currentWord.word.split('/').map(w => w.trim()) : [];

  // Compute unit progress
  const unitMasteredCount = deck.filter(w => masteredIds.includes(w.id)).length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Deck Control & Scope Selector */}
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Unit / Scope Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Unit Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} color="var(--accent-primary)" />
              <select 
                value={selectedUnit || ''} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setSelectedUnit(Number(val));
                    setSelectedTier(null);
                  }
                }}
                style={{
                  background: selectedUnit ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  color: selectedUnit ? 'var(--accent-primary)' : 'var(--text-primary)',
                  border: selectedUnit ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  fontSize: '0.88rem',
                  fontWeight: selectedUnit ? '700' : '500',
                  cursor: 'pointer'
                }}
              >
                <option value="" disabled>-- Chọn theo 50 Chủ điểm (Unit) --</option>
                {(THEMES || []).map(theme => (
                  <optgroup key={theme.id} label={`${theme.name || theme.title} (${theme.nameVi || theme.titleVi})`}>
                    {(theme.units || []).map(u => (
                      <option key={u.id} value={u.id}>
                        Unit {u.id}: {u.name || u.title} ({u.nameVi || u.titleVi})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Tier Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--text-muted)" />
              <select 
                value={selectedUnit ? '' : (selectedTier ?? '')} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== '') {
                    setSelectedUnit(null);
                    setSelectedTier(val === 'review' || val === 'favorites' ? val : Number(val));
                  }
                }}
                style={{
                  background: !selectedUnit && selectedTier !== null ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  color: !selectedUnit && selectedTier !== null ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: !selectedUnit && selectedTier !== null ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                <option value="" disabled>-- Chọn theo Cấp độ (Tier) --</option>
                {TIERS.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
                <option value="review">⚡ Ôn từ yếu ({reviewIds.length} từ)</option>
                <option value="favorites">⭐ Từ yêu thích ({favorites.length} từ)</option>
              </select>
            </div>
          </div>

          {/* Shuffle & Auto-audio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className="icon-btn" 
              title="Trộn ngẫu nhiên thẻ"
              onClick={handleShuffle}
            >
              <Shuffle size={18} />
            </button>
            <button 
              className="icon-btn" 
              title={isAutoPlayAudio ? "Tắt tự động phát âm khi chuyển từ" : "Bật tự động phát âm"}
              onClick={() => setIsAutoPlayAudio(!isAutoPlayAudio)}
              style={{ color: isAutoPlayAudio ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            >
              <Volume2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Counter & Scope Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '720px', margin: '0 auto', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {unitInfo ? (
              <span>Unit {unitInfo.id}: {unitInfo.name} <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>({unitInfo.nameVi})</span></span>
            ) : tierInfo ? (
              <span>{tierInfo.name}</span>
            ) : selectedTier === 'review' ? (
              <span>Danh sách từ yếu cần ôn lại</span>
            ) : (
              <span>Từ vựng yêu thích</span>
            )}
          </span>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Thẻ <strong>{currentIndex + 1}</strong> / {deck.length} • Đã thuộc {unitMasteredCount}/{deck.length} từ
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isMastered && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--success)', fontWeight: '700', background: 'var(--success-bg)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
              <CheckCircle size={14} /> Đã thuộc
            </span>
          )}
          {isReview && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--warning)', fontWeight: '700', background: 'var(--warning-bg)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
              <XCircle size={14} /> Cần ôn
            </span>
          )}
        </div>
      </div>

      {/* 3D Interactive Flashcard */}
      <div 
        className="card-perspective-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe Feedback Indicators on Mobile */}
        {touchDeltaX > 35 && (
          <div className="swipe-indicator swipe-right">
            <CheckCircle size={22} />
            <span>Đã thuộc</span>
          </div>
        )}
        {touchDeltaX < -35 && (
          <div className="swipe-indicator swipe-left">
            <XCircle size={22} />
            <span>Cần ôn lại</span>
          </div>
        )}

        <div 
          className={`flashcard-3d ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
          style={{
            transform: !isFlipped && touchDeltaX !== 0 
              ? `translateX(${touchDeltaX}px) rotate(${touchDeltaX * 0.05}deg)` 
              : undefined,
            transition: isSwiping ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* FRONT FACE */}
          <div className="card-face card-face-front">
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentWord.unitId ? (
                  <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    Unit {currentWord.unitId} • {currentWord.topic}
                  </span>
                ) : (
                  <span className={`badge badge-tier${currentWord.tier}`}>
                    Tier 0: Bẫy Part 5
                  </span>
                )}
              </div>
              <button 
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(currentWord.id);
                }}
                style={{ color: isFav ? '#f59e0b' : 'var(--text-muted)' }}
                title="Đánh dấu yêu thích"
              >
                <Star size={18} fill={isFav ? '#f59e0b' : 'none'} />
              </button>
            </div>

            {/* Center Word & Audio */}
            <div style={{ textAlign: 'center', margin: 'auto 0' }}>
              {wordParts.length > 1 ? (
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                    {wordParts.map((w, idx) => (
                      <div 
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'var(--bg-secondary)',
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-full)',
                          border: '1.5px solid var(--border-card)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                          {w}
                        </span>
                        <button
                          className="icon-btn"
                          style={{ width: '32px', height: '32px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', borderColor: 'rgba(99, 102, 241, 0.35)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            audioService.speak(w);
                          }}
                          title={`Nghe riêng từ "${w}"`}
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {currentWord.ipa && (
                    <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {currentWord.ipa}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                    {currentWord.word}
                  </h2>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {currentWord.ipa}
                    </span>
                    <button 
                      className="icon-btn"
                      style={{ width: '36px', height: '36px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        audioService.speak(currentWord.word);
                      }}
                      title="Nghe phát âm (Phím A)"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                </>
              )}

              {currentWord.pos && (
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', padding: '4px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', color: 'var(--text-muted)' }}>
                    {currentWord.pos.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Flip Hint */}
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <RotateCw size={14} />
              <span>Nhấn Space hoặc bấm vào thẻ để xem nghĩa & cụm đồng nghĩa</span>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="card-face card-face-back">
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {wordParts.length > 1 ? (
                  wordParts.map((w, idx) => (
                    <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{w}</span>
                      <button 
                        className="icon-btn"
                        style={{ width: '24px', height: '24px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          audioService.speak(w);
                        }}
                        title={`Nghe riêng từ "${w}"`}
                      >
                        <Volume2 size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--accent-primary)' }}>{currentWord.word}</h3>
                    <button 
                      className="icon-btn"
                      style={{ width: '32px', height: '32px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        audioService.speak(currentWord.word);
                      }}
                    >
                      <Volume2 size={16} />
                    </button>
                  </>
                )}
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>({currentWord.pos || currentWord.type})</span>
              </div>
            </div>

            {/* Content Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '14px 0' }}>
              {/* Vietnamese Meaning */}
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
                  Nghĩa tiếng Việt
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#10b981' }}>
                  {currentWord.meaning}
                </div>
              </div>

              {/* TIER 0 SPECIAL: Contrast Box */}
              {currentWord.tier === 0 && currentWord.contrastWith && (
                <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e', fontWeight: '700', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <ShieldAlert size={16} />
                    <span>ĐỐI CHIẾU BẪY PART 5:</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        {wordParts.map((w, idx) => (
                          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontWeight: '700', color: '#818cf8' }}>{w}</span>
                            <button
                              className="icon-btn"
                              style={{ width: '20px', height: '20px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                audioService.speak(w);
                              }}
                              title={`Nghe "${w}"`}
                            >
                              <Volume2 size={10} />
                            </button>
                            {idx < wordParts.length - 1 && <span style={{ color: 'var(--text-muted)' }}>/</span>}
                          </span>
                        ))}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{currentWord.rule}</div>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        {currentWord.contrastWith.word.split('/').map(w => w.trim()).map((cw, cidx, arr) => (
                          <span key={cidx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontWeight: '700', color: '#f43f5e' }}>{cw}</span>
                            <button
                              className="icon-btn"
                              style={{ width: '20px', height: '20px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                audioService.speak(cw);
                              }}
                              title={`Nghe "${cw}"`}
                            >
                              <Volume2 size={10} />
                            </button>
                            {cidx < arr.length - 1 && <span style={{ color: 'var(--text-muted)' }}>/</span>}
                          </span>
                        ))}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{currentWord.contrastWith.rule}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Synonyms & Paraphrase Clusters */}
              {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '6px' }}>
                    Cụm từ đồng nghĩa (Bẫy Paraphrase TOEIC)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentWord.synonyms.map((syn, idx) => (
                      <span 
                        key={idx}
                        className="synonym-chip"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioService.speak(syn);
                        }}
                        title={`Bấm để nghe phát âm "${syn}"`}
                      >
                        <Volume2 size={13} />
                        <span>{syn}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Real TOEIC Example */}
              {currentWord.example && (
                <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Ví dụ ngữ cảnh TOEIC</span>
                    <button 
                      className="icon-btn" 
                      style={{ width: '26px', height: '26px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        audioService.speak(currentWord.example);
                      }}
                      title="Nghe cả câu ví dụ"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '4px', fontStyle: 'italic' }}>
                    "{currentWord.example}"
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {currentWord.exampleVi}
                  </p>
                </div>
              )}

              {/* Pro Tip */}
              {currentWord.tip && (
                <div style={{ fontSize: '0.82rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  💡 {currentWord.tip}
                </div>
              )}
            </div>

            {/* Bottom Flip back */}
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <RotateCw size={13} />
              <span>Bấm vào thẻ để lật lại mặt trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Study Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', maxWidth: '720px', margin: '20px auto 0', width: '100%', flexWrap: 'wrap' }}>
        <button 
          className="icon-btn"
          style={{ width: '48px', height: '48px' }}
          onClick={handlePrev}
          disabled={currentIndex === 0}
          title="Từ trước (Mũi tên trái)"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Action: Need Review */}
        <button 
          className="btn-secondary"
          onClick={handleMarkNeedReview}
          style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171', minWidth: '170px' }}
        >
          <XCircle size={18} />
          <span>Chưa nhớ (Phím 1)</span>
        </button>

        {/* Action: Mastered */}
        <button 
          className="btn-primary"
          onClick={handleMarkMastered}
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)', minWidth: '170px' }}
        >
          <CheckCircle size={18} />
          <span>Đã thuộc (Phím 2)</span>
        </button>

        <button 
          className="icon-btn"
          style={{ width: '48px', height: '48px' }}
          onClick={handleNext}
          title="Từ tiếp theo (Mũi tên phải)"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Keyboard Shortcuts Guide */}
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
        Phím tắt: <kbd style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>Space</kbd> Lật thẻ • <kbd style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>1</kbd> Chưa thuộc • <kbd style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>2</kbd> Đã thuộc • <kbd style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>A</kbd> Phát âm
      </div>

      {/* CELEBRATORY COMPLETION MODAL */}
      {showCompletionModal && (
        <div className="completion-overlay" onClick={() => setShowCompletionModal(false)}>
          <div className="completion-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              width: '76px', 
              height: '76px', 
              borderRadius: 'var(--radius-full)', 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: 'var(--success)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 18px',
              border: '2px solid rgba(16, 185, 129, 0.35)'
            }}>
              <Trophy size={38} />
            </div>

            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
              {selectedUnit ? `Hoàn thành Unit ${selectedUnit}!` : 'Hoàn thành lượt học!'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '22px' }}>
              {selectedUnit ? `${unitInfo?.name || unitInfo?.title || 'Unit'} (${unitInfo?.nameVi || unitInfo?.titleVi || ''})` : 'Bạn đã lướt qua toàn bộ thẻ trong mục này.'}
            </p>

            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-around' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--success)' }}>
                  {deck.filter(w => (masteredIds || []).includes(w.id)).length}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Từ đã thuộc</div>
              </div>
              <div style={{ borderRight: '1px solid var(--border-subtle)' }} />
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--warning)' }}>
                  {deck.filter(w => (reviewIds || []).includes(w.id)).length}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cần ôn lại</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedUnit && selectedUnit < 50 && (
                <button 
                  className="btn-primary" 
                  onClick={handleGoNextUnit}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>Học tiếp Unit {selectedUnit + 1}</span>
                  <ArrowRight size={18} />
                </button>
              )}

              {onStartQuizForUnit && selectedUnit && (
                <button 
                  className="btn-secondary" 
                  onClick={() => onStartQuizForUnit(selectedUnit)}
                  style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(99, 102, 241, 0.4)', color: 'var(--accent-primary)' }}
                >
                  <Sparkles size={18} />
                  <span>Kiểm tra phản xạ Unit {selectedUnit}</span>
                </button>
              )}

              <button 
                className="btn-secondary" 
                onClick={handleRestartDeck}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <RotateCw size={16} />
                <span>Học lại mục này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
