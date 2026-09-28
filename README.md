# 🎓 TOEIC Vocab Mastery — 600 Essential Words & Synonyms

Ứng dụng web học 600 từ vựng TOEIC căn bản và từ đồng nghĩa chuyên sâu, tích hợp hệ thống Flashcard lật thẻ, Luyện phản xạ (Quiz), Từ điển tra cứu nhanh và đồng bộ đám mây với Supabase.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

- **Frontend:** React 19, Vite
- **Styling:** Modern CSS (Glassmorphism, Dark/Light theme, Micro-animations)
- **Icons & Effects:** Lucide React, Canvas-Confetti
- **Backend & Database:** [Supabase](https://supabase.com) (Authentication, PostgreSQL, Row Level Security - RLS)
- **Audio:** Web Speech API (Phát âm chuẩn Anh - Mỹ `en-US` và Anh - Anh `en-GB`)

---

## 📋 Yêu cầu hệ thống (Prerequisites)

- **Node.js:** Phiên bản 18.0.0 trở lên
- **NPM** hoặc **Yarn** / **PNPM**
- Một tài khoản miễn phí trên [Supabase](https://supabase.com) để lưu trữ tiến độ học tập

---

## 🛠️ Hướng dẫn cài đặt & Chạy Local (Getting Started)

### Bước 1: Mở thư mục dự án
Mở terminal và di chuyển vào thư mục `600toeic`:
```bash
cd 600toeic
```

### Bước 2: Cài đặt các thư viện phụ thuộc
Chạy lệnh sau để tải các gói dependencies:
```bash
npm install
```

### Bước 3: Cấu hình biến môi trường (`.env`)
1. Tạo file `.env` tại thư mục gốc của dự án (hoặc sao chép từ `.env.example`):
   ```bash
   cp .env.example .env
   ```
2. Điền thông tin kết nối Supabase của bạn vào file `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_your_key_here
   ```
   > **Cách lấy thông số trên Supabase Dashboard:**
   > - Vào **Project Settings** ➔ **API** (hoặc **API Keys**).
   > - Copy `Project URL` ➔ Dán vào `VITE_SUPABASE_URL`.
   > - Copy `Publishable Key` (hoặc `anon public key`) ➔ Dán vào `VITE_SUPABASE_ANON_KEY`.

### Bước 4: Khởi tạo bảng dữ liệu trên Supabase
1. Mở [Supabase Dashboard](https://supabase.com/dashboard) và chọn dự án của bạn.
2. Bấm vào mục **SQL Editor** ở thanh menu bên trái.
3. Mở file `supabase_schema.sql` trong dự án, copy toàn bộ nội dung và dán vào SQL Editor.
4. Bấm **Run** (Ctrl + Enter) để tạo 4 bảng (`profiles`, `user_word_progress`, `user_favorites`, `user_stats`) và cấu hình bảo mật RLS.
5. *(Khuyên dùng)* Vào **Authentication** ➔ **Providers** ➔ **Email** ➔ Tắt **Confirm email** để có thể đăng ký và đăng nhập được ngay mà không cần chờ email kích hoạt.

### Bước 5: Khởi chạy môi trường phát triển (Dev Server)
Khởi động ứng dụng bằng lệnh:
```bash
npm run dev
```

Sau khi chạy lệnh, mở trình duyệt và truy cập:
👉 **`http://localhost:5173`**

---

## 📂 Cấu trúc thư mục (Project Structure)

```text
600toeic/
├── index.html              # Trang HTML gốc
├── package.json            # Quản lý dependencies & scripts
├── vite.config.js          # Cấu hình Vite
├── supabase_schema.sql     # Script SQL khởi tạo Database trên Supabase
├── public/                 # Static assets, Web App Manifest
├── src/
│   ├── main.jsx            # Entry point ứng dụng React
│   ├── App.jsx             # Layout chính, định tuyến Tab & State tổng
│   ├── index.css           # Toàn bộ Design System, Theme Tokens & Styling
│   ├── components/         # Các thành phần giao diện
│   │   ├── Navbar.jsx          # Thanh điều hướng, Streak & Avatar người dùng
│   │   ├── BottomNav.jsx       # Menu điều hướng trên thiết bị di động
│   │   ├── DashboardView.jsx   # Màn hình Tổng quan, thống kê tiến độ
│   │   ├── StudyDeckView.jsx   # Học từ vựng qua Flashcard lật thẻ
│   │   ├── QuizView.jsx        # Chế độ luyện phản xạ & làm bài trắc nghiệm
│   │   ├── ExplorerView.jsx    # Từ điển tra cứu, lọc từ và quản lý yêu thích
│   │   ├── AuthModal.jsx       # Cửa sổ Đăng nhập & Đăng ký tài khoản
│   │   ├── UserProfileModal.jsx# Cài đặt mục tiêu TOEIC, giọng đọc & Profile
│   │   └── MigrationModal.jsx  # Hỗ trợ đồng bộ tiến độ học từ máy khách lên Cloud
│   ├── data/               # Dữ liệu từ vựng TOEIC
│   │   ├── topics.js           # 10 chủ đề lớn trong TOEIC
│   │   ├── vocabData.js        # Tổng hợp 600 từ vựng chi tiết
│   │   └── units/              # Dữ liệu từ vựng theo từng chủ đề
│   └── services/           # Tầng tích hợp dịch vụ
│       ├── supabaseClient.js   # Kết nối Supabase Client
│       ├── authService.js      # Xử lý Đăng nhập, Đăng ký, Quản lý Profile
│       ├── storageService.js   # Cơ chế lưu trữ Hybrid (LocalStorage + Cloud)
│       └── audioService.js     # Phát âm phát hiện đa giọng chuẩn
└── .env                    # Biến môi trường kết nối Supabase (Không commit)
```

---

## 📜 Các lệnh hữu ích (Available Scripts)

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run dev` | Khởi chạy server phát triển local với tính năng Hot Reload (HMR) |
| `npm run build` | Đóng gói và tối ưu mã nguồn cho môi trường Production (thư mục `dist/`) |
| `npm run preview` | Chạy thử bản build production ngay trên máy local |
