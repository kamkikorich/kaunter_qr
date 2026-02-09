# Semakan Google Sheet

Gunakan senarai ini untuk pastikan data boleh dibaca oleh aplikasi.

## 1. ID Spreadsheet

- Dalam `.env` atau `.env.local` pastikan:
  - `SPREADSHEET_ID` = ID dari URL Sheet anda  
  - Contoh URL: `https://docs.google.com/spreadsheets/d/ **1Fr8IIa2fZMvu4W6G_ekVEcJxZZHWNnkT2-drp_WtJ18** /edit`  
  - Nilai `SPREADSHEET_ID` = bahagian yang ditebalkan di atas (tanpa slash).

## 2. Nama lembaran (Sheet)

- Aplikasi baca lembaran bernama **Sheet1** (lalai).
- Jika lembaran anda nama lain (cth. "Maklum Balas"), set dalam env:
  - `SHEET_NAME=Maklum Balas`

## 3. Kongsi Sheet dengan Service Account

- Buka fail JSON kredensial Google (atau bahagian `client_email` dalam `GOOGLE_SERVICE_ACCOUNT`).
- Cari nilai **client_email** (cth. `xxx@xxx.iam.gserviceaccount.com`).
- Buka Google Sheet anda → **Kongsi** (Share) → tambah e-mel tersebut sebagai **Editor** (atau sekurang-kurangnya **Pembaca**).
- Tanpa langkah ini, API akan dapat ralat "Permission denied" atau data kosong.

## 4. Baris dan lajur dalam Sheet

- **Baris 1** = header (akan diskip; jangan letak data sebenar di sini).
- Lajur yang dibaca: **A** hingga **I**.
- Susunan yang disokong:

  | A           | B       | C       | D   | E   | F   | G   | H     | I   |
  |------------|--------|--------|-----|-----|-----|-----|-------|-----|
  | Timestamp  | Kaunter| Tujuan | Skor Mesra | Skor Pantas | Skor Jelas | Kategori... | Ulasan | Sentimen AI |
  | (data)     | (data) | (data) | ... | ... | ... | ... | ...   | ... |

- **Lajur A baris 1:** mestilah teks (cth. "Timestamp", "Tarikh"). Jika baris 1 lajur A ialah tarikh (nombor/format tarikh), sistem akan anggap tiada header dan baris 1 akan dikira sebagai data.

## 5. Kredensial dalam .env.local

- Pastikan ada:
  - `GOOGLE_SERVICE_ACCOUNT` = keseluruhan JSON service account dalam satu baris (boleh escape quote).
  - `SPREADSHEET_ID` = ID spreadsheet.
  - (Pilihan) `SHEET_NAME=Sheet1` jika guna nama lain.
- Restart server selepas ubah `.env` atau `.env.local`.

## 6. Ujian pantas

- Selepas semakan di atas, buka: `http://localhost:3000`
- Masuk ke bahagian Admin dashboard.
- Jika masih kosong, buka konsol pelayar (F12 → Console) dan semak ralat ketika muat data. Semak juga terminal server untuk ralat dari API (cth. 403, 404).
