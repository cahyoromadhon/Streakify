# Streakify

Streakify adalah aplikasi web **Daily Habit Tracker** untuk membantu pengguna membangun kebiasaan secara konsisten, menyelesaikan task harian, dan memantau progres melalui streak.

## Instalasi aplikasi Windows (.exe)

Pengguna Windows dapat langsung mengunduh dan menjalankan aplikasi Streakify tanpa
memasang Node.js atau membuka terminal.

1. Unduh [Streakify-Setup-0.1.0.exe](./release/Streakify-Setup-0.1.0.exe).
2. Buka file `.exe` yang sudah diunduh.
3. Jika Windows menampilkan peringatan keamanan, pilih **More info** lalu **Run anyway**
   setelah memastikan file berasal dari sumber yang dipercaya.
4. Ikuti langkah instalasi sampai selesai.
5. Jalankan Streakify dari shortcut Desktop atau Start Menu.

Data habit disimpan secara lokal pada komputer pengguna. Gunakan fitur **Export JSON**
di halaman Setting untuk membuat backup sebelum memindahkan atau menghapus aplikasi.

## Fitur utama

- Dashboard dengan sidebar layout dan ringkasan daily streak.
- Penambahan, pengeditan, dan penghapusan habit maupun single task.
- Beberapa mode progres:
  - Yes or no
  - Numeric value dengan target dan progres parsial
  - Timer dengan target durasi
  - Checklist dengan kondisi keberhasilan all items atau custom
- Frequency habit:
  - Setiap hari
  - Hari tertentu dalam satu minggu
  - Tanggal tertentu dalam bulan atau tahun
  - Repeat interval
- Date strip interaktif serta kalender popout untuk memilih tanggal.
- Modal kalender bulanan dengan navigasi bulan.
- Prioritas habit dari 1 sampai 10.
- Start date dan optional end date dengan format `dd/mm/yyyy`.
- Custom icon picker untuk task dan pilihan ikon habit.
- Konfirmasi hapus custom tanpa browser alert.
- Penyimpanan lokal menggunakan `localStorage`, sehingga data tetap tersedia setelah refresh.
- Export dan import JSON agar pengguna memiliki kendali penuh atas backup dan pemindahan data.
- Halaman Setting penuh untuk mengatur accent color, backup, import, dan reset data.
- Accent color yang dapat dikustomisasi.

## Teknologi

- React 18
- TypeScript
- Vite
- Tailwind CSS
- date-fns
- lucide-react
- Vitest
- LocalStorage untuk persistence

## Struktur project

```text
.
├── public/
│   └── streakify-mark.svg  # Logo dan favicon aplikasi
├── src/
│   ├── App.tsx             # App shell, dashboard, modal, dan interaksi utama
│   ├── data.ts             # Data habit awal/demo
│   ├── types.ts            # TypeScript types untuk habit dan form
│   ├── styles.css          # Global styles dan custom utility styles
│   ├── lib/
│   │   ├── habits.ts       # Scheduling, completion, dan streak calculation
│   │   └── habits.test.ts  # Test logika habit dan streak
│   └── main.tsx            # React entry point
├── index.html              # HTML entry dan favicon reference
├── tailwind.config.js      # Konfigurasi Tailwind
├── vite.config.ts          # Konfigurasi Vite
├── package.json            # Scripts dan dependencies
└── README.md
```

## Menjalankan project

Pastikan Node.js dan npm sudah terpasang, lalu jalankan:

```bash
npm install
npm run dev
```

Buka URL yang ditampilkan Vite, biasanya `http://localhost:5173`.

## Script tersedia

```bash
npm run dev      # Menjalankan development server
npm run build    # Type-check dan build production
npm run build:desktop # Membuat aplikasi portable Windows (.exe)
npm run build:installer # Membuat installer Windows NSIS (jalankan di Windows)
npm test         # Menjalankan Vitest
npm run preview  # Preview hasil build production
```

## Membuat aplikasi Windows dari source code

Perintah `npm run build:desktop` menghasilkan aplikasi portable Windows di folder
`release/` di dalam project. File `.exe` dapat langsung diunduh
dan dijalankan tanpa instalasi.
Untuk installer Windows dengan shortcut dan pilihan lokasi instalasi, jalankan
`npm run build:installer` pada Windows.

## Persistence

Data aplikasi disimpan di browser melalui LocalStorage:

- `habitly-habits-v1` untuk data habit dan progres.
- `habitly-theme-color` untuk accent color.

Halaman **Setting** menyediakan export seluruh habit, progres, dan accent color ke file
JSON, serta import untuk memulihkan backup. Import menggantikan data yang sedang tampil
setelah file melewati validasi format dasar. Data aplikasi tetap disimpan secara lokal pada
browser melalui `localStorage`; file JSON dapat digunakan untuk memindahkan data antar
browser atau perangkat.

Perubahan nama brand tidak mengubah key LocalStorage agar data pengguna lama tetap kompatibel.
