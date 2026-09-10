(function () {
  "use strict";

  const CONFIG = window.EDUCAFE_CONFIG || {};
  const app = document.getElementById("app");
  const toastRegion = document.getElementById("toastRegion");
  const modalRoot = document.getElementById("modalRoot");
  const STORAGE_KEY = "educafe_records_v1";
  const DRAFT_PREFIX = "educafe_draft_";
  const SESSION_KEY = "educafe_admin_session_v1";
  const LOAN_STATUSES = ["Sedang Dipinjam", "Dipulangkan", "Lewat", "Rosak", "Hilang"];
  const CONDITION_OPTIONS = ["Baik", "Memuaskan", "Rosak Ringan", "Rosak"];
  const BM_MONTHS = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];

  function field(key, label, type, required, extras) {
    return Object.assign({ key: key, label: label, type: type, required: required }, extras || {});
  }

  const MODULES = {
    PENGGUNAAN_PSS: {
      id: "PENGGUNAAN_PSS",
      prefix: "PSS",
      icon: "library",
      title: "Rekod Penggunaan Pusat Sumber",
      shortTitle: "Penggunaan PSS",
      description: "Catat penggunaan ruang, aktiviti dan jumlah murid.",
      dateKey: "tarikh",
      classKey: "kelasUnitKumpulan",
      categoryKey: "tujuanPenggunaan",
      fields: [
        field("tarikh", "Tarikh", "date", true),
        field("hari", "Hari", "text", false, { computed: true, readonly: true }),
        field("masaMula", "Masa mula", "time", true),
        field("masaTamat", "Masa tamat", "time", true),
        field("namaGuruPegawai", "Nama guru atau pegawai bertanggungjawab", "text", true),
        field("kategoriPengguna", "Kategori pengguna", "select", true, { options: ["Murid", "Guru", "Staf", "Komuniti", "Campuran"] }),
        field("kelasUnitKumpulan", "Kelas, unit atau kumpulan", "text", true),
        field("bilanganMuridLelaki", "Bilangan murid lelaki", "number", true, { min: 0 }),
        field("bilanganMuridPerempuan", "Bilangan murid perempuan", "number", true, { min: 0 }),
        field("jumlahPengguna", "Jumlah pengguna", "number", false, { computed: true, readonly: true }),
        field("tujuanPenggunaan", "Tujuan penggunaan", "select", true, { options: ["Pengajaran dan Pembelajaran", "Bacaan NILAM", "Aktiviti Pusat Sumber", "Perbincangan", "Mesyuarat", "Penyelidikan", "Program sekolah", "Lain-lain"] }),
        field("namaAktiviti", "Nama aktiviti", "text", true),
        field("catatan", "Catatan", "textarea", false, { full: true, max: 500 })
      ]
    },
    PINJAMAN_KAMUS: {
      id: "PINJAMAN_KAMUS",
      prefix: "KMS",
      icon: "languages",
      title: "Rekod Pinjaman Kamus",
      shortTitle: "Pinjaman Kamus",
      description: "Urus pinjaman kamus Bahasa Melayu dan Bahasa Inggeris.",
      dateKey: "tarikhPinjaman",
      classKey: "kelasJawatan",
      categoryKey: "bahasaKamus",
      statusKey: "statusPinjaman",
      isLoan: true,
      fields: [
        field("tarikhPinjaman", "Tarikh pinjaman", "date", true),
        field("namaPeminjam", "Nama peminjam", "text", true),
        field("kategoriPeminjam", "Kategori peminjam", "select", true, { options: ["Guru", "Murid"] }),
        field("kelasJawatan", "Kelas atau jawatan", "text", true),
        field("bahasaKamus", "Bahasa kamus", "select", true, { options: ["Bahasa Melayu", "Bahasa Inggeris"] }),
        field("tajukJenisKamus", "Tajuk atau jenis kamus", "text", true),
        field("nomborAsetKodKamus", "Nombor aset atau kod kamus", "text", true),
        field("kuantiti", "Kuantiti", "number", true, { min: 1 }),
        field("tarikhPerluDipulangkan", "Tarikh perlu dipulangkan", "date", true),
        field("tarikhPemulanganSebenar", "Tarikh pemulangan sebenar", "date", false, { adminOnly: true }),
        field("keadaanSemasaDipinjam", "Keadaan semasa dipinjam", "select", true, { options: CONDITION_OPTIONS }),
        field("keadaanSemasaDipulangkan", "Keadaan semasa dipulangkan", "select", false, { options: CONDITION_OPTIONS, adminOnly: true }),
        field("statusPinjaman", "Status", "select", false, { options: LOAN_STATUSES, adminOnly: true, defaultValue: "Sedang Dipinjam" }),
        field("catatan", "Catatan", "textarea", false, { full: true, max: 500 })
      ]
    },
    RESENSI_TAHAP_2: {
      id: "RESENSI_TAHAP_2",
      prefix: "RSN",
      icon: "book-heart",
      title: "Rekod Resensi Buku Tahap 2",
      shortTitle: "Resensi Tahap 2",
      description: "Himpunkan resensi murid Tahun 4, Tahun 5 dan Tahun 6.",
      dateKey: "tarikh",
      classKey: "tahunKelas",
      categoryKey: "kategoriBuku",
      statusKey: "statusPengesahan",
      fields: [
        field("tarikh", "Tarikh", "date", true),
        field("namaMurid", "Nama murid", "text", true),
        field("tahunKelas", "Tahun dan kelas", "text", true, { placeholder: "Contoh: Tahun 5 Bestari" }),
        field("tajukBuku", "Tajuk buku", "text", true),
        field("namaPenulis", "Nama penulis", "text", true),
        field("penerbit", "Penerbit", "text", true),
        field("bahasaBuku", "Bahasa buku", "select", true, { options: ["Bahasa Melayu", "Bahasa Inggeris", "Bahasa Arab", "Lain-lain"] }),
        field("kategoriBuku", "Kategori buku", "select", true, { options: ["Fiksyen", "Bukan Fiksyen", "Rujukan", "Biografi", "Sains dan Teknologi", "Agama dan Moral", "Lain-lain"] }),
        field("bilanganHalaman", "Bilangan halaman", "number", true, { min: 1 }),
        field("sinopsis", "Sinopsis atau ringkasan buku", "textarea", true, { full: true, max: 800, counter: true }),
        field("nilaiMurni", "Nilai murni atau pengajaran", "textarea", true, { full: true, max: 400, counter: true }),
        field("penilaianBintang", "Penilaian buku", "select", true, { options: ["1 bintang", "2 bintang", "3 bintang", "4 bintang", "5 bintang"] }),
        field("namaGuruPengesah", "Nama guru pengesah", "text", false, { adminOnly: true }),
        field("statusPengesahan", "Status pengesahan", "select", false, { options: ["Belum Disahkan", "Disahkan", "Perlu Pembetulan"], adminOnly: true, defaultValue: "Belum Disahkan" }),
        field("catatanGuru", "Catatan guru", "textarea", false, { full: true, max: 500, adminOnly: true })
      ]
    },
    PINJAMAN_BUKU_GURU: {
      id: "PINJAMAN_BUKU_GURU",
      prefix: "PBG",
      icon: "book-open-check",
      title: "Rekod Pinjaman Buku Guru",
      shortTitle: "Buku Guru",
      description: "Rekod bahan yang dipinjam oleh guru dan panitia.",
      dateKey: "tarikhPinjaman",
      classKey: "jawatanPanitia",
      categoryKey: "kategoriBuku",
      statusKey: "statusPinjaman",
      isLoan: true,
      fields: [
        field("tarikhPinjaman", "Tarikh pinjaman", "date", true),
        field("namaGuru", "Nama guru", "text", true),
        field("jawatanPanitia", "Jawatan atau panitia", "text", true),
        field("kodBuku", "Nombor perolehan, barcode atau kod buku", "text", true),
        field("tajukBuku", "Tajuk buku", "text", true),
        field("namaPenulis", "Nama penulis", "text", true),
        field("kategoriBuku", "Kategori buku", "text", true),
        field("kuantiti", "Kuantiti", "number", true, { min: 1 }),
        field("tarikhPerluDipulangkan", "Tarikh perlu dipulangkan", "date", true),
        field("tarikhPemulanganSebenar", "Tarikh pemulangan sebenar", "date", false, { adminOnly: true }),
        field("keadaanBukuSemasaDipinjam", "Keadaan buku semasa dipinjam", "select", true, { options: CONDITION_OPTIONS }),
        field("keadaanBukuSemasaDipulangkan", "Keadaan buku semasa dipulangkan", "select", false, { options: CONDITION_OPTIONS, adminOnly: true }),
        field("statusPinjaman", "Status pinjaman", "select", false, { options: LOAN_STATUSES, adminOnly: true, defaultValue: "Sedang Dipinjam" }),
        field("catatan", "Catatan", "textarea", false, { full: true, max: 500 })
      ]
    },
    PINJAMAN_BUKU_MURID: {
      id: "PINJAMAN_BUKU_MURID",
      prefix: "PBM",
      icon: "book-user",
      title: "Rekod Pinjaman Buku Murid",
      shortTitle: "Buku Murid",
      description: "Pantau pinjaman dan pemulangan buku oleh murid.",
      dateKey: "tarikhPinjaman",
      classKey: "tahunKelas",
      categoryKey: "kategoriBuku",
      statusKey: "statusPinjaman",
      isLoan: true,
      fields: [
        field("tarikhPinjaman", "Tarikh pinjaman", "date", true),
        field("namaMurid", "Nama murid", "text", true),
        field("tahunKelas", "Tahun dan kelas", "text", true),
        field("kodBuku", "Nombor perolehan, barcode atau kod buku", "text", true),
        field("tajukBuku", "Tajuk buku", "text", true),
        field("namaPenulis", "Nama penulis", "text", true),
        field("kategoriBuku", "Kategori buku", "text", true),
        field("tarikhPerluDipulangkan", "Tarikh perlu dipulangkan", "date", true),
        field("tarikhPemulanganSebenar", "Tarikh pemulangan sebenar", "date", false, { adminOnly: true }),
        field("keadaanBukuSemasaDipinjam", "Keadaan buku semasa dipinjam", "select", true, { options: CONDITION_OPTIONS }),
        field("keadaanBukuSemasaDipulangkan", "Keadaan buku semasa dipulangkan", "select", false, { options: CONDITION_OPTIONS, adminOnly: true }),
        field("statusPinjaman", "Status pinjaman", "select", false, { options: LOAN_STATUSES, adminOnly: true, defaultValue: "Sedang Dipinjam" }),
        field("catatan", "Catatan", "textarea", false, { full: true, max: 500 })
      ]
    }
  };

  function basketModule(id, type, title) {
    return {
      id: id,
      prefix: type === "NILAM BM" ? "BNM" : "BNI",
      icon: type === "NILAM BM" ? "shopping-basket" : "package-open",
      title: title,
      shortTitle: type === "NILAM BM" ? "Bakul NILAM BM" : "Bakul NILAM BI",
      description: "Pinjaman bakul bacaan mengikut kelas dengan semakan kod aktif.",
      dateKey: "tarikhPinjaman",
      classKey: "tahunKelas",
      categoryKey: "jenisBakul",
      statusKey: "statusPinjaman",
      isLoan: true,
      basketType: type,
      fields: [
        field("jenisBakul", "Jenis bakul", "text", false, { computed: true, readonly: true, defaultValue: type }),
        field("kodNomborBakul", "Kod atau nombor bakul", "text", true),
        field("tarikhPinjaman", "Tarikh pinjaman", "date", true),
        field("namaGuruPeminjam", "Nama guru peminjam", "text", true),
        field("tahunKelas", "Tahun dan kelas", "text", true),
        field("bilanganBukuDalamBakul", "Bilangan buku dalam bakul", "number", true, { min: 1 }),
        field("tarikhPerluDipulangkan", "Tarikh perlu dipulangkan", "date", true),
        field("tarikhPemulanganSebenar", "Tarikh pemulangan sebenar", "date", false, { adminOnly: true }),
        field("keadaanBakulSemasaDipinjam", "Keadaan bakul semasa dipinjam", "select", true, { options: CONDITION_OPTIONS }),
        field("keadaanBakulSemasaDipulangkan", "Keadaan bakul semasa dipulangkan", "select", false, { options: CONDITION_OPTIONS, adminOnly: true }),
        field("statusPinjaman", "Status pinjaman", "select", false, { options: LOAN_STATUSES, adminOnly: true, defaultValue: "Sedang Dipinjam" }),
        field("catatan", "Catatan", "textarea", false, { full: true, max: 500 })
      ]
    };
  }

  MODULES.PINJAMAN_BAKUL_BM = basketModule("PINJAMAN_BAKUL_BM", "NILAM BM", "Rekod Pinjaman Bakul NILAM Bahasa Melayu");
  MODULES.PINJAMAN_BAKUL_BI = basketModule("PINJAMAN_BAKUL_BI", "NILAM BI", "Rekod Pinjaman Bakul NILAM Bahasa Inggeris");

  const MODULE_ORDER = [
    "PENGGUNAAN_PSS",
    "PINJAMAN_KAMUS",
    "RESENSI_TAHAP_2",
    "PINJAMAN_BUKU_GURU",
    "PINJAMAN_BUKU_MURID",
    "PINJAMAN_BAKUL_BM",
    "PINJAMAN_BAKUL_BI"
  ];

  const HOME_MODULES = [
    { id: "PENGGUNAAN_PSS" },
    { id: "PINJAMAN_KAMUS" },
    { id: "RESENSI_TAHAP_2" },
    { id: "PINJAMAN_BUKU_GURU" },
    { id: "PINJAMAN_BUKU_MURID" },
    {
      id: "PINJAMAN_BAKUL",
      icon: "shopping-basket",
      title: "Rekod Pinjaman Bakul",
      description: "Pilih Bakul NILAM Bahasa Melayu atau Bahasa Inggeris."
    }
  ];

  const state = {
    records: emptyStore(),
    admin: null,
    submitting: false,
    charts: [],
    filters: {},
    pages: {},
    installPrompt: null,
    pendingDelete: null,
    inactivityTimer: null,
    modalModule: null,
    lastSessionRefreshAt: 0
  };
  state.loginPending = false;
  state.recordsReady = false;
  state.recordsLoading = null;
  state.recordsError = "";

  function emptyStore() {
    return MODULE_ORDER.reduce(function (store, id) {
      store[id] = [];
      return store;
    }, {});
  }

  function isConfigured() {
    const sheetId = String(CONFIG.GOOGLE_SHEET_ID || "");
    const url = String(CONFIG.APPS_SCRIPT_WEB_APP_URL || "");
    return Boolean(
      sheetId &&
      url &&
      sheetId.indexOf("MASUKKAN_") === -1 &&
      url.indexOf("MASUKKAN_") === -1 &&
      /^https:\/\/script\.google\.com\//.test(url)
    );
  }

  function hasSheetId() {
    const sheetId = String(CONFIG.GOOGLE_SHEET_ID || "");
    return Boolean(sheetId && sheetId.indexOf("MASUKKAN_") === -1);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slug(value) {
    return String(value || "tiada").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function todayIso() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: CONFIG.TIME_ZONE || "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
  }

  function currentTime() {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: CONFIG.TIME_ZONE || "Asia/Kuala_Lumpur",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date());
  }

  function formatDate(value, includeTime) {
    if (!value) return "-";
    const source = /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? String(value) + "T12:00:00+08:00" : value;
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return escapeHtml(value);
    const options = {
      timeZone: CONFIG.TIME_ZONE || "Asia/Kuala_Lumpur",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    };
    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.hour12 = false;
    }
    return new Intl.DateTimeFormat("ms-MY", options).format(date);
  }

  function longDate(value) {
    if (!value) return "-";
    const date = new Date(String(value).slice(0, 10) + "T12:00:00+08:00");
    return new Intl.DateTimeFormat("ms-MY", {
      timeZone: CONFIG.TIME_ZONE || "Asia/Kuala_Lumpur",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function dayName(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("ms-MY", {
      timeZone: CONFIG.TIME_ZONE || "Asia/Kuala_Lumpur",
      weekday: "long"
    }).format(new Date(String(value).slice(0, 10) + "T12:00:00+08:00"));
  }

  function generateId(moduleId) {
    const prefix = MODULES[moduleId].prefix;
    const date = todayIso().replace(/-/g, "");
    const random = Math.random().toString(36).slice(2, 7).toUpperCase();
    return prefix + "-" + date + "-" + random;
  }

  function effectiveStatus(record, module) {
    if (!module.isLoan) return record[module.statusKey] || "";
    const status = record.statusPinjaman || "Sedang Dipinjam";
    if (
      !record.tarikhPemulanganSebenar &&
      record.tarikhPerluDipulangkan &&
      record.tarikhPerluDipulangkan < todayIso() &&
      (status === "Sedang Dipinjam" || status === "Lewat")
    ) {
      return "Lewat";
    }
    return status;
  }

  function normalizeRecord(moduleId, input, existing) {
    const module = MODULES[moduleId];
    const record = Object.assign({}, existing || {}, input || {});
    record.id = record.id || generateId(moduleId);
    record.modul = moduleId;
    record.sumberModul = module.shortTitle;
    record.statusRekod = record.statusRekod || "Aktif";
    record.createdAt = record.createdAt || nowIso();
    record.updatedAt = nowIso();
    record.actionUser = state.admin ? state.admin.username : "Pengguna Awam";
    if (moduleId === "PENGGUNAAN_PSS") {
      record.hari = dayName(record.tarikh);
      record.jumlahPengguna = Number(record.bilanganMuridLelaki || 0) + Number(record.bilanganMuridPerempuan || 0);
    }
    if (module.basketType) record.jenisBakul = module.basketType;
    if (module.isLoan) record.statusPinjaman = effectiveStatus(record, module) || "Sedang Dipinjam";
    if (moduleId === "RESENSI_TAHAP_2") {
      record.statusPengesahan = record.statusPengesahan || "Belum Disahkan";
    }
    return record;
  }

  function loadLocalStore() {
    let data;
    try {
      data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (error) {
      data = null;
    }
    const store = emptyStore();
    MODULE_ORDER.forEach(function (id) {
      store[id] = data && Array.isArray(data[id]) ? data[id] : [];
    });
    if (!data && CONFIG.DEMO_MODE_SAMPLE_DATA !== false) seedDemoData(store);
    saveLocalStore(store);
    return store;
  }

  function saveLocalStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function sampleBase(moduleId, suffix) {
    const stamp = "2026-09-10T08:00:00.000Z";
    return {
      id: MODULES[moduleId].prefix + "-CONTOH-" + suffix,
      modul: moduleId,
      sumberModul: MODULES[moduleId].shortTitle,
      statusRekod: "Aktif",
      createdAt: stamp,
      updatedAt: stamp,
      actionUser: "DATA CONTOH"
    };
  }

  function seedDemoData(store) {
    store.PENGGUNAAN_PSS.push(Object.assign(sampleBase("PENGGUNAAN_PSS", "001"), {
      tarikh: todayIso(), hari: dayName(todayIso()), masaMula: "08:00", masaTamat: "09:00",
      namaGuruPegawai: "Cikgu Contoh", kategoriPengguna: "Murid", kelasUnitKumpulan: "Tahun 5 Bestari",
      bilanganMuridLelaki: 14, bilanganMuridPerempuan: 16, jumlahPengguna: 30,
      tujuanPenggunaan: "Bacaan NILAM", namaAktiviti: "Sesi Bacaan Berpandu", catatan: "DATA CONTOH - boleh dipadam oleh admin."
    }));
    store.PINJAMAN_KAMUS.push(Object.assign(sampleBase("PINJAMAN_KAMUS", "001"), {
      tarikhPinjaman: todayIso(), namaPeminjam: "Murid Contoh", kategoriPeminjam: "Murid",
      kelasJawatan: "Tahun 6 Cemerlang", bahasaKamus: "Bahasa Melayu", tajukJenisKamus: "Kamus Dewan",
      nomborAsetKodKamus: "KMS-DEMO-01", kuantiti: 1, tarikhPerluDipulangkan: addDays(todayIso(), 7),
      keadaanSemasaDipinjam: "Baik", statusPinjaman: "Sedang Dipinjam", catatan: "DATA CONTOH"
    }));
    store.RESENSI_TAHAP_2.push(Object.assign(sampleBase("RESENSI_TAHAP_2", "001"), {
      tarikh: todayIso(), namaMurid: "Nur Contoh", tahunKelas: "Tahun 4 Amanah", tajukBuku: "Kisah di Perpustakaan",
      namaPenulis: "Penulis Contoh", penerbit: "Penerbit Contoh", bahasaBuku: "Bahasa Melayu",
      kategoriBuku: "Fiksyen", bilanganHalaman: 48, sinopsis: "DATA CONTOH: Sebuah kisah tentang persahabatan dan minat membaca.",
      nilaiMurni: "Rajin membaca dan saling membantu.", penilaianBintang: "5 bintang",
      statusPengesahan: "Belum Disahkan", catatanGuru: "DATA CONTOH"
    }));
    [
      ["PINJAMAN_BUKU_GURU", { tarikhPinjaman: todayIso(), namaGuru: "Guru Contoh", jawatanPanitia: "Panitia Sains", kodBuku: "BG-DEMO-01", tajukBuku: "Eksperimen Sains", namaPenulis: "Penulis Contoh", kategoriBuku: "Rujukan", kuantiti: 1, tarikhPerluDipulangkan: addDays(todayIso(), 14), keadaanBukuSemasaDipinjam: "Baik", statusPinjaman: "Sedang Dipinjam", catatan: "DATA CONTOH" }],
      ["PINJAMAN_BUKU_MURID", { tarikhPinjaman: todayIso(), namaMurid: "Murid Contoh", tahunKelas: "Tahun 5 Bestari", kodBuku: "BM-DEMO-01", tajukBuku: "Jejak Ilmu", namaPenulis: "Penulis Contoh", kategoriBuku: "Fiksyen", tarikhPerluDipulangkan: addDays(todayIso(), 7), keadaanBukuSemasaDipinjam: "Baik", statusPinjaman: "Sedang Dipinjam", catatan: "DATA CONTOH" }],
      ["PINJAMAN_BAKUL_BM", { jenisBakul: "NILAM BM", kodNomborBakul: "BM-DEMO-01", tarikhPinjaman: todayIso(), namaGuruPeminjam: "Guru Contoh", tahunKelas: "Tahun 4 Amanah", bilanganBukuDalamBakul: 30, tarikhPerluDipulangkan: addDays(todayIso(), 7), keadaanBakulSemasaDipinjam: "Baik", statusPinjaman: "Sedang Dipinjam", catatan: "DATA CONTOH" }],
      ["PINJAMAN_BAKUL_BI", { jenisBakul: "NILAM BI", kodNomborBakul: "BI-DEMO-01", tarikhPinjaman: todayIso(), namaGuruPeminjam: "Guru Contoh", tahunKelas: "Tahun 6 Cemerlang", bilanganBukuDalamBakul: 25, tarikhPerluDipulangkan: addDays(todayIso(), 7), keadaanBakulSemasaDipinjam: "Baik", statusPinjaman: "Sedang Dipinjam", catatan: "DATA CONTOH" }]
    ].forEach(function (entry) {
      store[entry[0]].push(Object.assign(sampleBase(entry[0], "001"), entry[1]));
    });
  }

  function addDays(iso, days) {
    const date = new Date(iso + "T12:00:00+08:00");
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  const DataService = {
    init: async function () {
      if (!isConfigured()) {
        state.records = loadLocalStore();
        return { demo: true };
      }
      return { demo: false };
    },

    request: async function (action, payload, attempt) {
      const body = Object.assign({
        action: action,
        token: state.admin && state.admin.token ? state.admin.token : ""
      }, payload || {});
      const controller = new AbortController();
      const timeout = window.setTimeout(function () { controller.abort(); }, 25000);
      try {
        const response = await fetch(CONFIG.APPS_SCRIPT_WEB_APP_URL, {
          method: "POST",
          body: JSON.stringify(body),
          redirect: "follow",
          signal: controller.signal
        });
        if (!response.ok) throw new Error("Pelayan membalas kod " + response.status + ".");
        const result = await response.json();
        if (!result || result.success !== true) {
          const apiError = new Error(result && result.message ? result.message : "Respons API tidak sah.");
          apiError.isApiError = true;
          apiError.code = result && result.error && result.error.code || "API_ERROR";
          throw apiError;
        }
        return result.data;
      } catch (error) {
        if (!attempt && !error.isApiError && error.name !== "AbortError" && action !== "login") {
          await delay(650);
          return this.request(action, payload, 1);
        }
        if (error.isApiError) throw error;
        throw new Error(error.name === "AbortError"
          ? "Pelayan mengambil masa terlalu lama. Semak internet dan cuba semula."
          : "Sambungan Google Sheets gagal. Semak internet dan cuba semula.");
      } finally {
        window.clearTimeout(timeout);
      }
    },

    add: async function (moduleId, record) {
      const normalized = normalizeRecord(moduleId, record);
      if (isConfigured()) {
        return this.request("addRecord", { module: moduleId, record: normalized });
      }
      checkLocalBasketConflict(moduleId, normalized);
      state.records[moduleId].unshift(normalized);
      saveLocalStore(state.records);
      return normalized;
    },

    getAll: async function () {
      if (isConfigured()) {
        const token = state.admin && state.admin.token;
        const data = await this.request("getAllRecords", {});
        if (!state.admin || state.admin.token !== token) return state.records;
        state.records = emptyStore();
        MODULE_ORDER.forEach(function (id) {
          state.records[id] = Array.isArray(data[id]) ? data[id] : [];
        });
      } else {
        state.records = loadLocalStore();
      }
      recalculateStatuses();
      state.recordsReady = true;
      state.recordsError = "";
      return state.records;
    },

    update: async function (moduleId, id, changes) {
      if (isConfigured()) {
        return this.request("updateRecord", { module: moduleId, id: id, record: changes });
      }
      const index = state.records[moduleId].findIndex(function (row) { return row.id === id; });
      if (index < 0) throw new Error("Rekod tidak ditemui.");
      const updated = normalizeRecord(moduleId, changes, state.records[moduleId][index]);
      checkLocalBasketConflict(moduleId, updated, id);
      state.records[moduleId][index] = updated;
      saveLocalStore(state.records);
      return updated;
    },

    remove: async function (moduleId, id) {
      if (isConfigured()) {
        return this.request("deleteRecord", { module: moduleId, id: id });
      }
      const index = state.records[moduleId].findIndex(function (row) { return row.id === id; });
      if (index < 0) throw new Error("Rekod tidak ditemui.");
      state.records[moduleId][index].statusRekod = "Dipadam";
      state.records[moduleId][index].updatedAt = nowIso();
      state.records[moduleId][index].actionUser = state.admin ? state.admin.username : "Admin Demo";
      saveLocalStore(state.records);
      return { id: id };
    },

    markReturned: async function (moduleId, id, condition) {
      if (isConfigured()) {
        return this.request("markReturned", {
          module: moduleId,
          id: id,
          returnDate: todayIso(),
          condition: condition || "Baik"
        });
      }
      const module = MODULES[moduleId];
      const row = state.records[moduleId].find(function (record) { return record.id === id; });
      if (!row) throw new Error("Rekod tidak ditemui.");
      row.tarikhPemulanganSebenar = todayIso();
      row.statusPinjaman = condition === "Rosak" ? "Rosak" : "Dipulangkan";
      const conditionField = module.fields.find(function (item) {
        return /SemasaDipulangkan$/.test(item.key);
      });
      if (conditionField) row[conditionField.key] = condition || "Baik";
      row.updatedAt = nowIso();
      row.actionUser = state.admin ? state.admin.username : "Admin Demo";
      saveLocalStore(state.records);
      return row;
    },

    login: async function (username, password) {
      if (!isConfigured()) throw new Error("Gunakan butang Admin Demo Setempat.");
      return this.request("login", { username: username, password: password });
    },

    verify: async function (token) {
      if (!isConfigured()) return Boolean(token && token.indexOf("DEMO-") === 0);
      return this.request("verifySession", { token: token });
    },

    logout: async function () {
      if (isConfigured() && state.admin && state.admin.token) {
        try {
          await this.request("logout", {});
        } catch (error) {
          console.warn(error);
        }
      }
    }
  };

  function delay(milliseconds) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, milliseconds);
    });
  }

  const scriptLoads = {};
  function loadLibrary(path) {
    if (scriptLoads[path]) return scriptLoads[path];
    scriptLoads[path] = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = path;
      script.onload = resolve;
      script.onerror = function () {
        delete scriptLoads[path];
        script.remove();
        reject(new Error("Fail sokongan tidak dapat dimuatkan. Sila cuba semula."));
      };
      document.head.appendChild(script);
    });
    return scriptLoads[path];
  }

  function checkLocalBasketConflict(moduleId, record, ignoreId) {
    if (!MODULES[moduleId].basketType) return;
    const code = String(record.kodNomborBakul || "").trim().toLowerCase();
    const conflict = state.records[moduleId].some(function (row) {
      return row.statusRekod !== "Dipadam" &&
        row.id !== ignoreId &&
        String(row.kodNomborBakul || "").trim().toLowerCase() === code &&
        effectiveStatus(row, MODULES[moduleId]) !== "Dipulangkan";
    });
    if (conflict) {
      throw new Error("Kod bakul ini masih mempunyai pinjaman aktif. Tandakan pemulangan terlebih dahulu.");
    }
  }

  function recalculateStatuses() {
    let changed = false;
    MODULE_ORDER.forEach(function (id) {
      const module = MODULES[id];
      if (!module.isLoan) return;
      state.records[id].forEach(function (row) {
        const next = effectiveStatus(row, module);
        if (row.statusPinjaman !== next) {
          row.statusPinjaman = next;
          changed = true;
        }
      });
    });
    if (changed && !isConfigured()) saveLocalStore(state.records);
  }

  function activeRows(moduleId) {
    return (state.records[moduleId] || []).filter(function (row) {
      return row.statusRekod !== "Dipadam";
    });
  }

  function persistSession(session) {
    if (!session) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function readSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  async function restoreSession() {
    const saved = readSession();
    if (!saved || !saved.token || Number(saved.expiresAt || 0) <= Date.now()) {
      persistSession(null);
      return;
    }
    try {
      const verification = await DataService.verify(saved.token);
      if (verification) {
        state.admin = Object.assign({}, saved, typeof verification === "object" ? verification : {});
        state.lastSessionRefreshAt = Date.now();
        resetInactivityTimer();
      }
    } catch (error) {
      persistSession(null);
    }
  }

  function resetInactivityTimer() {
    if (!state.admin) return;
    window.clearTimeout(state.inactivityTimer);
    const minutes = Number(CONFIG.SESSION_TIMEOUT_MINUTES || 30);
    const timeoutMs = Math.max(minutes, 1) * 60 * 1000;
    state.admin.expiresAt = Date.now() + timeoutMs;
    persistSession(state.admin);
    state.inactivityTimer = window.setTimeout(function () {
      logoutAdmin(true);
    }, timeoutMs);
    if (isConfigured() && Date.now() - state.lastSessionRefreshAt > 5 * 60 * 1000) {
      state.lastSessionRefreshAt = Date.now();
      DataService.request("verifySession", {}).then(function (session) {
        if (!state.admin) return;
        if (session && session.expiresAt) state.admin.expiresAt = session.expiresAt;
        persistSession(state.admin);
      }).catch(function (error) {
        console.warn("Sesi tidak dapat diperbaharui:", error.message);
      });
    }
  }

  async function logoutAdmin(expired) {
    const logout = DataService.logout();
    state.admin = null;
    state.records = emptyStore();
    state.recordsReady = false;
    state.recordsError = "";
    state.recordsLoading = null;
    persistSession(null);
    window.clearTimeout(state.inactivityTimer);
    location.hash = "#home";
    toast(expired ? "Sesi admin tamat kerana tidak aktif." : "Anda telah log keluar.", expired ? "warning" : "success");
    await logout;
  }

  function badgeMarkup(sizeClass) {
    return [
      '<span class="badge-frame ', sizeClass || "", '">',
      '<img data-school-badge src="', escapeHtml(CONFIG.SCHOOL_BADGE_URL || ""), '" alt="Lencana ', escapeHtml(CONFIG.SCHOOL_NAME || ""), '">',
      '<span class="badge-fallback" hidden>SKST</span>',
      "</span>"
    ].join("");
  }

  function headerMarkup() {
    return [
      '<header class="site-header">',
      '<div class="site-header__inner">',
      '<button class="brand-block" type="button" data-action="home" style="border:0;background:transparent;color:inherit;padding:0;text-align:left">',
      badgeMarkup(),
      '<span class="brand-copy">',
      '<span class="eyebrow">Sistem Pengurusan Pusat Sumber</span>',
      "<strong>EduCafe @ D&apos;Sutra</strong>",
      '<span class="school-name">', escapeHtml(CONFIG.SCHOOL_NAME || ""), "</span>",
      "</span>",
      "</button>",
      '<div class="header-actions">',
      state.admin
        ? '<button class="btn btn-ghost" type="button" data-action="admin-dashboard"><i data-lucide="layout-dashboard"></i> Dashboard</button><button class="btn btn-gold" type="button" data-action="logout"><i data-lucide="log-out"></i> Log Keluar</button>'
        : '<button class="btn btn-gold admin-login-button" type="button" data-action="login"><i data-lucide="shield-check"></i> Log Masuk Admin</button>',
      "</div>",
      "</div>",
      "</header>"
    ].join("");
  }

  function footerMarkup() {
    return [
      '<footer class="page-footer">',
      "<strong>", escapeHtml(CONFIG.SCHOOL_NAME || ""), "</strong><br>",
      "&copy; ", String(new Date().getFullYear()), " EduCafe @ D&apos;Sutra. Semua hak terpelihara.",
      "</footer>"
    ].join("");
  }

  function renderHome() {
    const notice = isConfigured() ? "" : [
      '<div class="notice" role="status"><i data-lucide="wifi-off"></i><div>',
      "<strong>", hasSheetId() ? "Sheet ID telah disediakan" : "Mod Demo Setempat sedang digunakan", "</strong>",
      hasSheetId()
        ? "URL Google Apps Script Web App belum dimasukkan. Sistem kekal dalam Mod Demo Setempat sehingga URL /exec dikonfigurasi."
        : "Sambungan Google Sheets belum dikonfigurasi. Data kini disimpan dalam localStorage peranti ini sahaja.",
      "</div></div>"
    ].join("");
    const moduleCards = HOME_MODULES.map(function (item) {
      const source = MODULES[item.id] || item;
      return [
        '<button type="button" class="module-card" data-action="open-module" data-module="', item.id, '">',
        '<span class="module-card__top"><span class="module-card__icon"><i data-lucide="', source.icon, '"></i></span><i class="module-watermark" data-lucide="', source.icon, '" aria-hidden="true"></i></span>',
        "<span>",
        "<h4>", escapeHtml(source.title), "</h4>",
        "<p>", escapeHtml(source.description), "</p>",
        "</span>",
        '<span class="module-card__meta">Buka borang <i data-lucide="arrow-right"></i></span>',
        "</button>"
      ].join("");
    }).join("");
    app.innerHTML = [
      headerMarkup(),
      '<main class="main-wrap home-page">',
      notice,
      '<section class="hero-section">',
      '<img class="welcome-art" src="assets/library-welcome.webp" alt="" width="1200" height="800" fetchpriority="high">',
      '<div class="hero-copy">',
      '<span class="welcome-label"><i data-lucide="sun" aria-hidden="true"></i> Selamat datang ke pusat sumber</span>',
      "<h2>EduCafe @ D&apos;Sutra</h2>",
      "<p>Ruang membaca, mencipta dan berkongsi ilmu.</p>",
      '<div class="hero-actions">',
      '<button class="btn btn-primary" type="button" data-action="scroll-modules"><i data-lucide="clipboard-pen-line"></i> Isi Rekod</button>',
      '<button class="btn btn-outline" type="button" data-action="login"><i data-lucide="shield-check"></i> Log Masuk Admin</button>',
      "</div>",
      "</div>",
      "</section>",
      '<section id="modulUtama">',
      '<div class="section-heading"><div><h3>Rekod pusat sumber</h3><p>Penggunaan, pinjaman dan resensi buku.</p></div><span class="module-count">6 modul</span></div>',
      '<div class="module-grid">', moduleCards, "</div>",
      "</section>",
      '<section><div class="section-heading"><div><h3>Satu aliran kerja yang jelas</h3><p>Direka untuk kegunaan harian guru, murid dan pentadbir pusat sumber.</p></div></div>',
      '<div class="feature-strip">',
      featureMarkup("file-pen-line", "Rekod pantas", "Borang tersusun dengan validasi medan wajib."),
      featureMarkup("search", "Carian tepat", "Admin boleh menapis rekod mengikut tempoh, kelas dan status."),
      featureMarkup("chart-no-axes-combined", "Analisis jelas", "Statistik dan carta membantu pemantauan penggunaan."),
      featureMarkup("file-down", "Laporan PDF", "Rumusan mengikut hari, minggu, bulan dan tahun."),
      "</div></section>",
      installPanelMarkup(),
      "</main>",
      footerMarkup()
    ].join("");
    postRender();
  }

  function featureMarkup(icon, title, description) {
    return [
      '<div class="feature-item"><i data-lucide="', icon, '"></i><strong>',
      escapeHtml(title), "</strong><span>", escapeHtml(description), "</span></div>"
    ].join("");
  }

  function installPanelMarkup() {
    return [
      '<section class="install-panel">',
      '<div><strong>Pasang EduCafe sebagai aplikasi</strong><p>Akses lebih pantas dari skrin utama telefon, tablet atau komputer.</p></div>',
      '<button class="btn btn-gold" type="button" data-action="install"><i data-lucide="download"></i> Pasang Aplikasi</button>',
      "</section>"
    ].join("");
  }

  function renderBasketChoice() {
    app.innerHTML = [
      headerMarkup(),
      '<main class="main-wrap form-page">',
      pageToolbarMarkup("Pilih Rekod Pinjaman Bakul", "Pilih kategori bahasa sebelum membuka borang.", "home"),
      '<div class="basket-choice-grid">',
      basketChoiceMarkup("PINJAMAN_BAKUL_BM", "languages", "Bakul NILAM Bahasa Melayu", "Bahan bacaan NILAM dalam Bahasa Melayu."),
      basketChoiceMarkup("PINJAMAN_BAKUL_BI", "book-open", "Bakul NILAM Bahasa Inggeris", "Bahan bacaan NILAM dalam Bahasa Inggeris."),
      "</div></main>",
      footerMarkup()
    ].join("");
    postRender();
  }

  function basketChoiceMarkup(moduleId, icon, title, description) {
    return [
      '<button type="button" class="basket-choice-card" data-action="open-module" data-module="', moduleId, '">',
      '<span class="module-card__icon"><i data-lucide="', icon, '"></i></span>',
      "<span><h3>", escapeHtml(title), "</h3><p>", escapeHtml(description), "</p></span>",
      '<span class="module-card__meta">Buka borang <i data-lucide="arrow-right"></i></span>',
      "</button>"
    ].join("");
  }

  function pageToolbarMarkup(title, description, backAction, extra) {
    return [
      '<div class="page-toolbar">',
      '<button class="btn btn-muted" type="button" data-action="', backAction || "home", '"><i data-lucide="arrow-left"></i> Kembali</button>',
      '<div class="page-title-block"><h2>', escapeHtml(title), "</h2><p>", escapeHtml(description || ""), "</p></div>",
      extra || "<span></span>",
      "</div>"
    ].join("");
  }

  function getDraft(moduleId) {
    try {
      return JSON.parse(localStorage.getItem(DRAFT_PREFIX + moduleId) || "null");
    } catch (error) {
      return null;
    }
  }

  function initialFormRecord(moduleId, existing) {
    if (existing) return Object.assign({}, existing);
    const draft = getDraft(moduleId);
    if (draft) return Object.assign({}, draft);
    const record = { id: generateId(moduleId) };
    MODULES[moduleId].fields.forEach(function (item) {
      if (item.defaultValue != null) record[item.key] = item.defaultValue;
    });
    const dateField = MODULES[moduleId].dateKey;
    record[dateField] = todayIso();
    if (moduleId === "PENGGUNAAN_PSS") {
      record.hari = dayName(todayIso());
      record.jumlahPengguna = 0;
      record.masaMula = currentTime();
    }
    return record;
  }

  function renderForm(moduleId, recordId) {
    const module = MODULES[moduleId];
    if (!module) return renderNotFound();
    const editing = Boolean(recordId);
    if (editing && !state.admin) {
      location.hash = "#login";
      return;
    }
    const existing = editing ? activeRows(moduleId).find(function (row) { return row.id === recordId; }) : null;
    if (editing && !existing) return renderNotFound();
    const record = initialFormRecord(moduleId, existing);
    const draftNotice = !editing && getDraft(moduleId)
      ? '<div class="notice"><i data-lucide="file-clock"></i><div><strong>Draf dipulihkan</strong>Maklumat yang belum dihantar telah dimuatkan semula.</div></div>'
      : "";
    const fields = module.fields.filter(function (item) {
      return state.admin || !item.adminOnly;
    }).map(function (item) {
      return formFieldMarkup(item, record[item.key]);
    }).join("");
    const backAction = state.admin ? "admin-module" : (module.basketType ? "basket-choice" : "home");
    const backData = state.admin ? ' data-module="' + moduleId + '"' : "";
    const pdfButton = state.admin
      ? '<button class="btn btn-outline" type="button" data-action="pdf" data-module="' + moduleId + '"><i data-lucide="file-down"></i> Jana Rumusan PDF</button>'
      : "";
    app.innerHTML = [
      headerMarkup(),
      '<main class="main-wrap form-page">',
      '<div class="page-toolbar"><button class="btn btn-muted" type="button" data-action="', backAction, '"', backData, '><i data-lucide="arrow-left"></i> Kembali</button>',
      '<div class="page-title-block"><h2>', editing ? "Edit " : "", escapeHtml(module.title), '</h2><p>ID rekod dijana secara automatik dan setiap medan wajib ditandakan.</p></div>',
      pdfButton,
      "</div>",
      draftNotice,
      '<form class="record-form" id="recordForm" data-module="', moduleId, '" data-record-id="', editing ? escapeHtml(recordId) : "", '" novalidate>',
      '<div class="form-grid">',
      formFieldMarkup(field("id", "ID rekod", "text", false, { readonly: true }), record.id),
      fields,
      "</div>",
      '<div class="form-actions">',
      !editing ? '<button class="btn btn-muted" type="button" data-action="clear-form"><i data-lucide="eraser"></i> Kosongkan</button>' : "",
      '<button class="btn btn-primary" type="submit" data-action="submit-record"><i data-lucide="send"></i> ', editing ? "Simpan Perubahan" : "Hantar Rekod", "</button>",
      "</div></form></main>",
      footerMarkup()
    ].join("");
    postRender();
    updateComputedFields(document.getElementById("recordForm"));
  }

  function formFieldMarkup(item, value) {
    const classes = item.full ? "field full" : "field";
    const required = item.required ? " required" : "";
    const readonly = item.readonly ? " readonly" : "";
    const max = item.max ? ' maxlength="' + item.max + '"' : "";
    const min = item.min != null ? ' min="' + item.min + '"' : "";
    const placeholder = item.placeholder ? ' placeholder="' + escapeHtml(item.placeholder) + '"' : "";
    let control;
    if (item.type === "select") {
      const options = ['<option value="">Pilih...</option>'].concat((item.options || []).map(function (option) {
        const selected = String(value || "") === option ? " selected" : "";
        return '<option value="' + escapeHtml(option) + '"' + selected + ">" + escapeHtml(option) + "</option>";
      })).join("");
      control = '<select id="field-' + item.key + '" name="' + item.key + '"' + required + ">" + options + "</select>";
    } else if (item.type === "textarea") {
      control = '<textarea id="field-' + item.key + '" name="' + item.key + '"' + required + max + placeholder + ">" + escapeHtml(value || "") + "</textarea>";
    } else {
      control = '<input id="field-' + item.key + '" name="' + item.key + '" type="' + item.type + '" value="' + escapeHtml(value == null ? "" : value) + '"' + required + readonly + max + min + placeholder + ">";
    }
    const help = item.counter
      ? '<span class="field-help"><span>Maksimum ' + item.max + ' aksara</span><span data-counter-for="' + item.key + '">' + String(value || "").length + "/" + item.max + "</span></span>"
      : "";
    return [
      '<div class="', classes, '">',
      '<label for="field-', item.key, '">', escapeHtml(item.label), item.required ? ' <span class="required-dot">*</span>' : "", "</label>",
      control,
      help,
      '<span class="field-error" data-error-for="', item.key, '"></span>',
      "</div>"
    ].join("");
  }

  function renderLogin() {
    if (state.admin) {
      location.hash = "#admin/dashboard";
      return;
    }
    const modeNotice = isConfigured()
      ? '<div class="notice"><i data-lucide="lock-keyhole"></i><div><strong>Pengesahan selamat</strong>Kelayakan log masuk dihantar terus ke Google Apps Script dan tidak disimpan pada pelayar.</div></div>'
      : '<div class="notice"><i data-lucide="wifi-off"></i><div><strong>' + (hasSheetId() ? "Sheet ID tersedia, URL Web App belum dimasukkan" : "Google Apps Script belum dikonfigurasi") + '</strong>Gunakan akses Admin Demo Setempat untuk menguji fungsi pentadbiran. Kelayakan produksi tidak digunakan dalam mod ini.</div></div>';
    const loginControls = isConfigured()
      ? [
          '<form id="loginForm" novalidate>',
          '<div class="field"><label for="adminUsername">Nama pengguna <span class="required-dot">*</span></label><input id="adminUsername" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required><span class="field-error" data-error-for="username"></span></div>',
          '<div class="field" style="margin-top:1rem"><label for="adminPassword">Kata laluan <span class="required-dot">*</span></label><div class="password-control"><input id="adminPassword" name="password" type="password" autocomplete="current-password" aria-describedby="loginFeedback" required><button type="button" class="password-toggle" data-action="toggle-password" aria-label="Tunjukkan kata laluan" title="Tunjukkan kata laluan" aria-pressed="false"><i data-lucide="eye"></i></button></div><span class="field-error" data-error-for="password"></span></div>',
          '<div id="loginFeedback" class="login-feedback" role="status" aria-live="polite" aria-atomic="true" hidden></div>',
          '<div class="form-actions"><button class="btn btn-primary" type="submit" data-action="submit-login"><i data-lucide="log-in"></i> Log Masuk Admin</button></div>',
          "</form>"
        ].join("")
      : '<button class="btn btn-primary" type="button" data-action="demo-login" style="width:100%"><i data-lucide="flask-conical"></i> Masuk Admin Demo Setempat</button>';
    app.innerHTML = [
      headerMarkup(),
      '<main class="login-page"><div class="main-wrap login-layout">',
      '<section class="login-copy"><span class="welcome-label"><i data-lucide="library"></i> EduCafe @ D\'Sutra</span><h2>Selamat kembali, warga pendidik.</h2><img class="login-art" src="assets/library-welcome.webp" width="1200" height="800" alt="Sudut bacaan dengan buku dan rak perpustakaan berwarna-warni"></section>',
      '<section class="login-card">',
      '<div class="login-card__head">', badgeMarkup(), '<div><h3>Log Masuk Admin</h3><p>', escapeHtml(CONFIG.SCHOOL_NAME || ""), "</p></div></div>",
      modeNotice,
      loginControls,
      '<div class="form-actions" style="justify-content:flex-start"><button class="btn btn-muted" type="button" data-action="home"><i data-lucide="arrow-left"></i> Halaman Utama</button></div>',
      "</section></div></main>",
      footerMarkup()
    ].join("");
    postRender();
  }

  function sidebarMarkup(activeId) {
    const links = [
      '<button type="button" data-action="admin-dashboard" class="' + (activeId === "dashboard" ? "active" : "") + '"><i data-lucide="layout-dashboard"></i> Dashboard Analisis</button>'
    ];
    MODULE_ORDER.forEach(function (id) {
      const module = MODULES[id];
      links.push(
        '<button type="button" data-action="admin-module" data-module="' + id + '" class="' + (activeId === id ? "active" : "") + '"><i data-lucide="' + module.icon + '"></i> ' + escapeHtml(module.shortTitle) + "</button>"
      );
    });
    return [
      '<aside class="admin-sidebar"><h2>Menu Pentadbiran</h2><nav class="admin-nav">',
      links.join(""),
      '<button type="button" data-action="home"><i data-lucide="house"></i> Halaman Utama</button>',
      '<button type="button" data-action="logout"><i data-lucide="log-out"></i> Log Keluar</button>',
      "</nav></aside>"
    ].join("");
  }

  function mobileAdminNavMarkup(activeId) {
    return [
      '<nav class="mobile-admin-nav" aria-label="Navigasi admin telefon">',
      '<button type="button" data-action="admin-dashboard" class="', activeId === "dashboard" ? "active" : "", '"><i data-lucide="layout-dashboard"></i><span>Dashboard</span></button>',
      '<button type="button" data-action="admin-modules-menu"><i data-lucide="table-properties"></i><span>Rekod</span></button>',
      '<button type="button" data-action="home"><i data-lucide="house"></i><span>Utama</span></button>',
      '<button type="button" data-action="logout"><i data-lucide="log-out"></i><span>Keluar</span></button>',
      "</nav>"
    ].join("");
  }

  function adminShellMarkup(activeId, title, description, content, actions) {
    return [
      headerMarkup(),
      '<div class="admin-shell">',
      sidebarMarkup(activeId),
      '<main class="admin-main">',
      '<div class="admin-topbar"><div><h2>', escapeHtml(title), "</h2><p>", escapeHtml(description), '</p></div><div class="admin-actions">', actions || "", "</div></div>",
      !isConfigured() ? '<div class="notice"><i data-lucide="database"></i><div><strong>Admin Demo Setempat</strong>Data contoh dan perubahan disimpan dalam localStorage pelayar ini.</div></div>' : "",
      content,
      "</main></div>",
      mobileAdminNavMarkup(activeId)
    ].join("");
  }

  function dashboardMetrics(period) {
    function rowsFor(id) {
      return period ? recordsForPeriod(id, period) : activeRows(id);
    }
    const allLoans = MODULE_ORDER.filter(function (id) { return MODULES[id].isLoan; }).reduce(function (rows, id) {
      return rows.concat(rowsFor(id).map(function (row) {
        return Object.assign({ _module: id }, row, { _status: effectiveStatus(row, MODULES[id]) });
      }));
    }, []);
    const usage = rowsFor("PENGGUNAAN_PSS");
    return [
      { label: "Penggunaan pusat sumber", value: usage.length, icon: "library" },
      { label: "Jumlah pengguna pusat sumber", value: sumBy(usage, "jumlahPengguna"), icon: "users" },
      { label: "Pinjaman kamus", value: rowsFor("PINJAMAN_KAMUS").length, icon: "languages" },
      { label: "Resensi Tahap 2", value: rowsFor("RESENSI_TAHAP_2").length, icon: "book-heart" },
      { label: "Pinjaman buku guru", value: rowsFor("PINJAMAN_BUKU_GURU").length, icon: "book-open-check" },
      { label: "Pinjaman buku murid", value: rowsFor("PINJAMAN_BUKU_MURID").length, icon: "book-user" },
      { label: "Bakul NILAM BM", value: rowsFor("PINJAMAN_BAKUL_BM").length, icon: "shopping-basket" },
      { label: "Bakul NILAM BI", value: rowsFor("PINJAMAN_BAKUL_BI").length, icon: "package-open" },
      { label: "Pinjaman aktif", value: allLoans.filter(function (row) { return row._status === "Sedang Dipinjam"; }).length, icon: "clock-3" },
      { label: "Pinjaman lewat", value: allLoans.filter(function (row) { return row._status === "Lewat"; }).length, icon: "alarm-clock" },
      { label: "Rosak atau hilang", value: allLoans.filter(function (row) { return row._status === "Rosak" || row._status === "Hilang"; }).reduce(function (total, row) {
        if (row._module === "PINJAMAN_KAMUS" || row._module === "PINJAMAN_BUKU_GURU") return total + Number(row.kuantiti || 1);
        return total + 1;
      }, 0), icon: "triangle-alert" }
    ];
  }

  function sumBy(rows, key) {
    return rows.reduce(function (total, row) {
      return total + Number(row[key] || 0);
    }, 0);
  }

  function renderAdminDashboard() {
    if (!requireAdmin()) return;
    const metrics = dashboardMetrics();
    const cards = metrics.map(function (item) {
      return [
        '<article class="stats-card"><span class="stat-icon"><i data-lucide="', item.icon, '"></i></span>',
        '<strong class="stat-number" data-target="', item.value, '">', item.value, "</strong><span>", escapeHtml(item.label), "</span></article>"
      ].join("");
    }).join("");
    const charts = [
      ["chartUsageMonth", "Penggunaan pusat sumber mengikut bulan"],
      ["chartUsageClass", "Penggunaan mengikut kelas"],
      ["chartReviewsYear", "Resensi Tahun 4, Tahun 5 dan Tahun 6"],
      ["chartLoansCategory", "Pinjaman mengikut kategori"],
      ["chartBaskets", "Bakul NILAM BM berbanding BI"],
      ["chartLoanStatus", "Status pinjaman aktif, dipulangkan dan lewat"]
    ].map(function (item) {
      return '<section class="chart-panel"><h3>' + escapeHtml(item[1]) + '</h3><div class="chart-box"><canvas id="' + item[0] + '"></canvas></div></section>';
    }).join("");
    const actions = [
      '<button class="btn btn-primary" type="button" data-action="pdf" data-module="ALL"><i data-lucide="file-down"></i> Rumusan Keseluruhan</button>',
      '<button class="btn btn-muted" type="button" data-action="refresh-admin"><i data-lucide="refresh-cw"></i> Segar Semula</button>'
    ].join("");
    app.innerHTML = adminShellMarkup(
      "dashboard",
      "Dashboard Analisis",
      "Gambaran keseluruhan operasi Pusat Sumber EduCafe.",
      '<section class="stats-grid">' + cards + '</section><section class="charts-grid">' + charts + "</section>",
      actions
    );
    postRender();
    window.setTimeout(renderCharts, 60);
    window.setTimeout(animateStats, 80);
  }

  function requireAdmin() {
    if (state.admin) return true;
    location.hash = "#login";
    toast("Sila log masuk sebagai admin untuk meneruskan.", "warning");
    return false;
  }

  const TABLE_FIELDS = {
    PENGGUNAAN_PSS: ["tarikh", "namaGuruPegawai", "kelasUnitKumpulan", "jumlahPengguna", "tujuanPenggunaan"],
    PINJAMAN_KAMUS: ["tarikhPinjaman", "namaPeminjam", "kelasJawatan", "bahasaKamus", "tarikhPerluDipulangkan"],
    RESENSI_TAHAP_2: ["tarikh", "namaMurid", "tahunKelas", "tajukBuku", "penilaianBintang"],
    PINJAMAN_BUKU_GURU: ["tarikhPinjaman", "namaGuru", "jawatanPanitia", "tajukBuku", "tarikhPerluDipulangkan"],
    PINJAMAN_BUKU_MURID: ["tarikhPinjaman", "namaMurid", "tahunKelas", "tajukBuku", "tarikhPerluDipulangkan"],
    PINJAMAN_BAKUL_BM: ["tarikhPinjaman", "kodNomborBakul", "namaGuruPeminjam", "tahunKelas", "bilanganBukuDalamBakul"],
    PINJAMAN_BAKUL_BI: ["tarikhPinjaman", "kodNomborBakul", "namaGuruPeminjam", "tahunKelas", "bilanganBukuDalamBakul"]
  };

  function defaultFilters() {
    return { search: "", dateStart: "", dateEnd: "", classValue: "", category: "", status: "", sort: "desc" };
  }

  function getFilteredRows(moduleId) {
    const module = MODULES[moduleId];
    const filters = state.filters[moduleId] || defaultFilters();
    const query = filters.search.toLowerCase();
    const rows = activeRows(moduleId).filter(function (row) {
      const searchable = Object.keys(row).map(function (key) { return String(row[key] == null ? "" : row[key]); }).join(" ").toLowerCase();
      const date = String(row[module.dateKey] || "").slice(0, 10);
      const status = module.statusKey ? effectiveStatus(row, module) : "";
      return (!query || searchable.indexOf(query) >= 0) &&
        (!filters.dateStart || date >= filters.dateStart) &&
        (!filters.dateEnd || date <= filters.dateEnd) &&
        (!filters.classValue || String(row[module.classKey] || "") === filters.classValue) &&
        (!filters.category || String(row[module.categoryKey] || "") === filters.category) &&
        (!filters.status || status === filters.status);
    });
    rows.sort(function (a, b) {
      const first = String(a[module.dateKey] || a.updatedAt || "");
      const second = String(b[module.dateKey] || b.updatedAt || "");
      return filters.sort === "asc" ? first.localeCompare(second) : second.localeCompare(first);
    });
    return rows;
  }

  function distinctValues(rows, key) {
    if (!key) return [];
    return Array.from(new Set(rows.map(function (row) { return String(row[key] || "").trim(); }).filter(Boolean))).sort();
  }

  function optionList(values, selected, emptyLabel) {
    return ['<option value="">' + escapeHtml(emptyLabel) + "</option>"].concat(values.map(function (value) {
      return '<option value="' + escapeHtml(value) + '"' + (value === selected ? " selected" : "") + ">" + escapeHtml(value) + "</option>";
    })).join("");
  }

  function renderAdminModule(moduleId) {
    if (!requireAdmin()) return;
    const module = MODULES[moduleId];
    if (!module) return renderNotFound();
    state.filters[moduleId] = state.filters[moduleId] || defaultFilters();
    const filters = state.filters[moduleId];
    const baseRows = activeRows(moduleId);
    const rows = getFilteredRows(moduleId);
    const perPage = 10;
    const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
    state.pages[moduleId] = Math.min(Math.max(state.pages[moduleId] || 1, 1), totalPages);
    const page = state.pages[moduleId];
    const pageRows = rows.slice((page - 1) * perPage, page * perPage);
    const tableFields = TABLE_FIELDS[moduleId];
    const headers = tableFields.map(function (key) {
      const item = module.fields.find(function (candidate) { return candidate.key === key; });
      return "<th>" + escapeHtml(item ? item.label : key) + "</th>";
    }).join("");
    const body = pageRows.length ? pageRows.map(function (row) {
      const cells = tableFields.map(function (key) {
        const item = module.fields.find(function (candidate) { return candidate.key === key; });
        return "<td>" + displayFieldValue(item, row[key]) + "</td>";
      }).join("");
      const status = module.statusKey ? effectiveStatus(row, module) : row.statusRekod;
      const returnButton = module.isLoan && status !== "Dipulangkan" && status !== "Hilang"
        ? '<button class="btn btn-outline icon-btn" type="button" title="Tandakan dipulangkan" data-action="return" data-module="' + moduleId + '" data-id="' + escapeHtml(row.id) + '"><i data-lucide="undo-2"></i></button>'
        : "";
      return [
        "<tr><td><strong>", escapeHtml(row.id), "</strong><br><small>", formatDate(row.updatedAt, true), "</small></td>",
        cells,
        '<td><span class="status-pill status-', slug(status), '">', escapeHtml(status || "Aktif"), "</span></td>",
        '<td><div class="row-actions">',
        '<button class="btn btn-muted icon-btn" type="button" title="Lihat rekod" data-action="view" data-module="', moduleId, '" data-id="', escapeHtml(row.id), '"><i data-lucide="eye"></i></button>',
        '<button class="btn btn-outline icon-btn" type="button" title="Edit rekod" data-action="edit" data-module="', moduleId, '" data-id="', escapeHtml(row.id), '"><i data-lucide="pencil"></i></button>',
        returnButton,
        '<button class="btn btn-danger icon-btn" type="button" title="Padam rekod" data-action="delete" data-module="', moduleId, '" data-id="', escapeHtml(row.id), '"><i data-lucide="trash-2"></i></button>',
        "</div></td></tr>"
      ].join("");
    }).join("") : '<tr><td colspan="' + (tableFields.length + 3) + '"><div class="empty-state"><i data-lucide="inbox"></i><strong>Tiada rekod ditemui</strong><span>Ubah penapis atau tambah rekod baharu.</span></div></td></tr>';
    const filterPanel = [
      '<form id="filterForm" class="filter-panel" data-module="', moduleId, '">',
      '<label>Carian<input name="search" type="search" value="', escapeHtml(filters.search), '" placeholder="ID, nama, tajuk..."></label>',
      '<label>Tarikh mula<input name="dateStart" type="date" value="', escapeHtml(filters.dateStart), '"></label>',
      '<label>Tarikh akhir<input name="dateEnd" type="date" value="', escapeHtml(filters.dateEnd), '"></label>',
      '<label>Kelas<select name="classValue">', optionList(distinctValues(baseRows, module.classKey), filters.classValue, "Semua kelas"), "</select></label>",
      '<label>Kategori<select name="category">', optionList(distinctValues(baseRows, module.categoryKey), filters.category, "Semua kategori"), "</select></label>",
      '<label>Status<select name="status">', optionList(distinctValues(baseRows.map(function (row) {
        const clone = Object.assign({}, row);
        clone.__status = module.statusKey ? effectiveStatus(row, module) : row.statusRekod;
        return clone;
      }), "__status"), filters.status, "Semua status"), "</select></label>",
      '<label>Susunan<select name="sort"><option value="desc"', filters.sort === "desc" ? " selected" : "", '>Terbaharu dahulu</option><option value="asc"', filters.sort === "asc" ? " selected" : "", ">Terdahulu dahulu</option></select></label>",
      '<div class="filter-inline"><button class="btn btn-primary" type="submit" data-action="apply-filter"><i data-lucide="list-filter"></i> Tapis</button><button class="btn btn-muted" type="button" data-action="reset-filter" data-module="', moduleId, '" title="Kosongkan penapis"><i data-lucide="rotate-ccw"></i></button></div>',
      "</form>"
    ].join("");
    const table = [
      '<section class="table-panel"><div class="table-scroll"><table class="data-table"><thead><tr><th>ID / dikemas kini</th>',
      headers, "<th>Status</th><th>Tindakan</th></tr></thead><tbody>", body, "</tbody></table></div>",
      '<div class="table-footer"><span>Memaparkan ', pageRows.length, " daripada ", rows.length, " rekod</span>",
      '<div class="row-actions"><button class="btn btn-muted icon-btn" type="button" title="Halaman sebelumnya" data-action="page" data-module="', moduleId, '" data-page="', page - 1, '"', page <= 1 ? " disabled" : "", '><i data-lucide="chevron-left"></i></button>',
      '<span class="status-pill">Halaman ', page, " / ", totalPages, "</span>",
      '<button class="btn btn-muted icon-btn" type="button" title="Halaman seterusnya" data-action="page" data-module="', moduleId, '" data-page="', page + 1, '"', page >= totalPages ? " disabled" : "", '><i data-lucide="chevron-right"></i></button></div></div></section>'
    ].join("");
    const actions = [
      '<button class="btn btn-primary" type="button" data-action="open-module" data-module="', moduleId, '"><i data-lucide="plus"></i> Tambah Rekod</button>',
      '<button class="btn btn-outline" type="button" data-action="pdf" data-module="', moduleId, '"><i data-lucide="file-down"></i> Jana Rumusan PDF</button>'
    ].join("");
    app.innerHTML = adminShellMarkup(moduleId, module.title, rows.length + " rekod sepadan dengan paparan semasa.", filterPanel + table, actions);
    postRender();
  }

  function displayFieldValue(item, value) {
    if (value == null || value === "") return "-";
    if (item && item.type === "date") return escapeHtml(formatDate(value, false));
    if (item && item.type === "textarea") {
      const short = String(value).length > 90 ? String(value).slice(0, 87) + "..." : String(value);
      return escapeHtml(short);
    }
    return escapeHtml(value);
  }

  async function renderCharts() {
    try {
      if (!window.Chart) await loadLibrary("assets/vendor/chart-4.4.7.min.js");
    } catch (error) {
      toast(error.message, "error");
    }
    if (!state.admin || !document.getElementById("chartUsageMonth")) return;
    state.charts.forEach(function (chart) { chart.destroy(); });
    state.charts = [];
    if (!window.Chart) {
      document.querySelectorAll(".chart-box").forEach(function (box) {
        box.innerHTML = '<div class="empty-state"><i data-lucide="chart-no-axes-combined"></i><span>Perpustakaan carta tidak dapat dimuatkan.</span></div>';
      });
      postRender();
      return;
    }
    const usage = activeRows("PENGGUNAAN_PSS");
    const currentYear = todayIso().slice(0, 4);
    const byMonth = Array(12).fill(0);
    usage.forEach(function (row) {
      const date = String(row.tarikh || "");
      if (date.slice(0, 4) === currentYear) byMonth[Number(date.slice(5, 7)) - 1] += 1;
    });
    const byClass = countBy(usage, function (row) { return row.kelasUnitKumpulan || "Tidak dinyatakan"; });
    const reviews = activeRows("RESENSI_TAHAP_2");
    const reviewCounts = [4, 5, 6].map(function (year) {
      return reviews.filter(function (row) { return new RegExp("Tahun\\s*" + year, "i").test(row.tahunKelas || ""); }).length;
    });
    const loanModules = ["PINJAMAN_KAMUS", "PINJAMAN_BUKU_GURU", "PINJAMAN_BUKU_MURID", "PINJAMAN_BAKUL_BM", "PINJAMAN_BAKUL_BI"];
    const loanCounts = loanModules.map(function (id) { return activeRows(id).length; });
    const allLoans = loanModules.reduce(function (all, id) {
      return all.concat(activeRows(id).map(function (row) { return effectiveStatus(row, MODULES[id]); }));
    }, []);
    createChart("chartUsageMonth", "line", BM_MONTHS.map(function (name) { return name.slice(0, 3); }), byMonth, "Bilangan penggunaan", ["#0f766e"], true);
    const classEntries = Object.entries(byClass).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8);
    createChart("chartUsageClass", "bar", classEntries.map(function (item) { return item[0]; }), classEntries.map(function (item) { return item[1]; }), "Rekod", ["#14b8a6", "#f59e0b", "#38bdf8", "#fb7185"]);
    createChart("chartReviewsYear", "bar", ["Tahun 4", "Tahun 5", "Tahun 6"], reviewCounts, "Resensi", ["#0f766e", "#f59e0b", "#38bdf8"]);
    createChart("chartLoansCategory", "doughnut", loanModules.map(function (id) { return MODULES[id].shortTitle; }), loanCounts, "Pinjaman", ["#0f766e", "#f59e0b", "#38bdf8", "#14b8a6", "#fb7185"]);
    createChart("chartBaskets", "bar", ["NILAM BM", "NILAM BI"], [activeRows("PINJAMAN_BAKUL_BM").length, activeRows("PINJAMAN_BAKUL_BI").length], "Pinjaman bakul", ["#0f766e", "#f59e0b"]);
    createChart("chartLoanStatus", "doughnut", ["Aktif", "Dipulangkan", "Lewat"], [
      allLoans.filter(function (status) { return status === "Sedang Dipinjam"; }).length,
      allLoans.filter(function (status) { return status === "Dipulangkan"; }).length,
      allLoans.filter(function (status) { return status === "Lewat"; }).length
    ], "Status", ["#38bdf8", "#15803d", "#f59e0b"]);
  }

  function countBy(rows, getter) {
    return rows.reduce(function (counts, row) {
      const key = getter(row);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }

  function createChart(id, type, labels, values, label, colors, fill) {
    const element = document.getElementById(id);
    if (!element) return;
    if (!labels.length) {
      element.parentElement.innerHTML = '<div class="empty-state"><i data-lucide="chart-no-axes-combined"></i><span>Belum ada data untuk carta ini.</span></div>';
      return;
    }
    const colorList = labels.map(function (_, index) { return colors[index % colors.length]; });
    const chart = new window.Chart(element, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: values,
          borderColor: type === "line" ? colors[0] : colorList,
          backgroundColor: type === "line" ? "rgba(20,184,166,0.18)" : colorList,
          fill: Boolean(fill),
          tension: 0.32,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { duration: 500 },
        plugins: { legend: { display: type === "doughnut", position: "bottom" } },
        scales: type === "doughnut" ? {} : { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
    state.charts.push(chart);
  }

  function animateStats() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".stat-number").forEach(function (element) {
      const target = Number(element.dataset.target || 0);
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / 500, 1);
        element.textContent = Math.round(target * progress);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  function renderLoading(message) {
    app.innerHTML = [
      headerMarkup(),
      '<main class="main-wrap"><div class="loading-state"><span class="loading-spinner"></span><strong>',
      escapeHtml(message || "Memuatkan data..."), "</strong><span>Sila tunggu sebentar.</span></div></main>"
    ].join("");
    postRender();
  }

  function renderNotFound() {
    app.innerHTML = [
      headerMarkup(),
      '<main class="main-wrap"><div class="empty-state"><i data-lucide="file-question"></i><strong>Halaman atau rekod tidak ditemui</strong><button class="btn btn-primary" type="button" data-action="home">Kembali ke Halaman Utama</button></div></main>',
      footerMarkup()
    ].join("");
    postRender();
  }

  function postRender() {
    document.querySelectorAll("[data-school-badge]").forEach(function (image) {
      function useFallback() {
        image.hidden = true;
        if (image.nextElementSibling) image.nextElementSibling.hidden = false;
      }
      image.addEventListener("error", useFallback, { once: true });
      if (image.complete && image.naturalWidth === 0) useFallback();
    });
    if (window.lucide) window.lucide.createIcons();
  }

  function updateComputedFields(form) {
    if (!form) return;
    const moduleId = form.dataset.module;
    if (moduleId === "PENGGUNAAN_PSS") {
      const date = form.elements.tarikh;
      const day = form.elements.hari;
      const boys = form.elements.bilanganMuridLelaki;
      const girls = form.elements.bilanganMuridPerempuan;
      const total = form.elements.jumlahPengguna;
      if (date && day) day.value = dayName(date.value);
      if (total) total.value = Number(boys && boys.value || 0) + Number(girls && girls.value || 0);
    }
  }

  function saveDraftFromForm(form) {
    if (!form || form.dataset.recordId) return;
    const data = Object.fromEntries(new FormData(form).entries());
    updateComputedFields(form);
    if (form.elements.hari) data.hari = form.elements.hari.value;
    if (form.elements.jumlahPengguna) data.jumlahPengguna = form.elements.jumlahPengguna.value;
    localStorage.setItem(DRAFT_PREFIX + form.dataset.module, JSON.stringify(data));
  }

  function validateRecordForm(form, data) {
    const module = MODULES[form.dataset.module];
    let valid = true;
    form.querySelectorAll("[data-error-for]").forEach(function (item) { item.textContent = ""; });
    module.fields.filter(function (item) { return state.admin || !item.adminOnly; }).forEach(function (item) {
      const control = form.elements[item.key];
      if (!control) return;
      const value = String(data[item.key] == null ? "" : data[item.key]).trim();
      let message = "";
      if (item.required && !value) message = "Medan ini wajib diisi.";
      if (!message && item.max && value.length > item.max) message = "Had maksimum ialah " + item.max + " aksara.";
      if (!message && item.type === "number" && value && item.min != null && Number(value) < item.min) message = "Nilai minimum ialah " + item.min + ".";
      if (message) {
        const error = form.querySelector('[data-error-for="' + item.key + '"]');
        if (error) error.textContent = message;
        control.setAttribute("aria-invalid", "true");
        valid = false;
      } else {
        control.removeAttribute("aria-invalid");
      }
    });
    if (form.dataset.module === "RESENSI_TAHAP_2" && data.tahunKelas && !/Tahun\s*[456]/i.test(data.tahunKelas)) {
      setFieldError(form, "tahunKelas", "Modul ini hanya untuk murid Tahun 4, Tahun 5 atau Tahun 6.");
      valid = false;
    }
    if (module.isLoan && data.tarikhPinjaman && data.tarikhPerluDipulangkan && data.tarikhPerluDipulangkan < data.tarikhPinjaman) {
      setFieldError(form, "tarikhPerluDipulangkan", "Tarikh pemulangan tidak boleh lebih awal daripada tarikh pinjaman.");
      valid = false;
    }
    if (form.dataset.module === "PENGGUNAAN_PSS" && data.masaMula && data.masaTamat && data.masaTamat <= data.masaMula) {
      setFieldError(form, "masaTamat", "Masa tamat mestilah selepas masa mula.");
      valid = false;
    }
    if (!valid) {
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
    }
    return valid;
  }

  function setFieldError(form, key, message) {
    const control = form.elements[key];
    const error = form.querySelector('[data-error-for="' + key + '"]');
    if (control) control.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
  }

  async function handleRecordSubmit(form) {
    if (state.submitting) return;
    updateComputedFields(form);
    const data = Object.fromEntries(new FormData(form).entries());
    if (form.elements.hari) data.hari = form.elements.hari.value;
    if (form.elements.jumlahPengguna) data.jumlahPengguna = form.elements.jumlahPengguna.value;
    if (!validateRecordForm(form, data)) {
      toast("Sila semak medan yang ditandakan.", "error");
      return;
    }
    const submit = form.querySelector('[type="submit"]');
    state.submitting = true;
    if (submit) {
      submit.disabled = true;
      submit.innerHTML = '<span class="loading-spinner small"></span> Menyimpan...';
    }
    try {
      const moduleId = form.dataset.module;
      if (form.dataset.recordId) {
        await DataService.update(moduleId, form.dataset.recordId, data);
        toast("Rekod berjaya dikemas kini.", "success");
        await DataService.getAll();
        location.hash = "#admin/module/" + moduleId;
      } else {
        const saved = await DataService.add(moduleId, data);
        localStorage.removeItem(DRAFT_PREFIX + moduleId);
        toast("Rekod berjaya dihantar.", "success");
        showSuccessModal(moduleId, saved && saved.id ? saved.id : data.id);
        renderForm(moduleId);
      }
    } catch (error) {
      saveDraftFromForm(form);
      toast(error.message || "Rekod gagal disimpan.", "error");
      if (submit) {
        submit.disabled = false;
        submit.innerHTML = '<i data-lucide="send"></i> Cuba Semula';
        postRender();
      }
    } finally {
      state.submitting = false;
    }
  }

  function showLoginFeedback(form, message, type) {
    const feedback = form.querySelector("#loginFeedback");
    if (!feedback) return;
    feedback.hidden = !message;
    feedback.className = "login-feedback " + (type || "");
    feedback.textContent = message;
  }

  async function handleLoginSubmit(form) {
    if (state.loginPending) return;
    const values = Object.fromEntries(new FormData(form).entries());
    values.username = String(values.username || "").trim();
    setFieldError(form, "username", "");
    setFieldError(form, "password", "");
    if (!values.username || !values.password) {
      if (!values.username) setFieldError(form, "username", "Nama pengguna diperlukan.");
      if (!values.password) setFieldError(form, "password", "Kata laluan diperlukan.");
      return;
    }
    state.loginPending = true;
    const button = form.querySelector('[type="submit"]');
    const originalButton = button && button.innerHTML;
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i data-lucide="loader-circle" class="loading-spin"></i> Menyemak...';
    }
    form.setAttribute("aria-busy", "true");
    showLoginFeedback(form, "Menyemak nama pengguna dan kata laluan...", "pending");
    postRender();
    try {
      const result = await DataService.login(values.username, values.password);
      if (!result || !result.token) throw new Error("Respons log masuk tidak lengkap. Cuba semula.");
      if (!form.isConnected) {
        await DataService.request("logout", { token: result.token });
        return;
      }
      const timeout = Number(CONFIG.SESSION_TIMEOUT_MINUTES || 30) * 60 * 1000;
      state.admin = {
        token: result.token,
        username: result.username || values.username,
        expiresAt: result.expiresAt || Date.now() + timeout
      };
      state.lastSessionRefreshAt = Date.now();
      persistSession(state.admin);
      resetInactivityTimer();
      state.recordsReady = false;
      state.recordsError = "";
      state.records = emptyStore();
      form.elements.password.value = "";
      showLoginFeedback(form, "Nama pengguna dan kata laluan betul. Log masuk berjaya.", "success");
      toast("Nama pengguna dan kata laluan betul. Log masuk berjaya.", "success");
      location.hash = "#admin/dashboard";
    } catch (error) {
      if (!form.isConnected) return;
      const invalidCredentials = error.code === "INVALID_CREDENTIALS" || /Nama pengguna atau kata laluan (tidak sah|salah)/i.test(error.message);
      const message = invalidCredentials
        ? "Nama pengguna atau kata laluan salah. Sila semak dan cuba semula."
        : error.message || "Log masuk gagal. Sila cuba semula.";
      showLoginFeedback(form, message, "error");
      if (invalidCredentials) {
        form.elements.password.setAttribute("aria-invalid", "true");
        form.elements.password.focus();
      }
      toast(message, "error");
    } finally {
      state.loginPending = false;
      if (form.isConnected) {
        form.removeAttribute("aria-busy");
        if (button) {
          button.disabled = false;
          button.innerHTML = originalButton;
        }
        postRender();
      }
    }
  }

  async function loginDemo() {
    const timeout = Number(CONFIG.SESSION_TIMEOUT_MINUTES || 30) * 60 * 1000;
    state.admin = {
      token: "DEMO-" + Math.random().toString(36).slice(2),
      username: "Admin Demo",
      expiresAt: Date.now() + timeout,
      demo: true
    };
    state.lastSessionRefreshAt = Date.now();
    persistSession(state.admin);
    resetInactivityTimer();
    await DataService.getAll();
    location.hash = "#admin/dashboard";
    toast("Admin Demo Setempat diaktifkan.", "success");
  }

  function showModal(content) {
    modalRoot.innerHTML = '<div class="modal-backdrop"><section class="modal-dialog" role="dialog" aria-modal="true">' + content + "</section></div>";
    document.body.classList.add("modal-open");
    postRender();
    const focusable = modalRoot.querySelector("button, input, select, textarea");
    if (focusable) focusable.focus();
  }

  function closeModal() {
    modalRoot.innerHTML = "";
    document.body.classList.remove("modal-open");
    state.pendingDelete = null;
    state.modalModule = null;
  }

  function showSuccessModal(moduleId, id) {
    showModal([
      '<div class="modal-head"><div><span class="modal-icon success"><i data-lucide="circle-check-big"></i></span><h3>Rekod berjaya dihantar</h3></div><button class="btn btn-muted icon-btn" type="button" data-action="close-modal" title="Tutup"><i data-lucide="x"></i></button></div>',
      '<div class="modal-body"><p>ID rujukan anda:</p><div class="record-id-box">', escapeHtml(id), "</div><p>Rekod telah disimpan dalam ", isConfigured() ? "Google Sheets" : "Mod Demo Setempat", ".</p></div>",
      '<div class="modal-actions"><button class="btn btn-primary" type="button" data-action="close-modal">Selesai</button></div>'
    ].join(""));
  }

  function showRecordModal(moduleId, id) {
    const module = MODULES[moduleId];
    const row = activeRows(moduleId).find(function (record) { return record.id === id; });
    if (!row) return toast("Rekod tidak ditemui.", "error");
    const details = [
      { label: "ID rekod", value: row.id },
      { label: "Dicipta", value: formatDate(row.createdAt, true) },
      { label: "Dikemas kini", value: formatDate(row.updatedAt, true) },
      { label: "Tindakan oleh", value: row.actionUser || "-" }
    ].concat(module.fields.map(function (item) {
      return { label: item.label, value: item.type === "date" ? formatDate(row[item.key], false) : (row[item.key] || "-") };
    })).map(function (item) {
      return '<div class="detail-item"><span>' + escapeHtml(item.label) + "</span><strong>" + escapeHtml(item.value) + "</strong></div>";
    }).join("");
    showModal([
      '<div class="modal-head"><div><h3>', escapeHtml(module.title), '</h3><p>Butiran penuh rekod</p></div><button class="btn btn-muted icon-btn" type="button" data-action="close-modal" title="Tutup"><i data-lucide="x"></i></button></div>',
      '<div class="modal-body"><div class="detail-grid">', details, "</div></div>",
      '<div class="modal-actions"><button class="btn btn-outline" type="button" data-action="edit" data-module="', moduleId, '" data-id="', escapeHtml(id), '"><i data-lucide="pencil"></i> Edit</button><button class="btn btn-primary" type="button" data-action="close-modal">Tutup</button></div>'
    ].join(""));
  }

  function showReturnModal(moduleId, id) {
    const row = activeRows(moduleId).find(function (record) { return record.id === id; });
    if (!row) return toast("Rekod tidak ditemui.", "error");
    showModal([
      '<form id="returnForm" data-module="', moduleId, '" data-id="', escapeHtml(id), '">',
      '<div class="modal-head"><div><h3>Tandakan sebagai dipulangkan</h3><p>', escapeHtml(id), '</p></div><button class="btn btn-muted icon-btn" type="button" data-action="close-modal" title="Tutup"><i data-lucide="x"></i></button></div>',
      '<div class="modal-body"><div class="field"><label for="returnCondition">Keadaan semasa dipulangkan</label><select id="returnCondition" name="condition" required>',
      CONDITION_OPTIONS.map(function (value) { return '<option value="' + value + '">' + value + "</option>"; }).join(""),
      "</select></div></div>",
      '<div class="modal-actions"><button class="btn btn-muted" type="button" data-action="close-modal">Batal</button><button class="btn btn-primary" type="submit" data-action="submit-return"><i data-lucide="undo-2"></i> Sahkan Pemulangan</button></div></form>'
    ].join(""));
  }

  async function handleReturnSubmit(form) {
    if (state.submitting) return;
    state.submitting = true;
    try {
      await DataService.markReturned(form.dataset.module, form.dataset.id, form.elements.condition.value);
      await DataService.getAll();
      closeModal();
      renderAdminModule(form.dataset.module);
      toast("Pemulangan berjaya direkodkan.", "success");
    } catch (error) {
      toast(error.message || "Pemulangan gagal direkodkan.", "error");
    } finally {
      state.submitting = false;
    }
  }

  function showDeleteStepOne(moduleId, id) {
    state.pendingDelete = { moduleId: moduleId, id: id };
    showModal([
      '<div class="modal-head"><div><h3>Padam rekod?</h3><p>Langkah pengesahan 1 daripada 2</p></div><button class="btn btn-muted icon-btn" type="button" data-action="close-modal" title="Tutup"><i data-lucide="x"></i></button></div>',
      '<div class="modal-body"><div class="notice"><i data-lucide="triangle-alert"></i><div><strong>Tindakan ini direkodkan dalam log aktiviti.</strong>Rekod ', escapeHtml(id), ' tidak lagi akan dipaparkan dalam senarai aktif.</div></div></div>',
      '<div class="modal-actions"><button class="btn btn-muted" type="button" data-action="close-modal">Batal</button><button class="btn btn-danger" type="button" data-action="delete-step-two"><i data-lucide="arrow-right"></i> Teruskan</button></div>'
    ].join(""));
  }

  function showDeleteStepTwo() {
    if (!state.pendingDelete) return closeModal();
    const pending = state.pendingDelete;
    showModal([
      '<div class="modal-head"><div><h3>Pengesahan akhir</h3><p>Langkah pengesahan 2 daripada 2</p></div></div>',
      '<div class="modal-body"><p>Anda pasti mahu memadam rekod <strong>', escapeHtml(pending.id), "</strong>?</p></div>",
      '<div class="modal-actions"><button class="btn btn-muted" type="button" data-action="close-modal">Batal</button><button class="btn btn-danger" type="button" data-action="confirm-delete"><i data-lucide="trash-2"></i> Ya, Padam Rekod</button></div>'
    ].join(""));
    state.pendingDelete = pending;
  }

  async function confirmDelete() {
    if (!state.pendingDelete || state.submitting) return;
    const pending = state.pendingDelete;
    state.submitting = true;
    try {
      await DataService.remove(pending.moduleId, pending.id);
      await DataService.getAll();
      closeModal();
      renderAdminModule(pending.moduleId);
      toast("Rekod berjaya dipadam.", "success");
    } catch (error) {
      toast(error.message || "Rekod gagal dipadam.", "error");
    } finally {
      state.submitting = false;
    }
  }

  function showAdminModulesMenu() {
    const buttons = MODULE_ORDER.map(function (id) {
      return '<button class="btn btn-muted" type="button" data-action="admin-module" data-module="' + id + '"><i data-lucide="' + MODULES[id].icon + '"></i> ' + escapeHtml(MODULES[id].shortTitle) + "</button>";
    }).join("");
    showModal([
      '<div class="modal-head"><div><h3>Pilih Modul Rekod</h3><p>Akses jadual dan operasi admin.</p></div><button class="btn btn-muted icon-btn" type="button" data-action="close-modal"><i data-lucide="x"></i></button></div>',
      '<div class="modal-body"><div class="modal-menu-grid">', buttons, "</div></div>"
    ].join(""));
  }

  function showPdfModal(moduleId) {
    state.modalModule = moduleId;
    const title = moduleId === "ALL" ? "Rumusan Keseluruhan" : MODULES[moduleId].title;
    showModal([
      '<form id="pdfForm" data-module="', moduleId, '">',
      '<div class="modal-head"><div><h3>Jana Rumusan PDF</h3><p>', escapeHtml(title), '</p></div><button class="btn btn-muted icon-btn" type="button" data-action="close-modal" title="Tutup"><i data-lucide="x"></i></button></div>',
      '<div class="modal-body">',
      '<div class="field"><label for="periodType">Jenis tempoh</label><select id="periodType" name="periodType" data-period-select><option value="daily">Harian</option><option value="weekly">Mingguan / julat minggu</option><option value="monthly">Bulanan</option><option value="yearly">Tahunan</option></select></div>',
      '<div class="pdf-period-grid">',
      '<div class="period-panel" data-period-panel="daily"><h3>Harian</h3><div class="field"><label>Tarikh<input type="date" name="dailyDate" value="', todayIso(), '"></label></div></div>',
      '<div class="period-panel" data-period-panel="weekly" hidden><h3>Mingguan</h3><div class="form-grid"><div class="field"><label>Tarikh mula<input type="date" name="weekStart" value="', addDays(todayIso(), -6), '"></label></div><div class="field"><label>Tarikh akhir<input type="date" name="weekEnd" value="', todayIso(), '"></label></div></div></div>',
      '<div class="period-panel" data-period-panel="monthly" hidden><h3>Bulanan</h3><div class="field"><label>Bulan dan tahun<input type="month" name="monthValue" value="', todayIso().slice(0, 7), '"></label></div></div>',
      '<div class="period-panel" data-period-panel="yearly" hidden><h3>Tahunan</h3><div class="field"><label>Tahun<input type="number" min="2000" max="2100" name="yearValue" value="', todayIso().slice(0, 4), '"></label></div></div>',
      "</div></div>",
      '<div class="modal-actions"><button class="btn btn-muted" type="button" data-action="close-modal">Batal</button><button class="btn btn-primary" type="submit" data-action="submit-pdf"><i data-lucide="file-down"></i> Jana PDF</button></div>',
      "</form>"
    ].join(""));
  }

  function updatePeriodPanels(select) {
    const form = select.closest("form");
    if (!form) return;
    form.querySelectorAll("[data-period-panel]").forEach(function (panel) {
      panel.hidden = panel.dataset.periodPanel !== select.value;
    });
  }

  function periodFromForm(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    let start;
    let end;
    let label;
    if (data.periodType === "daily") {
      if (!data.dailyDate) throw new Error("Sila pilih tarikh laporan.");
      start = end = data.dailyDate;
      label = "Harian: " + longDate(start);
    } else if (data.periodType === "weekly") {
      if (!data.weekStart || !data.weekEnd) throw new Error("Sila lengkapkan julat minggu.");
      if (data.weekEnd < data.weekStart) throw new Error("Tarikh akhir minggu tidak boleh lebih awal.");
      start = data.weekStart;
      end = data.weekEnd;
      label = "Mingguan: " + longDate(start) + " hingga " + longDate(end);
    } else if (data.periodType === "monthly") {
      if (!data.monthValue) throw new Error("Sila pilih bulan dan tahun.");
      start = data.monthValue + "-01";
      const date = new Date(Number(data.monthValue.slice(0, 4)), Number(data.monthValue.slice(5, 7)), 0);
      end = data.monthValue + "-" + String(date.getDate()).padStart(2, "0");
      label = "Bulanan: " + BM_MONTHS[Number(data.monthValue.slice(5, 7)) - 1] + " " + data.monthValue.slice(0, 4);
    } else {
      if (!data.yearValue) throw new Error("Sila masukkan tahun.");
      start = data.yearValue + "-01-01";
      end = data.yearValue + "-12-31";
      label = "Tahunan: " + data.yearValue;
    }
    return { start: start, end: end, label: label };
  }

  function recordsForPeriod(moduleId, period) {
    return activeRows(moduleId).filter(function (row) {
      const date = String(row[MODULES[moduleId].dateKey] || "").slice(0, 10);
      return date >= period.start && date <= period.end;
    });
  }

  async function handlePdfSubmit(form) {
    if (state.submitting) return;
    state.submitting = true;
    const button = form.querySelector('[type="submit"]');
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="loading-spinner small"></span> Menjana...';
    }
    try {
      const period = periodFromForm(form);
      await generatePdf(form.dataset.module, period);
      closeModal();
      toast("Laporan PDF berjaya dijana.", "success");
    } catch (error) {
      toast(error.message || "PDF gagal dijana.", "error");
      if (button) {
        button.disabled = false;
        button.innerHTML = '<i data-lucide="file-down"></i> Cuba Semula';
        postRender();
      }
    } finally {
      state.submitting = false;
    }
  }

  function moduleStatistics(moduleId, rows) {
    const module = MODULES[moduleId];
    if (moduleId === "PENGGUNAAN_PSS") {
      return [
        ["Jumlah rekod", rows.length],
        ["Jumlah pengguna", sumBy(rows, "jumlahPengguna")],
        ["Jumlah murid lelaki", sumBy(rows, "bilanganMuridLelaki")],
        ["Jumlah murid perempuan", sumBy(rows, "bilanganMuridPerempuan")]
      ];
    }
    if (moduleId === "RESENSI_TAHAP_2") {
      return [
        ["Jumlah resensi", rows.length],
        ["Disahkan", rows.filter(function (row) { return row.statusPengesahan === "Disahkan"; }).length],
        ["Belum disahkan", rows.filter(function (row) { return row.statusPengesahan === "Belum Disahkan"; }).length],
        ["Perlu pembetulan", rows.filter(function (row) { return row.statusPengesahan === "Perlu Pembetulan"; }).length]
      ];
    }
    if (module.isLoan) {
      return [
        ["Jumlah pinjaman", rows.length],
        ["Aktif", rows.filter(function (row) { return effectiveStatus(row, module) === "Sedang Dipinjam"; }).length],
        ["Dipulangkan", rows.filter(function (row) { return effectiveStatus(row, module) === "Dipulangkan"; }).length],
        ["Lewat", rows.filter(function (row) { return effectiveStatus(row, module) === "Lewat"; }).length],
        ["Rosak / hilang", rows.filter(function (row) { const status = effectiveStatus(row, module); return status === "Rosak" || status === "Hilang"; }).length]
      ];
    }
    return [["Jumlah rekod", rows.length]];
  }

  async function generatePdf(moduleId, period) {
    if (!requireAdmin() || !state.recordsReady) throw new Error("Sila tunggu rekod admin dimuatkan.");
    if (!window.jspdf) await loadLibrary("assets/vendor/jspdf-2.5.2.min.js");
    await loadLibrary("assets/vendor/jspdf-autotable-3.8.4.min.js");
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("Pustaka PDF tidak dapat dimuatkan. Semak sambungan internet dan cuba semula.");
    }
    const jsPDF = window.jspdf.jsPDF;
    const logo = await loadBadgeForPdf();
    const generatedAt = new Intl.DateTimeFormat("ms-MY", {
      timeZone: CONFIG.TIME_ZONE || "Asia/Kuala_Lumpur",
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false
    }).format(new Date());
    if (moduleId === "ALL") {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const overview = MODULE_ORDER.map(function (id) {
        const rows = recordsForPeriod(id, period);
        const stats = moduleStatistics(id, rows);
        return [MODULES[id].shortTitle, rows.length, stats.slice(1).map(function (item) { return item[0] + ": " + item[1]; }).join("; ") || "-"];
      });
      addPdfHeader(doc, logo, "Rumusan Keseluruhan", period.label, generatedAt);
      drawPdfStats(doc, dashboardMetrics(period).slice(0, 6).map(function (item) { return [item.label, item.value]; }), 42);
      doc.autoTable({
        startY: 61,
        head: [["Modul", "Jumlah rekod", "Statistik penting"]],
        body: overview,
        margin: { top: 38, right: 12, bottom: 25, left: 12 },
        styles: { font: "helvetica", fontSize: 8, cellPadding: 2.2, overflow: "linebreak" },
        headStyles: { fillColor: [15, 118, 110], textColor: 255 },
        didDrawPage: function () { addPdfHeader(doc, logo, "Rumusan Keseluruhan", period.label, generatedAt); }
      });
      finalizePdf(doc);
      doc.save("rumusan-keseluruhan-" + period.start + "-" + period.end + ".pdf");
      return;
    }
    const module = MODULES[moduleId];
    const rows = recordsForPeriod(moduleId, period);
    const orientation = module.fields.length > 7 ? "landscape" : "portrait";
    const doc = new jsPDF({ orientation: orientation, unit: "mm", format: "a4" });
    const reportName = "Laporan " + module.shortTitle;
    const stats = moduleStatistics(moduleId, rows);
    const fieldChunks = chunkArray(module.fields, 6);
    addPdfHeader(doc, logo, reportName, period.label, generatedAt);
    drawPdfStats(doc, stats, 42);
    if (!rows.length) {
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text("Tiada rekod bagi tempoh yang dipilih.", 14, 70);
    } else {
      fieldChunks.forEach(function (fields, chunkIndex) {
        if (chunkIndex > 0) doc.addPage();
        const headingY = chunkIndex === 0 ? 62 : 42;
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text("Butiran rekod " + (fieldChunks.length > 1 ? "(bahagian " + (chunkIndex + 1) + " daripada " + fieldChunks.length + ")" : ""), 12, headingY);
        const head = [["ID"].concat(fields.map(function (item) { return item.label; }))];
        const body = rows.map(function (row) {
          return [row.id].concat(fields.map(function (item) {
            const value = item.type === "date" ? formatDate(row[item.key], false) : row[item.key];
            return String(value == null || value === "" ? "-" : value);
          }));
        });
        doc.autoTable({
          startY: headingY + 4,
          head: head,
          body: body,
          margin: { top: 38, right: 10, bottom: 25, left: 10 },
          tableWidth: "auto",
          styles: { font: "helvetica", fontSize: 6.5, cellPadding: 1.6, overflow: "linebreak", valign: "top" },
          headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          didDrawPage: function () { addPdfHeader(doc, logo, reportName, period.label, generatedAt); }
        });
      });
    }
    finalizePdf(doc);
    doc.save(slug(reportName) + "-" + period.start + "-" + period.end + ".pdf");
  }

  function chunkArray(items, size) {
    const chunks = [];
    for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
    return chunks;
  }

  function addPdfHeader(doc, logo, reportName, periodLabel, generatedAt) {
    const width = doc.internal.pageSize.getWidth();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, width, 34, "F");
    try {
      doc.addImage(logo, "PNG", 10, 5, 22, 22, undefined, "FAST");
    } catch (error) {
      doc.setFillColor(248, 250, 252);
      doc.circle(21, 16, 10, "F");
      doc.setTextColor(15, 118, 110);
      doc.setFontSize(7);
      doc.text("SKST", 14, 18);
    }
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(String(CONFIG.SCHOOL_NAME || ""), 36, 9);
    doc.setFontSize(8);
    doc.text("SISTEM PENGURUSAN PUSAT SUMBER EDUCAFE @ D'SUTRA", 36, 15);
    doc.setTextColor(253, 230, 138);
    doc.setFontSize(11);
    doc.text(reportName, 36, 23);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(230);
    doc.setFontSize(7);
    doc.text("Tempoh: " + periodLabel + "  |  Dijana: " + generatedAt + " (Asia/Kuala_Lumpur)", 36, 29);
  }

  function drawPdfStats(doc, stats, y) {
    const width = doc.internal.pageSize.getWidth();
    const gap = 3;
    const boxWidth = Math.min(48, (width - 24 - gap * (stats.length - 1)) / Math.max(stats.length, 1));
    stats.slice(0, 6).forEach(function (item, index) {
      const x = 12 + index * (boxWidth + gap);
      doc.setFillColor(index % 2 ? 255 : 240, index % 2 ? 251 : 253, index % 2 ? 235 : 250);
      doc.roundedRect(x, y, boxWidth, 14, 1.5, 1.5, "F");
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(String(item[1]), x + 3, y + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.8);
      doc.text(doc.splitTextToSize(String(item[0]), boxWidth - 6), x + 3, y + 10);
    });
  }

  function finalizePdf(doc) {
    const total = doc.getNumberOfPages();
    for (let page = 1; page <= total; page += 1) {
      doc.setPage(page);
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();
      doc.setDrawColor(148, 163, 184);
      doc.line(12, height - 18, 65, height - 18);
      doc.line(78, height - 18, 131, height - 18);
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Disediakan oleh", 12, height - 14);
      doc.text("Disemak oleh", 78, height - 14);
      doc.text("Halaman " + page + " / " + total, width - 12, height - 12, { align: "right" });
    }
  }

  async function loadBadgeForPdf() {
    const fallback = fallbackBadgeDataUrl();
    const url = CONFIG.SCHOOL_BADGE_URL;
    if (!url) return fallback;
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("Imej tidak dapat dicapai.");
      const blob = await response.blob();
      return await blobToDataUrl(blob);
    } catch (fetchError) {
      return await imageToDataUrl(url).catch(function () { return fallback; });
    }
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function imageToDataUrl(url) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = function () {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth || 256;
          canvas.height = image.naturalHeight || 256;
          canvas.getContext("2d").drawImage(image, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (error) {
          reject(error);
        }
      };
      image.onerror = reject;
      image.src = url;
    });
  }

  function fallbackBadgeDataUrl() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    context.fillStyle = "#f8fafc";
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = "#0f766e";
    context.beginPath();
    context.arc(128, 128, 106, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#ffffff";
    context.font = "bold 52px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("SKST", 128, 128);
    return canvas.toDataURL("image/png");
  }

  async function handleClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target) {
      if (event.target.classList && event.target.classList.contains("modal-backdrop")) closeModal();
      return;
    }
    const action = target.dataset.action;
    if (action === "submit-record") {
      event.preventDefault();
      await handleRecordSubmit(target.closest("form"));
      return;
    }
    if (action === "submit-login") {
      event.preventDefault();
      await handleLoginSubmit(target.closest("form"));
      return;
    }
    if (action === "submit-return") {
      event.preventDefault();
      await handleReturnSubmit(target.closest("form"));
      return;
    }
    if (action === "submit-pdf") {
      event.preventDefault();
      await handlePdfSubmit(target.closest("form"));
      return;
    }
    if (action === "apply-filter") {
      event.preventDefault();
      applyFilters(target.closest("form"));
      return;
    }
    if (action === "home") location.hash = "#home";
    if (action === "login") location.hash = "#login";
    if (action === "admin-dashboard") {
      closeModal();
      location.hash = "#admin/dashboard";
    }
    if (action === "logout") await logoutAdmin(false);
    if (action === "scroll-modules") {
      const section = document.getElementById("modulUtama");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
    if (action === "open-module") {
      if (target.dataset.module === "PINJAMAN_BAKUL") location.hash = "#basket";
      else location.hash = "#module/" + target.dataset.module;
    }
    if (action === "basket-choice") location.hash = "#basket";
    if (action === "admin-module") {
      closeModal();
      location.hash = "#admin/module/" + target.dataset.module;
    }
    if (action === "view") showRecordModal(target.dataset.module, target.dataset.id);
    if (action === "edit") {
      closeModal();
      location.hash = "#admin/edit/" + target.dataset.module + "/" + encodeURIComponent(target.dataset.id);
    }
    if (action === "return") showReturnModal(target.dataset.module, target.dataset.id);
    if (action === "delete") showDeleteStepOne(target.dataset.module, target.dataset.id);
    if (action === "delete-step-two") showDeleteStepTwo();
    if (action === "confirm-delete") await confirmDelete();
    if (action === "close-modal") closeModal();
    if (action === "page") {
      state.pages[target.dataset.module] = Number(target.dataset.page);
      renderAdminModule(target.dataset.module);
    }
    if (action === "reset-filter") {
      state.filters[target.dataset.module] = defaultFilters();
      state.pages[target.dataset.module] = 1;
      renderAdminModule(target.dataset.module);
    }
    if (action === "clear-form") {
      const form = document.getElementById("recordForm");
      if (form) {
        localStorage.removeItem(DRAFT_PREFIX + form.dataset.module);
        renderForm(form.dataset.module);
        toast("Borang telah dikosongkan.", "success");
      }
    }
    if (action === "demo-login") await loginDemo();
    if (action === "toggle-password") {
      const password = document.getElementById("adminPassword");
      if (password) {
        const visible = password.type === "password";
        password.type = visible ? "text" : "password";
        const label = visible ? "Sembunyikan kata laluan" : "Tunjukkan kata laluan";
        target.setAttribute("aria-label", label);
        target.setAttribute("title", label);
        target.setAttribute("aria-pressed", String(visible));
        target.innerHTML = '<i data-lucide="' + (visible ? "eye-off" : "eye") + '"></i>';
        postRender();
      }
    }
    if (action === "refresh-admin") await refreshAdminData();
    if (action === "pdf") showPdfModal(target.dataset.module);
    if (action === "admin-modules-menu") showAdminModulesMenu();
    if (action === "install") await installApp();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    if (form.id === "recordForm") await handleRecordSubmit(form);
    if (form.id === "loginForm") await handleLoginSubmit(form);
    if (form.id === "returnForm") await handleReturnSubmit(form);
    if (form.id === "pdfForm") await handlePdfSubmit(form);
    if (form.id === "filterForm") applyFilters(form);
  }

  function applyFilters(form) {
    const moduleId = form.dataset.module;
    state.filters[moduleId] = Object.assign(defaultFilters(), Object.fromEntries(new FormData(form).entries()));
    state.pages[moduleId] = 1;
    renderAdminModule(moduleId);
  }

  function handleInput(event) {
    const loginForm = event.target.closest("#loginForm");
    if (loginForm && !state.loginPending) {
      showLoginFeedback(loginForm, "", "");
      loginForm.elements.password.removeAttribute("aria-invalid");
    }
    const form = event.target.closest("#recordForm");
    if (!form) return;
    const counter = form.querySelector('[data-counter-for="' + event.target.name + '"]');
    if (counter) {
      const max = Number(event.target.maxLength || 0);
      counter.textContent = event.target.value.length + "/" + max;
    }
    updateComputedFields(form);
    saveDraftFromForm(form);
  }

  function handleChange(event) {
    if (event.target.matches("[data-period-select]")) updatePeriodPanels(event.target);
    const form = event.target.closest("#recordForm");
    if (form) {
      updateComputedFields(form);
      saveDraftFromForm(form);
    }
  }

  function renderAdminDataState() {
    const message = state.recordsError;
    app.innerHTML = adminShellMarkup("dashboard", "Dashboard Analisis", "Log masuk disahkan. Selamat datang, " + state.admin.username + ".",
      '<section class="admin-data-state" role="status" aria-live="polite" aria-busy="' + (!message) + '">' +
      '<i data-lucide="' + (message ? 'cloud-off' : 'loader-circle') + '" class="' + (message ? '' : 'loading-spin') + '"></i>' +
      '<h3>' + (message ? 'Rekod belum dapat dimuatkan' : 'Memuatkan rekod pusat sumber') + '</h3>' +
      '<p>' + escapeHtml(message || "Kata laluan betul. Sesi admin anda telah aktif.") + '</p>' +
      (message ? '<button class="btn btn-primary" data-action="refresh-admin" type="button"><i data-lucide="refresh-cw"></i> Cuba Semula</button>' : '<div class="data-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>') + '</section>', "");
    postRender();
  }

  function loadAdminData() {
    if (state.recordsLoading) return state.recordsLoading;
    const token = state.admin && state.admin.token;
    if (!token) return Promise.resolve();
    state.recordsError = "";
    const pending = DataService.getAll().catch(function (error) {
      if (state.admin && state.admin.token === token) state.recordsError = error.message;
    }).finally(function () {
      if (state.recordsLoading !== pending) return;
      state.recordsLoading = null;
      if (state.admin && state.admin.token === token && location.hash.indexOf("#admin/") === 0) route();
    });
    state.recordsLoading = pending;
    return pending;
  }

  async function refreshAdminData() {
    if (!requireAdmin()) return;
    state.recordsReady = false;
    state.recordsError = "";
    const pending = loadAdminData();
    renderAdminDataState();
    await pending;
  }

  function toast(message, type) {
    const item = document.createElement("div");
    item.className = "toast " + (type || "success");
    item.innerHTML = '<i data-lucide="' + (type === "error" ? "circle-x" : type === "warning" ? "triangle-alert" : "circle-check") + '"></i><span>' + escapeHtml(message) + "</span>";
    toastRegion.appendChild(item);
    postRender();
    window.setTimeout(function () {
      item.classList.add("leaving");
      window.setTimeout(function () { item.remove(); }, 220);
    }, 4200);
  }

  async function installApp() {
    if (state.installPrompt) {
      state.installPrompt.prompt();
      await state.installPrompt.userChoice;
      state.installPrompt = null;
      toast("Permintaan pemasangan telah diproses.", "success");
      return;
    }
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    toast(isIos
      ? "Pada Safari, pilih Kongsi kemudian Tambah ke Skrin Utama."
      : "Gunakan menu pelayar dan pilih Pasang aplikasi atau Tambah ke skrin utama.", "warning");
  }

  async function route() {
    closeModal();
    state.charts.forEach(function (chart) { chart.destroy(); });
    state.charts = [];
    const path = (location.hash || "#home").replace(/^#/, "").split("/").filter(Boolean);
    if (path[0] === "admin") {
      if (!requireAdmin()) return;
      if (!state.recordsReady) {
        renderAdminDataState();
        if (!state.recordsError) loadAdminData();
        return;
      }
    }
    if (!path.length || path[0] === "home") return renderHome();
    if (path[0] === "basket") return renderBasketChoice();
    if (path[0] === "login") return renderLogin();
    if (path[0] === "module" && path[1]) return renderForm(path[1]);
    if (path[0] === "admin" && path[1] === "dashboard") return renderAdminDashboard();
    if (path[0] === "admin" && path[1] === "module" && path[2]) return renderAdminModule(path[2]);
    if (path[0] === "admin" && path[1] === "edit" && path[2] && path[3]) return renderForm(path[2], decodeURIComponent(path.slice(3).join("/")));
    return renderNotFound();
  }

  async function init() {
    app.addEventListener("click", handleClick);
    app.addEventListener("submit", handleSubmit);
    app.addEventListener("input", handleInput);
    app.addEventListener("change", handleChange);
    modalRoot.addEventListener("click", handleClick);
    modalRoot.addEventListener("submit", handleSubmit);
    modalRoot.addEventListener("change", handleChange);
    window.addEventListener("hashchange", route);
    ["pointerdown", "keydown"].forEach(function (name) {
      document.addEventListener(name, resetInactivityTimer, { passive: true });
    });
    window.addEventListener("beforeinstallprompt", function (event) {
      event.preventDefault();
      state.installPrompt = event;
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modalRoot.innerHTML) closeModal();
    });
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register("./service-worker.js").catch(function (error) {
        console.warn("Service worker gagal didaftarkan:", error);
      });
    }
    renderLoading("Memulakan EduCafe...");
    try {
      await DataService.init();
      await restoreSession();
      await route();
    } catch (error) {
      state.admin = null;
      persistSession(null);
      renderHome();
      toast(error.message || "Sistem gagal dimulakan.", "error");
    }
  }

  init();
})();
