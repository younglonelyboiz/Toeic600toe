// TOEIC Vocabulary Mastery - Complete Curated Dataset
// 600 Essential Words for the TOEIC (50 Units across 10 Themes) + Tier 0 (Grammar Traps)

import { THEMES, UNITS, getUnitsByTheme, getUnitById, getThemeById } from './topics.js';
import { TIER_0_WORDS } from './units/tier0_traps.js';
import { THEME_01_WORDS } from './units/theme01_business.js';
import { THEME_02_WORDS } from './units/theme02_office.js';
import { THEME_03_WORDS } from './units/theme03_personnel.js';
import { THEME_04_WORDS } from './units/theme04_purchasing.js';
import { THEME_05_WORDS } from './units/theme05_finances.js';
import { THEME_06_WORDS } from './units/theme06_management.js';
import { THEME_07_WORDS } from './units/theme07_restaurants.js';
import { THEME_08_WORDS } from './units/theme08_travel.js';
import { THEME_09_WORDS } from './units/theme09_entertainment.js';
import { THEME_10_WORDS } from './units/theme10_health.js';

export { THEMES, UNITS, getUnitsByTheme, getUnitById, getThemeById };

export const TIERS = [
  {
    id: 0,
    name: "Tier 0: Bẫy Liên từ & Giới từ",
    badge: "Đặc trị Part 5",
    desc: "Cặp bài trùng Mệnh đề (S + V) vs Cụm danh từ / V-ing, liên từ tương quan & trạng từ liên kết.",
    color: "#ec4899",
    icon: "ShieldAlert"
  },
  {
    id: 1,
    name: "Tier 1: Cốt lõi Nền tảng",
    badge: "Từ thông dụng nhất",
    desc: "Từ vựng căn bản, tần suất xuất hiện cao nhất trong mọi đề thi TOEIC và giao tiếp công sở.",
    color: "#6366f1",
    icon: "Zap"
  },
  {
    id: 2,
    name: "Tier 2: Văn phòng & Vận hành",
    badge: "Hợp đồng & Nhân sự",
    desc: "Từ vựng quy trình làm việc, hợp đồng, lịch trình, thiết bị và trao đổi nội bộ.",
    color: "#06b6d4",
    icon: "Briefcase"
  },
  {
    id: 3,
    name: "Tier 3: Kinh doanh & Thương mại",
    badge: "Tài chính & Tiếp thị",
    desc: "Từ vựng doanh thu, đàm phán giá, chiến dịch quảng bá, khách hàng và logistics.",
    color: "#10b981",
    icon: "TrendingUp"
  },
  {
    id: 4,
    name: "Tier 4: Chuyên sâu & Nâng cao",
    badge: "Mục tiêu 800+ TOEIC",
    desc: "Từ vựng quản trị cao cấp, pháp lý, kỹ thuật, thông số và các bẫy khó Part 7.",
    color: "#f59e0b",
    icon: "Award"
  }
];

// Combine Tier 0 Traps + 600 Essential Words
export const VOCABULARY_DATA = [
  ...TIER_0_WORDS,
  ...THEME_01_WORDS,
  ...THEME_02_WORDS,
  ...THEME_03_WORDS,
  ...THEME_04_WORDS,
  ...THEME_05_WORDS,
  ...THEME_06_WORDS,
  ...THEME_07_WORDS,
  ...THEME_08_WORDS,
  ...THEME_09_WORDS,
  ...THEME_10_WORDS
];

export function getAllWords() {
  return VOCABULARY_DATA;
}

export function get600WordsOnly() {
  return VOCABULARY_DATA.filter(w => w.unitId !== undefined);
}

export function getWordsByTier(tierId) {
  if (tierId === 'all') return VOCABULARY_DATA;
  return VOCABULARY_DATA.filter(w => w.tier === Number(tierId));
}

export function getWordsByUnit(unitId) {
  const uId = Number(unitId);
  return VOCABULARY_DATA.filter(w => w.unitId === uId);
}

export function getWordsByTheme(themeId) {
  return VOCABULARY_DATA.filter(w => w.themeId === themeId);
}

export function getTierInfo(tierId) {
  return TIERS.find(t => t.id === Number(tierId));
}

export function searchWords(query) {
  if (!query || !query.trim()) return VOCABULARY_DATA;
  const q = query.toLowerCase().trim();
  return VOCABULARY_DATA.filter(w => 
    w.word.toLowerCase().includes(q) ||
    w.meaning.toLowerCase().includes(q) ||
    (w.synonyms && w.synonyms.some(s => s.toLowerCase().includes(q))) ||
    (w.topic && w.topic.toLowerCase().includes(q)) ||
    (w.example && w.example.toLowerCase().includes(q))
  );
}

// Generate realistic Quiz questions (supporting tier, unit, theme, or all)
export function generateQuizQuestions(scope = 'all', count = 10) {
  let words = [];

  if (typeof scope === 'string' && scope.startsWith('unit_')) {
    const unitId = Number(scope.replace('unit_', ''));
    words = getWordsByUnit(unitId);
  } else if (typeof scope === 'string' && scope.startsWith('theme_')) {
    const themeId = scope.replace('theme_', '');
    words = getWordsByTheme(themeId);
  } else if (scope === 'all') {
    words = VOCABULARY_DATA;
  } else {
    // Treat as tier
    words = getWordsByTier(scope);
  }

  if (words.length === 0) words = VOCABULARY_DATA;

  // Shuffle target words
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, words.length));

  // Global pool for backup distractors
  const allWordPool = VOCABULARY_DATA.filter(w => w.meaning && !w.word.includes('/'));

  return selected.map((item, index) => {
    const isFillBlank = Math.random() > 0.5 && item.example && !item.word.includes('/');
    
    // Pick distractors preferably from the same pool or global pool
    const otherCandidates = words.length >= 4 
      ? words.filter(w => w.id !== item.id)
      : allWordPool.filter(w => w.id !== item.id);

    const shuffledOthers = [...otherCandidates].sort(() => 0.5 - Math.random()).slice(0, 3);

    let questionText = "";
    let correctAnswer = "";
    let options = [];

    if (isFillBlank) {
      const regex = new RegExp(`\\b${item.word}\\b`, 'gi');
      questionText = item.example.replace(regex, '[ ______ ]');
      if (questionText === item.example) {
        questionText = `Từ "${item.word}" (${item.pos || ''}) có nghĩa là gì?`;
        correctAnswer = item.meaning;
        options = [item.meaning, ...shuffledOthers.map(o => o.meaning)];
      } else {
        correctAnswer = item.word;
        options = [item.word, ...shuffledOthers.map(o => o.word)];
      }
    } else {
      questionText = `Từ "${item.word}" (${item.pos || item.type || ''}) có nghĩa là gì?`;
      correctAnswer = item.meaning;
      options = [item.meaning, ...shuffledOthers.map(o => o.meaning)];
    }

    options = [...new Set(options)].sort(() => 0.5 - Math.random());

    return {
      index: index + 1,
      wordData: item,
      questionText,
      correctAnswer,
      options,
      explanation: item.tip || `${item.word}: ${item.meaning}. Ví dụ: ${item.example || ''}`
    };
  });
}
