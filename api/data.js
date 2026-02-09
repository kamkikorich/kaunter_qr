// API endpoint untuk mendapatkan data dari Google Sheets
// Untuk Vercel Serverless Functions

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const CRED_PATH = path.join(__dirname, '..', 'perkeso-keningau-qr-fb9465d9879f.json');

// Load service account credentials (sama seperti submit.js – baca .env / .env.local)
const getCredentials = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    try {
      return require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));
    } catch (e) {
      return null;
    }
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    } catch (e) {
      return null;
    }
  }
  if (fs.existsSync(CRED_PATH)) {
    return require(CRED_PATH);
  }
  return null;
};

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1Fr8IIa2fZMvu4W6G_ekVEcJxZZHWNnkT2-drp_WtJ18';
const SHEET_NAME = process.env.SHEET_NAME || 'Sheet1';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const credentials = getCredentials();
  if (!credentials) {
    return res.status(200).json({
      success: true,
      data: [],
      count: 0,
      message: 'GOOGLE_SERVICE_ACCOUNT tidak dikonfigurasi. Sila set dalam .env atau .env.local.'
    });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get data from sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:I`
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0
      });
    }

    // Baris 1 dalam sheet = header (Timestamp, Kaunter, ...). Skip supaya jumlah sepadan dengan data.
    const firstCellVal = rows[0] && rows[0][0] != null ? String(rows[0][0]).trim() : '';
    const firstCellIsTimestamp = /^\d{4}-\d{2}-\d{2}/.test(firstCellVal) && !isNaN(new Date(firstCellVal).getTime());
    const skipFirstRowAsHeader = !firstCellIsTimestamp;
    const dataRows = skipFirstRowAsHeader && rows.length > 1 ? rows.slice(1) : rows;

    const data = dataRows
      .filter(row => row && (row[0] != null && row[0] !== '') || (row[1] != null && row[1] !== '')) // elak baris kosong
      .map(row => {
        return {
          timestamp: formatDate(row[0]),
          kaunter: row[1] || '',
          tujuan: row[2] || '',
          skor_mesra: row[3] || 0,
          skor_pantas: row[4] || 0,
          skor_jelas: row[5] || 0,
          kategori_perbaikan: row[6] || '',
          ulasan: row[7] || '',
          sentimen_ai: row[8] || ''
        };
      })
      .reverse(); // Newest first

    return res.status(200).json({
      success: true,
      data: data,
      count: data.length
    });

  } catch (error) {
    console.error('Error:', error);
    // Return 200 supaya frontend boleh baca mesej ralat (bukan masuk catch showDemoData)
    return res.status(200).json({
      success: false,
      data: [],
      count: 0,
      error: error.message
    });
  }
};

// Helper function to format date
function formatDate(dateValue) {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;
    return date.toISOString().replace('T', ' ').substring(0, 16);
  } catch (e) {
    return dateValue;
  }
}
