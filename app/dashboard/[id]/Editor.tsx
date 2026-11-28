"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { invitationData, ZONES, type InvitationData } from "@/lib/invitation";
import { saveInvitation } from "../actions";

type Data = InvitationData;
type Person = Data["pria"];
type Event = Data["acara"][number];

const OFFSET: Record<Data["zona"], string> = { "Asia/Jakarta": "+07:00", "Asia/Makassar": "+08:00", "Asia/Jayapura": "+09:00" };
// "2027-06-12T08:00" + zona -> ISO dengan offset. Jam dinding tetap saat zona diganti.
const toIso = (local: string, zona: Data["zona"]) => (local ? `${local.slice(0, 16)}:00${OFFSET[zona]}` : "");

const input = "w-full rounded-xl border border-ink/20 bg-white px-3 py-2.5";
const small = "rounded-full border border-gold px-3 py-1.5 text-sm text-gold-deep";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm">{label}</span>
      {children}
    </label>
  );
}

function Text({ label, value, onChange, max, area }: { label: string; value?: string; onChange: (v: string) => void; max: number; area?: boolean }) {
  return (
    <Field label={label}>
      {area ? (
        <textarea rows={3} maxLength={max} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={input} />
      ) : (
        <input maxLength={max} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={input} />
      )}
    </Field>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <legend className="float-left mb-1 w-full font-display text-xl">{title}</legend>
      {children}
    </fieldset>
  );
}

export function Editor({ id, initialData, initialTheme, themes }: { id: string; initialData: Data; initialTheme: string; themes: { slug: string; name: string }[] }) {
  const [data, setData] = useState(initialData);
  const [theme, setTheme] = useState(initialTheme);
  const [status, setStatus] = useState("Tersimpan");
  const first = useRef(true);

  // Simpan otomatis (PRD F4): tunggu 1,2 dtk setelah berhenti mengetik, hanya jika lolos zod.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(async () => {
      const parsed = invitationData.safeParse(data);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return setStatus(`Belum tersimpan: periksa ${issue.path.join(" › ")} (${issue.message})`);
      }
      setStatus("Menyimpan…");
      const res = await saveInvitation(id, theme, parsed.data).catch(() => ({ error: "Koneksi gagal" }));
      setStatus("error" in res ? `Gagal: ${res.error}` : "Tersimpan");
    }, 1200);
    return () => clearTimeout(t);
  }, [data, theme, id]);

  const set = (patch: Partial<Data>) => setData((d) => ({ ...d, ...patch }));
  const setPerson = (who: "wanita" | "pria", patch: Partial<Person>) => setData((d) => ({ ...d, [who]: { ...d[who], ...patch } }));
  const setItem = <K extends "acara" | "cerita" | "hadiah">(key: K, i: number, patch: Partial<Data[K][number]>) =>
    setData((d) => ({ ...d, [key]: d[key].map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
  const removeItem = (key: "acara" | "cerita" | "hadiah", i: number) =>
    setData((d) => ({ ...d, [key]: d[key].filter((_, j) => j !== i) }));

  function setZona(zona: Data["zona"]) {
    setData((d) => ({
      ...d,
      zona,
      acara: d.acara.map((a) => ({ ...a, mulai: toIso(a.mulai, zona), selesai: a.selesai && toIso(a.selesai, zona) })),
    }));
  }

  const kutipan = data.kutipan ?? { teks: "", sumber: "" };
  const setKutipan = (patch: Partial<typeof kutipan>) => {
    const k = { ...kutipan, ...patch };
    set({ kutipan: k.teks || k.sumber ? k : undefined });
  };

  return (
    <div className="space-y-4 pb-20">
      <p role="status" className="sticky top-0 z-10 rounded-xl bg-cream px-3 py-2 text-sm">{status}</p>

      <Card title="Tema">
        <select value={theme} onChange={(e) => setTheme(e.target.value)} className={input} aria-label="Tema">
          {themes.map((t) => (
            <option key={t.slug} value={t.slug}>{t.name}</option>
          ))}
        </select>
      </Card>

      {(["wanita", "pria"] as const).map((who) => (
        <Card key={who} title={who === "wanita" ? "Mempelai wanita" : "Mempelai pria"}>
          <Text label="Nama lengkap" max={80} value={data[who].nama} onChange={(v) => setPerson(who, { nama: v })} />
          <Text label="Nama panggilan" max={30} value={data[who].panggilan} onChange={(v) => setPerson(who, { panggilan: v })} />
          <Text label="Keterangan orang tua" max={160} value={data[who].ortu} onChange={(v) => setPerson(who, { ortu: v })} />
          <Text label="Instagram (tanpa @, opsional)" max={30} value={data[who].instagram} onChange={(v) => setPerson(who, { instagram: v.replace(/^@/, "") || undefined })} />
        </Card>
      ))}

      <Card title="Acara">
        <Field label="Zona waktu">
          <select value={data.zona} onChange={(e) => setZona(e.target.value as Data["zona"])} className={input}>
            {Object.entries(ZONES).map(([z, label]) => (
              <option key={z} value={z}>{label}</option>
            ))}
          </select>
        </Field>
        {data.acara.map((a, i) => (
          <div key={i} className="space-y-3 border-t border-gold/30 pt-3">
            <Text label="Nama acara" max={40} value={a.judul} onChange={(v) => setItem("acara", i, { judul: v })} />
            <Field label="Mulai">
              <input type="datetime-local" value={a.mulai.slice(0, 16)} onChange={(e) => setItem("acara", i, { mulai: toIso(e.target.value, data.zona) })} className={input} />
            </Field>
            <Field label="Selesai (kosongkan = sampai selesai)">
              <input type="datetime-local" value={a.selesai?.slice(0, 16) ?? ""} onChange={(e) => setItem("acara", i, { selesai: toIso(e.target.value, data.zona) || undefined })} className={input} />
            </Field>
            <Text label="Tempat" max={120} value={a.tempat} onChange={(v) => setItem("acara", i, { tempat: v })} />
            <Text label="Alamat" max={240} area value={a.alamat} onChange={(v) => setItem("acara", i, { alamat: v })} />
            <Text label="Link Google Maps (opsional)" max={500} value={a.peta} onChange={(v) => setItem("acara", i, { peta: v || undefined })} />
            {data.acara.length > 1 && (
              <button type="button" onClick={() => removeItem("acara", i)} className={small}>Hapus acara</button>
            )}
          </div>
        ))}
        {data.acara.length < 4 && (
          <button
            type="button"
            className={small}
            onClick={() => set({ acara: [...data.acara, { ...data.acara[data.acara.length - 1], judul: "Acara baru" } as Event] })}
          >
            + Tambah acara
          </button>
        )}
      </Card>

      <Card title="Kutipan">
        <Text label="Teks (opsional)" max={400} area value={kutipan.teks} onChange={(v) => setKutipan({ teks: v })} />
        <Text label="Sumber" max={80} value={kutipan.sumber} onChange={(v) => setKutipan({ sumber: v })} />
      </Card>

      <Card title="Kisah kami">
        {data.cerita.map((c, i) => (
          <div key={i} className="space-y-3 border-t border-gold/30 pt-3">
            <Text label="Tahun" max={10} value={c.tahun} onChange={(v) => setItem("cerita", i, { tahun: v })} />
            <Text label="Judul" max={60} value={c.judul} onChange={(v) => setItem("cerita", i, { judul: v })} />
            <Text label="Cerita" max={400} area value={c.isi} onChange={(v) => setItem("cerita", i, { isi: v })} />
            <button type="button" onClick={() => removeItem("cerita", i)} className={small}>Hapus</button>
          </div>
        ))}
        {data.cerita.length < 6 && (
          <button type="button" className={small} onClick={() => set({ cerita: [...data.cerita, { tahun: "", judul: "", isi: "" }] })}>
            + Tambah cerita
          </button>
        )}
      </Card>

      <Card title="Rekening tanda kasih">
        {data.hadiah.map((h, i) => (
          <div key={i} className="space-y-3 border-t border-gold/30 pt-3">
            <Text label="Bank / e-wallet" max={30} value={h.bank} onChange={(v) => setItem("hadiah", i, { bank: v })} />
            <Text label="Nomor rekening" max={30} value={h.nomor} onChange={(v) => setItem("hadiah", i, { nomor: v })} />
            <Text label="Atas nama" max={80} value={h.atasNama} onChange={(v) => setItem("hadiah", i, { atasNama: v })} />
            <button type="button" onClick={() => removeItem("hadiah", i)} className={small}>Hapus</button>
          </div>
        ))}
        {data.hadiah.length < 3 && (
          <button type="button" className={small} onClick={() => set({ hadiah: [...data.hadiah, { bank: "", nomor: "", atasNama: "" }] })}>
            + Tambah rekening
          </button>
        )}
      </Card>

      <Card title="Penutup">
        <Text label="Kalimat penutup (opsional)" max={400} area value={data.penutup} onChange={(v) => set({ penutup: v || undefined })} />
      </Card>
    </div>
  );
}
