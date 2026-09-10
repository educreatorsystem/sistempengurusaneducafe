/**
 * EduCafe @ D'Sutra - Google Apps Script API
 * Tetapkan GOOGLE_SHEET_ID dalam Script Properties atau gantikan nilai di bawah.
 * Jangan simpan kata laluan admin di dalam fail ini.
 */

var GOOGLE_SHEET_ID = "1T2mYQNl3ogtALF7fwqJqsAQAk7uwLO3Uz6_ZsODZAtI";
var SESSION_TIMEOUT_MINUTES = 30;
var MAX_LOGIN_ATTEMPTS = 5;
var MIN_ADMIN_PASSWORD_LENGTH = 7;

var BASE_HEADERS = [
  "id",
  "createdAt",
  "updatedAt",
  "statusRekod",
  "modul",
  "sumberModul",
  "actionUser"
];

var SHEET_DEFINITIONS = {
  PENGGUNAAN_PSS: [
    "tarikh", "hari", "masaMula", "masaTamat", "namaGuruPegawai",
    "kategoriPengguna", "kelasUnitKumpulan", "bilanganMuridLelaki",
    "bilanganMuridPerempuan", "jumlahPengguna", "tujuanPenggunaan",
    "namaAktiviti", "catatan"
  ],
  PINJAMAN_KAMUS: [
    "tarikhPinjaman", "namaPeminjam", "kategoriPeminjam", "kelasJawatan",
    "bahasaKamus", "tajukJenisKamus", "nomborAsetKodKamus", "kuantiti",
    "tarikhPerluDipulangkan", "tarikhPemulanganSebenar",
    "keadaanSemasaDipinjam", "keadaanSemasaDipulangkan",
    "statusPinjaman", "catatan"
  ],
  RESENSI_TAHAP_2: [
    "tarikh", "namaMurid", "tahunKelas", "tajukBuku", "namaPenulis",
    "penerbit", "bahasaBuku", "kategoriBuku", "bilanganHalaman",
    "sinopsis", "nilaiMurni", "penilaianBintang", "namaGuruPengesah",
    "statusPengesahan", "catatanGuru"
  ],
  PINJAMAN_BUKU_GURU: [
    "tarikhPinjaman", "namaGuru", "jawatanPanitia", "kodBuku", "tajukBuku",
    "namaPenulis", "kategoriBuku", "kuantiti", "tarikhPerluDipulangkan",
    "tarikhPemulanganSebenar", "keadaanBukuSemasaDipinjam",
    "keadaanBukuSemasaDipulangkan", "statusPinjaman", "catatan"
  ],
  PINJAMAN_BUKU_MURID: [
    "tarikhPinjaman", "namaMurid", "tahunKelas", "kodBuku", "tajukBuku",
    "namaPenulis", "kategoriBuku", "tarikhPerluDipulangkan",
    "tarikhPemulanganSebenar", "keadaanBukuSemasaDipinjam",
    "keadaanBukuSemasaDipulangkan", "statusPinjaman", "catatan"
  ],
  PINJAMAN_BAKUL_BM: [
    "jenisBakul", "kodNomborBakul", "tarikhPinjaman", "namaGuruPeminjam",
    "tahunKelas", "bilanganBukuDalamBakul", "tarikhPerluDipulangkan",
    "tarikhPemulanganSebenar", "keadaanBakulSemasaDipinjam",
    "keadaanBakulSemasaDipulangkan", "statusPinjaman", "catatan"
  ],
  PINJAMAN_BAKUL_BI: [
    "jenisBakul", "kodNomborBakul", "tarikhPinjaman", "namaGuruPeminjam",
    "tahunKelas", "bilanganBukuDalamBakul", "tarikhPerluDipulangkan",
    "tarikhPemulanganSebenar", "keadaanBakulSemasaDipinjam",
    "keadaanBakulSemasaDipulangkan", "statusPinjaman", "catatan"
  ],
  LOG_AKTIVITI: ["action", "recordId", "details"]
};

var MODULE_PREFIXES = {
  PENGGUNAAN_PSS: "PSS",
  PINJAMAN_KAMUS: "KMS",
  RESENSI_TAHAP_2: "RSN",
  PINJAMAN_BUKU_GURU: "PBG",
  PINJAMAN_BUKU_MURID: "PBM",
  PINJAMAN_BAKUL_BM: "BNM",
  PINJAMAN_BAKUL_BI: "BNI",
  LOG_AKTIVITI: "LOG"
};

var LOAN_MODULES = [
  "PINJAMAN_KAMUS",
  "PINJAMAN_BUKU_GURU",
  "PINJAMAN_BUKU_MURID",
  "PINJAMAN_BAKUL_BM",
  "PINJAMAN_BAKUL_BI"
];

var REQUIRED_FIELDS = {
  PENGGUNAAN_PSS: ["tarikh", "masaMula", "masaTamat", "namaGuruPegawai", "kategoriPengguna", "kelasUnitKumpulan", "bilanganMuridLelaki", "bilanganMuridPerempuan", "tujuanPenggunaan", "namaAktiviti"],
  PINJAMAN_KAMUS: ["tarikhPinjaman", "namaPeminjam", "kategoriPeminjam", "kelasJawatan", "bahasaKamus", "tajukJenisKamus", "nomborAsetKodKamus", "kuantiti", "tarikhPerluDipulangkan", "keadaanSemasaDipinjam"],
  RESENSI_TAHAP_2: ["tarikh", "namaMurid", "tahunKelas", "tajukBuku", "namaPenulis", "penerbit", "bahasaBuku", "kategoriBuku", "bilanganHalaman", "sinopsis", "nilaiMurni", "penilaianBintang"],
  PINJAMAN_BUKU_GURU: ["tarikhPinjaman", "namaGuru", "jawatanPanitia", "kodBuku", "tajukBuku", "namaPenulis", "kategoriBuku", "kuantiti", "tarikhPerluDipulangkan", "keadaanBukuSemasaDipinjam"],
  PINJAMAN_BUKU_MURID: ["tarikhPinjaman", "namaMurid", "tahunKelas", "kodBuku", "tajukBuku", "namaPenulis", "kategoriBuku", "tarikhPerluDipulangkan", "keadaanBukuSemasaDipinjam"],
  PINJAMAN_BAKUL_BM: ["kodNomborBakul", "tarikhPinjaman", "namaGuruPeminjam", "tahunKelas", "bilanganBukuDalamBakul", "tarikhPerluDipulangkan", "keadaanBakulSemasaDipinjam"],
  PINJAMAN_BAKUL_BI: ["kodNomborBakul", "tarikhPinjaman", "namaGuruPeminjam", "tahunKelas", "bilanganBukuDalamBakul", "tarikhPerluDipulangkan", "keadaanBakulSemasaDipinjam"]
};

var MODULE_TITLES = {
  PENGGUNAAN_PSS: "Penggunaan PSS",
  PINJAMAN_KAMUS: "Pinjaman Kamus",
  RESENSI_TAHAP_2: "Resensi Tahap 2",
  PINJAMAN_BUKU_GURU: "Buku Guru",
  PINJAMAN_BUKU_MURID: "Buku Murid",
  PINJAMAN_BAKUL_BM: "Bakul NILAM BM",
  PINJAMAN_BAKUL_BI: "Bakul NILAM BI"
};

/**
 * Persediaan awal:
 * 1. Tambah Script Properties INITIAL_ADMIN_USERNAME dan INITIAL_ADMIN_PASSWORD.
 * 2. Tambah GOOGLE_SHEET_ID jika tidak mahu mengubah pemboleh ubah di atas.
 * 3. Jalankan setupAdminAccount sekali dari editor Apps Script.
 *
 * Kata laluan asal dipadam selepas hash selamat disimpan.
 */
function setupAdminAccount() {
  var properties = PropertiesService.getScriptProperties();
  var username = String(properties.getProperty("INITIAL_ADMIN_USERNAME") || "gurucemerlang").trim();
  var password = properties.getProperty("INITIAL_ADMIN_PASSWORD");
  if (!password || String(password).length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error("Tetapkan Script Property INITIAL_ADMIN_PASSWORD sekurang-kurangnya " + MIN_ADMIN_PASSWORD_LENGTH + " aksara.");
  }
  var salt = Utilities.getUuid() + Utilities.getUuid();
  properties.setProperties({
    ADMIN_USERNAME: username,
    ADMIN_PASSWORD_SALT: salt,
    ADMIN_PASSWORD_HASH: hashText_(salt + String(password)),
    SESSION_TIMEOUT_MINUTES: String(SESSION_TIMEOUT_MINUTES)
  });
  properties.deleteProperty("INITIAL_ADMIN_PASSWORD");
  ensureSheets();
  return "Akaun admin dan helaian EduCafe berjaya disediakan.";
}

function ensureSheets() {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return ensureSheetsUnlocked_();
  } finally {
    lock.releaseLock();
  }
}

function ensureSheetsUnlocked_() {
  var spreadsheet = getSpreadsheet_();
  Object.keys(SHEET_DEFINITIONS).forEach(function (name) {
    var sheet = spreadsheet.getSheetByName(name);
    if (!sheet) sheet = spreadsheet.insertSheet(name);
    ensureHeaders_(sheet, BASE_HEADERS.concat(SHEET_DEFINITIONS[name]));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, sheet.getLastColumn())
      .setBackground("#0F766E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold");
    sheet.autoResizeColumns(1, Math.min(sheet.getLastColumn(), 12));
  });
  spreadsheet.setSpreadsheetTimeZone("Asia/Kuala_Lumpur");
  return true;
}

function doGet() {
  return jsonResponse_(true, "API EduCafe aktif.", {
    application: "EduCafe @ D'Sutra",
    timeZone: "Asia/Kuala_Lumpur",
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    var request = parseRequest_(e);
    var action = String(request.action || "").trim();
    if (!action) throw new Error("Tindakan API tidak dinyatakan.");

    if (action === "health") return jsonResponse_(true, "API EduCafe aktif.", { timestamp: new Date().toISOString() });
    if (action === "login") return handleLogin_(request);
    if (action === "addRecord") return handleAddRecord_(request);
    if (action === "checkBasketConflict") return handleBasketCheck_(request);

    var session = verifyAdminToken_(request.token);
    if (action === "verifySession") {
      return jsonResponse_(true, "Sesi admin sah.", {
        username: session.username,
        expiresAt: session.expiresAt
      });
    }
    if (action === "logout") return handleLogout_(request.token);
    if (action === "getAllRecords") return handleGetAll_(request, session);
    if (action === "getRecords" || action === "searchRecords") return handleGetRecords_(request, session);
    if (action === "updateRecord") return handleUpdateRecord_(request, session);
    if (action === "deleteRecord") return handleDeleteRecord_(request, session);
    if (action === "markReturned") return handleMarkReturned_(request, session);

    throw new Error("Tindakan API tidak disokong: " + action);
  } catch (error) {
    return jsonResponse_(false, error.message || "Ralat pelayan tidak diketahui.", null, {
      name: error.name || "Error"
    });
  }
}

function parseRequest_(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      throw new Error("Badan permintaan JSON tidak sah.");
    }
  }
  return e.parameter || {};
}

function jsonResponse_(success, message, data, error) {
  var payload = {
    success: Boolean(success),
    message: String(message || ""),
    data: data == null ? null : data,
    error: error || null,
    timestamp: new Date().toISOString()
  };
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet_() {
  var properties = PropertiesService.getScriptProperties();
  var sheetId = String(properties.getProperty("GOOGLE_SHEET_ID") || GOOGLE_SHEET_ID || "").trim();
  if (!sheetId || sheetId.indexOf("MASUKKAN_ID") !== -1) {
    throw new Error("GOOGLE_SHEET_ID belum dikonfigurasi dalam Script Properties atau Code.gs.");
  }
  try {
    return SpreadsheetApp.openById(sheetId);
  } catch (error) {
    throw new Error("Google Sheet tidak dapat dibuka. Semak ID dan kebenaran akses.");
  }
}

function ensureHeaders_(sheet, expected) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
    return;
  }
  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  var current = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  var missing = expected.filter(function (header) {
    return current.indexOf(header) === -1;
  });
  if (missing.length) {
    sheet.getRange(1, lastColumn + 1, 1, missing.length).setValues([missing]);
  }
}

function validateModule_(module) {
  var name = String(module || "");
  if (!SHEET_DEFINITIONS[name] || name === "LOG_AKTIVITI") {
    throw new Error("Modul rekod tidak sah.");
  }
  return name;
}

function handleLogin_(request) {
  var username = String(request.username || "").trim();
  var password = String(request.password || "");
  if (!username || !password) throw new Error("Nama pengguna dan kata laluan diperlukan.");

  var properties = PropertiesService.getScriptProperties();
  var expectedUsername = properties.getProperty("ADMIN_USERNAME");
  var salt = properties.getProperty("ADMIN_PASSWORD_SALT");
  var expectedHash = properties.getProperty("ADMIN_PASSWORD_HASH");
  if (!expectedUsername || !salt || !expectedHash) {
    throw new Error("Akaun admin belum disediakan. Jalankan setupAdminAccount terlebih dahulu.");
  }

  var cache = CacheService.getScriptCache();
  var attemptKey = "LOGIN_FAIL_" + hashText_(username).slice(0, 24);
  var attempts = Number(cache.get(attemptKey) || 0);
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    throw new Error("Terlalu banyak percubaan log masuk. Cuba semula selepas 10 minit.");
  }

  var valid = username === expectedUsername && hashText_(salt + password) === expectedHash;
  if (!valid) {
    cache.put(attemptKey, String(attempts + 1), 600);
    Utilities.sleep(250);
    throw new Error("Nama pengguna atau kata laluan tidak sah.");
  }
  cache.remove(attemptKey);
  cleanExpiredSessions_();

  var token = Utilities.getUuid() + Utilities.getUuid() + String(new Date().getTime());
  var now = new Date().getTime();
  var expiresAt = now + sessionTimeoutMs_();
  properties.setProperty(sessionKey_(token), JSON.stringify({
    username: expectedUsername,
    createdAt: now,
    lastActiveAt: now,
    expiresAt: expiresAt
  }));
  logActivity_("LOG_MASUK", "", "Log masuk admin berjaya.", expectedUsername);
  return jsonResponse_(true, "Log masuk admin berjaya.", {
    token: token,
    username: expectedUsername,
    expiresAt: expiresAt
  });
}

function verifyAdminToken_(token) {
  var rawToken = String(token || "");
  if (!rawToken) throw new Error("Token sesi admin diperlukan.");
  var properties = PropertiesService.getScriptProperties();
  var key = sessionKey_(rawToken);
  var raw = properties.getProperty(key);
  if (!raw) throw new Error("Sesi admin tidak sah atau telah tamat.");
  var session;
  try {
    session = JSON.parse(raw);
  } catch (error) {
    properties.deleteProperty(key);
    throw new Error("Data sesi admin rosak. Sila log masuk semula.");
  }
  var now = new Date().getTime();
  if (Number(session.expiresAt || 0) <= now) {
    properties.deleteProperty(key);
    throw new Error("Sesi admin telah tamat. Sila log masuk semula.");
  }
  session.lastActiveAt = now;
  session.expiresAt = now + sessionTimeoutMs_();
  properties.setProperty(key, JSON.stringify(session));
  return session;
}

function handleLogout_(token) {
  var properties = PropertiesService.getScriptProperties();
  var key = sessionKey_(String(token || ""));
  var raw = properties.getProperty(key);
  if (raw) {
    try {
      var session = JSON.parse(raw);
      logActivity_("LOG_KELUAR", "", "Log keluar admin.", session.username || "Admin");
    } catch (error) {
      // Sesi akan tetap dipadam.
    }
  }
  properties.deleteProperty(key);
  return jsonResponse_(true, "Log keluar berjaya.", { loggedOut: true });
}

function sessionTimeoutMs_() {
  var value = Number(PropertiesService.getScriptProperties().getProperty("SESSION_TIMEOUT_MINUTES") || SESSION_TIMEOUT_MINUTES);
  return Math.max(value, 1) * 60 * 1000;
}

function sessionKey_(token) {
  return "SESSION_" + hashText_(token).slice(0, 48);
}

function cleanExpiredSessions_() {
  var properties = PropertiesService.getScriptProperties();
  var all = properties.getProperties();
  var now = new Date().getTime();
  Object.keys(all).forEach(function (key) {
    if (key.indexOf("SESSION_") !== 0) return;
    try {
      if (Number(JSON.parse(all[key]).expiresAt || 0) <= now) properties.deleteProperty(key);
    } catch (error) {
      properties.deleteProperty(key);
    }
  });
}

function hashText_(text) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(text),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function (byte) {
    var value = byte < 0 ? byte + 256 : byte;
    return ("0" + value.toString(16)).slice(-2);
  }).join("");
}

function handleAddRecord_(request) {
  var module = validateModule_(request.module);
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ensureSheetsUnlocked_();
    var spreadsheet = getSpreadsheet_();
    var sheet = spreadsheet.getSheetByName(module);
    var record = normalizeServerRecord_(module, request.record || {}, null, "Pengguna Awam");
    enforcePublicDefaults_(module, record);
    if (findRecordRow_(sheet, record.id) > 0) record.id = generateServerId_(module);
    validateRecord_(module, record);
    assertBasketAvailable_(sheet, module, record, "");
    appendRecord_(sheet, module, record);
    logActivityUnlocked_(spreadsheet, "TAMBAH_REKOD", record.id, "Rekod baharu ditambah dalam " + module + ".", "Pengguna Awam");
    return jsonResponse_(true, "Rekod berjaya ditambah.", record);
  } finally {
    lock.releaseLock();
  }
}

function handleGetAll_(request, session) {
  ensureSheets();
  var spreadsheet = getSpreadsheet_();
  var result = {};
  Object.keys(MODULE_TITLES).forEach(function (module) {
    result[module] = readRecords_(spreadsheet.getSheetByName(module), module, Boolean(request.includeDeleted));
  });
  logActivity_("BACA_SEMUA", "", "Admin membaca semua rekod.", session.username);
  return jsonResponse_(true, "Semua rekod berjaya dibaca.", result);
}

function handleGetRecords_(request, session) {
  var module = validateModule_(request.module);
  ensureSheets();
  var records = readRecords_(getSpreadsheet_().getSheetByName(module), module, Boolean(request.includeDeleted));
  records = filterRecords_(records, module, request.filters || request);
  logActivity_("CARI_REKOD", "", "Carian rekod dalam " + module + ".", session.username);
  return jsonResponse_(true, "Rekod berjaya dibaca.", {
    records: records,
    count: records.length
  });
}

function handleUpdateRecord_(request, session) {
  var module = validateModule_(request.module);
  var id = String(request.id || "").trim();
  if (!id) throw new Error("ID rekod diperlukan.");
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ensureSheetsUnlocked_();
    var spreadsheet = getSpreadsheet_();
    var sheet = spreadsheet.getSheetByName(module);
    var rowNumber = findRecordRow_(sheet, id);
    if (rowNumber < 2) throw new Error("Rekod tidak ditemui.");
    var headers = getHeaders_(sheet);
    var existing = rowToObject_(headers, sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0]);
    if (existing.statusRekod === "Dipadam") throw new Error("Rekod yang telah dipadam tidak boleh dikemas kini.");
    var record = normalizeServerRecord_(module, request.record || {}, existing, session.username);
    record.id = id;
    validateRecord_(module, record);
    assertBasketAvailable_(sheet, module, record, id);
    sheet.getRange(rowNumber, 1, 1, headers.length).setValues([objectToRow_(headers, record)]);
    logActivityUnlocked_(spreadsheet, "KEMAS_KINI", id, "Rekod dikemas kini dalam " + module + ".", session.username);
    return jsonResponse_(true, "Rekod berjaya dikemas kini.", record);
  } finally {
    lock.releaseLock();
  }
}

function handleDeleteRecord_(request, session) {
  var module = validateModule_(request.module);
  var id = String(request.id || "").trim();
  if (!id) throw new Error("ID rekod diperlukan.");
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ensureSheetsUnlocked_();
    var spreadsheet = getSpreadsheet_();
    var sheet = spreadsheet.getSheetByName(module);
    var rowNumber = findRecordRow_(sheet, id);
    if (rowNumber < 2) throw new Error("Rekod tidak ditemui.");
    var headers = getHeaders_(sheet);
    var record = rowToObject_(headers, sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0]);
    record.statusRekod = "Dipadam";
    record.updatedAt = new Date().toISOString();
    record.actionUser = session.username;
    sheet.getRange(rowNumber, 1, 1, headers.length).setValues([objectToRow_(headers, record)]);
    logActivityUnlocked_(spreadsheet, "PADAM_REKOD", id, "Rekod ditanda sebagai Dipadam dalam " + module + ".", session.username);
    return jsonResponse_(true, "Rekod berjaya dipadam.", { id: id, statusRekod: "Dipadam" });
  } finally {
    lock.releaseLock();
  }
}

function handleMarkReturned_(request, session) {
  var module = validateModule_(request.module);
  if (LOAN_MODULES.indexOf(module) === -1) throw new Error("Modul ini bukan modul pinjaman.");
  var id = String(request.id || "").trim();
  if (!id) throw new Error("ID rekod diperlukan.");
  var condition = sanitizeValue_(request.condition || "Baik");
  var returnDate = normalizeDate_(request.returnDate || todayKl_());
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ensureSheetsUnlocked_();
    var spreadsheet = getSpreadsheet_();
    var sheet = spreadsheet.getSheetByName(module);
    var rowNumber = findRecordRow_(sheet, id);
    if (rowNumber < 2) throw new Error("Rekod tidak ditemui.");
    var headers = getHeaders_(sheet);
    var record = rowToObject_(headers, sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0]);
    if (record.statusRekod === "Dipadam") throw new Error("Rekod yang dipadam tidak boleh ditandakan.");
    record.tarikhPemulanganSebenar = returnDate;
    record.statusPinjaman = condition === "Rosak" ? "Rosak" : "Dipulangkan";
    var conditionHeader = headers.filter(function (header) {
      return /SemasaDipulangkan$/.test(header);
    })[0];
    if (conditionHeader) record[conditionHeader] = condition;
    record.updatedAt = new Date().toISOString();
    record.actionUser = session.username;
    sheet.getRange(rowNumber, 1, 1, headers.length).setValues([objectToRow_(headers, record)]);
    logActivityUnlocked_(spreadsheet, "PEMULANGAN", id, "Pemulangan direkodkan dalam " + module + ".", session.username);
    return jsonResponse_(true, "Pemulangan berjaya direkodkan.", record);
  } finally {
    lock.releaseLock();
  }
}

function handleBasketCheck_(request) {
  var module = validateModule_(request.module);
  if (module !== "PINJAMAN_BAKUL_BM" && module !== "PINJAMAN_BAKUL_BI") {
    throw new Error("Semakan kod hanya sah untuk modul pinjaman bakul.");
  }
  ensureSheets();
  var sheet = getSpreadsheet_().getSheetByName(module);
  var record = {
    kodNomborBakul: sanitizeValue_(request.code || (request.record && request.record.kodNomborBakul) || "")
  };
  assertBasketAvailable_(sheet, module, record, String(request.ignoreId || ""));
  return jsonResponse_(true, "Kod bakul tersedia.", { available: true });
}

function normalizeServerRecord_(module, incoming, existing, actionUser) {
  var now = new Date().toISOString();
  var allowed = BASE_HEADERS.concat(SHEET_DEFINITIONS[module]);
  var record = {};
  allowed.forEach(function (key) {
    if (existing && existing[key] != null) record[key] = existing[key];
    if (incoming && Object.prototype.hasOwnProperty.call(incoming, key)) {
      record[key] = sanitizeValue_(incoming[key]);
    }
  });
  record.id = existing && existing.id ? existing.id : sanitizeValue_(record.id || generateServerId_(module));
  record.createdAt = existing && existing.createdAt ? existing.createdAt : now;
  record.updatedAt = now;
  record.statusRekod = existing && existing.statusRekod ? existing.statusRekod : "Aktif";
  record.modul = module;
  record.sumberModul = MODULE_TITLES[module];
  record.actionUser = actionUser;

  if (module === "PENGGUNAAN_PSS") {
    record.tarikh = normalizeDate_(record.tarikh);
    record.hari = dayNameMs_(record.tarikh);
    record.bilanganMuridLelaki = safeNumber_(record.bilanganMuridLelaki, 0);
    record.bilanganMuridPerempuan = safeNumber_(record.bilanganMuridPerempuan, 0);
    record.jumlahPengguna = record.bilanganMuridLelaki + record.bilanganMuridPerempuan;
  }
  if (module === "RESENSI_TAHAP_2") {
    record.tarikh = normalizeDate_(record.tarikh);
    record.bilanganHalaman = safeNumber_(record.bilanganHalaman, 1);
    record.statusPengesahan = record.statusPengesahan || "Belum Disahkan";
  }
  if (LOAN_MODULES.indexOf(module) >= 0) {
    record.tarikhPinjaman = normalizeDate_(record.tarikhPinjaman);
    record.tarikhPerluDipulangkan = normalizeDate_(record.tarikhPerluDipulangkan);
    record.tarikhPemulanganSebenar = record.tarikhPemulanganSebenar ? normalizeDate_(record.tarikhPemulanganSebenar) : "";
    record.statusPinjaman = calculateLoanStatus_(record);
  }
  if (module === "PINJAMAN_KAMUS" || module === "PINJAMAN_BUKU_GURU") {
    record.kuantiti = safeNumber_(record.kuantiti, 1);
  }
  if (module === "PINJAMAN_BAKUL_BM" || module === "PINJAMAN_BAKUL_BI") {
    record.jenisBakul = module === "PINJAMAN_BAKUL_BM" ? "NILAM BM" : "NILAM BI";
    record.bilanganBukuDalamBakul = safeNumber_(record.bilanganBukuDalamBakul, 1);
  }
  return record;
}

function enforcePublicDefaults_(module, record) {
  if (LOAN_MODULES.indexOf(module) >= 0) {
    record.tarikhPemulanganSebenar = "";
    record.statusPinjaman = calculateLoanStatus_(Object.assign({}, record, { statusPinjaman: "Sedang Dipinjam" }));
    Object.keys(record).forEach(function (key) {
      if (/SemasaDipulangkan$/.test(key)) record[key] = "";
    });
  }
  if (module === "RESENSI_TAHAP_2") {
    record.namaGuruPengesah = "";
    record.statusPengesahan = "Belum Disahkan";
    record.catatanGuru = "";
  }
}

function validateRecord_(module, record) {
  (REQUIRED_FIELDS[module] || []).forEach(function (key) {
    if (record[key] == null || String(record[key]).trim() === "") {
      throw new Error("Medan wajib belum lengkap: " + key + ".");
    }
  });
  if (module === "RESENSI_TAHAP_2") {
    if (!/Tahun\s*[456]/i.test(String(record.tahunKelas || ""))) {
      throw new Error("Resensi Tahap 2 hanya untuk murid Tahun 4, Tahun 5 atau Tahun 6.");
    }
    if (String(record.sinopsis || "").length > 800) throw new Error("Sinopsis melebihi 800 aksara.");
    if (String(record.nilaiMurni || "").length > 400) throw new Error("Nilai murni melebihi 400 aksara.");
  }
  if (module === "PENGGUNAAN_PSS" && record.masaMula && record.masaTamat && record.masaTamat <= record.masaMula) {
    throw new Error("Masa tamat mestilah selepas masa mula.");
  }
  if (LOAN_MODULES.indexOf(module) >= 0 && record.tarikhPerluDipulangkan < record.tarikhPinjaman) {
    throw new Error("Tarikh perlu dipulangkan tidak boleh lebih awal daripada tarikh pinjaman.");
  }
}

function sanitizeValue_(value) {
  if (value == null) return "";
  if (typeof value === "number" || typeof value === "boolean") return value;
  var text = String(value).replace(/\u0000/g, "").trim();
  if (text.length > 5000) text = text.slice(0, 5000);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function safeNumber_(value, minimum) {
  var number = Number(value);
  if (!isFinite(number) || number < minimum) throw new Error("Nilai nombor tidak sah.");
  return number;
}

function normalizeDate_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, "Asia/Kuala_Lumpur", "yyyy-MM-dd");
  var text = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error("Format tarikh tidak sah.");
  return text;
}

function calculateLoanStatus_(record) {
  var status = String(record.statusPinjaman || "Sedang Dipinjam");
  if (record.tarikhPemulanganSebenar) return status === "Rosak" || status === "Hilang" ? status : "Dipulangkan";
  if (record.tarikhPerluDipulangkan && record.tarikhPerluDipulangkan < todayKl_() && (status === "Sedang Dipinjam" || status === "Lewat")) {
    return "Lewat";
  }
  return status;
}

function todayKl_() {
  return Utilities.formatDate(new Date(), "Asia/Kuala_Lumpur", "yyyy-MM-dd");
}

function dayNameMs_(dateText) {
  var parts = String(dateText).split("-");
  var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
  var names = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
  return names[date.getDay()];
}

function generateServerId_(module) {
  var date = Utilities.formatDate(new Date(), "Asia/Kuala_Lumpur", "yyyyMMdd");
  var suffix = Utilities.getUuid().replace(/-/g, "").slice(0, 6).toUpperCase();
  return MODULE_PREFIXES[module] + "-" + date + "-" + suffix;
}

function getHeaders_(sheet) {
  if (!sheet || sheet.getLastColumn() < 1) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
}

function appendRecord_(sheet, module, record) {
  var headers = getHeaders_(sheet);
  sheet.appendRow(objectToRow_(headers, record));
}

function objectToRow_(headers, record) {
  return headers.map(function (header) {
    return record[header] == null ? "" : record[header];
  });
}

function rowToObject_(headers, values) {
  var record = {};
  headers.forEach(function (header, index) {
    var value = values[index];
    if (value instanceof Date) {
      value = /At$/.test(header)
        ? value.toISOString()
        : Utilities.formatDate(value, "Asia/Kuala_Lumpur", "yyyy-MM-dd");
    }
    record[header] = value;
  });
  return record;
}

function readRecords_(sheet, module, includeDeleted) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  var headers = getHeaders_(sheet);
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  return values.map(function (row) {
    var record = rowToObject_(headers, row);
    if (LOAN_MODULES.indexOf(module) >= 0) record.statusPinjaman = calculateLoanStatus_(record);
    return record;
  }).filter(function (record) {
    return includeDeleted || record.statusRekod !== "Dipadam";
  }).sort(function (a, b) {
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  });
}

function findRecordRow_(sheet, id) {
  if (!sheet || sheet.getLastRow() < 2) return -1;
  var headers = getHeaders_(sheet);
  var idColumn = headers.indexOf("id") + 1;
  if (!idColumn) return -1;
  var finder = sheet.getRange(2, idColumn, sheet.getLastRow() - 1, 1)
    .createTextFinder(String(id))
    .matchEntireCell(true)
    .findNext();
  return finder ? finder.getRow() : -1;
}

function assertBasketAvailable_(sheet, module, record, ignoreId) {
  if (module !== "PINJAMAN_BAKUL_BM" && module !== "PINJAMAN_BAKUL_BI") return;
  var code = String(record.kodNomborBakul || "").trim().toLowerCase();
  if (!code) throw new Error("Kod atau nombor bakul diperlukan.");
  var conflict = readRecords_(sheet, module, false).some(function (row) {
    return row.id !== ignoreId &&
      String(row.kodNomborBakul || "").trim().toLowerCase() === code &&
      String(row.statusPinjaman || "") !== "Dipulangkan";
  });
  if (conflict) {
    throw new Error("Kod bakul ini masih dipinjam oleh kelas lain. Tandakan pemulangan terdahulu terlebih dahulu.");
  }
}

function filterRecords_(records, module, filters) {
  var query = String(filters.search || "").toLowerCase();
  var start = String(filters.dateStart || "");
  var end = String(filters.dateEnd || "");
  var dateKey = module === "PENGGUNAAN_PSS" || module === "RESENSI_TAHAP_2" ? "tarikh" : "tarikhPinjaman";
  return records.filter(function (record) {
    var haystack = Object.keys(record).map(function (key) { return String(record[key] || ""); }).join(" ").toLowerCase();
    var date = String(record[dateKey] || "").slice(0, 10);
    var status = record.statusPinjaman || record.statusPengesahan || record.statusRekod;
    return (!query || haystack.indexOf(query) >= 0) &&
      (!start || date >= start) &&
      (!end || date <= end) &&
      (!filters.status || status === filters.status) &&
      (!filters.classValue || record.kelasUnitKumpulan === filters.classValue || record.kelasJawatan === filters.classValue || record.tahunKelas === filters.classValue) &&
      (!filters.category || record.kategoriPengguna === filters.category || record.bahasaKamus === filters.category || record.kategoriBuku === filters.category || record.jenisBakul === filters.category);
  });
}

function logActivity_(action, recordId, details, username) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ensureSheetsUnlocked_();
    logActivityUnlocked_(getSpreadsheet_(), action, recordId, details, username);
  } finally {
    lock.releaseLock();
  }
}

function logActivityUnlocked_(spreadsheet, action, recordId, details, username) {
  var sheet = spreadsheet.getSheetByName("LOG_AKTIVITI");
  if (!sheet) return;
  var now = new Date().toISOString();
  var record = {
    id: generateServerId_("LOG_AKTIVITI"),
    createdAt: now,
    updatedAt: now,
    statusRekod: "Aktif",
    modul: "LOG_AKTIVITI",
    sumberModul: "Log Aktiviti",
    actionUser: sanitizeValue_(username || "Sistem"),
    action: sanitizeValue_(action),
    recordId: sanitizeValue_(recordId),
    details: sanitizeValue_(details)
  };
  appendRecord_(sheet, "LOG_AKTIVITI", record);
}

/**
 * Boleh dijalankan secara manual atau melalui pencetus berkala.
 * Fungsi ini menyimpan perubahan status Lewat terus ke Google Sheets.
 */
function refreshOverdueStatuses() {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ensureSheetsUnlocked_();
    var spreadsheet = getSpreadsheet_();
    var changed = 0;
    LOAN_MODULES.forEach(function (module) {
      var sheet = spreadsheet.getSheetByName(module);
      if (!sheet || sheet.getLastRow() < 2) return;
      var headers = getHeaders_(sheet);
      var statusColumn = headers.indexOf("statusPinjaman") + 1;
      var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
      values.forEach(function (row, index) {
        var record = rowToObject_(headers, row);
        var status = calculateLoanStatus_(record);
        if (record.statusPinjaman !== status) {
          sheet.getRange(index + 2, statusColumn).setValue(status);
          changed += 1;
        }
      });
    });
    logActivityUnlocked_(spreadsheet, "KEMAS_KINI_LEWAT", "", changed + " status lewat dikemas kini.", "Sistem");
    return changed;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Jalankan sekali jika mahu pencetus automatik bagi status lewat dan pembersihan sesi.
 */
function installMaintenanceTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    var handler = trigger.getHandlerFunction();
    if (handler === "refreshOverdueStatuses" || handler === "cleanExpiredSessionsTrigger") {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  ScriptApp.newTrigger("refreshOverdueStatuses").timeBased().everyHours(1).create();
  ScriptApp.newTrigger("cleanExpiredSessionsTrigger").timeBased().everyHours(6).create();
  return "Pencetus penyelenggaraan EduCafe berjaya dipasang.";
}

function cleanExpiredSessionsTrigger() {
  cleanExpiredSessions_();
}
