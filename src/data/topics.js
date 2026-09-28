// TOEIC 600 Essential Words - 50 Units Categorized into 10 Core Themes
// Based on Dr. Lin Lougheed's Barron's 600 Essential Words for the TOEIC

export const THEMES = [
  {
    id: "general_business",
    number: 1,
    title: "General Business",
    titleVi: "Kinh doanh Tổng quát & Hợp đồng",
    desc: "Hợp đồng, tiếp thị, bảo hành, kế hoạch kinh doanh và hội nghị doanh nghiệp.",
    color: "#6366f1",
    unitRange: [1, 5]
  },
  {
    id: "office_technology",
    number: 2,
    title: "Office Issues & Tech",
    titleVi: "Văn phòng & Công nghệ",
    desc: "Máy tính, thiết bị điện tử, văn phòng phẩm và quy trình công sở.",
    color: "#06b6d4",
    unitRange: [6, 10]
  },
  {
    id: "personnel",
    number: 3,
    title: "Personnel & Career",
    titleVi: "Nhân sự & Tuyển dụng",
    desc: "Đăng tuyển, phỏng vấn, tuyển dụng, lương thưởng và thăng tiến công tác.",
    color: "#8b5cf6",
    unitRange: [11, 15]
  },
  {
    id: "purchasing",
    number: 4,
    title: "Purchasing & Logistics",
    titleVi: "Mua sắm & Hậu cần",
    desc: "Mua sắm, đặt hàng vật phẩm, giao hàng, hóa đơn và kiểm kê kho bãi.",
    color: "#10b981",
    unitRange: [16, 20]
  },
  {
    id: "finances",
    number: 5,
    title: "Finances & Banking",
    titleVi: "Tài chính & Ngân hàng",
    desc: "Giao dịch ngân hàng, sổ sách kế toán, danh mục đầu tư, thuế và báo cáo tài chính.",
    color: "#f59e0b",
    unitRange: [21, 25]
  },
  {
    id: "management",
    number: 6,
    title: "Corporate Management",
    titleVi: "Quản trị & Điều hành",
    desc: "Tài sản, phòng ban, họp hội đồng quản trị, kiểm soát chất lượng và thuê mặt bằng.",
    color: "#ec4899",
    unitRange: [26, 30]
  },
  {
    id: "restaurants_events",
    number: 7,
    title: "Restaurants & Events",
    titleVi: "Nhà hàng & Sự kiện",
    desc: "Chọn địa điểm ẩm thực, đặt tiệc chiêu đãi, nghề đầu bếp và tổ chức sự kiện.",
    color: "#f97316",
    unitRange: [31, 35]
  },
  {
    id: "travel",
    number: 8,
    title: "Travel & Transport",
    titleVi: "Du lịch & Vận chuyển",
    desc: "Hàng không, chuyến bay, tàu hỏa, đặt phòng khách sạn và dịch vụ thuê xe.",
    color: "#14b8a6",
    unitRange: [36, 40]
  },
  {
    id: "entertainment",
    number: 9,
    title: "Entertainment & Media",
    titleVi: "Giải trí & Truyền thông",
    desc: "Điện ảnh, nhà hát, âm nhạc, bảo tàng triển lãm và báo chí truyền thông đại chúng.",
    color: "#a855f7",
    unitRange: [41, 45]
  },
  {
    id: "health",
    number: 10,
    title: "Health & Medical",
    titleVi: "Y tế & Sức khỏe",
    desc: "Phòng khám bác sĩ, nha khoa, bảo hiểm y tế, bệnh viện và nhà thuốc.",
    color: "#ef4444",
    unitRange: [46, 50]
  }
];

export const UNITS = [
  // THEME 1: General Business (1-5)
  { id: 1, unitNumber: 1, themeId: "general_business", title: "Contracts", titleVi: "Hợp đồng & Khế ước", icon: "FileText", tier: 2 },
  { id: 2, unitNumber: 2, themeId: "general_business", title: "Marketing", titleVi: "Tiếp thị & Khách hàng", icon: "TrendingUp", tier: 3 },
  { id: 3, unitNumber: 3, themeId: "general_business", title: "Warranties", titleVi: "Bảo hành & Cam kết", icon: "ShieldCheck", tier: 2 },
  { id: 4, unitNumber: 4, themeId: "general_business", title: "Business Planning", titleVi: "Kế hoạch Kinh doanh", icon: "Compass", tier: 3 },
  { id: 5, unitNumber: 5, themeId: "general_business", title: "Conferences", titleVi: "Hội nghị & Cuộc gặp", icon: "Users", tier: 2 },

  // THEME 2: Office Issues & Technology (6-10)
  { id: 6, unitNumber: 6, themeId: "office_technology", title: "Computers", titleVi: "Máy tính & Hệ thống", icon: "Monitor", tier: 1 },
  { id: 7, unitNumber: 7, themeId: "office_technology", title: "Office Technology", titleVi: "Kỹ thuật Văn phòng", icon: "Cpu", tier: 2 },
  { id: 8, unitNumber: 8, themeId: "office_technology", title: "Office Procedures", titleVi: "Quy trình Công sở", icon: "CheckSquare", tier: 2 },
  { id: 9, unitNumber: 9, themeId: "office_technology", title: "Electronics", titleVi: "Thiết bị Điện tử", icon: "Zap", tier: 2 },
  { id: 10, unitNumber: 10, themeId: "office_technology", title: "Correspondence", titleVi: "Thư từ & Trao đổi", icon: "Mail", tier: 1 },

  // THEME 3: Personnel & Career (11-15)
  { id: 11, unitNumber: 11, themeId: "personnel", title: "Job Advertising & Recruiting", titleVi: "Đăng tuyển & Tuyển dụng", icon: "Megaphone", tier: 2 },
  { id: 12, unitNumber: 12, themeId: "personnel", title: "Applying & Interviewing", titleVi: "Nộp đơn & Phỏng vấn", icon: "UserCheck", tier: 1 },
  { id: 13, unitNumber: 13, themeId: "personnel", title: "Hiring & Training", titleVi: "Thuê người & Huấn luyện", icon: "GraduationCap", tier: 2 },
  { id: 14, unitNumber: 14, themeId: "personnel", title: "Salaries & Benefits", titleVi: "Lương bổng & Đãi ngộ", icon: "DollarSign", tier: 2 },
  { id: 15, unitNumber: 15, themeId: "personnel", title: "Promotions, Pensions & Awards", titleVi: "Thăng tiến & Khen thưởng", icon: "Award", tier: 3 },

  // THEME 4: Purchasing & Logistics (16-20)
  { id: 16, unitNumber: 16, themeId: "purchasing", title: "Shopping", titleVi: "Mua sắm & Tiêu dùng", icon: "ShoppingBag", tier: 1 },
  { id: 17, unitNumber: 17, themeId: "purchasing", title: "Ordering Supplies", titleVi: "Đặt hàng Văn phòng phẩm", icon: "ClipboardList", tier: 2 },
  { id: 18, unitNumber: 18, themeId: "purchasing", title: "Shipping", titleVi: "Vận chuyển & Giao nhận", icon: "Truck", tier: 2 },
  { id: 19, unitNumber: 19, themeId: "purchasing", title: "Invoices", titleVi: "Hóa đơn & Biên lai", icon: "Receipt", tier: 3 },
  { id: 20, unitNumber: 20, themeId: "purchasing", title: "Inventory", titleVi: "Kiểm kê & Hàng tồn kho", icon: "Boxes", tier: 3 },

  // THEME 5: Finances & Banking (21-25)
  { id: 21, unitNumber: 21, themeId: "finances", title: "Banking", titleVi: "Ngân hàng & Giao dịch", icon: "Landmark", tier: 2 },
  { id: 22, unitNumber: 22, themeId: "finances", title: "Accounting", titleVi: "Kế toán & Sổ sách", icon: "Calculator", tier: 3 },
  { id: 23, unitNumber: 23, themeId: "finances", title: "Investments", titleVi: "Đầu tư & Cổ phiếu", icon: "TrendingUp", tier: 3 },
  { id: 24, unitNumber: 24, themeId: "finances", title: "Taxes", titleVi: "Thuế & Nghĩa vụ tài chính", icon: "Percent", tier: 3 },
  { id: 25, unitNumber: 25, themeId: "finances", title: "Financial Statements", titleVi: "Báo cáo Tài chính", icon: "BarChart3", tier: 4 },

  // THEME 6: Corporate Management (26-30)
  { id: 26, unitNumber: 26, themeId: "management", title: "Property & Department", titleVi: "Tài sản & Phòng ban", icon: "Building2", tier: 3 },
  { id: 27, unitNumber: 27, themeId: "management", title: "Board Meetings & Committees", titleVi: "Họp HĐQT & Ban điều hành", icon: "Briefcase", tier: 4 },
  { id: 28, unitNumber: 28, themeId: "management", title: "Quality Control", titleVi: "Kiểm soát Chất lượng", icon: "ShieldAlert", tier: 3 },
  { id: 29, unitNumber: 29, themeId: "management", title: "Product Development", titleVi: "Phát triển Sản phẩm", icon: "Lightbulb", tier: 3 },
  { id: 30, unitNumber: 30, themeId: "management", title: "Renting & Leasing", titleVi: "Thuê & Cho thuê tài sản", icon: "Key", tier: 3 },

  // THEME 7: Restaurants & Events (31-35)
  { id: 31, unitNumber: 31, themeId: "restaurants_events", title: "Selecting a Restaurant", titleVi: "Chọn Nhà hàng", icon: "UtensilsCrossed", tier: 1 },
  { id: 32, unitNumber: 32, themeId: "restaurants_events", title: "Eating Out", titleVi: "Ăn uống Bên ngoài", icon: "Coffee", tier: 1 },
  { id: 33, unitNumber: 33, themeId: "restaurants_events", title: "Ordering Lunch", titleVi: "Đặt bữa trưa Công sở", icon: "Soup", tier: 1 },
  { id: 34, unitNumber: 34, themeId: "restaurants_events", title: "Cooking as a Career", titleVi: "Nghề Ẩm thực & Bếp", icon: "Flame", tier: 2 },
  { id: 35, unitNumber: 35, themeId: "restaurants_events", title: "Events", titleVi: "Tổ chức Sự kiện", icon: "CalendarCheck", tier: 2 },

  // THEME 8: Travel & Transportation (36-40)
  { id: 36, unitNumber: 36, themeId: "travel", title: "General Travel", titleVi: "Du lịch & Công tác", icon: "Globe", tier: 1 },
  { id: 37, unitNumber: 37, themeId: "travel", title: "Airlines", titleVi: "Hàng không & Chuyến bay", icon: "Plane", tier: 2 },
  { id: 38, unitNumber: 38, themeId: "travel", title: "Trains", titleVi: "Tàu hỏa & Đường sắt", icon: "Train", tier: 2 },
  { id: 39, unitNumber: 39, themeId: "travel", title: "Hotels", titleVi: "Khách sạn & Lưu trú", icon: "Bed", tier: 2 },
  { id: 40, unitNumber: 40, themeId: "travel", title: "Car Rentals", titleVi: "Thuê xe Tự lái", icon: "Car", tier: 2 },

  // THEME 9: Entertainment & Media (41-45)
  { id: 41, unitNumber: 41, themeId: "entertainment", title: "Movies", titleVi: "Điện ảnh & Phim ảnh", icon: "Film", tier: 1 },
  { id: 42, unitNumber: 42, themeId: "entertainment", title: "Theater", titleVi: "Kịch nghệ & Sân khấu", icon: "Drama", tier: 2 },
  { id: 43, unitNumber: 43, themeId: "entertainment", title: "Music", titleVi: "Âm nhạc & Buổi biểu diễn", icon: "Music", tier: 1 },
  { id: 44, unitNumber: 44, themeId: "entertainment", title: "Museums", titleVi: "Bảo tàng & Triển lãm", icon: "Landmark", tier: 2 },
  { id: 45, unitNumber: 45, themeId: "entertainment", title: "Media", titleVi: "Truyền thông & Báo chí", icon: "Radio", tier: 3 },

  // THEME 10: Health & Medical (46-50)
  { id: 46, unitNumber: 46, themeId: "health", title: "Doctor's Office", titleVi: "Phòng khám Bác sĩ", icon: "Stethoscope", tier: 2 },
  { id: 47, unitNumber: 47, themeId: "health", title: "Dentist's Office", titleVi: "Phòng khám Nha sĩ", icon: "Smile", tier: 2 },
  { id: 48, unitNumber: 48, themeId: "health", title: "Health Insurance", titleVi: "Bảo hiểm Y tế", icon: "Shield", tier: 3 },
  { id: 49, unitNumber: 49, themeId: "health", title: "Hospitals", name: "Hospitals", titleVi: "Bệnh viện & Điều trị", nameVi: "Bệnh viện & Điều trị", icon: "Hospital", tier: 2 },
  { id: 50, unitNumber: 50, themeId: "health", title: "Pharmacy", name: "Pharmacy", titleVi: "Nhà thuốc & Dược phẩm", nameVi: "Nhà thuốc & Dược phẩm", icon: "Pill", tier: 2 }
];

// Ensure all units have both name and title aliases
UNITS.forEach(u => {
  if (!u.name) u.name = u.title;
  if (!u.title) u.title = u.name;
  if (!u.nameVi) u.nameVi = u.titleVi;
  if (!u.titleVi) u.titleVi = u.nameVi;
});

// Ensure all themes have both name and title aliases, plus units array
THEMES.forEach(t => {
  if (!t.name) t.name = t.title;
  if (!t.title) t.title = t.name;
  if (!t.nameVi) t.nameVi = t.titleVi;
  if (!t.titleVi) t.titleVi = t.nameVi;
  t.units = UNITS.filter(u => u.themeId === t.id);
});

export function getUnitsByTheme(themeId) {
  return UNITS.filter(u => u.themeId === themeId);
}

export function getUnitById(unitId) {
  return UNITS.find(u => u.id === Number(unitId));
}

export function getThemeById(themeId) {
  return THEMES.find(t => t.id === themeId);
}

