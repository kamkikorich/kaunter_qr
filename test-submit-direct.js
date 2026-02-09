/**
 * Ujian terus modul submit (tanpa guna server lama)
 * Jalankan: node test-submit-direct.js
 */

const submitHandler = require('./api/submit');

function mockReq(body) {
  return {
    method: 'POST',
    body
  };
}

function mockRes() {
  const out = { statusCode: 200, body: '' };
  return {
    setHeader: () => {},
    status: function (code) {
      out.statusCode = code;
      return this;
    },
    json: function (data) {
      out.body = data;
      return this;
    },
    end: function () {},
    get: () => out
  };
}

async function run() {
  console.log('=== Ujian 1: Rating biasa ===\n');
  const res1 = mockRes();
  await submitHandler(mockReq({
    kaunter: 'Kaunter 1',
    tujuan: 'Tuntutan Faedah',
    skor_mesra: 5,
    skor_pantas: 4,
    skor_jelas: 5,
    kategori_perbaikan: '',
    ulasan: 'Ujian - rating biasa.'
  }), res1);
  const r1 = res1.get();
  console.log('Status:', r1.statusCode, r1.statusCode === 200 ? 'OK' : 'FAIL');
  console.log('Response:', JSON.stringify(r1.body, null, 2));
  console.log(r1.body.success ? '-> Data rating biasa diterima.\n' : '');

  console.log('=== Ujian 2: Penghargaan Staf ===\n');
  const res2 = mockRes();
  await submitHandler(mockReq({
    kaunter: 'Kaunter 2',
    tujuan: 'PENGHARGAAN STAF',
    skor_mesra: 5,
    skor_pantas: 5,
    skor_jelas: 5,
    kategori_perbaikan: '',
    ulasan: 'PENGHARGAAN kepada Cik Siti: Terima kasih. [Pemberi: Tel: 5678]',
    nama_pegawai: 'Cik Siti',
    is_penghargaan: true
  }), res2);
  const r2 = res2.get();
  console.log('Status:', r2.statusCode, r2.statusCode === 200 ? 'OK' : 'FAIL');
  console.log('Response:', JSON.stringify(r2.body, null, 2));
  if (r2.body.success) {
    console.log('-> Data penghargaan diterima.');
    if (r2.body.rujukan) console.log('-> No. Rujukan:', r2.body.rujukan);
  }
  console.log('\n=== Selesai ===');
}

run().catch(e => {
  console.error('Ralat:', e);
  process.exit(1);
});
