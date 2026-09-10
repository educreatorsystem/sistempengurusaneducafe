# EduCafe @ D'Sutra

Sistem Pengurusan Pusat Sumber EduCafe @ D'Sutra untuk **Sekolah Kebangsaan Sungai Tiram**. Sistem ini ialah aplikasi web statik/PWA yang menggunakan Google Sheets sebagai pangkalan data dan Google Apps Script sebagai API.

## Fungsi utama

- Mod pengguna untuk menghantar rekod tanpa melihat pangkalan data.
- Tujuh set data dalam enam modul: penggunaan PSS, kamus, resensi Tahap 2, buku guru, buku murid, Bakul NILAM BM dan Bakul NILAM BI.
- Mod admin dengan sesi bertempoh, carian, penapis, susunan, pagination, lihat, edit, pemulangan dan padam dua langkah.
- Dashboard dengan 11 metrik dan enam carta analisis.
- PDF harian, mingguan, bulanan, tahunan dan Rumusan Keseluruhan.
- Mod Demo Setempat menggunakan **localStorage** apabila Google Sheets belum dikonfigurasi.
- PWA dengan cache asas, paparan standalone dan aliran pemasangan.

## Struktur fail

| Fail | Tujuan |
| --- | --- |
| **index.html** | Titik masuk aplikasi dan pustaka CDN |
| **styles.css** | Reka bentuk responsif, animasi dan keadaan UI |
| **app.js** | Borang, mod demo, admin, carta, PDF dan PWA |
| **config.js** | ID Google Sheet, URL Web App dan tetapan aplikasi |
| **Code.gs** | API Google Apps Script, keselamatan dan operasi Sheets |
| **manifest.json** | Metadata PWA |
| **service-worker.js** | Cache fail statik dan fallback luar talian |
| **assets/icon.svg**, **assets/icon-192.png**, **assets/icon-512.png** | Ikon aplikasi |

## 1. Cipta Google Sheet

1. Buka [Google Sheets](https://sheets.google.com) dan cipta spreadsheet kosong.
2. Namakan spreadsheet, contohnya Pangkalan Data EduCafe.
3. Daripada URL seperti https://docs.google.com/spreadsheets/d/ABC123/edit, salin bahagian ABC123. Itulah ID Google Sheet.
4. Dalam tetapan spreadsheet, pilih zon masa **(GMT+08:00) Kuala Lumpur**.

Helaian berikut akan dicipta secara automatik oleh **Code.gs**:

- PENGGUNAAN_PSS
- PINJAMAN_KAMUS
- RESENSI_TAHAP_2
- PINJAMAN_BUKU_GURU
- PINJAMAN_BUKU_MURID
- PINJAMAN_BAKUL_BM
- PINJAMAN_BAKUL_BI
- LOG_AKTIVITI

## 2. Masukkan ID Google Sheet

ID perlu disediakan di dua tempat:

1. Dalam projek Apps Script, buka **Project Settings > Script Properties**.
2. Tambah GOOGLE_SHEET_ID dengan ID yang disalin.
3. Projek ini telah ditetapkan kepada ID Google Sheet **1T2mYQNl3ogtALF7fwqJqsAQAk7uwLO3Uz6_ZsODZAtI** dalam **config.js** dan **Code.gs**.

Nilai dalam config digunakan oleh aplikasi untuk menentukan sama ada Mod Demo perlu diaktifkan; akses data sebenar tetap dilakukan oleh Apps Script.

## 3. Pasang kod Google Apps Script

1. Daripada Google Sheet, pilih **Extensions > Apps Script**.
2. Padam kandungan lalai dalam Code.gs.
3. Salin keseluruhan kandungan fail **Code.gs** projek ini ke editor.
4. Simpan projek sebagai EduCafe API.
5. Pastikan zon masa projek ialah Asia/Kuala_Lumpur.

## 4. Akaun admin

Jangan masukkan kata laluan dalam **index.html**, **app.js**, **config.js** atau mana-mana fail klien.

Akaun admin lalai telah disediakan sebagai salt dan hash SHA-256 dalam kod pelayan. Pada log masuk pertama, Apps Script akan mencipta Script Properties admin dan semua helaian secara automatik. Kata laluan teks biasa tidak disimpan dalam fail projek.

Untuk menukar akaun atau kata laluan kemudian:

1. Buka **Project Settings > Script Properties**.
2. Tambah `INITIAL_ADMIN_USERNAME` dengan nama pengguna baharu.
3. Tambah `INITIAL_ADMIN_PASSWORD` dengan kata laluan baharu.
4. Pilihan: tambah `SESSION_TIMEOUT_MINUTES` dengan nilai 30.
5. Kembali ke editor dan jalankan fungsi **setupAdminAccount**.
6. Benarkan akses Google Sheets apabila diminta.

Fungsi persediaan akan:

- mencipta semua helaian dan header;
- menghasilkan salt rawak;
- menyimpan hanya hash SHA-256 bersalt;
- memadam INITIAL_ADMIN_PASSWORD daripada Script Properties.

Jalankan **installMaintenanceTriggers** sekali jika mahu status lewat dikemas kini dalam Sheet setiap jam dan sesi tamat dibersihkan setiap enam jam.

## 5. Deploy Apps Script sebagai Web App

1. Pilih **Deploy > New deployment**.
2. Pilih jenis **Web app**.
3. Tetapkan **Execute as: Me**.
4. Tetapkan **Who has access: Anyone** supaya borang awam boleh menghantar rekod.
5. Klik **Deploy** dan benarkan akses.
6. Salin URL yang berakhir dengan /exec.

Operasi sensitif tetap memerlukan token sesi admin walaupun Web App boleh dicapai oleh orang awam. Selepas mengubah Code.gs, cipta versi deployment baharu.

## 6. Masukkan URL Web App

URL Web App `/exec` dan ID Google Sheet telah dimasukkan dalam **config.js**. Muat semula aplikasi dan notis Mod Demo akan hilang. Jika deployment Apps Script ditukar pada masa hadapan, gantikan nilai `APPS_SCRIPT_WEB_APP_URL` dengan URL `/exec` deployment baharu.

Pautan CSV awam disimpan sebagai **GOOGLE_SHEET_CSV_URL** untuk rujukan sambungan sahaja. Sistem tidak menggunakan CSV untuk operasi rekod kerana CSV tidak menyokong tambah, edit, padam, log masuk atau token sesi. Pertimbangkan untuk menghentikan penerbitan CSV selepas Web App berfungsi supaya data pusat sumber tidak terdedah secara awam.

## 7. Uji penyimpanan dan pembacaan data

1. Buka halaman utama dan isi satu borang.
2. Pastikan toast kejayaan serta ID rujukan dipaparkan.
3. Buka Google Sheet dan semak baris baharu pada helaian modul.
4. Log masuk admin dan buka jadual modul berkenaan.
5. Uji carian, penapis, edit, pemulangan dan padam dua langkah.
6. Semak LOG_AKTIVITI untuk audit tindakan.
7. Cuba pinjam kod bakul yang sama sebelum pinjaman pertama dipulangkan; permintaan kedua mesti ditolak.

Semua data demo mempunyai teks DATA CONTOH dan boleh dipadam melalui dashboard Admin Demo Setempat.

## 8. Jalankan sistem secara setempat

Jangan buka index.html terus melalui file protocol kerana service worker memerlukan pelayan HTTP.

~~~bash
python3 -m http.server 8080
~~~

Kemudian buka http://localhost:8080. Selagi placeholder konfigurasi belum diganti, aplikasi berjalan dalam Mod Demo Setempat. Akses admin demo menggunakan butang **Masuk Admin Demo Setempat**; ia tidak meminta atau menyimpan kata laluan produksi.

## 9. Terbitkan melalui GitHub Pages

1. Cipta repositori GitHub baharu.
2. Muat naik semua fail dan folder projek ke akar repositori.
3. Buka **Settings > Pages**.
4. Di bawah **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch main dan folder root.
6. Simpan dan tunggu URL GitHub Pages tersedia.
7. Buka URL HTTPS tersebut dan uji semula borang, log masuk, PDF dan pemasangan PWA.

Jangan commit sebarang kata laluan, token sesi atau salinan Script Properties ke GitHub.

## 10. Pasang sebagai PWA

- Android/Chrome/Edge: tekan butang **Pasang Aplikasi** atau gunakan menu pelayar > **Install app**.
- iPhone/iPad/Safari: pilih **Share** > **Add to Home Screen**.
- Komputer Chrome/Edge: gunakan ikon pemasangan pada bar alamat.

PWA memerlukan HTTPS, kecuali localhost. Cache asas menyimpan fail aplikasi supaya halaman boleh dibuka ketika luar talian; penghantaran ke Google Sheets masih memerlukan internet. Draf borang disimpan pada peranti dan dipulihkan selepas ralat rangkaian.

## Akaun dan keselamatan

- Nama pengguna produksi: gurucemerlang.
- Kata laluan produksi hanya ditetapkan melalui INITIAL_ADMIN_PASSWORD dalam Script Properties.
- Token sesi disimpan dalam sessionStorage, tamat selepas tempoh tidak aktif dan tidak dimasukkan ke URL.
- Operasi baca, kemas kini, padam, pemulangan dan laporan data memerlukan sesi admin.
- Nilai yang boleh menjadi formula Sheet dinyahaktifkan di pelayan dan semua output pengguna di-escape sebelum dipaparkan.
- Padam ialah soft delete (statusRekod = Dipadam) supaya audit kekal tersedia.

## Laporan PDF

PDF menggunakan jsPDF dan jsPDF-AutoTable melalui CDN. Lencana sekolah dimuatkan daripada URL konfigurasi dan ditukar kepada data imej; logo SKST dijana sebagai fallback jika URL luar gagal. Jadual panjang dipecah kepada beberapa bahagian kolum, header diulang pada setiap halaman dan nombor halaman serta ruang tandatangan ditambah.

## Penyelesaian masalah ringkas

- **Masih dalam Mod Demo:** semak kedua-dua nilai dalam config.js dan pastikan URL bermula dengan https://script.google.com/.
- **Log masuk gagal:** pastikan deployment menggunakan versi kod terkini. Untuk akaun tersuai, jalankan setupAdminAccount selepas menetapkan Script Properties.
- **API tidak berubah selepas kemas kini:** deploy versi Web App baharu dan gunakan URL /exec.
- **Carta/PDF tidak muncul:** semak internet atau polisi rangkaian kerana pustaka dimuatkan melalui CDN.
- **Lencana gagal dimuatkan:** fallback SKST akan digunakan pada UI dan PDF.
- **PWA tidak boleh dipasang:** gunakan HTTPS/localhost dan pastikan manifest.json serta service-worker.js boleh dicapai.
