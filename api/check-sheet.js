// GET /api/check-sheet – semak sambungan ke Google Sheet (tanpa dedah rahsia)
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const CRED_PATH = path.join(__dirname, '..', 'perkeso-keningau-qr-fb9465d9879f.json');

function getCredentials() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));
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
}

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1Fr8IIa2fZMvu4W6G_ekVEcJxZZHWNnkT2-drp_WtJ18';
const SHEET_NAME = process.env.SHEET_NAME || 'Sheet1';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const credentials = getCredentials();
  if (!credentials) {
    return res.status(200).json({
      ok: false,
      error: 'GOOGLE_SERVICE_ACCOUNT tidak dijumpai. Sila set dalam .env atau .env.local, atau letak fail JSON kredensial di root projek.',
      spreadsheetId: SPREADSHEET_ID ? SPREADSHEET_ID.slice(0, 8) + '...' : '(tidak set)',
      sheetName: SHEET_NAME
    });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:I1`
    });

    return res.status(200).json({
      ok: true,
      message: 'Sambungan ke Google Sheet berjaya.',
      spreadsheetId: SPREADSHEET_ID.slice(0, 12) + '...',
      sheetName: SHEET_NAME
    });
  } catch (err) {
    const msg = err.message || String(err);
    return res.status(200).json({
      ok: false,
      error: msg,
      spreadsheetId: SPREADSHEET_ID ? SPREADSHEET_ID.slice(0, 12) + '...' : '(tidak set)',
      sheetName: SHEET_NAME
    });
  }
};
