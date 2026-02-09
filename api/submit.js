// API endpoint untuk menghantar data ke Google Sheets
// Untuk Vercel Serverless Functions

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const CRED_PATH = path.join(__dirname, '..', 'perkeso-keningau-qr-fb9465d9879f.json');

// Load service account credentials (returns null jika tiada = demo mode)
const getCredentials = () => {
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
  return null; // Demo mode: tiada kredensial
};

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1Fr8IIa2fZMvu4W6G_ekVEcJxZZHWNnkT2-drp_WtJ18';
const SHEET_NAME = process.env.SHEET_NAME || 'Sheet1';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Validate required fields
    if (!data.skor_mesra || !data.skor_pantas || !data.skor_jelas) {
      return res.status(400).json({ error: 'Missing required ratings' });
    }

    const timestamp = new Date().toISOString();
    const rowData = [
      timestamp,
      data.kaunter || '',
      data.tujuan || '',
      parseInt(data.skor_mesra) || 0,
      parseInt(data.skor_pantas) || 0,
      parseInt(data.skor_jelas) || 0,
      data.kategori_perbaikan || '',
      data.ulasan || '',
      ''
    ];

    const credentials = getCredentials();
    if (credentials) {
      // Simpan ke Google Sheets
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
      const sheets = google.sheets({ version: 'v4', auth });
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:I`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [rowData] }
      });
    } else {
      // Demo mode: log sahaja (tiada kredensial)
      console.log('[DEMO] Data diterima (tiada Google credentials):', JSON.stringify(rowData));
    }

    return res.status(200).json({
      success: true,
      message: credentials ? 'Data berjaya direkodkan' : 'Data diterima (demo mode – tiada kredensial Google)',
      rujukan: timestamp
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
