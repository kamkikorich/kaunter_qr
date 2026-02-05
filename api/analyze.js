// API endpoint untuk analisis sentimen menggunakan DeepSeek AI
// Untuk Vercel Serverless Functions

const DATA_API_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api/data`
  : 'http://localhost:3000/api/data';

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
    // Get DeepSeek API Key from environment
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'YOUR_DEEPSEEK_API_KEY_HERE') {
      return res.status(500).json({ 
        error: 'DeepSeek API key not configured',
        demo: true,
        analysis: `CONTOH OUTPUT ANALISIS AI\n\nRumusan Eksekutif:\n1. Kemesraan staf mendapat penilaian tinggi (purata 4.6/5) - pelanggan memuji layanan mesra dan profesional\n2. Terdapat keluhan berkaitan waktu menunggu, terutamanya di kaunter 2 pada waktu puncak\n3. Kejelasan penerangan perlu dipertingkatkan untuk urusan tuntutan kompleks\n\nCadangan Tindakan:\n1. Tambah kaunter atau staf sambilan pada waktu puncak (9-11 pagi, 2-4 petang)\n2. Implementasi sistem giliran digital dengan notifikasi SMS/WhatsApp\n3. Adakan taklimat berkala untuk staf mengenai teknik komunikasi efektif`
      });
    }

    // Fetch data from Google Sheets via our data API
    const dataResponse = await fetch(DATA_API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!dataResponse.ok) {
      throw new Error('Failed to fetch feedback data');
    }

    const payload = await dataResponse.json();
    const data = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.data) ? payload.data : []);

    // Get comments from last 20 entries
    const commentsToAnalyze = data
      .filter(row => row.ulasan && row.ulasan.trim().length > 0)
      .slice(-20)
      .map(row => row.ulasan);

    if (commentsToAnalyze.length === 0) {
      return res.status(200).json({
        success: true,
        analysis: "Tiada ulasan tersedia untuk analisis. Sila pastikan terdapat maklum balas dengan ulasan teks.",
        commentCount: 0
      });
    }

    // Prepare prompt for DeepSeek
    const commentsText = commentsToAnalyze.map((c, i) => `${i + 1}. ${c}`).join("\n");
    const prompt = `Sebagai Pakar Kualiti Perkhidmatan, sila analisis ulasan pelanggan PERKESO Keningau berikut:

${commentsText}

Sila berikan:
1. Rumusan eksekutif (3 poin utama tentang sentimen pelanggan)
2. 3 cadangan tindakan spesifik untuk pihak pengurusan

Jawab dalam Bahasa Melayu yang formal.`;

    // Call DeepSeek API
    const deepseekResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Anda adalah pakar kualiti perkhidmatan dengan pengalaman 20 tahun dalam analisis maklum balas pelanggan kerajaan." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `DeepSeek API error: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();

    if (deepseekData.choices && deepseekData.choices.length > 0) {
      return res.status(200).json({
        success: true,
        analysis: deepseekData.choices[0].message.content,
        commentCount: commentsToAnalyze.length,
        model: deepseekData.model
      });
    } else {
      throw new Error('No response from DeepSeek API');
    }

  } catch (error) {
    console.error('Analysis Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      demo: true,
      analysis: `Ralat: ${error.message}\n\n--- CONTOH OUTPUT (Demo Mode) ---\n\nRumusan Eksekutif:\n1. Kemesraan staf mendapat penilaian tinggi - pelanggan memuji layanan mesra\n2. Terdapat isu waktu menunggu yang perlu diperbaiki\n3. Kejelasan penerangan perlu dipertingkatkan\n\nCadangan Tindakan:\n1. Tambah staf pada waktu puncak\n2. Naik taraf sistem komputer\n3. Sedikan tempat duduk tambahan`
    });
  }
};
