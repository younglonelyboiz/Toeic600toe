import React, { useState, useEffect } from 'react';
import { 
  generateQuizQuestions, 
  THEMES, 
  UNITS, 
  TIERS 
} from '../data/vocabData';
import { audioService } from '../services/audioService';
import { 
  Sparkles, 
  Keyboard, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Volume2, 
  ArrowRight, 
  Trophy, 
  BookOpen, 
  Layers 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizView({ 
  onRecordResult, 
  onToggleMastered, 
  onToggleReview, 
  initialScope = 'all' 
}) {
  const [quizMode, setQuizMode] = useState('choice'); // 'choice' or 'spelling'
  const [selectedScope, setSelectedScope] = useState(initialScope);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Spelling mode states
  const [spellingInput, setSpellingInput] = useState('');
  const [spellingFeedback, setSpellingFeedback] = useState(null);

  // Sync initialScope prop if changed
  useEffect(() => {
    if (initialScope) {
      setSelectedScope(initialScope);
    }
  }, [initialScope]);

  // Start new quiz session
  const startQuiz = (mode = quizMode, scope = selectedScope) => {
    const list = generateQuizQuestions(scope, 10);
    setQuestions(list);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setSpellingInput('');
    setSpellingFeedback(null);
  };

  useEffect(() => {
    startQuiz(quizMode, selectedScope);
  }, [selectedScope, quizMode]);

  const currentQ = questions[currentIndex];

  // Auto-pronounce in spelling mode when question appears
  useEffect(() => {
    if (quizMode === 'spelling' && currentQ && !isFinished) {
      const firstWord = currentQ.wordData.word.split('/')[0].trim();
      audioService.speak(firstWord);
    }
  }, [currentIndex, quizMode, currentQ, isFinished]);

  // Choice mode answer selection
  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      onToggleMastered(currentQ.wordData.id, true);
    } else {
      onToggleReview(currentQ.wordData.id, true);
    }
  };

  // Spelling mode submit
  const handleSpellingSubmit = (e) => {
    e.preventDefault();
    if (isAnswered || !spellingInput.trim()) return;

    const cleanInput = spellingInput.trim().toLowerCase();
    const cleanWord = currentQ.wordData.word.toLowerCase();
    const slashParts = cleanWord.split('/').map(p => p.trim());
    const isCorrect = cleanInput === cleanWord || slashParts.includes(cleanInput);

    setIsAnswered(true);
    setSpellingFeedback({
      isCorrect,
      expected: currentQ.wordData.word
    });

    if (isCorrect) {
      setScore(prev => prev + 1);
      onToggleMastered(currentQ.wordData.id, true);
    } else {
      onToggleReview(currentQ.wordData.id, true);
    }
  };

  // Next question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setSpellingInput('');
      setSpellingFeedback(null);
    } else {
      // Quiz Finished!
      const finalScore = score + (
        (quizMode === 'choice' && selectedOption === currentQ.correctAnswer) ||
        (quizMode === 'spelling' && spellingFeedback?.isCorrect) ? 1 : 0
      );
      setIsFinished(true);
      onRecordResult(finalScore, questions.length);

      if (finalScore >= 7) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }
  };

  if (!currentQ && !isFinished) {
    return (
      <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p>Đang tải dữ liệu câu hỏi...</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Top Selector Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        {/* Mode Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`nav-item ${quizMode === 'choice' ? 'active' : ''}`}
            onClick={() => setQuizMode('choice')}
            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
          >
            <Sparkles size={16} />
            <span>Trắc nghiệm 4 lựa chọn</span>
          </button>
          <button 
            className={`nav-item ${quizMode === 'spelling' ? 'active' : ''}`}
            onClick={() => setQuizMode('spelling')}
            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
          >
            <Keyboard size={16} />
            <span>Thử thách gõ từ (Spelling)</span>
          </button>
        </div>

        {/* Scope filter (50 Units, Themes, Tiers) */}
        <select 
          value={selectedScope} 
          onChange={(e) => setSelectedScope(e.target.value)}
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1.5px solid var(--border-subtle)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            fontSize: '0.88rem',
            fontWeight: '600',
            cursor: 'pointer',
            maxWidth: '300px'
          }}
        >
          <option value="all">Toàn bộ 600 từ vựng TOEIC</option>
          
          <optgroup label="50 Chủ điểm TOEIC (12 từ/Unit)">
            {(UNITS || []).map(u => (
              <option key={`unit_${u.id}`} value={`unit_${u.id}`}>
                Unit {u.id}: {u.name || u.title} ({u.nameVi || u.titleVi})
              </option>
            ))}
          </optgroup>

          <optgroup label="10 Chủ đề lớn (60 từ/Theme)">
            {(THEMES || []).map(t => (
              <option key={`theme_${t.id}`} value={`theme_${t.id}`}>
                {t.name || t.title} ({t.nameVi || t.titleVi})
              </option>
            ))}
          </optgroup>

          <optgroup label="Tầng độ khó & Bẫy đề thi">
            {(TIERS || []).map(t => (
              <option key={`tier_${t.id}`} value={t.id}>{t.name}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* QUIZ IN PROGRESS */}
      {!isFinished && (
        <div className="glass-card" style={{ padding: '32px 28px' }}>
          {/* Question Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                Câu hỏi {currentIndex + 1} / {questions.length}
              </span>
              {currentQ.wordData.unitId && (
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', color: 'var(--accent-primary)', border: '1px solid var(--border-subtle)' }}>
                  Unit {currentQ.wordData.unitId} • {currentQ.wordData.topic}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
              Điểm: {score} câu đúng
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '28px' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${((currentIndex + 1) / questions.length) * 100}%`, 
                background: 'var(--grad-primary)', 
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.3s'
              }} 
            />
          </div>

          {/* MODE 1: MULTIPLE CHOICE */}
          {quizMode === 'choice' && (
            <div>
              {/* Question Text */}
              <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                {currentQ.questionText}
              </div>

              {/* Options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '24px' }}>
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQ.correctAnswer;

                  let btnBg = 'var(--bg-secondary)';
                  let btnBorder = 'var(--border-subtle)';
                  let btnColor = 'var(--text-primary)';

                  if (isAnswered) {
                    if (isCorrect) {
                      btnBg = 'rgba(16, 185, 129, 0.2)';
                      btnBorder = 'rgba(16, 185, 129, 0.5)';
                      btnColor = '#34d399';
                    } else if (isSelected) {
                      btnBg = 'rgba(239, 68, 68, 0.2)';
                      btnBorder = 'rgba(239, 68, 68, 0.5)';
                      btnColor = '#f87171';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt)}
                      disabled={isAnswered}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-md)',
                        background: btnBg,
                        border: `1.5px solid ${btnBorder}`,
                        color: btnColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: isAnswered ? 'default' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrect && <CheckCircle2 size={20} color="#10b981" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle size={20} color="#ef4444" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 2: SPELLING & RECALL */}
          {quizMode === 'spelling' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <button 
                  className="icon-btn"
                  style={{ width: '56px', height: '56px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', borderColor: 'rgba(99, 102, 241, 0.4)', margin: '0 auto 16px' }}
                  onClick={() => audioService.speak(currentQ.wordData.word)}
                  title="Nghe lại phát âm"
                >
                  <Volume2 size={26} />
                </button>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                  Bấm loa để nghe phát âm và nhìn nghĩa bên dưới để gõ lại từ:
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981', marginBottom: '6px' }}>
                  "{currentQ.wordData.meaning}"
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Loại từ: <strong>{currentQ.wordData.pos || currentQ.wordData.type}</strong> • Phiên âm: {currentQ.wordData.ipa}
                </div>
              </div>

              <form onSubmit={handleSpellingSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '500px', margin: '0 auto 24px' }}>
                <input 
                  type="text"
                  placeholder="Gõ từ tiếng Anh vào đây..."
                  value={spellingInput}
                  onChange={(e) => setSpellingInput(e.target.value)}
                  disabled={isAnswered}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: `2px solid ${isAnswered ? (spellingFeedback?.isCorrect ? '#10b981' : '#ef4444') : 'var(--border-card)'}`,
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem',
                    outline: 'none',
                    fontWeight: '600'
                  }}
                />
                {!isAnswered && (
                  <button type="submit" className="btn-primary" style={{ padding: '0 24px' }}>
                    Kiểm tra
                  </button>
                )}
              </form>

              {/* Spelling Result Feedback */}
              {isAnswered && spellingFeedback && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-md)', 
                  background: spellingFeedback.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${spellingFeedback.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  maxWidth: '500px',
                  margin: '0 auto 20px'
                }}>
                  {spellingFeedback.isCorrect ? (
                    <div style={{ color: '#34d399', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <CheckCircle2 size={20} />
                      <span>Chính xác tuyệt đối!</span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ color: '#f87171', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <XCircle size={20} />
                        <span>Chưa chính xác!</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Từ đúng là: <strong style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{spellingFeedback.expected}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Explanation Box (when answered) */}
          {isAnswered && (
            <div style={{ background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-primary)', marginBottom: '24px' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--accent-primary)', marginBottom: '4px' }}>
                💡 Giải thích & Ngữ cảnh TOEIC:
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={handleNext}>
                <span>{currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* QUIZ FINISHED RESULTS SCREEN */}
      {isFinished && (
        <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: 'var(--radius-full)', 
            background: 'rgba(245, 158, 11, 0.15)', 
            color: '#f59e0b', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px',
            border: '2px solid rgba(245, 158, 11, 0.3)'
          }}>
            <Trophy size={40} />
          </div>

          <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Hoàn thành bài kiểm tra!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '24px' }}>
            Kết quả của bạn: <strong style={{ color: score >= 7 ? 'var(--success)' : 'var(--warning)', fontSize: '1.4rem' }}>{score} / {questions.length}</strong> câu đúng
          </p>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 32px' }}>
            {score >= 8 
              ? 'Xuất sắc! Bạn có phản xạ ghi nhớ từ vựng và mặt chữ rất tốt.' 
              : 'Hãy tiếp tục rèn luyện! Những từ bạn trả lời sai đã được tự động thêm vào danh sách cần ôn lại.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => startQuiz()}>
              <RotateCcw size={18} />
              <span>Luyện lại bài này</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
