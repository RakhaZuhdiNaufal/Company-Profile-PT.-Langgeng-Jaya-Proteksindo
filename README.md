# Website Company Profile — JL Proteksindo

PT. Langgeng Jaya Proteksindo · Surety Bond & Insurance
Dibuat dengan HTML, CSS, dan JavaScript murni (tanpa framework / library).

## Cara menjalankan
1. Ekstrak folder ini.
2. Buka `index.html` di browser (Chrome / Edge / Firefox / Safari).
   Untuk online, upload seluruh isi folder ke hosting (cPanel, Netlify, Vercel, GitHub Pages, dll).

## Struktur folder
```
index.html                 -> halaman utama
css/style.css              -> seluruh styling & tema warna
js/main.js                 -> semua interaksi
assets/img/                -> logo, favicon, foto (diambil dari PDF)
assets/img/pages/          -> gambar halaman PDF untuk Mode Preview
assets/docs/               -> file PDF company profile (tombol Unduh PDF)
```

## Fitur
- Section: Beranda, Profil, Cara kerja Surety Bond, Budaya, Legalitas, Visi Misi, Layanan, Cara Kerja, Kontak
- Mode Preview (tombol "Preview" di header, atau tekan tombol **P**):
  - Tab **Website**: pratinjau Desktop / Tablet / Mobile + putar orientasi, muat ulang, buka di tab baru
  - Tab **Brosur**: penampil halaman PDF (1 / 2 halaman), zoom, layar penuh, thumbnail,
    navigasi panah keyboard & swipe, unduh PDF
  - Bisa dibuka langsung lewat URL: `index.html#preview` atau `index.html#preview-pdf`
- Menu mobile, scroll spy, progress bar, tombol kembali ke atas
- Animasi saat scroll, counter angka, teks berganti otomatis, parallax hero
- Modal detail layanan (bisa geser antar layanan) + isi otomatis form kontak
- Salin nomor legalitas & email sekali klik
- Form kontak dengan validasi, terkirim lewat aplikasi email (mailto) — tanpa backend
- Responsif, aksesibel (keyboard, focus trap, reduced motion), siap cetak (print)

## Mengubah tema warna
Edit variabel di bagian atas `css/style.css`:
```css
--red: #E41F28;    /* merah logo */
--navy: #23418A;   /* biru logo */
--orange: #EF812A; /* oranye logo */
```

## Catatan
- Font "Plus Jakarta Sans" & peta Google Maps butuh koneksi internet; tanpa internet font otomatis
  diganti font sistem dan situs tetap berjalan normal.
- Domain di bilah browser Mode Preview (`jlproteksindo.co.id`) hanya tampilan — ganti di `index.html`.
