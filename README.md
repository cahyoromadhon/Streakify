# Streakify

Streakify adalah aplikasi web **Daily Habit Tracker** untuk membantu pengguna membangun kebiasaan secara konsisten, menyelesaikan task harian, dan memantau progres melalui streak.

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
npm test         # Menjalankan Vitest
npm run preview  # Preview hasil build production
```

## Persistence

Data aplikasi disimpan di browser melalui LocalStorage:

- `habitly-habits-v1` untuk data habit dan progres.
- `habitly-theme-color` untuk accent color.

Perubahan nama brand tidak mengubah key LocalStorage agar data pengguna lama tetap kompatibel.
