# ☁️ Panduan Lengkap Setup Cloud Backup & Device Sync (Supabase) dari 0

Panduan ini menuntun Anda langkah demi langkah untuk menghubungkan **IELTS GO** antara Laptop dan HP menggunakan **Supabase Free Tier (100% Gratis Selamanya)** dan **Device-Linked Sync Code** tanpa perlu mendaftar akun email/password di aplikasi.

---

## 🎯 Mengapa Menggunakan Arsitektur Ini?
1. **Zero-Friction**: Tidak perlu verifikasi email, password rumit, atau login Google di HP. Cukup ketik kode pairing (misal: `IELTS-7842-KM`) atau scan QR Code.
2. **100% Milik Anda Pribadi**: Data disimpan di database Supabase milik Anda sendiri. Tidak ada server perantara yang membaca data belajar Anda.
3. **Smart Merge**: Saat HP dan Laptop digabungkan, kosakata dari kedua perangkat akan disatukan (*union*), progres roadmap tertinggi dipertahankan, dan XP terakumulasi secara adil.
4. **Offline Fallback**: Jika belum sempat setup Supabase, aplikasi tetap menyediakan fitur **Download File Backup (.json)** yang bisa dipindahkan secara manual.

---

## ⏱️ Langkah 1: Buat Akun & Project di Supabase (Estimasi: 2 Menit)

1. Buka browser dan kunjungi: **[https://supabase.com](https://supabase.com)**
2. Klik tombol **"Start your project"** atau **"Sign in"** (bisa langsung login menggunakan akun GitHub atau Google Anda).
3. Di dashboard Supabase, klik tombol hijau **"New Project"**.
4. Isi formulir pembuatan project:
   - **Organization**: Pilih akun/organisasi Anda.
   - **Name**: Ketik `ieltsgo-sync` (atau nama bebas).
   - **Database Password**: Buat password yang kuat dan catat/simpan password tersebut.
   - **Region**: Pilih **Singapore (ap-southeast-1)** untuk kecepatan latensi terbaik dari Indonesia.
   - **Pricing Plan**: Pilih **Free Plan** ($0/bulan).
5. Klik **"Create new project"** dan tunggu sekitar 1–2 menit hingga database selesai disiapkan oleh Supabase.

---

## ⚡ Langkah 2: Buat Tabel Vault via SQL Editor (Estimasi: 1 Menit)

1. Pada menu navigasi sebelah kiri di dashboard Supabase Anda, klik ikon **SQL Editor** (ikon tanda kurung siku `>_`).
2. Klik tombol **"New query"** (atau lembar kosong).
3. Salin (*copy*) seluruh kode SQL berikut dan tempelkan (*paste*) ke dalam kotak editor:

```sql
-- 1. Buat tabel penyimpanan data sinkronisasi
create table if not exists sync_vault (
  sync_code text primary key,
  payload jsonb not null,
  updated_at timestamptz default now()
);

-- 2. Aktifkan Row Level Security (RLS) demi keamanan
alter table sync_vault enable row level security;

-- 3. Berikan izin baca dan tulis berbasis sync_code publik
create policy "Allow public read-write for sync_code"
on sync_vault
for all
using (true)
with check (true);
```

4. Klik tombol hijau **"Run"** (atau tekan `Ctrl + Enter`).
5. Pastikan muncul pesan hijau: **"Success. No rows returned"**.  
   *Tabel database Anda kini telah 100% siap menerima data pairing!*

---

## 🔑 Langkah 3: Ambil Project URL & Public Anon Key (Estimasi: 1 Menit)

1. Pada menu navigasi sebelah kiri, klik ikon gerigi **Project Settings** di bagian paling bawah.
2. Pilih submenu **"API"** (atau **Data API**).
3. Di halaman tersebut, Anda akan melihat dua informasi penting:
   - **Project URL**: Formatnya seperti `https://abcdefghijklm.supabase.co`
   - **Project API keys (anon / public)**: Kunci panjang yang diawali dengan `eyJhbGciOi...`
4. Biarkan tab ini terbuka atau salin kedua nilai tersebut.

---

## 🔗 Langkah 4: Masukkan Konfigurasi ke Aplikasi IELTS GO

1. Buka aplikasi **IELTS GO** di Laptop Anda.
2. Di pojok kanan atas, klik tombol **"Cloud Sync"** (ikon awan `fa-cloud-arrow-up`).
3. Pada modal yang terbuka, klik tab **"⚙️ Konfigurasi Cloud"**.
4. Tempelkan (*paste*) data yang Anda ambil dari Langkah 3:
   - **Supabase Project URL**: Tempelkan Project URL Anda.
   - **Supabase Anon Public Key**: Tempelkan Kunci Anon Anda.
5. Klik tombol **"Simpan Konfigurasi"**.
6. Muncul notifikasi sukses hijau: *"Konfigurasi Supabase berhasil disimpan!"*.

---

## 📱 Langkah 5: Cara Menghubungkan Laptop ke HP (Pairing)

### Di Laptop:
1. Pada modal Cloud Sync, buka tab **"🔗 Pairing Perangkat"**.
2. Klik tombol hijau **"Buat Kode Baru & Upload"**.
3. Sistem akan mengunggah seluruh progres Anda (Kosakata, XP, Level, Roadmap, Sesi Belajar) dan menghasilkan:
   - **Kode Pairing Unik**, contoh: `IELTS-8492-KP`
   - **QR Code Interaktif** yang muncul langsung di layar laptop.

### Di HP:
1. Buka browser di HP Anda (Chrome, Safari, dll.) dan buka alamat web IELTS GO Anda.
2. Klik ikon awan **Cloud Sync** di header HP.
3. Buka tab **"Konfigurasi Cloud"** sekali saja, masukkan URL dan Anon Key yang sama (atau bisa salin cepat via WhatsApp Web / Notes).
4. Buka tab **"Pairing Perangkat"**, masukkan kode yang tertera di laptop (contoh: `IELTS-8492-KP`).
5. Klik tombol biru **"Hubungkan Perangkat & Tarik Data"**.
6. **BIM SALABIM!** Seluruh kosakata, level, XP, dan riwayat belajar dari laptop langsung berpindah dan tampil di HP Anda!

---

## 🔄 Bagaimana Cara Kerjanya Selanjutnya?
* **Auto-Sync Latar Belakang**: Ketika Anda menambah kata baru di HP atau menyelesaikan speaking drill di laptop, aplikasi secara otomatis meng-update data ke cloud setiap beberapa detik (*silent background sync*).
* **Tarik Data Kapan Saja**: Jika Anda ingin memastikan data di laptop telah menerima latihan terbaru dari HP, cukup klik tombol **"Update Snapshot Cloud"** atau muat ulang (*refresh*) halaman.
* **Bila Sedang Offline**: Anda selalu bisa menggunakan tab **"📁 Backup File Offline"** untuk mengunduh file cadangan `.json` dan menyimpannya di Google Drive atau memori lokal!
