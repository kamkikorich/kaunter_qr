// API endpoint untuk mendapatkan data dari Google Sheets
// Untuk Vercel Serverless Functions

const { google } = require('googleapis');

// Load service account credentials
const getCredentials = () => {
  if (process.env.GOOGLE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  }
  return require('../perkeso-keningau-qr-fb9465d9879f.json');
};

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1Fr8IIa2fZMvu4W6G_ekVEcJxZZHWNnkT2-drp_WtJ18';
const SHEET_NAME = process.env.SHEET_NAME || 'Sheet1';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Setup Google Auth
    const credentials = getCredentials();
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

    // Convert to JSON (skip header row)
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
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
    }).reverse(); // Newest first

    return res.status(200).json({
      success: true,
      data: data,
      count: data.length
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
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
