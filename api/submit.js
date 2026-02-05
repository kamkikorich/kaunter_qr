// API endpoint untuk menghantar data ke Google Sheets
// Untuk Vercel Serverless Functions

const { google } = require('googleapis');
const path = require('path');

// Load service account credentials
const getCredentials = () => {
  // For local development, load from file
  // For production (Vercel), use environment variable
  if (process.env.GOOGLE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  }
  // Vercel will use env variable, locally we can use the json file
  return require('../perkeso-keningau-qr-fb9465d9879f.json');
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

    // Setup Google Auth
    const credentials = getCredentials();
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare row data
    const rowData = [
      new Date().toISOString(),           // Timestamp
      data.kaunter || '',                // Kaunter
      data.tujuan || '',                 // Tujuan
      parseInt(data.skor_mesra) || 0,    // Skor Mesra
      parseInt(data.skor_pantas) || 0,   // Skor Pantas
      parseInt(data.skor_jelas) || 0,    // Skor Jelas
      data.kategori_perbaikan || '',     // Kategori Perbaikan
      data.ulasan || '',                 // Ulasan
      ''                                 // Sentimen AI (placeholder)
    ];

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:I`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [rowData]
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Data berjaya direkodkan'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
