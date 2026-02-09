Blueprint Pembangunan Sistem Penilaian Kaunter PERKESO Keningau
1. Objektif Teknikal
Membina Web App satu halaman (Single Page App) yang berfungsi sebagai borang penilaian pelanggan dan dashboard admin dengan analisis Gemini AI.

2. Arkitektur Data (Google Sheets)
Sila pastikan Google Sheets mempunyai header berikut di Sheet1:

timestamp: Tarikh/Masa

kaunter: No Kaunter (1/2)

tujuan: Jenis Urusan

skor_mesra: Skala 1-5

skor_pantas: Skala 1-5

skor_jelas: Skala 1-5

kategori_perbaikan: Checkbox data

ulasan: Teks bebas pelanggan

sentimen_ai: (Untuk diisi oleh Gemini kemudian)

3. Struktur Soalan (Standard 1Serve/PERKESO)
Identiti: Dropdown [Kaunter 1, Kaunter 2].

Urusan: Dropdown [Tuntutan Faedah, Caruman, Pendaftaran, Pertanyaan].

Metrik Utama (1-5 Bintang):

Kemesraan Staf (Empati).

Kepantasan Urusan (Responsiveness).

Kejelasan Penerangan (Assurance).

Isu Spesifik (Multi-select): [Waktu Menunggu, Fasiliti, Sikap Staf, Sistem Giliran].

Komen Bebas: Ruangan teks untuk pelanggan meluahkan maklum balas.

4. Aliran Integrasi (Logic Flow)
A. Pengumpulan Data (Customer Side)
Frontend (HTML/JS) -> Google Apps Script (POST) -> Google Sheets.

B. Dashboard Admin (Admin Side)
Authentication: Login mudah (Password-protected section).

Data Retrieval: Fetch data dari Google Sheets.

Gemini Integration: - Admin klik butang "Analisis Sentimen".

Script akan menghantar 10-20 ulasan terakhir ke Gemini API.

Prompt Gemini: "Analisis komen pelanggan PERKESO ini. Berikan rumusan eksekutif dalam 3 poin utama dan cadangan tindakan untuk pihak pengurusan."

Paparkan hasil analisis terus di Dashboard.

5. Keperluan API & Kunci
Google Deployment URL: (Untuk disambungkan ke Apps Script).

Gemini API Key: (Disimpan dalam .env atau variable sulit).

Endpoint Gemini: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

6. Paparan UI (Tailwind CSS)
User Mode: Minimalistik, ikon besar, mesra peranti mudah alih (Mobile-first).

Admin Mode: - Kad statistik (Average ratings).

Jadual maklum balas.

Panel "AI Insight" dengan butang 'Generate Report'.

PROJECT: PERKESO KENINGAU CUSTOMER FEEDBACK SYSTEM
1. TECH STACK
Frontend: HTML5, Tailwind CSS (via CDN), JavaScript (Vanilla).

Database: Google Sheets (Direct Integration via Webhook/Deployment URL).

AI Engine: Google Gemini API (gemini-2.0-flash).

Environment: Mobile-friendly (Target: QR Scan).

2. DATA ARCHITECTURE (GOOGLE SHEETS)
Columns required in the sheet:

Timestamp

Counter_ID (Kaunter 1 / Kaunter 2)

Service_Type (Tuntutan / Caruman / Pendaftaran / Lain-lain)

Rating_Friendliness (1-5)

Rating_Speed (1-5)

Rating_Clarity (1-5)

Issues (Multi-select: Waiting Time, Facilities, Staff Attitude, System)

Customer_Comment (Raw Text for Gemini)

3. CORE FUNCTIONALITIES
A. Customer Entry (Form)
User interface with 1Serve standard questions.

Validation: Ensure ratings are selected before submission.

Submission Logic: Use fetch() with mode: 'no-cors' to POST data directly to the Google Sheets Deployment URL.

B. Admin Dashboard
Password Protection: Simple JS-based gatekeeper.

Data Fetching: Read JSON data from Google Sheets.

Gemini Integration:

Trigger: "Analyze with Gemini" button.

Input: Concatenate the last 20 Customer_Comment rows.

Gemini Prompt: "As a Service Quality Consultant, analyze these PERKESO Keningau customer comments. Provide a summary of sentiment and 3 actionable improvements for the Executive Officer."

Output: Display AI summary in a dedicated "Executive Insight" card.

4. UI/UX REQUIREMENTS
Theme: PERKESO Corporate Colors (Blue & Cyan).

Accessibility: Large buttons for elderly users.

Feedback: Show "Terima Kasih - Maklum Balas Diterima" after submission.

5. SECURITY & KEYS
Store GEMINI_API_KEY in a configuration constant (to be replaced by user).

Google Sheet URL must be accessible via exec link.