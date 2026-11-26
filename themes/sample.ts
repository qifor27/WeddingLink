import { invitationData } from "@/lib/invitation";

// Data contoh untuk preview tema (PRD F2). Nama fiktif.
export const sampleData = invitationData.parse({
  zona: "Asia/Jakarta",
  pria: {
    nama: "Dimas Pratama, S.T.",
    panggilan: "Dimas",
    ortu: "Putra dari Bapak Hendra & Ibu Sari",
  },
  wanita: {
    nama: "Rina Maharani, S.Pd.",
    panggilan: "Rina",
    ortu: "Putri dari Bapak Yusuf & Ibu Nurhayati",
  },
  acara: [
    {
      judul: "Akad Nikah",
      mulai: "2027-06-12T08:00:00+07:00",
      selesai: "2027-06-12T10:00:00+07:00",
      tempat: "Masjid Raya Contoh",
      alamat: "Jl. Contoh No. 1, Padang",
      peta: "https://maps.google.com/?q=Padang",
    },
    {
      judul: "Resepsi",
      mulai: "2027-06-12T11:00:00+07:00",
      selesai: "2027-06-12T14:00:00+07:00",
      tempat: "Gedung Serbaguna Contoh",
      alamat: "Jl. Contoh No. 2, Padang",
      peta: "https://maps.google.com/?q=Padang",
    },
  ],
  kutipan: {
    teks: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya.",
    sumber: "QS. Ar-Rum: 21",
  },
  cerita: [
    { tahun: "2021", judul: "Pertama bertemu", isi: "Kami bertemu di sebuah acara kampus." },
    { tahun: "2026", judul: "Lamaran", isi: "Dengan restu keluarga, kami melangkah ke jenjang berikutnya." },
  ],
  hadiah: [{ bank: "Bank Contoh", nomor: "1234567890", atasNama: "Rina Maharani" }],
});
