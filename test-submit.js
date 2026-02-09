/**
 * Ujian penghantaran data: Rating biasa + Penghargaan Staf
 * Jalankan: node test-submit.js
 * Pastikan server berjalan: npm run dev (atau npm start)
 * Jika tiada kredensial Google: server akan guna demo mode (data log ke konsol sahaja).
 * Untuk simpan ke Sheet: set GOOGLE_SERVICE_ACCOUNT dalam .env atau letak fail perkeso-keningau-qr-*.json di root.
 */

const BASE = 'http://localhost:3000';

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

async function run() {
  console.log('=== Ujian 1: Rating biasa (maklum balas) ===\n');

  const ratingPayload = {
    kaunter: 'Kaunter 1',
    tujuan: 'Tuntutan Faedah',
    skor_mesra: 5,
    skor_pantas: 4,
    skor_jelas: 5,
    kategori_perbaikan: '',
    ulasan: 'Ujian automatik - rating biasa. Layanan baik.'
  };

  const r1 = await post(`${BASE}/api/submit`, ratingPayload);
  console.log('Status:', r1.status, r1.ok ? 'OK' : 'FAIL');
  console.log('Response:', JSON.stringify(r1.data, null, 2));
  if (r1.ok) console.log('-> Data rating biasa berjaya dihantar.\n');
  else console.log('-> Ralat:', r1.data.error || r1.data.raw, '\n');

  console.log('=== Ujian 2: Penghargaan Staf ===\n');

  const penghargaanPayload = {
    kaunter: 'Kaunter 2',
    tujuan: 'PENGHARGAAN STAF',
    skor_mesra: 5,
    skor_pantas: 5,
    skor_jelas: 5,
    kategori_perbaikan: '',
    ulasan: 'PENGHARGAAN kepada Cik Siti binti Ali: Terima kasih atas layanan cemerlang. [Pemberi: Nama - Ahmad | Tel: 5678]',
    nama_pegawai: 'Cik Siti binti Ali',
    is_penghargaan: true
  };

  const r2 = await post(`${BASE}/api/submit`, penghargaanPayload);
  console.log('Status:', r2.status, r2.ok ? 'OK' : 'FAIL');
  console.log('Response:', JSON.stringify(r2.data, null, 2));
  if (r2.ok) {
    console.log('-> Data penghargaan berjaya dihantar.');
    if (r2.data.rujukan) console.log('-> No. Rujukan:', r2.data.rujukan);
  } else console.log('-> Ralat:', r2.data.error || r2.data.raw);

  console.log('\n=== Selesai ===');
}

run().catch(e => {
  console.error('Ralat:', e.message);
  if (e.cause) console.error(e.cause);
  process.exit(1);
});
