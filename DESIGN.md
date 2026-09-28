# TOEIC Vocabulary Mastery Web App - Design Specification (Updated)

Tài liệu thiết kế kiến trúc và đặc tả kỹ thuật ứng dụng tự học 600 từ vựng TOEIC thông dụng chuẩn theo 50 chủ điểm kinh điển (Barron's 600 Essential Words for the TOEIC), kết hợp chuyên đề đặc trị bẫy liên từ - giới từ Part 5.

---

## 1. Tóm tắt Hiểu biết & Bối cảnh (Understanding Summary)

* **Bối cảnh & Vấn đề:** Ở phiên bản trước, bộ dữ liệu từ vựng mới chỉ có 88 từ, bị thiếu hụt phần lớn nội dung so với mục tiêu 600 từ cốt lõi. Người học cần toàn bộ 600 từ vựng thuộc đúng 50 chủ điểm chuẩn của đề thi TOEIC.
* **Nguồn dữ liệu:** Bộ 50 chủ điểm và 600 từ được biên soạn chuẩn theo cuốn giáo trình kinh điển **"600 Essential Words for the TOEIC"** của **Dr. Lin Lougheed** (Barron's Educational Series), gồm đúng 50 Units, mỗi Unit có 12 từ vựng trọng tâm ($50 \times 12 = 600$ từ).
* **Mục tiêu sản phẩm:** Cung cấp giải pháp học từ vựng toàn diện: Flashcard lật thẻ tương tác kèm phát âm Audio US, Quiz trắc nghiệm phản xạ, Thử thách gõ chính tả (Spelling), và Tra cứu từ điển thông minh.
* **Đối tượng:** Học viên ôn luyện thi TOEIC mọi cấp độ (từ nền tảng 450+ đến 800+).
* **Mục tiêu ngoài phạm vi (Explicit Non-goals):**
  - Không xây dựng backend server / database server từ xa (giữ ứng dụng chạy client-side 100%, offline-friendly, tải nhanh tức thì).
  - Không phá vỡ dữ liệu tiến độ trong `localStorage` mà người dùng đã lưu từ trước.

---

## 2. Các giả định đề xuất (Assumptions)

1. **Hiệu năng Client-side:** Bộ dữ liệu 600 từ kèm ví dụ và mẹo thi (~600-800KB text/JSON) được nạp trực tiếp trong bundle, tìm kiếm và lọc dữ liệu đạt tốc độ < 16ms (60 FPS).
2. **Âm thanh & Phát âm (TTS):** Tận dụng `Web Speech Synthesis API` (giọng US chuẩn), tự động phát âm khi lật thẻ hoặc gõ từ.
3. **Lưu trữ & Bảo toàn dữ liệu:** Tiến độ (`masteredWords`, `reviewWords`, `favorites`, `streak`, `quizStats`) được lưu bền vững trong `localStorage`, có tính năng sao lưu (Export) và khôi phục (Import) bằng file JSON.

---

## 3. Nhật ký quyết định (Decision Log)

| STT | Quyết định | Các phương án đã cân nhắc | Lý do lựa chọn |
| :---: | :--- | :--- | :--- |
| **1** | **Cấu trúc dữ liệu 600 từ** | - Monolithic (dồn tất cả vào 1 file dài > 8.000 dòng)<br>- Tách 50 file JSON tải động qua fetch()<br>- **Modular: `topics.js` (50 units) + `vocabData.js` (600 từ)** | Giúp code sáng sủa, dễ bảo trì, vừa tải tức thì offline, vừa hỗ trợ tìm kiếm toàn cục và sinh đề thi không bị gián đoạn. |
| **2** | **Chế độ điều hướng học tập** | - Chỉ học theo 50 Units<br>- Chỉ phân loại theo Tiers độ khó<br>- **Hỗ trợ song song: 50 Units VÀ Cấp độ Tiers** | Đáp ứng cả 2 nhu cầu: người muốn cày tuần tự từ Unit 1 đến 50 theo sách, và người muốn rà soát nhanh theo bẫy Part 5 hoặc cấp độ. |
| **3** | **Chi tiết thẻ từ vựng** | - Thẻ rút gọn (chỉ từ + nghĩa)<br>- Thẻ mở rộng Word Families<br>- **Thẻ chuẩn bài bản: IPA + Từ loại + Nghĩa + Ví dụ có dịch + Từ đồng nghĩa + Tips** | Đầy đủ ngữ cảnh thực tế của đề thi ETS mà không làm thẻ bị quá tải thông tin. |
| **4** | **Sinh đề thi trắc nghiệm theo Unit** | - Lấy phương án nhiễu ngẫu nhiên từ bất kỳ từ nào<br>- **Ưu tiên lấy phương án nhiễu từ các từ cùng Chuyên đề** | Tạo độ bẫy và sự tương đồng về ngữ cảnh kinh doanh, sát với độ khó thật của đề thi TOEIC. |

---

## 4. Đặc tả Danh mục 50 Chủ điểm (50 Units across 10 Themes)

Toàn bộ 50 Units được nhóm vào 10 Chuyên đề lớn:

1. **General Business (Kinh doanh chung):**
   - Unit 1: Contracts (Hợp đồng)
   - Unit 2: Marketing (Tiếp thị & Khách hàng)
   - Unit 3: Warranties (Bảo hành & Cam kết)
   - Unit 4: Business Planning (Kế hoạch kinh doanh)
   - Unit 5: Conferences (Hội nghị & Cuộc họp)
2. **Office Issues & Technology (Văn phòng & Kỹ thuật):**
   - Unit 6: Computers (Máy tính)
   - Unit 7: Office Technology (Công nghệ văn phòng)
   - Unit 8: Office Procedures (Quy trình công sở)
   - Unit 9: Electronics (Thiết bị điện tử)
   - Unit 10: Correspondence (Thư từ & Trao đổi)
3. **Personnel & Employment (Nhân sự & Tuyển dụng):**
   - Unit 11: Job Advertising & Recruiting (Đăng tuyển & Tuyển dụng)
   - Unit 12: Applying & Interviewing (Nộp đơn & Phỏng vấn)
   - Unit 13: Hiring & Training (Thuê nhân viên & Huấn luyện)
   - Unit 14: Salaries & Benefits (Lương thưởng & Chế độ)
   - Unit 15: Promotions, Pensions & Awards (Thăng tiến, Lương hưu & Khen thưởng)
4. **Purchasing & Logistics (Mua sắm & Hậu cần):**
   - Unit 16: Shopping (Mua sắm)
   - Unit 17: Ordering Supplies (Đặt vật phẩm & Thiết bị)
   - Unit 18: Shipping (Vận chuyển & Giao hàng)
   - Unit 19: Invoices (Hóa đơn & Thanh toán)
   - Unit 20: Inventory (Kiểm kê & Hàng tồn kho)
5. **Finances & Banking (Tài chính & Ngân hàng):**
   - Unit 21: Banking (Ngân hàng)
   - Unit 22: Accounting (Kế toán)
   - Unit 23: Investments (Đầu tư)
   - Unit 24: Taxes (Thuế)
   - Unit 25: Financial Statements (Báo cáo tài chính)
6. **Corporate Management (Quản trị & Điều hành):**
   - Unit 26: Property & Department (Tài sản & Phòng ban)
   - Unit 27: Board Meetings & Committees (Họp hội đồng quản trị & Ủy ban)
   - Unit 28: Quality Control (Kiểm soát chất lượng)
   - Unit 29: Product Development (Phát triển sản phẩm)
   - Unit 30: Renting & Leasing (Thuê & Cho thuê tài sản)
7. **Restaurants & Events (Nhà hàng & Ẩm thực):**
   - Unit 31: Selecting a Restaurant (Chọn nhà hàng)
   - Unit 32: Eating Out (Đi ăn ngoài)
   - Unit 33: Ordering Lunch (Đặt bữa trưa)
   - Unit 34: Cooking as a Career (Nghề đầu bếp)
   - Unit 35: Events (Sự kiện & Tiệc chiêu đãi)
8. **Travel & Transportation (Du lịch & Di chuyển):**
   - Unit 36: General Travel (Du lịch nói chung)
   - Unit 37: Airlines (Hàng không & Chuyến bay)
   - Unit 38: Trains (Tàu hỏa)
   - Unit 39: Hotels (Khách sạn & Đặt phòng)
   - Unit 40: Car Rentals (Thuê xe)
9. **Entertainment & Media (Giải trí & Truyền thông):**
   - Unit 41: Movies (Điện ảnh)
   - Unit 42: Theater (Kịch & Nhà hát)
   - Unit 43: Music (Âm nhạc)
   - Unit 44: Museums (Bảo tàng & Triển lãm)
   - Unit 45: Media (Truyền thông & Báo chí)
10. **Health & Medical Care (Sức khỏe & Y tế):**
    - Unit 46: Doctor's Office (Phòng khám bác sĩ)
    - Unit 47: Dentist's Office (Phòng khám nha sĩ)
    - Unit 48: Health Insurance (Bảo hiểm y tế)
    - Unit 49: Hospitals (Bệnh viện)
    - Unit 50: Pharmacy (Nhà thuốc & Dược phẩm)

*Đồng thời duy trì **Tier 0**: Bộ bẫy Liên từ & Giới từ Part 5.*

---

## 5. Cấu trúc Đối tượng Dữ liệu (Schema)

```typescript
interface WordItem {
  id: string;               // e.g. "u01_001", "u50_012", "t0_001"
  unitId?: number;          // 1 to 50
  tier: number;             // 0 (Traps), 1 (Core), 2 (Workplace), 3 (Commerce), 4 (Advanced)
  word: string;             // Từ vựng
  ipa: string;              // Phiên âm chuẩn US
  pos: string;              // Từ loại: 'v' | 'n' | 'adj' | 'adv' | 'conjunction' | 'preposition'
  meaning: string;          // Nghĩa tiếng Việt
  synonyms?: string[];      // Cụm từ đồng nghĩa / Paraphrase
  example: string;          // Ví dụ chuẩn đề thi TOEIC
  exampleVi: string;        // Bản dịch nghĩa ví dụ
  topic: string;            // Tên chủ điểm (e.g. "Contracts")
  tip?: string;             // Mẹo làm bài Part 5 hoặc Part 7
}
```

---

## 6. Kiến trúc Thành phần Giao diện & Luồng Dữ liệu

1. **`DashboardView`**:
   - Thêm tab chọn: **Lộ trình 50 Chủ điểm (Roadmap)** và **Phân loại Cấp độ (Tiers)**.
   - Thẻ hiển thị 10 Chuyên đề lớn, mở ra 5 Units với thanh tiến độ hoàn thành cụ thể (ví dụ: *8/12 từ đã thuộc*).
   - Nút hành động nhanh: Bắt đầu học Unit này.
2. **`StudyDeckView`**:
   - Header có bộ chọn Unit (Unit 1 $\rightarrow$ 50) hoặc chọn Tier.
   - Mỗi Unit chứa đúng 12 từ, hiển thị tiến độ dạng `Thẻ 1/12`.
   - Kết thúc 12 từ có modal chúc mừng và nút chuyển tiếp sang Unit kế tiếp hoặc làm Quiz ngay.
3. **`QuizView`**:
   - Bộ chọn phạm vi làm bài: Theo Unit cụ thể, Theo Chuyên đề lớn, hoặc Toàn bộ 600 từ.
   - 2 chế độ: Trắc nghiệm 4 đáp án & Gõ chính tả (Spelling).
4. **`ExplorerView`**:
   - Thanh tìm kiếm thời gian thực toàn bộ 600 từ.
   - Lọc theo Unit (1..50) hoặc theo Tier và Trạng thái học tập.

---

## 7. Tiêu chuẩn Kiểm thử & Nghiệm thu (Verification & Acceptance Criteria)

1. **Tính đầy đủ (Completeness):** Đúng 50 Units $\times$ 12 từ = 600 từ vựng cốt lõi TOEIC + Bộ bẫy ngữ pháp Tier 0.
2. **Tính toàn vẹn (Integrity):** Không có ID trùng lặp; 100% các từ có đầy đủ phiên âm, nghĩa tiếng Việt, câu ví dụ và dịch nghĩa.
3. **Trải nghiệm mượt mà:** Chuyển đổi giữa 50 Units trong StudyDeck, Quiz và Explorer không bị giật lag, giữ nguyên tiến độ `localStorage` cũ.
