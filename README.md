# PERKESO Keningau - Sistem Penilaian Pelanggan

Sistem maklum balas pelanggan berdasarkan standard 1Serve dengan integrasi Google Sheets dan analisis AI DeepSeek.

## Struktur Projek

```
├── api/
│   ├── submit.js      # Endpoint untuk hantar maklum balas (POST)
│   └── data.js        # Endpoint untuk ambil data (GET)
├── index.html         # Frontend utama (borang + dashboard)
├── package.json       # Dependencies Node.js
├── vercel.json        # Konfigurasi Vercel
└── .env.example       # Contoh environment variables
```

## Setup Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` dan isi:
- `GOOGLE_SERVICE_ACCOUNT` - Salin keseluruhan kandungan fail `perkeso-keningau-qr-fb9465d9879f.json` sebagai satu baris

Contoh format:
```
GOOGLE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...",...}
```

### 3. Running Locally

```bash
npm run dev
```

Akses di: http://localhost:3000

## Deploy ke Vercel

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/perkeso-keningau-qr.git
git push -u origin main
```

### 2. Setup di Vercel

1. Daftar/Login [vercel.com](https://vercel.com)
2. Import projek dari GitHub
3. Dalam **Environment Variables**, tambah:
   - `SPREADSHEET_ID` = `1Fr8IIa2fZMvu4W6G_ekVEcJxZZHWNnkT2-drp_WtJ18`
   - `SHEET_NAME` = `Sheet1`
   - `GOOGLE_SERVICE_ACCOUNT` = [paste keseluruhan JSON service account]

4. Deploy!

## Setup Google Sheets

Pastikan Google Sheets anda ada 9 lajur:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| timestamp | kaunter | tujuan | skor_mesra | skor_pantas | skor_jelas | kategori_perbaikan | ulasan | sentimen_ai |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/submit` | Hantar maklum balas baru |
| GET | `/api/data` | Dapatkan semua data |

### Contoh POST /api/submit

```json
{
  "kaunter": "Kaunter 1",
  "tujuan": "Tuntutan Faedah",
  "skor_mesra": 5,
  "skor_pantas": 4,
  "skor_jelas": 5,
  "kategori_perbaikan": "Waktu Menunggu, Fasiliti",
  "ulasan": "Staf sangat mesra!"
}
```

## Keselamatan

⚠️ **Penting:**
- Jangan commit fail `perkeso-keningau-qr-fb9465d9879f.json` ke GitHub
- Fail ini sudah dilindungi oleh `.gitignore`
- Guna environment variable `GOOGLE_SERVICE_ACCOUNT` untuk production

## Customization

### Tukar Kata Laluan Admin

Dalam `index.html`, cari:
```javascript
const ADMIN_PASSWORD = "admin123";
```

### Tukar Google Sheets

Dalam `index.html`, tukar:
```javascript
const SPREADSHEET_ID = "YOUR_NEW_SPREADSHEET_ID";
```

Atau dalam `.env`:
```
SPREADSHEET_ID=your_new_spreadsheet_id
```

## DeepSeek AI Integration

Untuk menggunakan analisis AI:
1. Daftar di [deepseek.com](https://deepseek.com)
2. Dapatkan API Key
3. Masukkan dalam `index.html` atau environment variable `DEEPSEEK_API_KEY`
