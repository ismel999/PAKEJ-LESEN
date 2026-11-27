  import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
  import {
    getFirestore, collection, onSnapshot, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc,
    runTransaction, deleteField, query, where, serverTimestamp, writeBatch
  } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
  import {
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword,
    deleteUser // TAMBAHAN: rollback akaun Auth kalau dokumen pelajar gagal dicipta (cth: slot Ceramah/UK dah penuh)
  } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
  import { firebaseConfig } from "./firebase-config.js";

  const configWarning = document.getElementById("config-warning");
  const statusEl = document.getElementById("statusSambungan");
  const tbody = document.getElementById("tbody");
  const ringkasanEl = document.getElementById("ringkasan");
  const carianEl = document.getElementById("carian");
  const notifPermintaanEl = document.getElementById("notifPermintaan");
  const tapisanAktifWrapEl = document.getElementById("tapisanAktifWrap"); // TAMBAHAN

  const loginScreen = document.getElementById("login-screen");
  const appContent = document.getElementById("app-content");
  const loginEmailEl = document.getElementById("loginEmail");
  const loginPasswordEl = document.getElementById("loginPassword");
  const btnLogin = document.getElementById("btnLogin");
  const loginErrorEl = document.getElementById("login-error");
  const btnLogout = document.getElementById("btnLogout");

  const modalOverlay = document.getElementById("modalOverlay");
  const modalNamaPelajar = document.getElementById("modalNamaPelajar");
  const modalPilihanWrap = document.getElementById("modalPilihanWrap");
  const btnTutupModal = document.getElementById("btnTutupModal");

  // TAMBAHAN: rujukan DOM untuk modal Kalendar
  const btnBukaKalendar = document.getElementById("btnBukaKalendar");
  // TAMBAHAN: butang "Details" kedua dalam tab Dashboard — buka modal
  // kalendar yang SAMA (bukaModalKalendar), bukan modal/logik berasingan.
  const btnBukaKalendarDashboard = document.getElementById("btnBukaKalendarDashboard");
  // TAMBAHAN: butang "Details" pada kad heatmap "Jadual Akan Datang (14
  // Hari)" — diletak BALIK atas permintaan admin, guna function
  // bukaModalKalendar() SAMA (bukan modal/logik berasingan).
  const btnBukaKalendarHeatmap = document.getElementById("btnBukaKalendarHeatmap");
  // TAMBAHAN: butang "+ Tambah Pakej" pada kad "Pengurusan Pakej" (tab Dashboard)
  const btnTambahPakej = document.getElementById("btnTambahPakej");
  const modalKalenderOverlay = document.getElementById("modalKalenderOverlay");
  const kalendarIsiWrap = document.getElementById("kalendarIsiWrap");
  const btnTutupModalKalendar = document.getElementById("btnTutupModalKalendar");
  // TAMBAHAN: rujukan DOM modal "Maklumat Lengkap"
  const modalMaklumatOverlay = document.getElementById("modalMaklumatOverlay");
  const modalMaklumatWrap = document.getElementById("modalMaklumatWrap");
  const btnTutupModalMaklumat = document.getElementById("btnTutupModalMaklumat");

  // TAMBAHAN: rujukan DOM bekas slip cetak (laporan status seorang pelajar)
  const slipCetakPelajarEl = document.getElementById("slipCetakPelajar");

  // TAMBAHAN: rujukan DOM untuk tab "Daftar Memandu" (kaunter)
  const drmBorang = document.getElementById("drmBorang");
  const drmPanelJaya = document.getElementById("drmPanelJaya");
  const drmNama = document.getElementById("drmNama");
  const drmNoKP = document.getElementById("drmNoKP");
  const drmNoTel = document.getElementById("drmNoTel");
  const drmAlamat = document.getElementById("drmAlamat");
  // KEMASKINI (Request 2 — 2 pakej): drmPakej (SATU select) -> DUA select
  // berasingan (Moto/Kereta) + ref nota "2 pakej".
  const drmPakejMoto = document.getElementById("drmPakejMoto");
  const drmPakejKereta = document.getElementById("drmPakejKereta");
  const drmNotaDuaPakej = document.getElementById("drmNotaDuaPakej");
  const drmEmel = document.getElementById("drmEmel");
  const drmPassword = document.getElementById("drmPassword");
  const drmRalat = document.getElementById("drmRalat");
  const drmBtnJana = document.getElementById("drmBtnJana");
  const drmBtnSalin = document.getElementById("drmBtnSalin");
  const drmBtnBatal = document.getElementById("drmBtnBatal");
  const drmBtnDaftar = document.getElementById("drmBtnDaftar");
  const drmBtnDaftarLagi = document.getElementById("drmBtnDaftarLagi");
  const drmBtnCetakSlip = document.getElementById("drmBtnCetakSlip");
  const drmBtnSelesai = document.getElementById("drmBtnSelesai"); // TAMBAHAN
  const drmSlipRingkas = document.getElementById("drmSlipRingkas");
  // TAMBAHAN: panel "Sahkan Pembayaran (Tunai)" lepas daftar
  const drmPanelBayaranLepasDaftar = document.getElementById("drmPanelBayaranLepasDaftar");
  const drmNotaBayaranLepasDaftar = document.getElementById("drmNotaBayaranLepasDaftar");
  const drmBtnSahBayaranLepasDaftar = document.getElementById("drmBtnSahBayaranLepasDaftar");

  // TAMBAHAN: rujukan DOM kalendar Ceramah & Ujian Komputer (dlm borang Daftar Memandu)
  const drmCeramahGrid = document.getElementById("drmCeramahGrid");
  const drmCeramahLabel = document.getElementById("drmCeramahLabel");
  const drmCeramahPrev = document.getElementById("drmCeramahPrev");
  const drmCeramahNext = document.getElementById("drmCeramahNext");
  const drmCeramahPilihanTeks = document.getElementById("drmCeramahPilihanTeks");
  // KEMASKINI (2 pakej): sub-paparan pilih Moto/Kereta utk SATU tarikh Ceramah yg diklik
  const drmCeramahJenisWrap = document.getElementById("drmCeramahJenisWrap");
  const drmCeramahJenisTarikhTeks = document.getElementById("drmCeramahJenisTarikhTeks");
  const drmCeramahJenisBtnWrap = document.getElementById("drmCeramahJenisBtnWrap");
  const drmUkGrid = document.getElementById("drmUkGrid");
  const drmUkLabel = document.getElementById("drmUkLabel");
  const drmUkPrev = document.getElementById("drmUkPrev");
  const drmUkNext = document.getElementById("drmUkNext");
  const drmUkSesiWrap = document.getElementById("drmUkSesiWrap");
  const drmUkTarikhTerpilihTeks = document.getElementById("drmUkTarikhTerpilihTeks");
  const drmUkSesiBtnWrap = document.getElementById("drmUkSesiBtnWrap");
  const drmUkPilihanTeks = document.getElementById("drmUkPilihanTeks");

  // TAMBAHAN: rujukan DOM untuk senarai "Pelajar Didaftar Kaunter" + mini-kalendar
  const kkSenaraiWrap = document.getElementById("kkSenaraiWrap");
  const kkKiraanEl = document.getElementById("kkKiraan");
  const kkCarianEl = document.getElementById("kkCarian"); // TAMBAHAN: carian khusus tab ni
  const kkKalOverlay = document.getElementById("kkKalOverlay");
  const kkKalNavWrap = document.getElementById("kkKalNavWrap");
  const kkKalLabelBulan = document.getElementById("kkKalLabelBulan");
  const kkKalGrid = document.getElementById("kkKalGrid");
  const kkKalPrev = document.getElementById("kkKalPrev");
  const kkKalNext = document.getElementById("kkKalNext");
  const kkKalTutup = document.getElementById("kkKalTutup");
  // TAMBAHAN: rujukan DOM sub-paparan pilih Sesi (Ujian Komputer, kaunter)
  const kkKalGridWrap = document.getElementById("kkKalGridWrap");
  const kkKalUkSesiWrap = document.getElementById("kkKalUkSesiWrap");
  const kkKalUkTarikhTeks = document.getElementById("kkKalUkTarikhTeks");
  const kkKalUkSesiBtnWrap = document.getElementById("kkKalUkSesiBtnWrap");
  const kkKalUkKembali = document.getElementById("kkKalUkKembali");
  // TAMBAHAN: rujukan DOM sub-paparan pilih Sesi (Latihan Praktikal, kaunter)
  const kkKalLpSesiWrap = document.getElementById("kkKalLpSesiWrap");
  const kkKalLpTarikhTeks = document.getElementById("kkKalLpTarikhTeks");
  const kkKalLpAmaran = document.getElementById("kkKalLpAmaran");
  const kkKalLpSesiBtnWrap = document.getElementById("kkKalLpSesiBtnWrap");
  const kkKalLpKembali = document.getElementById("kkKalLpKembali");

  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("GANTI_")) {
    configWarning.style.display = "block";
    statusEl.textContent = "Config belum diisi";
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // TAMBAHAN: 4 pakej ASAL (default) — dipakai sbg titik permulaan sebelum
  // admin sentuh apa-apa. "key" ni jadi NAMA FIELD dlm dok Firestore
  // "tetapan/pakej" (lihat mulakanStatusPakej() bawah) — key SAMA ni yang
  // app Android WAJIB baca utk tahu pakej mana kena jadi kelabu/disabled.
  const SENARAI_PAKEJ_ASAL = [
    { key: "pakej_b", nama: "Pakej B", harga: "RM 720.00", jenis: "MOTO" },
    { key: "pakej_b2", nama: "Pakej B2", harga: "RM 850.00", jenis: "MOTO" },
    { key: "pakej_d", nama: "Pakej D", harga: "RM 980.00", jenis: "KERETA" },
    { key: "pakej_da", nama: "Pakej DA", harga: "RM 1230.00", jenis: "KERETA" },
  ];
  // TAMBAHAN: data pakej sebenar (termasuk pakej BARU yg admin tambah
  // sendiri via "+ Tambah Pakej"), dimuat dari SATU dok Firestore
  // "tetapan/pakej" — satu field per pakej, key ialah slug nama pakej.
  // DUA bentuk nilai disokong (lihat dapatkanSenaraiPakejPenuh() bawah):
  //   1. boolean (format LAMA, cuma utk 4 pakej ASAL di atas) — true/tiada
  //      field = aktif, false = dinyahaktifkan; nama/harga diambil dari
  //      SENARAI_PAKEJ_ASAL.
  //   2. objek {nama, harga, aktif} (format BARU — WAJIB utk pakej baru yg
  //      admin tambah sendiri, sebab nama/harga dia takde dlm kod).
  // NOTA/ASSUMSI: dok/field ni pihak app Android WAJIB baca (collection
  // "tetapan", dok "pakej") utk papar pakej yg aktif:false dlm keadaan
  // kelabu/tak boleh tekan (BUKAN hilang terus macam kat dropdown admin ni).
  let statusPakej = {};
  let unsubscribeStatusPakej = null;

  // TAMBAHAN: tukar nama pakej jadi "key" (slug) — huruf kecil, bukan
  // alfanumerik jadi underscore, potong underscore hujung/pangkal. Dikongsi
  // oleh tambahPakejBaru() sahaja (4 pakej ASAL dah ada key tetap sendiri).
  function janaKeyPakej(nama) {
    return nama.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }

  // TAMBAHAN: SUMBER TUNGGAL senarai pakej PENUH (4 asal + mana-mana pakej
  // baru yg admin dah tambah), digabung drpd SENARAI_PAKEJ_ASAL + statusPakej
  // semasa. Dikongsi oleh dropdown #drmPakej DAN kad "Pengurusan Pakej" —
  // supaya KEDUA guna hasil pengiraan SAMA, tiada risiko bercanggah.
  function dapatkanSenaraiPakejPenuh() {
    const hasil = [];
    const dilihat = new Set();

    SENARAI_PAKEJ_ASAL.forEach(pk => {
      const v = statusPakej[pk.key];
      // TAMBAHAN: pakej ASAL yg dah dibuang admin (butang "Buang") ditanda
      // { dipadam: true } dlm Firestore — TAK boleh guna deleteField() utk
      // pakej asal sebab field yg TIADA ditafsir sbg "aktif secara default"
      // (lihat bawah), so kena tanda dipadam SECARA EXPLICIT supaya dia
      // betul-betul hilang drpd senarai & dropdown.
      if (v && typeof v === "object" && v.dipadam === true) {
        dilihat.add(pk.key);
        return;
      }
      let aktif = true, nama = pk.nama, harga = pk.harga, jenis = pk.jenis; // KEMASKINI: jenis (MOTO/KERETA) — lalai ikut pakej asal
      if (typeof v === "boolean") {
        aktif = v; // format lama
      } else if (v && typeof v === "object") {
        aktif = v.aktif !== false;
        if (v.nama) nama = v.nama;
        if (v.harga) harga = v.harga;
        if (v.jenis) jenis = v.jenis;
      }
      hasil.push({ key: pk.key, nama, harga, aktif, jenis });
      dilihat.add(pk.key);
    });

    // pakej BARU (ditambah admin via "+ Tambah Pakej") — mana-mana field
    // dlm statusPakej yg bukan salah satu 4 key asal & berbentuk objek.
    // Pakej baru yg dibuang terus dipadam drpd dok (deleteField(), lihat
    // padamPakej()) jadi automatik takkan muncul kat sini lagi — TIADA
    // penanda dipadam diperlukan utk kes ni.
    Object.keys(statusPakej).forEach(key => {
      if (dilihat.has(key)) return;
      const v = statusPakej[key];
      if (v && typeof v === "object" && v.nama) {
        hasil.push({ key, nama: v.nama, harga: v.harga || "", aktif: v.aktif !== false, jenis: v.jenis || "" });
      }
    });

    return hasil;
  }

  // ======================================================================
  // KEMASKINI (2 PAKEJ: Moto + Kereta): kunci field & koleksi slot latihan.
  // Latihan Moto & Kereta DIKIRA BERASINGAN — koleksi slot pun berasingan.
  // ======================================================================
  const KUNCI_LATIHAN_MOTO = "latihanPraktikalMoto";
  const KUNCI_LATIHAN_KERETA = "latihanPraktikalKereta";
  const KOLEKSI_LATIHAN = {
    latihanPraktikalMoto:   { jenis: "MOTO",   label: "Moto",   sesi: "latihan_moto_slots",   qti: "latihan_moto_qti_slots",   jumlahSesiLalai: 7 },
    // KEMASKINI: Latihan Kereta = 10 sesi (bukan 9) + 1 QTI = 11 jumlah
    // keseluruhan. jumlahSesiLalai ni SATU sumber kebenaran dikongsi oleh
    // kkBlokLatihan() (bilangan baris Sesi dipaparkan), kkTetapkanLatihanSesi()
    // (padding senarai + penentu "sesi terakhir" pemicu auto-QTI) & tempat lain
    // yg guna KOLEKSI_LATIHAN — tukar SATU nombor ni je, semua tempat terus ikut.
    latihanPraktikalKereta: { jenis: "KERETA", label: "Kereta", sesi: "latihan_kereta_slots", qti: "latihan_kereta_qti_slots", jumlahSesiLalai: 10 }
  };

  let senaraiPelajar = [];
  let senaraiPermintaan = []; // TAMBAHAN: permintaan tukar tarikh berstatus MENUNGGU
  let unsubscribeSnapshot = null;
  let unsubscribePermintaan = null; // TAMBAHAN
  // KEMASKINI (mockup diluluskan, pastu dikemaskini lagi ikut maklum balas
  // admin — "papar semua terus, tak payah sembunyi-sembunyi"): "Lihat Sesi"
  // popup terapung digantikan dgn blok tajuk+panel inline
  // (htmlBlokLatihanTajukPanel()) — tekan TAJUK buka/tutup panel, panel
  // tunjuk SEMUA sesi SEKALI GUS (tiada lagi "4 dulu + Lihat Lagi"). BEBERAPA
  // blok boleh terbuka SERENTAK (bukan satu je pada satu masa macam popup
  // lama), so pakai Set (SAMA pattern dgn kadTerbukaSet di bawah) dipetakan
  // ikut kunci "uid|kunci" (kunci = latihanPraktikalMoto/latihanPraktikalKereta).
  let latihanTerbukaSet = new Set(); // TAMBAHAN: "uid|kunci" blok Latihan Praktikal mana yg tajuk-nya ditekan (panel terbuka)
  // TAMBAHAN: set uid kad pelajar yang SEDANG TERBUKA (collapse-by-default /
  // expand-on-klik — lihat baris_htmlKad()). Set (bukan boolean tunggal)
  // sebab BEBERAPA kad boleh terbuka SERENTAK & bebas (bukan accordion yang
  // paksa tutup yang lain). Dikongsi merentas render() semula (Firestore
  // snapshot baru / carian / tapisan) supaya kad yang admin dah buka TAK
  // tertutup balik secara tak sengaja bila senarai render semula.
  let kadTerbukaSet = new Set();
  // TAMBAHAN: sama pattern macam kadTerbukaSet di atas, tapi utk baris
  // permintaan tukar tarikh (.notif-item) — lihat renderNotifPermintaan().
  let notifTerbukaSet = new Set();
  // TAMBAHAN: cache rekod lesen lama (students/{uid}/rekod_lesen_tamat) —
  // uid -> array rekod (disusun terbaru dulu). Dimuat lazy (sekali sahaja)
  // bila kad pelajar dibuka — lihat muatRekodLamaPelajar().
  let petaRekodLamaPelajar = new Map();
  // TAMBAHAN (Design A): set "uid|recordId|kunci" dropdown "Lihat Sesi"
  // Latihan mana yg terbuka dlm kad Rekod Lesen Lama — sama pattern dgn
  // latihanTerbukaSet (data semasa), tapi diasingkan set-nya sendiri sbb
  // skop berlainan (rekod arkib, bukan data semasa pelajar).
  let rlLatihanTerbukaSet = new Set();

  // TAMBAHAN: uid pelajar didaftar-kaunter yang kad dia sedang terbuka (tab Daftar Memandu)
  let kkTerbukaSet = new Set();
  let tapisanKalendar = null; // TAMBAHAN: { kategori: "CERAMAH"|"UJIAN_KOMPUTER", tarikh: "dd/mm/yyyy" } — bila diisi, table utama ditapis ikut ni (bukan popup senarai)
  // TAMBAHAN: tapisan dari klik KAD RINGKASAN (KPI card) kat atas — ikut STATUS
  // (pending/belum), bukan tarikh macam tapisanKalendar. Nilai: "PAKEJ" |
  // "CERAMAH" | "UK" | "BAYAR" | null. Sengaja pembolehubah BERASINGAN dari
  // tapisanKalendar (bentuk data & cara padan dia lain — status vs tarikh),
  // tapi KEDUA-DUA saling eksklusif (set satu automatik kosongkan yang lain)
  // supaya cuma SATU tapisan aktif pada satu masa & chip "Menapis: ..." kat
  // atas table (renderTapisanAktif) jadi SATU penunjuk konsisten untuk kedua
  // mekanisme, bukan dua UI berasingan yang boleh bercanggah.
  let tapisanKad = null;

  // TAMBAHAN: mod susunan senarai pelajar (tab Senarai Pelajar) — "abc"
  // (nama A-Z, lalai/default, sedia ada) atau "terbaru" (ikut tarikhDaftar,
  // paling baru didaftar di atas sekali). Dikongsi oleh SEMUA tapisan kad
  // ringkasan (Jumlah Pelajar/Pakej/Ceramah/UK/Bayar/dll) sebab semua tu
  // satu senarai/toolbar yang sama — tukar kotak "Susun" sekali terpakai
  // merentasi semua kad. TIDAK menyentuh renderSenaraiKaunter()/
  // renderSenaraiSelesai() (tab lain, toolbar berasingan, tak diminta).
  let susunMod = "abc";

  // TAMBAHAN: tab semasa yang admin sedang lihat ("dashboard" / "senarai" /
  // "permintaan") — dikemaskini oleh tukarTab(). render() baca ni untuk tentukan
  // kad ringkasan "Permintaan Tukar Tarikh" patut disorot .aktif atau tidak
  // (dia bukan tapisan table macam PAKEJ/CERAMAH/UK/BAYAR, dia tab berasingan).
  let tabSemasa = "dashboard";

  // ============ LOGIN ============

  btnLogin.addEventListener("click", cubaLogin);
  loginPasswordEl.addEventListener("keydown", (e) => { if (e.key === "Enter") cubaLogin(); });

  async function cubaLogin() {
    loginErrorEl.style.display = "none";
    const emel = loginEmailEl.value.trim();
    const kataLaluan = loginPasswordEl.value;

    if (!emel || !kataLaluan) {
      tunjukRalatLogin("Sila isi emel dan kata laluan.");
      return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = "Menyemak...";

    try {
      await signInWithEmailAndPassword(auth, emel, kataLaluan);
      // seterusnya dikendalikan oleh onAuthStateChanged di bawah
    } catch (err) {
      tunjukRalatLogin(mesejRalatAuth(err.code));
      btnLogin.disabled = false;
      btnLogin.textContent = "Log Masuk";
    }
  }

  function tunjukRalatLogin(mesej) {
    loginErrorEl.textContent = mesej;
    loginErrorEl.style.display = "block";
  }

  function mesejRalatAuth(code) {
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
      return "Emel atau kata laluan salah.";
    }
    if (code === "auth/too-many-requests") {
      return "Terlalu banyak percubaan. Cuba lagi sebentar.";
    }
    return "Gagal log masuk: " + code;
  }

  btnLogout.addEventListener("click", () => {
    if (unsubscribeSnapshot) unsubscribeSnapshot();
    if (unsubscribePermintaan) unsubscribePermintaan(); // TAMBAHAN
    signOut(auth);
  });

  // ============ AUTH STATE + SEMAK ADMIN ============

  // PEMBAIKAN (bug: login-screen tak hilang lepas log masuk): DUA BARIS
  // toggle (loginScreen.style.display / appContent.style.display) sebelum
  // ni disalin berasingan kat SETIAP cabang (tak log masuk / admin sah /
  // admin gagal semak) — laluan "admin gagal semak" (bukan admin / getDoc
  // gagal) plak TAK PERNAH explicitly tutup/buka terus, dia cuma panggil
  // signOut(auth) & signOut() tu picu onAuthStateChanged(null)
  // BERASINGAN utk tutup app+papar login. Dalam keadaan biasa round-trip
  // async ni cukup laju & tak nampak masalah — tapi ia satu jurang tegar
  // (timing-dependent, bukan atomic) yang boleh tinggalkan app & login
  // SERENTAK di skrin sekiranya event kedua tu lengah/lewat. Dua function
  // kecil di bawah jadikan toggle ni SATU sumber kebenaran & SERTA-MERTA
  // (bukan bergantung round-trip async kedua) di SETIAP cabang.
  function tunjukSkrinLogin() {
    loginScreen.style.display = "flex";
    appContent.style.display = "none";
  }
  function tunjukAppContent() {
    loginScreen.style.display = "none";
    appContent.style.display = "block";
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      tunjukSkrinLogin();
      btnLogin.disabled = false;
      btnLogin.textContent = "Log Masuk";
      return;
    }

    // user log masuk — semak dia wujud dalam collection "admins"
    try {
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (!adminDoc.exists()) {
        // PEMBAIKAN: tutup app + papar balik skrin login SERTA-MERTA (jangan
        // tunggu signOut() punya onAuthStateChanged(null) yang berasingan).
        tunjukSkrinLogin();
        tunjukRalatLogin("Akaun ni bukan admin. Hubungi pentadbir sistem.");
        await signOut(auth);
        return;
      }
    } catch (err) {
      tunjukSkrinLogin(); // PEMBAIKAN: sama macam atas — serta-merta, bukan tunggu signOut()
      tunjukRalatLogin("Gagal sahkan akaun admin: " + err.message);
      await signOut(auth);
      return;
    }

    tunjukAppContent();
    mulakanSenaraiPelajar();
    mulakanSenaraiPermintaan(); // TAMBAHAN
    mulakanStatusPakej(); // TAMBAHAN: dropdown #drmPakej + kad "Pengurusan Pakej"
    drmRenderCeramahGrid(); // TAMBAHAN: muat kalendar Ceramah (borang Daftar Memandu)
    drmRenderUkGrid(); // TAMBAHAN: muat kalendar Ujian Komputer (borang Daftar Memandu)
  });

  // ============ DATA PELAJAR (lepas admin sah) ============

  // TAMBAHAN: penanda "muatan awal dah siap" — snapshot PERTAMA Firestore
  // bagi SEMUA dokumen sedia ada sebagai docChanges() jenis "added" (bukan
  // cuma dokumen yang betul2 baru dicipta). Bendera ni pisahkan dua kes tu —
  // backfill tarikhDaftar (bawah) CUMA jalan utk "added" SELEPAS muatan awal
  // (pendaftaran sebenar/baru), elak rekod lama (sedia ada sebelum ciri ni)
  // tertulis semula dgn tarikh "sekarang" & tersalah anggap "terbaru".
  let muatanAwalPelajarSiap = false;

  function mulakanSenaraiPelajar() {
    if (unsubscribeSnapshot) return; // dah ada listener aktif

    unsubscribeSnapshot = onSnapshot(collection(db, "students"), (snapshot) => {
      senaraiPelajar = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
      statusEl.textContent = `Live • ${senaraiPelajar.length} pelajar`;
      render();

      // TAMBAHAN: self-heal tarikhDaftar utk pelajar yang BARU muncul SELEPAS
      // muatan awal (cth: pelajar daftar sendiri guna app — laluan tu tak
      // tulis tarikhDaftar sebab bukan kod dashboard ni) — bila dashboard
      // tengah "Live" & pelajar baru ni muncul (docChanges "added"), tulis
      // tarikhDaftar=serverTimestamp() SEKALI terus dari sini supaya dia
      // terus disusun betul dalam mod "Terbaru" (lag cuma saat admin tengah
      // online, bukan masa pendaftaran 100% tepat, tapi cukup hampir).
      // Pelajar sedia ada (rekod lama, dimuat semasa muatan awal) TIDAK
      // disentuh — kekal tiada tarikhDaftar, jatuh ke bawah sekali (lihat
      // urutIkutTarikhDaftar()), BUKAN direka-reka tarikh.
      if (muatanAwalPelajarSiap) {
        snapshot.docChanges().forEach(ch => {
          if (ch.type === "added" && !ch.doc.data().tarikhDaftar) {
            updateDoc(doc(db, "students", ch.doc.id), { tarikhDaftar: serverTimestamp() })
              .catch(err => console.error("Gagal backfill tarikhDaftar:", ch.doc.id, err));
          }
        });
      } else {
        muatanAwalPelajarSiap = true;
      }
    }, (err) => {
      statusEl.textContent = "Gagal sambung: " + err.message;
      tbody.innerHTML = `<div class="kosong">Ralat sambungan Firestore. Semak firebase-config.js &amp; Firestore Security Rules.</div>`;
    });
  }

  // ---------- TAMBAHAN: Listener dok "tetapan/pakej" (senarai + status pakej) ----------
  // Satu dok ringkas, satu field per pakej (lihat dapatkanSenaraiPakejPenuh()
  // di atas). Bila dok ni berubah (admin togol/tambah kat kad "Pengurusan
  // Pakej"), dropdown #drmPakej & kad tu sendiri dibina semula serta-merta.
  function mulakanStatusPakej() {
    if (unsubscribeStatusPakej) return; // dah ada listener aktif
    unsubscribeStatusPakej = onSnapshot(doc(db, "tetapan", "pakej"), (snap) => {
      statusPakej = snap.exists() ? snap.data() : {};
      binaPilihanPakejDropdown();
      renderPengurusanPakej();
    }, (err) => {
      console.error("Gagal muat status pakej:", err);
    });
  }

  // KEMASKINI (Request 2 — 2 pakej): bina DUA dropdown berasingan (Moto/
  // Kereta) ikut dapatkanSenaraiPakejPenuh(), ditapis pk.jenis masing2 —
  // "boleh pilih antara b/b2 ja [utk moto] ... kereta satu ja" (max 1 per
  // jenis kenderaan, pattern SAMA dgn PakejLesenActivity app Android).
  // value format "${key}|${nama}|${harga}" (TAMBAH key berbanding format
  // lama "${nama}|${harga}" — perlu utk bina senarai[] bila 2 pakej dipilih
  // sekali, lihat daftarPelajarKaunter()).
  function binaPilihanDropdownJenis(selectEl, jenisTarget, labelKosong) {
    if (!selectEl) return;
    const nilaiAsal = selectEl.value;
    selectEl.innerHTML = `<option value="">${labelKosong}</option>` +
      dapatkanSenaraiPakejPenuh().filter(pk => pk.aktif && pk.jenis === jenisTarget)
        .map(pk => `<option value="${pk.key}|${pk.nama}|${pk.harga}">${pk.nama} — ${pk.harga}</option>`)
        .join("");
    // kekal pilihan admin sblm ni kalau option tu masih wujud selepas dibina semula
    if ([...selectEl.options].some(o => o.value === nilaiAsal)) selectEl.value = nilaiAsal;
  }
  function binaPilihanPakejDropdown() {
    binaPilihanDropdownJenis(drmPakejMoto, "MOTO", "Belum Pilih Pakej Motosikal");
    binaPilihanDropdownJenis(drmPakejKereta, "KERETA", "Belum Pilih Pakej Kereta");
  }

  // TAMBAHAN: tukar "RM 1,234.56" -> 123456 (sen, integer) — mirror
  // `tukarHargaKeSen` Android (PakejLesenActivity), supaya jumlah gabungan 2
  // pakej dikira TEPAT (elak ralat float drpd terus tambah string "RM x.xx").
  function hargaKeSen(h) {
    const bersih = String(h || "").replace(/[^0-9.]/g, "");
    const nilai = parseFloat(bersih || "0");
    return Math.round((isNaN(nilai) ? 0 : nilai) * 100);
  }
  // Sen (integer) -> "RM x.xx"
  function senKeHarga(sen) {
    return `RM ${(Math.round(sen) / 100).toFixed(2)}`;
  }

  // TAMBAHAN: true kalau KEDUA-DUA dropdown pakej dipilih sekali gus — SATU
  // sumber kebenaran dikongsi oleh nota, kalendar Ceramah & daftarPelajarKaunter().
  function drmModeDuaPakej() {
    return !!(drmPakejMoto && drmPakejMoto.value) && !!(drmPakejKereta && drmPakejKereta.value);
  }

  // TAMBAHAN: tunjuk/sembunyi nota "2 pakej" + reset pilihan tarikh Ceramah
  // bila mod dua-pakej TUKAR (dr tunggal->dua atau dua->tunggal) — elak
  // keadaan "separuh" yg mengelirukan (cth: dah pilih 1 tarikh mod tunggal,
  // admin pilih pakej ke-2, tarikh tu jadi tak jelas ia utk Moto/Kereta mana).
  // Tukar dropdown pakej yg LAIN (cth tukar "Pakej B" -> "Pakej B2" je, mod
  // tetap sama) TIDAK reset — kekal pilihan tarikh admin.
  let drmModeDuaPakejSebelumIni = false;
  function drmKemaskiniNotaDuaPakej() {
    const dua = drmModeDuaPakej();
    if (drmNotaDuaPakej) drmNotaDuaPakej.style.display = dua ? "" : "none";
    if (dua !== drmModeDuaPakejSebelumIni) {
      drmModeDuaPakejSebelumIni = dua;
      drmCeramahTarikhPilih = null;
      drmCeramahTarikhPilihMoto = null;
      drmCeramahTarikhPilihKereta = null;
      if (drmCeramahJenisWrap) drmCeramahJenisWrap.style.display = "none";
      drmRenderCeramahGrid();
      drmKemaskiniTeksPilihan();
    }
  }
  if (drmPakejMoto) drmPakejMoto.addEventListener("change", drmKemaskiniNotaDuaPakej);
  if (drmPakejKereta) drmPakejKereta.addEventListener("change", drmKemaskiniNotaDuaPakej);

  // TAMBAHAN: togol aktif/nyahaktif SATU pakej (butang dlm kad "Pengurusan
  // Pakej", tab Dashboard). Pakej ASAL (4 default) ditulis sbg boolean ringkas
  // (kekal format lama); pakej BARU (admin tambah sendiri) ditulis sbg objek
  // supaya nama/harga dia tak hilang bila ditogol. setDoc({merge:true})
  // supaya field pakej lain yg tak disentuh kekal.
  async function togolStatusPakej(key, namaPaparan) {
    const semasa = dapatkanSenaraiPakejPenuh().find(pk => pk.key === key);
    if (!semasa) return;
    const aktifSemasa = semasa.aktif;
    const soalan = aktifSemasa
      ? `Nyahaktifkan ${namaPaparan}?\n\nPakej ni akan hilang drpd pilihan pendaftaran BARU (kaunter & app). Pelajar yang dah ada pakej ni tak terjejas.`
      : `Aktifkan balik ${namaPaparan}?`;
    if (!confirm(soalan)) return;

    const adaPakejAsal = SENARAI_PAKEJ_ASAL.some(pk => pk.key === key);
    // KEMASKINI: pakej asal yg dah ditukar jadi objek (sebab admin dah set "jenis")
    // JANGAN ditimpa balik jadi boolean — kalau tak, field "jenis" hilang.
    const sudahObjek = statusPakej[key] && typeof statusPakej[key] === "object";
    let nilaiBaru;
    if (adaPakejAsal && !sudahObjek) nilaiBaru = !aktifSemasa; // format lama: boolean ringkas
    else {
      nilaiBaru = { nama: semasa.nama, harga: semasa.harga, aktif: !aktifSemasa }; // format baru: objek penuh
      if (semasa.jenis) nilaiBaru.jenis = semasa.jenis;
    }

    try {
      await setDoc(doc(db, "tetapan", "pakej"), { [key]: nilaiBaru }, { merge: true });
    } catch (err) {
      alert("Gagal kemaskini status pakej: " + err.message);
    }
  }

  // TAMBAHAN: ubah HARGA satu pakej sedia ada (B/B2/D/DA + pakej baru) —
  // guna prompt() ringkas (sama pattern dgn tambahPakejBaru()/padamPakej()).
  // setDoc merge ke SAMA dok "tetapan/pakej" yg app Android (listener live)
  // & dropdown "Pilih Pakej" admin sendiri (dapatkanSenaraiPakejPenuh(),
  // SUMBER SAMA) baca — jadi harga baru terus naik di DUA-DUA tempat tanpa
  // apa-apa perlu ditukar kat app. "jenis" sedia ada WAJIB dikekalkan di sini
  // (bukan ditanya semula) — ia ditetapkan sekali sahaja masa pakej dicipta.
  // Pelajar yang DAH daftar sebelum ni TAK terjejas — harga tersimpan dlm
  // rekod pelajar sendiri (p.pakejLesen.harga), bukan dibaca live dari sini.
  async function ubahHargaPakej(key, namaPaparan, hargaSemasa) {
    const hargaMentah = prompt(`Harga baru utk "${namaPaparan}" (cth: RM 1500.00):`, hargaSemasa || "");
    if (hargaMentah === null) return; // admin batal
    const hargaTeks = hargaMentah.trim();
    if (!hargaTeks) { alert("Harga tak boleh kosong."); return; }
    const hargaBaru = /^rm/i.test(hargaTeks) ? hargaTeks : `RM ${hargaTeks}`;

    const semasa = dapatkanSenaraiPakejPenuh().find(pk => pk.key === key);
    if (!semasa) return;

    const nilaiBaru = { nama: semasa.nama, harga: hargaBaru, aktif: semasa.aktif };
    if (semasa.jenis) nilaiBaru.jenis = semasa.jenis;

    try {
      await setDoc(doc(db, "tetapan", "pakej"), { [key]: nilaiBaru }, { merge: true });
      tunjukToast(`Harga ${namaPaparan} dikemaskini: ${hargaBaru}.`, "success");
    } catch (err) {
      tunjukToast("Gagal simpan harga pakej: " + err.message, "error");
    }
  }

  // TAMBAHAN: admin tambah SATU pakej baru (bukan salah satu 4 pakej asal)
  // — guna prompt() ringkas (sama pattern dgn padamPelajar() yg sedia ada
  // guna prompt utk taip nama sblm padam), elak perlu bina borang/modal
  // baru berasingan. Pakej baru terus tersedia dlm dropdown #drmPakej &
  // kad "Pengurusan Pakej" sebaik sahaja disimpan (onSnapshot live).
  async function tambahPakejBaru() {
    const namaMentah = prompt('Nama pakej baru (cth: "Pakej E"):');
    if (namaMentah === null) return; // admin batal
    const nama = namaMentah.trim();
    if (!nama) { alert("Nama pakej tak boleh kosong."); return; }

    const key = janaKeyPakej(nama);
    if (!key) { alert("Nama pakej kena ada sekurang-kurangnya satu huruf/nombor."); return; }

    const senaraiSemasa = dapatkanSenaraiPakejPenuh();
    if (senaraiSemasa.some(pk => pk.key === key)) {
      alert(`Pakej dgn nama serupa ("${nama}") dah wujud dlm senarai. Sila guna nama lain.`);
      return;
    }

    const hargaMentah = prompt(`Harga utk "${nama}" (cth: RM 1500.00):`);
    if (hargaMentah === null) return; // admin batal
    const hargaTeks = hargaMentah.trim();
    if (!hargaTeks) { alert("Harga tak boleh kosong."); return; }
    const harga = /^rm/i.test(hargaTeks) ? hargaTeks : `RM ${hargaTeks}`;

    // KEMASKINI: jenis pakej (MOTO/KERETA) — app guna ni utk tahu pakej baru tu moto atau kereta
    const jenisMentah = prompt(`Jenis utk "${nama}"? Taip MOTO atau KERETA:`, "MOTO");
    if (jenisMentah === null) return; // admin batal
    const jenis = jenisMentah.trim().toUpperCase();
    if (jenis !== "MOTO" && jenis !== "KERETA") { alert('Jenis kena "MOTO" atau "KERETA".'); return; }

    try {
      await setDoc(doc(db, "tetapan", "pakej"), { [key]: { nama, harga, aktif: true, jenis } }, { merge: true });
      alert(`"${nama}" dah ditambah & terus boleh dipilih dlm dropdown "Pilih Pakej" (borang Daftar Memandu).`);
    } catch (err) {
      alert("Gagal tambah pakej: " + err.message);
    }
  }

  // TAMBAHAN: BUANG SATU pakej terus (permanent — beza dgn "Nyahaktifkan"
  // yg boleh diaktifkan balik bila-bila masa). Sama pattern 2-langkah dgn
  // padamPelajar() sedia ada (confirm() dulu, then taip nama utk sahkan)
  // sebab ni pun tindakan tak boleh dibuat asal (well — pakej boleh
  // ditambah semula manual via "+ Tambah Pakej" kalau tersilap, tapi
  // pelajar yg dah ada pakej ni SEBELUM dibuang tetap tak terjejas, sebab
  // baris_htmlPakej() dll baca terus drpd p.pakejLesen, bukan senarai ni).
  //
  // Pakej ASAL (B/B2/D/DA) TAK boleh dibuang guna deleteField() sebab field
  // yg tiada ditafsir "aktif secara default" oleh dapatkanSenaraiPakejPenuh()
  // — jadi ditanda { dipadam: true } supaya explicit. Pakej BARU (admin
  // tambah sendiri) terus dibuang field dia drpd dok (deleteField()).
  async function padamPakej(key, namaPaparan) {
    const langkah1 = confirm(`BUANG pakej "${namaPaparan}" terus?\n\nIa akan hilang drpd kad ni & dropdown "Pilih Pakej" (borang Daftar Memandu). Pelajar yang DAH ADA pakej ni sebelum ni TAK terjejas.`);
    if (!langkah1) return;

    const sahkanNama = prompt(`Untuk sahkan buang, taip nama pakej ni:\n"${namaPaparan}"`);
    if (sahkanNama === null) return; // admin batal
    if (sahkanNama.trim() !== namaPaparan) {
      tunjukToast("Nama tak sepadan. Buang dibatalkan.", "warning");
      return;
    }

    const adaPakejAsal = SENARAI_PAKEJ_ASAL.some(pk => pk.key === key);
    try {
      if (adaPakejAsal) {
        await setDoc(doc(db, "tetapan", "pakej"), { [key]: { dipadam: true } }, { merge: true });
      } else {
        await updateDoc(doc(db, "tetapan", "pakej"), { [key]: deleteField() });
      }
      tunjukToast(`Pakej "${namaPaparan}" dah dibuang.`, "success");
    } catch (err) {
      tunjukToast("Gagal buang pakej: " + err.message, "error");
    }
  }

  // TAMBAHAN: render kad "Pengurusan Pakej" (tab Dashboard) — papar tiap
  // pakej (dapatkanSenaraiPakejPenuh(), termasuk pakej baru yg admin
  // tambah), bilangan pelajar SEMASA guna pakej tu (kira terus drpd
  // senaraiPelajar.pakejLesen.nama, TIADA field/koleksi baru diduplikasi),
  // status aktif/nyahaktif + butang togol + butang buang.
  function renderPengurusanPakej() {
    const wrap = document.getElementById("pengurusanPakejWrap");
    if (!wrap) return;
    wrap.innerHTML = dapatkanSenaraiPakejPenuh().map(pk => {
      const aktif = pk.aktif;
      // KEMASKINI: kira jugak pelajar 2 pakej (padan dlm pakejLesen.senarai[]) + pelajar lama (pakejLesen.nama)
      const bil = senaraiPelajar.filter(p => (p.pakejLesen && p.pakejLesen.nama === pk.nama) || senaraiPakejPelajar(p).some(x => (x.key && x.key === pk.key) || x.nama === pk.nama)).length;
      return `
        <div class="pakej-baris">
          <div>
            <div class="pakej-baris-nama">${pk.nama} <span style="color:var(--kelabu); font-weight:400;">— ${pk.harga}</span></div>
            <div class="pakej-baris-sub">${bil} pelajar guna pakej ni &middot; ${aktif ? '<span style="color:var(--hijau)">Aktif</span>' : '<span style="color:var(--merah)">Dinyahaktifkan</span>'}</div>
          </div>
          <div class="pakej-baris-aksi">
            <button class="btn-edit-harga" data-aksi="edit-harga-pakej" data-pakej-key="${pk.key}" data-pakej-nama="${pk.nama}" data-pakej-harga="${pk.harga}">
              <i class="fa-solid fa-pen"></i> Edit Harga
            </button>
            <button class="btn-pakej-togol ${aktif ? "nyahaktif" : "aktifkan"}" data-aksi="togol-pakej" data-pakej-key="${pk.key}" data-pakej-nama="${pk.nama}">
              <i class="fa-solid ${aktif ? "fa-ban" : "fa-check"}"></i> ${aktif ? "Nyahaktifkan" : "Aktifkan"}
            </button>
            <button class="btn-padam-umum" data-aksi="buang-pakej" data-pakej-key="${pk.key}" data-pakej-nama="${pk.nama}">
              <i class="fa-solid fa-trash"></i> Buang
            </button>
          </div>
        </div>
      `;
    }).join("");

    wrap.querySelectorAll("[data-aksi='togol-pakej']").forEach(btn => {
      btn.addEventListener("click", () => togolStatusPakej(btn.dataset.pakejKey, btn.dataset.pakejNama));
    });
    wrap.querySelectorAll("[data-aksi='edit-harga-pakej']").forEach(btn => {
      btn.addEventListener("click", () => ubahHargaPakej(btn.dataset.pakejKey, btn.dataset.pakejNama, btn.dataset.pakejHarga));
    });
    wrap.querySelectorAll("[data-aksi='buang-pakej']").forEach(btn => {
      btn.addEventListener("click", () => padamPakej(btn.dataset.pakejKey, btn.dataset.pakejNama));
    });
  }

  // ---------- TAMBAHAN: Listener koleksi "permintaanTukarTarikh" (status MENUNGGU sahaja) ----------
  // Ni koleksi top-level yang app student tulis bila dia hantar "Minta Tukar
  // Tarikh". Admin nampak sebagai kotak notifikasi kuning kat atas jadual +
  // badge 🔔 kat nama pelajar berkenaan.
  function mulakanSenaraiPermintaan() {
    if (unsubscribePermintaan) return; // dah ada listener aktif

    const qPermintaan = query(collection(db, "permintaanTukarTarikh"), where("status", "==", "MENUNGGU"));
    unsubscribePermintaan = onSnapshot(qPermintaan, (snapshot) => {
      senaraiPermintaan = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      render();
    }, (err) => {
      console.error("Gagal muat permintaan tukar tarikh:", err);
    });
  }

  carianEl.addEventListener("input", render);
  // TAMBAHAN: kotak "Susun ikut" (A-Z / Terbaru Daftar) — tukar susunMod &
  // render semula; lihat urutSenaraiUtama()/susunMod kat atas.
  const susunPilihEl = document.getElementById("susunPilih");
  if (susunPilihEl) susunPilihEl.addEventListener("change", () => {
    susunMod = susunPilihEl.value;
    render();
  });
  // TAMBAHAN: carian tab "Pelajar Didaftar Kaunter" — berasingan drpd #carian
  // (skop tab lain), panggil renderSenaraiKaunter() terus (bukan render()
  // penuh, elak kerja lebih render tab lain yg tak berkaitan).
  if (kkCarianEl) kkCarianEl.addEventListener("input", renderSenaraiKaunter);

  // ======================================================================
  // TAMBAHAN (visual): toast ringkas menggantikan dialog "alert" bawaan
  // pelayar untuk mesej info/kejayaan/ralat SELEPAS satu tindakan selesai
  // (bukan keputusan get-izin — semua dialog get-izin/get-input sedia ada
  // yang menentukan sama ada tindakan diteruskan TIDAK disentuh, kekal guna
  // dialog asal pelayar).
  // ======================================================================
  function tunjukToast(mesej, jenis = "success") {
    let kotak = document.getElementById("toastKotak");
    if (!kotak) {
      kotak = document.createElement("div");
      kotak.id = "toastKotak";
      document.body.appendChild(kotak);
    }
    const ikonMap = {
      success: "fa-circle-check",
      error: "fa-circle-exclamation",
      warning: "fa-triangle-exclamation",
      info: "fa-circle-info"
    };
    const ikon = ikonMap[jenis] || ikonMap.success;

    const elToast = document.createElement("div");
    elToast.className = `toast ${jenis}`;
    const elIkon = document.createElement("i");
    elIkon.className = `fa-solid ${ikon}`;
    const elTeks = document.createElement("span");
    elTeks.textContent = mesej;
    elToast.appendChild(elIkon);
    elToast.appendChild(elTeks);
    kotak.appendChild(elToast);

    requestAnimationFrame(() => elToast.classList.add("tunjuk"));
    const tempoh = (jenis === "error") ? 6000 : 4000;
    setTimeout(() => {
      elToast.classList.remove("tunjuk");
      setTimeout(() => elToast.remove(), 400);
    }, tempoh);
  }

  // TAMBAHAN: urutkan senarai pelajar ikut nama A-Z (abjad) — dikongsi oleh
  // SEMUA senarai pelajar (Senarai Pelajar, Pelajar Didaftar Kaunter,
  // Pelajar Selesai) supaya konsisten merentas app, tak kira urutan asal
  // dari Firestore. localeCompare({numeric... }) tak perlu, tapi
  // sensitivity:"base" supaya huruf besar/kecil disusun sama (bukan ASCII
  // ketat yang letak semua huruf besar dulu baru huruf kecil).
  function urutIkutNama(senarai) {
    return senarai.slice().sort((a, b) =>
      (a.nama || "").localeCompare(b.nama || "", "ms", { sensitivity: "base" })
    );
  }

  // TAMBAHAN: urutkan ikut tarikhDaftar (serverTimestamp, ditulis bila admin
  // daftar pelajar kat kaunter — lihat dataBaru di fungsi daftar kaunter) —
  // paling BARU didaftar di atas sekali. Pelajar TANPA medan ni (rekod lama
  // sblm ciri ni wujud, atau pelajar daftar sendiri melalui app sebelum app
  // turut ditambah medan sama) dianggap milis 0 (paling lama) — jatuh ke
  // bawah sekali, bukan hilang dari senarai.
  function urutIkutTarikhDaftar(senarai) {
    const milis = (p) => (p.tarikhDaftar && typeof p.tarikhDaftar.toMillis === "function")
      ? p.tarikhDaftar.toMillis() : 0;
    return senarai.slice().sort((a, b) => milis(b) - milis(a));
  }

  // TAMBAHAN: dispatcher ikut kotak "Susun" (#susunPilih, pembolehubah
  // susunMod) — "abc" (lalai) guna urutIkutNama sedia ada, "terbaru" guna
  // urutIkutTarikhDaftar baru di atas. Dipanggil gantian terus render()
  // (tab Senarai Pelajar) — TIDAK menyentuh renderSenaraiKaunter()/
  // renderSenaraiSelesai() yang masih kekal urutIkutNama() terus.
  function urutSenaraiUtama(senarai) {
    return susunMod === "terbaru" ? urutIkutTarikhDaftar(senarai) : urutIkutNama(senarai);
  }

  function render() {
    renderNotifPermintaan(); // TAMBAHAN
    renderTapisanAktif(); // TAMBAHAN: chip tapisan kalendar (kalau ada)

    const kataKunci = carianEl.value.trim().toLowerCase();
    const senaraiDitapis = urutSenaraiUtama(senaraiPelajar.filter(p => {
      const nama = (p.nama || "").toLowerCase();
      const noKP = (p.noKP || "").toLowerCase();
      const cocokCarian = nama.includes(kataKunci) || noKP.includes(kataKunci);
      if (!cocokCarian) return false;

      // TAMBAHAN: tapisan dari kalendar — kalau aktif, cuma tunjuk pelajar
      // yang ada jadual kategori tu PADA tarikh tu (digabung dengan carian
      // nama/noKP di atas, bukan ganti)
      if (tapisanKalendar) {
        if (tapisanKalendar.kategori === "CERAMAH") {
          // KEMASKINI: padan ceramah / ceramahMoto / ceramahKereta
          return senaraiCeramahPelajar(p).some(c => !!(c.data && c.data.tarikh === tapisanKalendar.tarikh));
        }
        if (tapisanKalendar.kategori === "UJIAN_KOMPUTER") {
          return !!(p.ujianKomputer && p.ujianKomputer.tarikh === tapisanKalendar.tarikh);
        }
        // LATIHAN_MEMANDU — sesiKe: nombor (1-based, padan senaraiSesi[i-1]) atau "QTI"
        // KEMASKINI: latihan Moto ATAU Kereta (tapisanKalendar.kunci)
        const lp = p[tapisanKalendar.kunci || KUNCI_LATIHAN_MOTO];
        if (!lp) return false;
        if (tapisanKalendar.sesiKe === "QTI") {
          return !!(lp.qti && lp.qti.tarikh === tapisanKalendar.tarikh);
        }
        const sesi = lp.senaraiSesi && lp.senaraiSesi[tapisanKalendar.sesiKe - 1];
        return !!(sesi && sesi.tarikh === tapisanKalendar.tarikh);
      }

      // TAMBAHAN: tapisan dari klik kad ringkasan (status pending, bukan
      // tarikh) — guna predikat SAMA yang mengira angka kad tu kat bawah,
      // supaya bilangan atas kad & bilangan baris terpapar sentiasa sepadan.
      if (tapisanKad === "PAKEJ") return pakejBelumSah(p);
      if (tapisanKad === "CERAMAH") return ceramahBelumHadir(p);
      if (tapisanKad === "UK") return ukBelumSah(p);
      if (tapisanKad === "LATIHAN_MOTO") return latihanMotoBelumSelesai(p);
      if (tapisanKad === "LATIHAN_KERETA") return latihanKeretaBelumSelesai(p);
      if (tapisanKad === "BAYAR") return bayaranBelumSah(p);
      if (tapisanKad === "TAMBAH_KELAS") return pernahTambahKelas(p);
      // KEMASKINI: kad "Jumlah Pelajar" skang betul2 MENAPIS (bukan setakat
      // papar angka je) — bila diklik, senarai pun tunjuk pelajar AKTIF
      // (belum selesai) sahaja, sepadan dgn angka bilPelajarAktif kat bawah.
      // Pelajar yg dah selesai TETAP boleh dilihat — di tab "Selesai"
      // berasingan (kad hijau "Selesai" sebelah kad ni).
      if (tapisanKad === "AKTIF") return !pelajarSudahSelesai(p);

      return true;
    }));

    const bilBelumHadirCeramah = senaraiPelajar.filter(ceramahBelumHadir).length;
    const bilPendingUK = senaraiPelajar.filter(ukBelumSah).length;
    // TAMBAHAN: pecahan Latihan Moto/Kereta berasingan (sama kad "Ringkasan" sidebar)
    const bilLatihanMotoBelum = senaraiPelajar.filter(latihanMotoBelumSelesai).length;
    const bilLatihanKeretaBelum = senaraiPelajar.filter(latihanKeretaBelumSelesai).length;
    const bilPendingBayar = senaraiPelajar.filter(bayaranBelumSah).length;
    // TAMBAHAN: ringkasan pakej belum sah
    const bilPendingPakej = senaraiPelajar.filter(pakejBelumSah).length;
    // TAMBAHAN: kad "Jumlah Pelajar" kini kira pelajar AKTIF (belum selesai)
    // sahaja — pelajar yg dah "Selesai" (lihat pelajarSudahSelesai()) tolak
    // keluar drpd angka ni supaya tak bengkak dgn pelajar lama yg dah habis,
    // tapi tab "Senarai Pelajar" sendiri KEKAL papar SEMUA (total, tak ditapis).
    const bilPelajarAktif = senaraiPelajar.filter(p => !pelajarSudahSelesai(p)).length;

    // TAMBAHAN: kad mana yang kena tunjuk sebagai "aktif" sekarang — kalau
    // tapisanKad diisi dgn salah satu kad khusus (PAKEJ/CERAMAH/UK/BAYAR),
    // kad tu sendiri yg disorot; "AKTIF" (atau takde tapisan langsung — cth
    // baru load page) dikira SAMA macam "SEMUA" (kad "Jumlah Pelajar"),
    // sebab "AKTIF" MEMANG tapisan asal/baseline kad tu; kalau tapisan
    // kalendar (tarikh) yang aktif, takde kad KPI yang disorot (chip
    // "Menapis: ..." kat atas dah cukup jelas).
    const kadAktifSekarang = tabSemasa === "permintaan" ? "PERMINTAAN" : (tabSemasa === "selesai" ? "SELESAI_KAD" : (tapisanKalendar ? null : ((!tapisanKad || tapisanKad === "AKTIF") ? "SEMUA" : tapisanKad)));
    const kelasAktif = (jenis) => kadAktifSekarang === jenis ? " aktif" : "";

    ringkasanEl.innerHTML = `
      <div class="kad-ringkasan${kelasAktif("SEMUA")}" data-kad="SEMUA" title="Papar pelajar yang belum selesai sahaja (pelajar dah selesai ada di kad 'Selesai')">
        <div class="ikon-bulat ikon-oren"><i class="fa-solid fa-user-graduate"></i></div>
        <div><div class="angka">${bilPelajarAktif}</div><div class="label">Jumlah Pelajar</div></div>
      </div>
      <div class="kad-ringkasan${kelasAktif("PAKEJ")}" data-kad="PAKEJ" title="Tapis: pelajar dengan pakej belum disahkan">
        <div class="ikon-bulat ikon-kuning"><i class="fa-solid fa-file-signature"></i></div>
        <div><div class="angka">${bilPendingPakej}</div><div class="label">Pakej Belum Sah</div></div>
      </div>
      <div class="kad-ringkasan${kelasAktif("CERAMAH")}" data-kad="CERAMAH" title="Tapis: pelajar belum hadir Ceramah">
        <div class="ikon-bulat ikon-kuning"><i class="fa-solid fa-chalkboard-user"></i></div>
        <div><div class="angka">${bilBelumHadirCeramah}</div><div class="label">Ceramah Belum Hadir</div></div>
      </div>
      <div class="kad-ringkasan${kelasAktif("UK")}" data-kad="UK" title="Tapis: pelajar Ujian Komputer belum sah">
        <div class="ikon-bulat ikon-kuning"><i class="fa-solid fa-laptop"></i></div>
        <div><div class="angka">${bilPendingUK}</div><div class="label">UK Belum Sah</div></div>
      </div>
      <div class="kad-ringkasan${kelasAktif("LATIHAN_MOTO")}" data-kad="LATIHAN_MOTO" title="Tapis: pelajar Latihan Praktikal Moto belum selesai">
        <div class="ikon-bulat ikon-kuning"><i class="fa-solid fa-motorcycle"></i></div>
        <div><div class="angka">${bilLatihanMotoBelum}</div><div class="label">Latihan Moto Belum Sah</div></div>
      </div>
      <div class="kad-ringkasan${kelasAktif("LATIHAN_KERETA")}" data-kad="LATIHAN_KERETA" title="Tapis: pelajar Latihan Praktikal Kereta belum selesai">
        <div class="ikon-bulat ikon-kuning"><i class="fa-solid fa-car"></i></div>
        <div><div class="angka">${bilLatihanKeretaBelum}</div><div class="label">Latihan Kereta Belum Sah</div></div>
      </div>
      <div class="kad-ringkasan${kelasAktif("BAYAR")}" data-kad="BAYAR" title="Tapis: pelajar pembayaran belum sah">
        <div class="ikon-bulat ikon-merah"><i class="fa-solid fa-money-bill-wave"></i></div>
        <div><div class="angka">${bilPendingBayar}</div><div class="label">Bayaran Belum Sah</div></div>
      </div>
      <!-- KEMASKINI: kad "Pernah Tambah Kelas" dipindah ATAS "Permintaan
           Tukar Tarikh" (sebelum ni bawah "Selesai") — kira PELAJAR
           (pernahTambahKelas), bukan bilangan rekod arkib, elak kira dua kali. -->
      <div class="kad-ringkasan${kelasAktif("TAMBAH_KELAS")}" data-kad="TAMBAH_KELAS" title="Tapis: pelajar yang pernah Daftar Tambah Kelas Lesen">
        <div class="ikon-bulat ikon-abu"><i class="fa-solid fa-box-archive"></i></div>
        <div><div class="angka">${senaraiPelajar.filter(pernahTambahKelas).length}</div><div class="label">Pernah Tambah Kelas</div></div>
      </div>
      <div class="kad-ringkasan${kelasAktif("PERMINTAAN")}" data-kad="PERMINTAAN" title="Lihat senarai permintaan tukar tarikh">
        <div class="ikon-bulat ikon-hijau"><i class="fa-solid fa-bell"></i></div>
        <div><div class="angka">${senaraiPermintaan.length}</div><div class="label">Permintaan Tukar Tarikh</div></div>
      </div>
      <!-- TAMBAHAN: kad "Selesai" duduk BAWAH "Permintaan Tukar Tarikh" (atas
           permintaan admin) — pelajar yg dah pelajarSudahSelesai(), TAK KIRA
           didaftar guna admin (kaunter) atau guna app sendiri (predikat tu
           semak terus senaraiPelajar keseluruhan, tiada tapisan daftarKaunter
           langsung). Klik terus lompat ke tab "selesai", sama pattern kad
           "PERMINTAAN" di atas. -->
      <div class="kad-ringkasan${kelasAktif("SELESAI_KAD")}" data-kad="SELESAI_KAD" title="Lihat senarai pelajar yang dah selesai">
        <div class="ikon-bulat ikon-hijau"><i class="fa-solid fa-circle-check"></i></div>
        <div><div class="angka">${senaraiPelajar.filter(pelajarSudahSelesai).length}</div><div class="label">Selesai</div></div>
      </div>
    `;

    // TAMBAHAN: wire klik kad ringkasan (KPI card) — sambung semula tiap
    // render() sebab innerHTML kad ni ditulis semula setiap kali (sama
    // pattern macam listener tbody kat bawah).
    ringkasanEl.querySelectorAll("[data-kad]").forEach(kad => {
      kad.addEventListener("click", () => {
        if (kad.dataset.kad === "PERMINTAAN") {
          // TAMBAHAN (FIX): "Permintaan Tukar Tarikh" kini tab berasingan
          // sendiri (bukan lagi sebahagian tab Dashboard) — klik kad ni
          // terus lompat ke tab tu. gulungKeNotifPermintaan() dah tak perlu
          // untuk ni (function tu masih wujud, cuma dah tak dipanggil kat sini).
          tukarTab("permintaan");
        } else if (kad.dataset.kad === "SELESAI_KAD") {
          // TAMBAHAN: kad "Selesai" — sama pattern "PERMINTAAN", klik terus
          // lompat ke tab tu (bukan tapisan kad Senarai Pelajar biasa).
          tukarTab("selesai");
        } else {
          aktifkanTapisanKad(kad.dataset.kad);
          // TAMBAHAN: kad ni sekarang duduk dalam tab Dashboard — lepas
          // tapisan diset/ditogol, pergi terus ke tab Senarai Pelajar
          // supaya admin nampak table yang dah ditapis tu.
          tukarTab("senarai");
        }
      });
    });

    // TAMBAHAN: papar carta donut + carta bar + heatmap & kemaskini nav-badge
    // sidebar — dikira semula setiap render() (data sentiasa terkini ikut
    // senaraiPelajar / senaraiPermintaan semasa).
    renderDonut();
    renderBarChart();
    renderJadualAkanDatang();
    renderSenaraiKaunter(); // TAMBAHAN: senarai "Pelajar Didaftar Kaunter" (tab Daftar Memandu)
    renderPengurusanPakej(); // TAMBAHAN: kad "Pengurusan Pakej" (tab Dashboard) — bilangan pelajar/pakej berubah ikut senaraiPelajar semasa
    const navBadgeSenarai = document.getElementById("navBadgeSenarai");
    if (navBadgeSenarai) navBadgeSenarai.textContent = senaraiPelajar.length;

    if (senaraiDitapis.length === 0) {
      tbody.innerHTML = `<div class="kosong">Tiada pelajar dijumpai.</div>`;
      return;
    }

    tbody.innerHTML = senaraiDitapis.map(p => barisPelajar(p)).join("");
    wireKadPelajarEvents(tbody);

    renderSenaraiSelesai(); // TAMBAHAN: tab berasingan "Selesai"
  }

  // ======================================================================
  // TAMBAHAN: wiring event kad pelajar (barisPelajar()) DIKELUARKAN jadi
  // function berasingan supaya boleh dikongsi antara #tbody (tab "Senarai
  // Pelajar") DAN wrap kad tab "Selesai" yang baru (lihat
  // renderSenaraiSelesai() di bawah) — TIADA logik sahkan/reset/dsb baru
  // direka, cuma scope querySelectorAll() ditukar ikut containerEl yang
  // diterima (sama pattern renderSenaraiKaunter() yang sedia ada wire
  // kkSenaraiWrap secara berasingan drpd #tbody).
  // ======================================================================
  function wireKadPelajarEvents(containerEl) {
    // TAMBAHAN: sahkan pakej
    containerEl.querySelectorAll("[data-aksi='sah-pakej']").forEach(btn => {
      btn.addEventListener("click", () => sahkanPakej(btn.dataset.uid));
    });
    containerEl.querySelectorAll("[data-aksi='sah-ceramah']").forEach(btn => {
      btn.addEventListener("click", () => sahkanCeramah(btn.dataset.uid, btn.dataset.kunci)); // KEMASKINI: kunci (ceramah/ceramahMoto/ceramahKereta)
    });
    containerEl.querySelectorAll("[data-aksi='sah-uk']").forEach(btn => {
      btn.addEventListener("click", () => sahkanUjianKomputer(btn.dataset.uid));
    });
    containerEl.querySelectorAll("[data-aksi='sah-bayar']").forEach(btn => {
      btn.addEventListener("click", () => sahkanPembayaran(btn.dataset.uid));
    });
    containerEl.querySelectorAll("[data-aksi='buka-reset']").forEach(btn => {
      btn.addEventListener("click", () => bukaModalReset(btn.dataset.uid));
    });
    // TAMBAHAN: reset semua jadual (Ceramah + UK + Latihan Praktikal) sekaligus
    containerEl.querySelectorAll("[data-aksi='reset-semua']").forEach(btn => {
      btn.addEventListener("click", () => resetSemuaJadual(btn.dataset.uid, btn));
    });
    // TAMBAHAN: padam pelajar
    containerEl.querySelectorAll("[data-aksi='padam-pelajar']").forEach(btn => {
      btn.addEventListener("click", () => padamPelajar(btn.dataset.uid));
    });
    // TAMBAHAN: sahkan kehadiran sesi latihan praktikal (per-sesi) & QTI
    containerEl.querySelectorAll("[data-aksi='sah-sesi-latihan']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        sahkanKehadiranSesi(btn.dataset.uid, Number(btn.dataset.index), btn.dataset.kunci);
      });
    });
    containerEl.querySelectorAll("[data-aksi='sah-qti-latihan']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        sahkanKehadiranQti(btn.dataset.uid, btn.dataset.kunci);
      });
    });
    // TAMBAHAN: butang "Tak Hadir" sebelah "Sahkan" (Ceramah/UK/Sesi Latihan/
    // QTI) — tanda tak hadir, bebaskan slot (guna balik fungsi reset
    // "_TanpaKonfirmasi" sedia ada) & hantar notifikasi ke app pelajar
    // (students/{uid}/notifikasi) minta pilih tarikh baru.
    containerEl.querySelectorAll("[data-aksi='tak-hadir-ceramah']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        tandaTakHadirCeramah(btn.dataset.uid, btn.dataset.kunci);
      });
    });
    containerEl.querySelectorAll("[data-aksi='tak-hadir-uk']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        tandaTakHadirUK(btn.dataset.uid);
      });
    });
    containerEl.querySelectorAll("[data-aksi='tak-hadir-sesi-latihan']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        tandaTakHadirSesiLatihan(btn.dataset.uid, Number(btn.dataset.index), btn.dataset.kunci);
      });
    });
    containerEl.querySelectorAll("[data-aksi='tak-hadir-qti-latihan']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        tandaTakHadirQtiLatihan(btn.dataset.uid, btn.dataset.kunci);
      });
    });
    // TAMBAHAN: toggle tajuk blok "Latihan Praktikal" (buka/tutup panel jadual)
    containerEl.querySelectorAll("[data-aksi='toggle-latihan']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleLatihanPopup(btn.dataset.uid, btn.dataset.kunci);
      });
    });
    // TAMBAHAN: cetak laporan (slip) seorang pelajar
    containerEl.querySelectorAll("[data-aksi='cetak-laporan']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        cetakLaporanPelajar(btn.dataset.uid);
      });
    });
    // TAMBAHAN (Design A): dropdown "Lihat Sesi" Latihan dlm kad Rekod
    // Lesen Lama — toggle rlLatihanTerbukaSet (uid|recordId|kunci) &
    // classList.toggle terus kad tu (TAK perlu render() penuh, sama
    // ringan macam togol .kad-pelajar-toggle di bawah).
    containerEl.querySelectorAll("[data-rl-lat-toggle]").forEach(tajuk => {
      tajuk.addEventListener("click", (e) => {
        e.stopPropagation();
        const key = tajuk.dataset.rlLatToggle;
        if (rlLatihanTerbukaSet.has(key)) rlLatihanTerbukaSet.delete(key);
        else rlLatihanTerbukaSet.add(key);
        const demo = tajuk.closest(".lat-a-demo");
        if (demo) demo.classList.toggle("terbuka");
      });
    });
    // TAMBAHAN: butang "Maklumat Lengkap" sebelah nama (buka modal)
    containerEl.querySelectorAll("[data-aksi='maklumat-lengkap']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        bukaModalMaklumat(btn.dataset.uid);
      });
    });
    // TAMBAHAN: togol buka/tutup kad pelajar (collapse-by-default) — klik
    // header (.kad-pelajar-atas: avatar+nama+id+chevron) je yang ditogol.
    // KEMASKINI: butang "Maklumat Lengkap" & "Cetak" skang DUA-DUA duduk
    // terus dalam header (sebelah nama, baris_htmlKepalaKad()) — masing2
    // listener (data-aksi='maklumat-lengkap'/'cetak-laporan' di atas) dah
    // panggil e.stopPropagation(), so klik butang2 tu TAK sekali tercetus
    // togol buka/tutup kad walaupun duduk dalam descendant header.
    // .senarai-kategori/.bawah-aksi (dalam .kad-detail) tetap sibling kad
    // header, bukan isu pun sejak awal.
    containerEl.querySelectorAll(".kad-pelajar-toggle").forEach(header => {
      header.addEventListener("click", () => {
        const kad = header.closest(".kad-pelajar");
        if (!kad) return;
        const uid = kad.dataset.uid;
        if (kadTerbukaSet.has(uid)) {
          kadTerbukaSet.delete(uid);
        } else {
          kadTerbukaSet.add(uid);
          // TAMBAHAN: muat rekod lesen lama (lazy, sekali sahaja) bila kad dibuka
          const p = senaraiPelajar.find(x => x.uid === uid);
          if (p && p.adaRekodLama) muatRekodLamaPelajar(uid);
        }
        kad.classList.toggle("terbuka");
      });
    });
  }

  // ======================================================================
  // TAMBAHAN: tab berasingan "Selesai" (dibuka drpd kad Ringkasan "Selesai",
  // duduk bawah "Permintaan Tukar Tarikh" — BUKAN nav-item sidebar) —
  // senarai pelajar yg dah pelajarSudahSelesai() (SEMUA peringkat SAH/HADIR
  // + Bayaran SAH), TAK KIRA didaftar guna admin (kaunter) atau guna app
  // sendiri. Guna balik EXACT barisPelajar()/wireKadPelajarEvents() yang
  // sama dgn tab Senarai Pelajar (TIADA kad/logik baru direka) — cuma
  // senarai ni ditapis pelajarSudahSelesai() sahaja, & tak terjejas oleh
  // carian/tapisan kad ringkasan (skop berasingan drpd tab Senarai Pelajar).
  // ======================================================================
  function renderSenaraiSelesai() {
    const selesaiWrap = document.getElementById("selesaiWrap");
    const selesaiKiraanEl = document.getElementById("selesaiKiraan");
    if (!selesaiWrap) return; // jaga-jaga kalau tab/elemen belum wujud

    const senaraiSelesai = urutIkutNama(senaraiPelajar.filter(pelajarSudahSelesai));
    if (selesaiKiraanEl) selesaiKiraanEl.textContent = senaraiSelesai.length;

    if (senaraiSelesai.length === 0) {
      selesaiWrap.innerHTML = `<div class="kosong">Tiada pelajar yang dah selesai lagi.</div>`;
      return;
    }

    // TAMBAHAN: ikon App/Kaunter kat hujung nama — lihat tagSumberPendaftaran()
    selesaiWrap.innerHTML = senaraiSelesai.map(p => barisPelajar(p, tagSumberPendaftaran(p))).join("");
    wireKadPelajarEvents(selesaiWrap);
  }

  // KEMASKINI (mockup diluluskan): buka/tutup blok "Latihan Praktikal" inline
  // (gantikan popup terapung lama) — BEBERAPA blok (Moto & Kereta, atau
  // pelbagai pelajar sekaligus) boleh terbuka SERENTAK, so TIADA lagi
  // "klik luar utk tutup" (itu konsep popup terapung — blok ni dah inline,
  // tak tutupi apa-apa, so tak perlu auto-tutup bila klik tempat lain).
  function toggleLatihanPopup(uid, kunci = KUNCI_LATIHAN_MOTO) {
    const id = `${uid}|${kunci || KUNCI_LATIHAN_MOTO}`;
    if (latihanTerbukaSet.has(id)) latihanTerbukaSet.delete(id);
    else latihanTerbukaSet.add(id);
    render();
  }

  // ======================================================================
  // TAMBAHAN (FIX): TUTUP OTOMATIK PERMINTAAN "MINTA TUKAR TARIKH" YANG
  // SEPADAN, WALAU ADMIN GUNA LALUAN RESET YANG MANA SEKALIPUN.
  // ======================================================================
  //
  // SEBELUM NI: hanya laluan "Approve & Reset" (kotak kuning) yang menandakan
  // permintaanTukarTarikh sebagai "SELESAI". Kalau admin guna butang
  // "↺ Reset Tarikh" terus kat baris pelajar (laluan BIASA, tak lalui kotak
  // kuning), permintaan asal kekal "MENUNGGU" SELAMA-LAMANYA — notifikasi
  // kuning & badge 🔔 tak pernah hilang walaupun tarikh dah pun direset.
  //
  // FIX: lepas SETIAP jenis reset (Ceramah / Ujian Komputer / Latihan —
  // termasuk reset SATU sesi & reset QTI), kita cari & tutup semua permintaan
  // "MENUNGGU" yang sepadan (uid + kategori) secara automatik. Ini jalan
  // SERENTAK dengan laluan approveDanReset() sedia ada tanpa konflik — kalau
  // permintaan tu memang dah "SELESAI", query di bawah cuma takkan jumpa apa-apa.
  //
  // KEMASKINI (2 PAKEJ): parameter `jenis` ("MOTO"/"KERETA", "" = tunggal) — bila
  // diberi, cuma permintaan yg jenisnya SAMA (atau kosong = pelajar 1 pakej)
  // ditutup; permintaan jenis lain utk pelajar yg sama TAK ditutup.
  async function tutupPermintaanTukarTarikhSepadan(uid, kategori, jenis = "") {
    try {
      const qSepadan = query(
        collection(db, "permintaanTukarTarikh"),
        where("uid", "==", uid),
        where("kategori", "==", kategori),
        where("status", "==", "MENUNGGU")
      );
      const snap = await getDocs(qSepadan);
      if (snap.empty) return;

      const docPadan = snap.docs.filter(d => {
        const jd = d.data().jenis || "";
        return !jenis || !jd || jd === jenis;
      });
      if (docPadan.length === 0) return;

      const batch = writeBatch(db);
      docPadan.forEach(d => {
        batch.update(d.ref, { status: "SELESAI", tarikhDiluluskan: serverTimestamp() });
      });
      await batch.commit();
    } catch (err) {
      // Housekeeping sahaja — reset utama (tarikh/status student) dah pun
      // berjaya sebelum function ni dipanggil, jadi kegagalan di sini
      // TAK ditunjuk sebagai error kat admin (elak alert mengelirukan).
      console.error(`Gagal tutup permintaan tukar tarikh (uid=${uid}, kategori=${kategori}):`, err);
    }
  }

  // ======================================================================
  // TAMBAHAN: KOTAK NOTIFIKASI KUNING — PERMINTAAN TUKAR TARIKH
  // ======================================================================
  //
  // Bila student hantar "Minta Tukar Tarikh" dari app (koleksi
  // "permintaanTukarTarikh", status "MENUNGGU"), permintaan tu terus muncul
  // sebagai kotak kuning kat atas jadual. Admin tekan "Approve & Reset" →
  // function ni panggil TERUS function reset yang dah sedia ada (tak buat
  // logic reset baru) ikut kategori:
  //   - CERAMAH          -> resetTarikhCeramah punya "core" (tanpa confirm)
  //   - UJIAN_KOMPUTER   -> resetTarikhUjianKomputer punya "core"
  //   - LATIHAN_MEMANDU  -> resetSatuSesiLatihan (kalau ada sesiKe) atau
  //                          resetTarikhLatihanPraktikal (kalau tiada, reset semua)
  // Lepas reset berjaya, permintaan ni ditanda status "SELESAI" supaya hilang
  // dari kotak kuning & badge 🔔.

  function labelKategoriPermintaan(kod) {
    switch (kod) {
      case "CERAMAH": return "Ceramah Undang-Undang";
      case "UJIAN_KOMPUTER": return "Ujian Komputer";
      case "LATIHAN_MEMANDU": return "Latihan Memandu";
      default: return kod;
    }
  }

  // KEMASKINI (2 pakej): permintaan ada field "jenis" (MOTO/KERETA; kosong = tunggal)
  function labelJenisPermintaan(r) {
    return r && r.jenis ? ` (${teksJenis(r.jenis)})` : "";
  }

  // Cari field pelajar yg patut direset utk permintaan ni. Ikut `jenis`; kalau
  // field jenis tu tiada/tak berjadual tapi pelajar ada SATU sahaja yg berjadual
  // (cth pelajar lama, jenis kosong) => guna yg satu tu.
  function kunciCeramahUntukPermintaan(uid, jenis) {
    const p = senaraiPelajar.find(x => x.uid === uid);
    const kunciJenis = jenis === "MOTO" ? "ceramahMoto" : (jenis === "KERETA" ? "ceramahKereta" : "ceramah");
    if (p && !(p[kunciJenis] && p[kunciJenis].tarikh)) {
      const ada = senaraiCeramahPelajar(p).filter(c => c.data && c.data.tarikh);
      if (ada.length === 1) return ada[0].kunci;
    }
    return kunciJenis;
  }
  function kunciLatihanUntukPermintaan(uid, jenis) {
    const p = senaraiPelajar.find(x => x.uid === uid);
    const kunciJenis = jenis === "KERETA" ? KUNCI_LATIHAN_KERETA : KUNCI_LATIHAN_MOTO;
    if (p && !(p[kunciJenis] && p[kunciJenis].senaraiSesi)) {
      const ada = senaraiLatihanPelajar(p).filter(e => e.lp && e.lp.senaraiSesi);
      if (ada.length === 1) return ada[0].kunci;
    }
    return kunciJenis;
  }

  function formatTarikhMohon(r) {
    try {
      if (r.tarikhMohon && typeof r.tarikhMohon.toDate === "function") {
        return r.tarikhMohon.toDate().toLocaleString("ms-MY");
      }
    } catch (e) { /* biar fallback bawah */ }
    return "-";
  }

  function renderNotifPermintaan() {
    if (senaraiPermintaan.length === 0) {
      notifPermintaanEl.innerHTML = "";
      return;
    }

    const itemHtml = senaraiPermintaan.map(r => {
      const kategoriLabel = labelKategoriPermintaan(r.kategori) + labelJenisPermintaan(r); // KEMASKINI: + (Moto/Kereta)
      const sesiInfo = (r.sesiKe && r.sesiKe > 0) ? ` — Sesi ${r.sesiKe}` : "";
      // TAMBAHAN: baris ni kini collapse-by-default / expand-on-klik — lihat
      // notifTerbukaSet & CSS .notif-item/.notif-item-atas/.notif-detail.
      // Info nama+kategori (baris pertama, SAMA teks macam sebelum ni) kekal
      // dalam header yang sentiasa nampak; sub-info (Tarikh semasa/Dimohon)
      // + butang Approve & Reset (markup/data-aksi/data-id TAK diubah)
      // dipotong ke dalam .notif-detail yang tersembunyi lalai.
      const terbuka = notifTerbukaSet.has(r.id);
      return `
        <div class="notif-item${terbuka ? " terbuka" : ""}" data-id="${r.id}">
          <div class="notif-item-atas notif-item-toggle">
            <div class="notif-info">
              🔔 <b>${r.namaPelajar || r.uid}</b> mohon tukar tarikh <b>${kategoriLabel}${sesiInfo}</b>
            </div>
            <div class="kad-chevron"><i class="fa-solid fa-chevron-down"></i></div>
          </div>
          <div class="notif-detail">
            <span class="notif-sub">Tarikh semasa: ${r.tarikhAsal || "-"} • Dimohon: ${formatTarikhMohon(r)}</span>
            <button class="btn-approve" data-aksi="approve-reset" data-id="${r.id}"><i class="fa-solid fa-check-double"></i> Approve &amp; Reset</button>
          </div>
        </div>
      `;
    }).join("");

    notifPermintaanEl.innerHTML = `
      <div class="notif-kuning">
        <div class="notif-header">🔔 ${senaraiPermintaan.length} permintaan tukar tarikh menunggu tindakan</div>
        <div class="notif-list">${itemHtml}</div>
      </div>
    `;

    notifPermintaanEl.querySelectorAll("[data-aksi='approve-reset']").forEach(btn => {
      btn.addEventListener("click", () => approveDanReset(btn.dataset.id, btn));
    });

    // TAMBAHAN: togol buka/tutup baris permintaan — klik header
    // (.notif-item-atas: nama+kategori+chevron) je yang ditogol. Butang
    // "Approve & Reset" duduk dalam .notif-detail, BUKAN descendant header
    // ni (dia sibling, bukan anak), jadi klik butang tu TAK sekali
    // tercetus togol (tiada risiko interferens dgn listener approve-reset
    // di atas, & tiada e.stopPropagation() diperlukan pun).
    notifPermintaanEl.querySelectorAll(".notif-item-toggle").forEach(header => {
      header.addEventListener("click", () => {
        const item = header.closest(".notif-item");
        if (!item) return;
        const id = item.dataset.id;
        if (notifTerbukaSet.has(id)) notifTerbukaSet.delete(id);
        else notifTerbukaSet.add(id);
        item.classList.toggle("terbuka");
      });
    });
  }

  // Approve satu permintaan: panggil function reset sedia ada ikut kategori,
  // lepas tu tanda permintaan "SELESAI". SATU confirm sahaja (bukan berganda).
  async function approveDanReset(permintaanId, btnEl) {
    const r = senaraiPermintaan.find(x => x.id === permintaanId);
    if (!r) return;

    const kategoriLabel = labelKategoriPermintaan(r.kategori) + labelJenisPermintaan(r); // KEMASKINI: + (Moto/Kereta)
    const sesiInfo = (r.sesiKe && r.sesiKe > 0) ? ` (Sesi ${r.sesiKe})` : "";

    if (!confirm(`Approve permintaan ${r.namaPelajar || r.uid} — ${kategoriLabel}${sesiInfo}?\n\nTarikh semasa (${r.tarikhAsal || "-"}) akan direset terus, dan pelajar WAJIB pilih tarikh baru dari app.`)) return;

    if (btnEl) { btnEl.disabled = true; btnEl.textContent = "Memproses..."; }

    try {
      // KEMASKINI (2 pakej): ikut `r.jenis` — field & koleksi slot yg BETUL
      // (ceramahMoto/ceramahKereta; latihan moto/kereta) dipilih, count slot LAMA
      // dikurangkan. Slot BAHARU dibook oleh app bila pelajar pilih tarikh baru.
      if (r.kategori === "CERAMAH") {
        await _resetTarikhCeramahTanpaKonfirmasi(r.uid, kunciCeramahUntukPermintaan(r.uid, r.jenis || ""));
      } else if (r.kategori === "UJIAN_KOMPUTER") {
        await _resetTarikhUjianKomputerTanpaKonfirmasi(r.uid);
      } else if (r.kategori === "LATIHAN_MEMANDU") {
        const kunciLat = kunciLatihanUntukPermintaan(r.uid, r.jenis || "");
        if (r.sesiKe && r.sesiKe > 0) {
          await _resetSatuSesiLatihanTanpaKonfirmasi(r.uid, r.sesiKe - 1, kunciLat);
        } else {
          await _resetTarikhLatihanPraktikalTanpaKonfirmasi(r.uid, kunciLat);
        }
      } else {
        throw new Error("Kategori permintaan tak dikenali: " + r.kategori);
      }

      await updateDoc(doc(db, "permintaanTukarTarikh", permintaanId), {
        status: "SELESAI",
        tarikhDiluluskan: serverTimestamp()
      });

      tunjukToast(`Permintaan ${r.namaPelajar || r.uid} (${kategoriLabel}${sesiInfo}) diluluskan & tarikh dah direset.`, "success");
    } catch (err) {
      tunjukToast("Gagal proses permintaan: " + err.message, "error");
      if (btnEl) { btnEl.disabled = false; btnEl.textContent = "Approve & Reset"; }
    }
  }

  // nilaiSah = value yang dianggap "confirmed" utk field ni (lalai "SAH")
  // labelPending = label alternatif utk badge kuning bila status wujud tapi belum confirmed
  function baris_badge(status, nilaiSah = "SAH", labelPending = null) {
    if (status === nilaiSah) return `<span class="badge badge-hijau"><i class="fa-solid fa-check"></i> ${nilaiSah}</span>`;
    if (status) return `<span class="badge badge-kuning"><i class="fa-solid fa-clock"></i> ${labelPending || status}</span>`;
    return `<span class="badge badge-abu"><i class="fa-solid fa-minus"></i> Belum ada</span>`;
  }

  // ======================================================================
  // KEMASKINI (2 PAKEJ): helper normalisasi — SATU sumber kebenaran utk
  // semua tempat yg baca pakej / ceramah / latihan. Pelajar LAMA (tiada
  // pakejLesen.senarai, hanya "ceramah" + "latihanPraktikalMoto") dikembalikan
  // sbg senarai SATU entri, jadi semua logik lama kekal sama.
  // ======================================================================
  function teksJenis(j) { return j === "MOTO" ? "Moto" : (j === "KERETA" ? "Kereta" : ""); }

  // "ceramahMoto"->"MOTO", "latihanPraktikalKereta"->"KERETA", "ceramah"->"" (tunggal)
  function jenisDariKunci(kunci) {
    if (/Moto$/.test(kunci || "")) return "MOTO";
    if (/Kereta$/.test(kunci || "")) return "KERETA";
    return "";
  }

  // senarai pakej pelajar: senarai[] (baru) ATAU satu entri dari pakejLesen (lama)
  function senaraiPakejPelajar(p) {
    const pl = p && p.pakejLesen;
    if (!pl || !pl.nama) return [];
    if (Array.isArray(pl.senarai) && pl.senarai.length > 0) return pl.senarai;
    return [{ nama: pl.nama, harga: pl.harga, hargaSen: pl.hargaSen }];
  }
  function adaDuaPakej(p) {
    const pl = p && p.pakejLesen;
    return !!(pl && Array.isArray(pl.senarai) && pl.senarai.length >= 2);
  }
  // teks (HTML ringkas) senarai pakej + jumlah gabungan
  function htmlSenaraiPakej(p) {
    const pl = p && p.pakejLesen;
    if (!pl || !pl.nama) return "—";
    if (!adaDuaPakej(p)) return `${pl.nama}${pl.harga ? " — " + pl.harga : ""}`;
    const baris = pl.senarai.map(x => `${x.nama}${teksJenis(x.jenis) ? " (" + teksJenis(x.jenis) + ")" : ""}${x.harga ? " — " + x.harga : ""}`);
    return `${baris.join("<br>")}${pl.harga ? `<br><b>Jumlah: ${pl.harga}</b>` : ""}`;
  }

  // Ceramah: [{kunci, label, data}] — 2 pakej => Moto + Kereta (data {} kalau belum book);
  // 1 pakej / pelajar lama => "ceramah" sahaja; tiada jadual => [].
  function senaraiCeramahPelajar(p) {
    const dua = adaDuaPakej(p);
    if (dua || p.ceramahMoto || p.ceramahKereta) {
      const hasil = [];
      if (dua || p.ceramahMoto) hasil.push({ kunci: "ceramahMoto", label: "Moto", data: p.ceramahMoto || {} });
      if (dua || p.ceramahKereta) hasil.push({ kunci: "ceramahKereta", label: "Kereta", data: p.ceramahKereta || {} });
      return hasil;
    }
    if (p.ceramah) return [{ kunci: "ceramah", label: "", data: p.ceramah }];
    return [];
  }

  // TAMBAHAN (fix bug dilaporkan admin — "daftar kaunter pakej Kereta tapi
  // Latihan Praktikal Kereta tak muncul langsung"): cari jenis (MOTO/
  // KERETA) sesuatu NAMA pakej, guna katalog dapatkanSenaraiPakejPenuh()
  // (SATU sumber kebenaran sedia ada, SAMA yg dropdown #drmPakejMoto/Kereta
  // & "Pengurusan Pakej" guna — jenis tersimpan kat situ utk SETIAP pakej).
  function jenisPakejDrpdNama(nama) {
    if (!nama) return "";
    const padanan = dapatkanSenaraiPakejPenuh().find(pk => pk.nama === nama);
    return padanan ? (padanan.jenis || "") : "";
  }
  // TAMBAHAN: senarai jenis (["MOTO"]/["KERETA"]/["MOTO","KERETA"]) yg
  // pakej SEBENAR pelajar ni perlukan — drpd pakejLesen.senarai[].jenis
  // (2 pakej, dah tersimpan terus) ATAU jenisPakejDrpdNama(pakejLesen.nama)
  // (1 pakej, kena cari dlm katalog sbb pakejLesen {nama,harga} 1-pakej TAK
  // simpan jenis terus).
  function senaraiJenisPakejPelajar(p) {
    if (adaDuaPakej(p)) {
      return p.pakejLesen.senarai.map(x => x.jenis).filter(j => j === "MOTO" || j === "KERETA");
    }
    if (p.pakejLesen && p.pakejLesen.nama) {
      const j = jenisPakejDrpdNama(p.pakejLesen.nama);
      return j ? [j] : [];
    }
    return [];
  }

  // Latihan: [{kunci, label, lp}].
  // KEMASKINI (fix): sebelum ni blok Latihan cuma muncul kalau field
  // latihanPraktikalMoto/Kereta DAH WUJUD dlm Firestore — tapi field tu
  // sendiri baru dicipta bila admin tetapkan SESI PERTAMA
  // (kkTetapkanLatihanSesi()). Jadi utk pelajar kaunter BARU didaftar
  // (pakej Kereta sahaja, ATAU 2 pakej yg admin baru mula SATU jenis),
  // blok jenis yg field-nya belum wujud lagi TAK PERNAH muncul — admin
  // jadi tak boleh tekan apa-apa utk mula jenis tu (bulan telur-ayam).
  // FIX: gabungkan jenis drpd PAKEJ pelajar (senaraiJenisPakejPelajar)
  // DENGAN jenis yg field-nya dah wujud (pelajar lama yg dah ada data) —
  // lp:null bila field tu sendiri belum wujud (SELAMAT, semua predikat
  // sedia ada — adaSesi/adaQti/latihanLpBelumSelesai dll — dah handle
  // lp:null dgn betul sebagai "belum mula").
  function senaraiLatihanPelajar(p) {
    const jenisDiperlukan = new Set(senaraiJenisPakejPelajar(p));
    if (p.latihanPraktikalMoto) jenisDiperlukan.add("MOTO");
    if (p.latihanPraktikalKereta) jenisDiperlukan.add("KERETA");

    const hasil = [];
    if (jenisDiperlukan.has("MOTO")) hasil.push({ kunci: KUNCI_LATIHAN_MOTO, label: "Moto", lp: p.latihanPraktikalMoto || null });
    if (jenisDiperlukan.has("KERETA")) hasil.push({ kunci: KUNCI_LATIHAN_KERETA, label: "Kereta", lp: p.latihanPraktikalKereta || null });
    return hasil;
  }
  // label Moto/Kereta cuma dipaparkan bila perlu bezakan (2 pakej / ada latihan kereta)
  function perluLabelJenis(p) { return adaDuaPakej(p) || !!p.latihanPraktikalKereta || senaraiJenisPakejPelajar(p).includes("KERETA"); }

  // ======================================================================
  // TAMBAHAN (FIX — exact-string match sblm ni tak match data sebenar):
  // "Auto Approve" — bila pelajar pakai akaun SAMA utk daftar pakej kedua,
  // app Android skip Ceramah+UK & tulis SATU status terus TANPA tarikh
  // (sbb tiada sesi sebenar nak dijadualkan). Dalam flow book BIASA (dari
  // app), status SENTIASA ditulis SEKALI GUS dgn tarikh — jadi "ada status
  // tapi TIADA tarikh" ni sendiri dah cukup jadi penanda auto-approve,
  // TAK KIRA ejaan/huruf besar-kecil teks status tu ("Auto Approve",
  // "AUTO_APPROVE", dll — apa-apa pun admin terima). Teks status SEBENAR
  // (c.data.status / p.ujianKomputer.status) terus dipaparkan pada badge,
  // supaya admin nampak PERSIS apa yang app tulis.
  // ======================================================================
  function ceramahAutoApprove(c) { return !!(c.data && c.data.status && !c.data.tarikh); }
  function ukAutoApprove(p) { return !!(p.ujianKomputer && p.ujianKomputer.status && !p.ujianKomputer.tarikh); }

  // pelajar 2 pakej: SEMUA ceramah (Moto & Kereta) mesti HADIR (atau Auto Approve). Lama: "ceramah" HADIR.
  function ceramahHadir(p) {
    const senarai = senaraiCeramahPelajar(p);
    if (senarai.length === 0) return false;
    return senarai.every(c => c.data && (c.data.status === "HADIR" || ceramahAutoApprove(c)));
  }

  // TAMBAHAN: helper semak pakej dah sah ke belum
  function pakejSudahSah(p) {
    return !!(p.pakejLesen && p.pakejLesen.status === "SAH");
  }

  // TAMBAHAN: helper semak Ujian Komputer dah SAH ke belum (atau Auto
  // Approve) — dipakai utk kunci keras seksyen Latihan Praktikal (kk)
  // sehingga Ceramah+UK confirmed.
  function ukSudahSah(p) {
    return !!(p.ujianKomputer && (p.ujianKomputer.status === "SAH" || ukAutoApprove(p)));
  }

  // ======================================================================
  // TAMBAHAN: helper predikat "belum sah/hadir" — SATU sumber kebenaran
  // dikongsi oleh (1) pengiraan kad ringkasan (bilPendingPakej dll dalam
  // render()) DAN (2) tapisan bila kad tu diklik (tapisanKad), supaya
  // bilangan atas kad SENTIASA sepadan tepat dengan bilangan baris yang
  // terpapar bila kad tu ditapis. Logik sama macam yang sedia ada sebelum
  // ni (dipindah dari inline filter dalam render(), TAK diubah).
  // ======================================================================
  function pakejBelumSah(p) {
    return !!(p.pakejLesen && p.pakejLesen.nama && p.pakejLesen.status !== "SAH");
  }
  function ceramahBelumHadir(p) {
    return senaraiCeramahPelajar(p).some(c => !!(c.data && c.data.tarikh && c.data.status !== "HADIR"));
  }
  function ukBelumSah(p) {
    return !!(p.ujianKomputer && p.ujianKomputer.status === "PENDING");
  }
  function bayaranBelumSah(p) {
    return !!(p.pembayaran && p.pembayaran.status && p.pembayaran.status !== "SAH");
  }
  // TAMBAHAN: predikat "belum selesai" utk Latihan Praktikal — sama pattern
  // macam pakejBelumSah/ceramahBelumHadir/ukBelumSah/bayaranBelumSah di atas,
  // dan sama EXACT logik pengiraan "belum hadir" yang baris_htmlLatihan()
  // sedia ada guna (jumlahBelumHadir), supaya angka carta sepadan dgn apa
  // yang admin nampak dalam dropdown "Lihat Sesi (x/y hadir)" kat table.
  // KEMASKINI: dikira PER latihan (Moto / Kereta berasingan) — "belum selesai"
  // kalau MANA-MANA satu belum. Logik pengiraan per-latihan SAMA macam asal.
  function latihanLpBelumSelesai(lp) {
    const adaSesi = !!(lp && lp.senaraiSesi && lp.senaraiSesi.length > 0);
    const adaQti = !!(lp && lp.qti && lp.qti.tarikh);
    if (!adaSesi && !adaQti) return false;
    let jumlahBelumHadir = 0;
    if (adaSesi) jumlahBelumHadir += lp.senaraiSesi.filter(s => s.status !== "HADIR").length;
    if (adaQti && lp.qti.status !== "HADIR") jumlahBelumHadir += 1;
    return jumlahBelumHadir > 0;
  }
  function latihanBelumSelesai(p) {
    return senaraiLatihanPelajar(p).some(e => latihanLpBelumSelesai(e.lp));
  }
  // TAMBAHAN: pecahan Moto/Kereta berasingan (utk carta bar ringkasan) —
  // guna balik senaraiLatihanPelajar()/latihanLpBelumSelesai() yang sama.
  function latihanMotoBelumSelesai(p) {
    const e = senaraiLatihanPelajar(p).find(x => x.kunci === KUNCI_LATIHAN_MOTO);
    return !!e && latihanLpBelumSelesai(e.lp);
  }
  function latihanKeretaBelumSelesai(p) {
    const e = senaraiLatihanPelajar(p).find(x => x.kunci === KUNCI_LATIHAN_KERETA);
    return !!e && latihanLpBelumSelesai(e.lp);
  }
  // TAMBAHAN: kad "Pernah Tambah Kelas" (sidebar Ringkasan) — kira PELAJAR
  // (bukan bilangan rekod arkib), elak kira dua kali kalau seorang pelajar
  // ada >1 rekod dalam rekod_lesen_tamat.
  function pernahTambahKelas(p) { return !!p.adaRekodLama; }
  // semua sesi (ada tarikh) HADIR + QTI HADIR => latihan tu "SELESAI"
  function latihanSelesaiSemua(senaraiSesi, qti) {
    return Array.isArray(senaraiSesi) && senaraiSesi.length > 0
      && senaraiSesi.every(s => !!(s && s.tarikh && s.status === "HADIR"))
      && !!(qti && qti.tarikh && qti.status === "HADIR");
  }

  // ======================================================================
  // TAMBAHAN: predikat "pelajar dah SELESAI" (settle) — dipakai utk tab
  // berasingan "Selesai" & kira semula kad "Jumlah Pelajar" (Ringkasan)
  // supaya pelajar yg dah habis SEMUA tak buat angka tu jadi bengkak dgn
  // pelajar lama. Ikut keputusan admin: "Selesai" = SEMUA peringkat SAH/
  // HADIR (Pakej, Ceramah, UK, Latihan Praktikal + QTI) *DAN* Pembayaran
  // pelajar tu dah SAH sekali (bukan cuma habis kursus je).
  //
  // PEMBAIKAN (bug dilaporkan admin): asalnya predikat ni HARD-REQUIRE
  // lp.senaraiSesi.length === 8 (ikut reka bentuk "8 sesi" yg dibina utk
  // borang kaunter). Tapi pelajar SEBENAR (terutama yg daftar guna app
  // sendiri, bukan kaunter) boleh ada BILANGAN sesi Latihan Praktikal yang
  // LAIN drpd 8 (cth pelajar "boy" — 7 sesi, label "Lihat Sesi (8/8 hadir)"
  // = 7 sesi + 1 QTI) — jadi hard-require 8 tu silently exclude pelajar yg
  // SEBENARNYA dah selesai. KEMASKINI: guna balik latihanBelumSelesai()
  // sedia ada (SATU sumber kebenaran yg sama drpd label "Lihat Sesi (x/y
  // hadir)" & carta bar Dashboard) — tak kira berapa banyak pun sesi
  // pelajar tu ada, asalkan SEMUA yg ada tu HADIR + QTI HADIR. Ni jugak yg
  // buat predikat ni betul2 "tak kira daftar guna admin/kaunter atau guna
  // app" (dua-dua guna struktur data + logik yg SAMA).
  //
  // NOTA: Pakej->Ceramah->UK->Latihan+QTI memang dah hard-lock berturutan
  // utk pelajar kaunter (lihat bolehLatihan dlm kkBinaHtmlKad), tapi
  // predikat ni TETAP semak semua secara eksplisit (bukan andaian) supaya
  // betul jugak utk pelajar app (yg tiada hard-lock macam tu) & walau admin
  // override urutan biasa.
  // ======================================================================
  function pelajarSudahSelesai(p) {
    if (!pakejSudahSah(p)) return false;
    if (!ceramahHadir(p)) return false;
    if (!ukSudahSah(p)) return false;

    // KEMASKINI (2 pakej): Moto & Kereta disemak BERASINGAN — kedua-dua (kalau
    // pelajar 2 pakej) mesti ada sesi + QTI dan semua HADIR.
    const senaraiLp = senaraiLatihanPelajar(p);
    if (senaraiLp.length === 0) return false;
    if (adaDuaPakej(p) && senaraiLp.length < 2) return false;
    for (const e of senaraiLp) {
      const lp = e.lp;
      const adaSesi = !!(lp && lp.senaraiSesi && lp.senaraiSesi.length > 0);
      const adaQti = !!(lp && lp.qti && lp.qti.tarikh);
      // Mesti dah BENAR-BENAR mula & ada QTI dijadualkan — bukan sekadar
      // "tiada apa-apa data pun" (latihanLpBelumSelesai() anggap takde data = "tak kira").
      if (!adaSesi || !adaQti) return false;
      if (latihanLpBelumSelesai(lp)) return false;
    }

    if (!(p.pembayaran && p.pembayaran.status === "SAH")) return false;

    return true;
  }

  // ======================================================================
  // TAMBAHAN: senarai sebab (Bahasa Melayu, mesra admin) kenapa seorang
  // pelajar BELUM lagi pelajarSudahSelesai() — SATU-SATU SAMA predikat
  // (pakejSudahSah/ceramahHadir/ukSudahSah/senaraiLatihanPelajar+
  // latihanLpBelumSelesai/pembayaran.status) dipecah jadi mesej, supaya
  // admin boleh nampak TERUS kat kad pelajar kaunter kenapa pelajar tu
  // "stuck" tak masuk tab Selesai — tak payah teka/tanya developer.
  // TIADA logik kelayakan baru — cuma "explain" predikat sedia ada.
  // ======================================================================
  function senaraiSebabBelumSelesai(p) {
    const sebab = [];
    if (!pakejSudahSah(p)) sebab.push("Pakej Lesen belum disahkan");

    const senaraiC = senaraiCeramahPelajar(p);
    if (senaraiC.length === 0) {
      sebab.push("Ceramah belum dijadualkan");
    } else {
      // TAMBAHAN: rekod "Auto Approve" (pakej kedua, akaun sama) dikira
      // SAMA level dgn HADIR — tak disenaraikan sebagai sebab tersekat.
      senaraiC.filter(c => !(c.data && (c.data.status === "HADIR" || ceramahAutoApprove(c)))).forEach(c => {
        sebab.push(`Ceramah${c.label ? " — " + c.label : ""} belum disahkan HADIR`);
      });
    }

    if (!ukSudahSah(p)) sebab.push("Ujian Komputer belum disahkan LULUS");

    const senaraiLp = senaraiLatihanPelajar(p);
    if (senaraiLp.length === 0) {
      sebab.push("Latihan Praktikal belum dimulakan (belum ada tarikh sesi ditetapkan)");
    } else {
      if (adaDuaPakej(p) && senaraiLp.length < 2) {
        sebab.push("Latihan Praktikal — satu lagi jenis (Moto/Kereta) belum dimulakan lagi");
      }
      senaraiLp.forEach(e => {
        const lp = e.lp;
        const label = e.label ? ` — ${e.label}` : "";
        const adaSesi = !!(lp && lp.senaraiSesi && lp.senaraiSesi.length > 0);
        const adaQti = !!(lp && lp.qti && lp.qti.tarikh);
        if (!adaSesi || !adaQti) {
          sebab.push(`Latihan Praktikal${label} belum lengkap dijadualkan (sesi dan/atau QTI belum ditetapkan)`);
        } else if (latihanLpBelumSelesai(lp)) {
          const bilBelum = (lp.senaraiSesi.filter(s => s.status !== "HADIR").length) + (lp.qti.status !== "HADIR" ? 1 : 0);
          sebab.push(`Latihan Praktikal${label} — masih ada ${bilBelum} sesi/QTI yang belum disahkan HADIR`);
        }
      });
    }

    if (!(p.pembayaran && p.pembayaran.status === "SAH")) {
      sebab.push(p.pembayaran ? "Bayaran belum disahkan (tekan \"Sahkan Pembayaran\")" : "Bayaran belum direkodkan");
    }

    return sebab;
  }

  // ---------- TAMBAHAN: Lajur Pakej Lesen (status + button sahkan) ----------

  function baris_htmlPakej(p) {
    if (!p.pakejLesen || !p.pakejLesen.nama) return "—";
    // KEMASKINI: 2 pakej => papar semua pakej dlm senarai[] + jumlah gabungan
    if (adaDuaPakej(p)) return `<span style="font-size:12px">${htmlSenaraiPakej(p)}</span><br>${baris_badge(p.pakejLesen.status, "SAH", "Belum Disahkan")}`;
    return `${p.pakejLesen.nama}<br><span style="color:var(--kelabu); font-size:11px">${p.pakejLesen.harga || ""}</span><br>${baris_badge(p.pakejLesen.status, "SAH", "Belum Disahkan")}`;
  }

  function baris_htmlSelBtnPakej(p) {
    const ada = p.pakejLesen && p.pakejLesen.nama;
    if (!ada) return `<button class="btn" disabled>Belum pilih pakej</button>`;
    if (p.pakejLesen.status === "SAH") return `<button class="btn" disabled>Sudah disahkan</button>`;
    return `<button class="btn sah-pakej" data-aksi="sah-pakej" data-uid="${p.uid}"><i class="fa-solid fa-check"></i> Sahkan Pakej</button>`;
  }

  // ---------- Lajur Ceramah ----------

  // KEMASKINI (2 pakej): terima `kunci` ("ceramah" | "ceramahMoto" | "ceramahKereta").
  // Tanpa kunci => "ceramah" (pelajar lama / kaunter) — SAMA macam asal.
  function baris_htmlCeramah(p, kunci = "ceramah") {
    const c = p[kunci];
    if (!c || !c.tarikh) return "—";
    let html = `${c.tarikh}<br><span style="color:var(--kelabu); font-size:11px">${c.masa || ""}</span><br>${baris_badge(c.status, "HADIR", "Belum Hadir")}`;
    // TAMBAHAN: info visual — student ni sepatutnya belum boleh sampai sini kalau pakej belum sah
    if (!pakejSudahSah(p) && c.status !== "HADIR") {
      html += `<span class="lock-note">🔒 Pakej belum disahkan</span>`;
    }
    return html;
  }

  function baris_htmlSelBtnCeramah(p, kunci = "ceramah") {
    const c = p[kunci];
    const ada = c && c.tarikh;
    if (!ada) return `<button class="btn" disabled>Tiada jadual</button>`;
    if (c.status === "HADIR") return `<button class="btn" disabled>Sudah hadir</button>`;
    // TAMBAHAN: butang "Tak Hadir" sebelah "Sahkan" — lihat tandaTakHadirCeramah()
    return `<div class="grup-btn-sah">
      <button class="btn sah-ceramah" data-aksi="sah-ceramah" data-uid="${p.uid}" data-kunci="${kunci}"><i class="fa-solid fa-check"></i> Sahkan Hadir</button>
      <button class="btn btn-tak-hadir" data-aksi="tak-hadir-ceramah" data-uid="${p.uid}" data-kunci="${kunci}" title="Tandakan tak hadir &amp; minta pelajar pilih tarikh baru dari app"><i class="fa-solid fa-xmark"></i> Tak Hadir</button>
    </div>`;
  }

  // ---------- Lajur Ujian Komputer ----------

  function baris_htmlUK(p) {
    if (!p.ujianKomputer || !p.ujianKomputer.tarikh) return "—";
    let html = `${p.ujianKomputer.tarikh}<br><span style="color:var(--kelabu); font-size:11px">${p.ujianKomputer.sesi || ""}</span><br>${baris_badge(p.ujianKomputer.status)}`;
    if (!ceramahHadir(p) && p.ujianKomputer.status !== "SAH") {
      html += `<span class="lock-note">🔒 Ceramah belum disahkan hadir</span>`;
    }
    return html;
  }

  function baris_htmlSelBtnUK(p) {
    const ada = p.ujianKomputer && p.ujianKomputer.tarikh;
    const statusUK = p.ujianKomputer ? p.ujianKomputer.status : null;
    if (!ada) return `<button class="btn" disabled>Tiada jadual</button>`;
    if (statusUK === "SAH") return `<button class="btn" disabled>Sudah disahkan</button>`;
    // Nota: ceramah belum "HADIR" TAK sekat button ni — admin sentiasa bebas
    // confirm terus dari dashboard. 🔒 lock-note kat baris_htmlUK() cuma info
    // visual (peringatan yg student ni sepatutnya belum boleh sampai tahap ni
    // ikut flow app), bukan sekatan admin.
    // TAMBAHAN: butang "Tak Hadir" sebelah "Sahkan" — lihat tandaTakHadirUK()
    return `<div class="grup-btn-sah">
      <button class="btn sah-uk" data-aksi="sah-uk" data-uid="${p.uid}"><i class="fa-solid fa-check"></i> Sahkan Lulus UK</button>
      <button class="btn btn-tak-hadir" data-aksi="tak-hadir-uk" data-uid="${p.uid}" title="Tandakan tak hadir &amp; minta pelajar pilih tarikh baru dari app"><i class="fa-solid fa-xmark"></i> Tak Hadir</button>
    </div>`;
  }

  // ---------- TAMBAHAN: Lajur Latihan Praktikal (Motosikal / Amali / Latihan Memandu) ----------
  //
  // Satu pelajar ada BEBERAPA sesi (latihanPraktikalMoto.senaraiSesi[]) + 1 QTI
  // berasingan (latihanPraktikalMoto.qti). Kehadiran disahkan SATU-SATU (bukan
  // borong macam Ceramah/UK) sebab tiap sesi ada tarikh & instruktor lain.
  // Status disimpan terus dalam objek sesi tu sendiri: {tarikh, sesi, status}.
  // "status" === "HADIR" bermakna dah disahkan; takde status = belum hadir lagi.
  //
  // ======================================================================
  // TAMBAHAN (mockup diluluskan, KEMASKINI ikut maklum balas admin — "papar
  // semua terus, tak payah sembunyi-sembunyi"): blok "Latihan Praktikal" 2
  // PERINGKAT — (1) TAJUK (sentiasa nampak: ikon+nama+kiraan hadir+chevron,
  // KLIK utk buka/tutup) (2) PANEL tersembunyi secara lalai; bila dibuka,
  // tunjuk SEMUA kad sesi SEKALI GUS (TIADA lagi "4 dulu + Lihat Lagi").
  // Gantikan popup terapung + skrol lama ("Lihat Sesi (x/y) ▼").
  //
  // htmlBlokLatihanTajukPanel() ialah SATU fungsi dikongsi oleh kad pelajar
  // (bina_htmlLatihanSeksyen di bawah) & kad "Pelajar Didaftar Kaunter"
  // (kkBlokLatihan()) — rupa+kelakuan tajuk/panel/grid 100% SAMA kat dua-dua
  // tempat (ikut permintaan admin "buat macam kad pelajar jugak"); pemanggil
  // masing-masing cuma sediakan senarai HTML kad sesi (semuaItem) ikut
  // keperluan sendiri (kad pelajar = 1 butang Sahkan je sbb tarikh dah
  // dibook student app; kad kaunter = 2 butang Pilih Tarikh/Tukar + Sahkan
  // sbb admin kena tetapkan tarikh sendiri).
  // ======================================================================
  function htmlBlokLatihanTajukPanel({ p, kunci, ikonJenis, labelJenis, hadHadirTeks, semuaItem }) {
    const kunciState = `${p.uid}|${kunci}`;
    const terbuka = latihanTerbukaSet.has(kunciState);

    const gridHtml = `<div class="sesi-grid">${semuaItem.join("")}</div>`;

    return `
      <div class="blok-latihan">
        <button type="button" class="latihan-tajuk${terbuka ? " terbuka" : ""}" data-aksi="toggle-latihan" data-uid="${p.uid}" data-kunci="${kunci}">
          <i class="fa-solid ${ikonJenis} ikon-jenis"></i>
          <span class="nama-tajuk">Latihan Praktikal${labelJenis}</span>
          ${hadHadirTeks ? `<span class="had-hadir">${hadHadirTeks}</span>` : ""}
          <i class="fa-solid fa-chevron-down chevron"></i>
        </button>
        <div class="latihan-panel${terbuka ? " terbuka" : ""}">
          ${gridHtml}
        </div>
      </div>`;
  }

  // KEMASKINI (2 PAKEJ): bina_htmlLatihanSeksyen() bina SATU blok (Moto ATAU
  // Kereta) guna htmlBlokLatihanTajukPanel() di atas.
  function bina_htmlLatihanSeksyen(p, e) {
    const lp = e ? e.lp : null;
    const kunci = e ? e.kunci : KUNCI_LATIHAN_MOTO;
    const adaSesi = !!(lp && lp.senaraiSesi && lp.senaraiSesi.length > 0);
    const adaQti = !!(lp && lp.qti && lp.qti.tarikh);

    if (!adaSesi && !adaQti) return "";

    const jumlahItem = (adaSesi ? lp.senaraiSesi.length : 0) + (adaQti ? 1 : 0);
    let jumlahBelumHadir = 0;
    if (adaSesi) jumlahBelumHadir += lp.senaraiSesi.filter(s => s.status !== "HADIR").length;
    if (adaQti && lp.qti.status !== "HADIR") jumlahBelumHadir += 1;

    const semuaItem = [];

    if (adaSesi) {
      lp.senaraiSesi.forEach((s, index) => {
        // sesi yg baru direset jadi {} — takde tarikh => butang Sahkan disabled
        const adaJadualSesi = !!(s && s.tarikh);
        const sudahHadir = adaJadualSesi && s.status === "HADIR";
        semuaItem.push(`
          <div class="sesi-item${adaJadualSesi ? "" : " tiada-jadual"}${sudahHadir ? " hadir" : ""}">
            <div class="sesi-label">Sesi ${index + 1}${s && s.sesi ? " — " + s.sesi : ""}</div>
            <div class="sesi-tarikh">${adaJadualSesi ? s.tarikh : "-"}<br>${baris_badge(adaJadualSesi ? s.status : null, "HADIR", "Belum Hadir")}</div>
            <div class="sesi-aksi">${!adaJadualSesi
              ? `<button class="btn-sesi" disabled>Sahkan</button>`
              : sudahHadir
                ? `<button class="btn-sesi" disabled><i class="fa-solid fa-check"></i> Sudah Hadir</button>`
                : `<button class="btn-sesi" data-aksi="sah-sesi-latihan" data-uid="${p.uid}" data-index="${index}" data-kunci="${kunci}">Sahkan</button>
                   <button class="btn-sesi btn-tak-hadir" data-aksi="tak-hadir-sesi-latihan" data-uid="${p.uid}" data-index="${index}" data-kunci="${kunci}" title="Tandakan tak hadir &amp; minta pelajar pilih tarikh baru"><i class="fa-solid fa-xmark"></i> Tak Hadir</button>`
            }</div>
          </div>`);
      });
    }

    if (adaQti) {
      const qtiHadir = lp.qti.status === "HADIR";
      semuaItem.push(`
        <div class="sesi-item${qtiHadir ? " hadir" : ""}">
          <div class="sesi-label">QTI</div>
          <div class="sesi-tarikh">${lp.qti.tarikh || "-"}<br>${baris_badge(lp.qti.status, "HADIR", "Belum Hadir")}</div>
          <div class="sesi-aksi">${qtiHadir
            ? `<button class="btn-sesi qti" disabled><i class="fa-solid fa-check"></i> Sudah Hadir</button>`
            : `<button class="btn-sesi qti" data-aksi="sah-qti-latihan" data-uid="${p.uid}" data-kunci="${kunci}">Sahkan</button>
               <button class="btn-sesi qti btn-tak-hadir" data-aksi="tak-hadir-qti-latihan" data-uid="${p.uid}" data-kunci="${kunci}" title="Tandakan tak hadir &amp; minta pelajar pilih tarikh baru"><i class="fa-solid fa-xmark"></i> Tak Hadir</button>`
          }</div>
        </div>`);
    }

    return htmlBlokLatihanTajukPanel({
      p, kunci,
      ikonJenis: kunci === KUNCI_LATIHAN_KERETA ? "fa-car" : "fa-motorcycle",
      labelJenis: (perluLabelJenis(p) && e && e.label) ? ` — ${e.label}` : "",
      hadHadirTeks: `${jumlahItem - jumlahBelumHadir}/${jumlahItem} hadir`,
      semuaItem
    });
  }

  // NOTA: baris_htmlLatihan() (gabungan SEMUA seksyen jadi SATU string) tak
  // dipakai di mana-mana (htmlBarisLatihanKad() panggil bina_htmlLatihanSeksyen()
  // terus, satu-satu) — dikekalkan je sebagai fungsi tak aktif, tak diubah.
  function baris_htmlLatihan(p) {
    const bahagian = senaraiLatihanPelajar(p).map(e => bina_htmlLatihanSeksyen(p, e)).filter(Boolean);
    return bahagian.length ? bahagian.join("") : "—";
  }

  // ---------- Lajur Pembayaran ----------

  function baris_htmlSelBtnBayar(p) {
    const statusBayar = p.pembayaran ? p.pembayaran.status : null;
    if (!statusBayar) return `<button class="btn" disabled>Belum bayar</button>`;
    if (statusBayar === "SAH") return `<button class="btn" disabled>Sudah disahkan</button>`;
    return `<button class="btn sah-bayar" data-aksi="sah-bayar" data-uid="${p.uid}"><i class="fa-solid fa-check"></i> Sahkan Pembayaran</button>`;
  }

  function baris_htmlBayar(p) {
    if (!p.pembayaran) return "—";
    return `${p.pembayaran.jumlah || ""}<br>${baris_badge(p.pembayaran.status)}`;
  }

  // PEMBAIKAN (kad pelajar): baris_htmlNama() asal dipecah kepada DUA —
  // baris_htmlKepalaKad() (avatar+nama+id, kekal header kad) &
  // baris_htmlAksiBawah() (3 butang Reset Tarikh/Reset Semua/Padam, kekal
  // SAMA markup/data-aksi/data-uid, cuma dipindah jadi footer kad ikut
  // mockup yang diluluskan — bukan direka baru, blok butang tu "dipotong"
  // terus dari sini & diletak semula dalam .bawah-aksi di baris_htmlKad()).
  function baris_htmlKepalaKad(p, tagHtml = "") {
    // TAMBAHAN: badge 🔔 kalau pelajar ni ada permintaan tukar tarikh MENUNGGU
    const adaPermintaanPending = senaraiPermintaan.some(r => r.uid === p.uid);
    // TAMBAHAN (visual): inisial nama untuk avatar bulat — tak ubah data, cuma paparan
    const inisialNama = (p.nama || "").trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
    // TAMBAHAN: warna avatar ikut status keseluruhan (ganti badge teks yang
    // dibuang dari header kad) — guna semula statusKeseluruhanPelajar(p)
    // sedia ada, klasifikasi TAK diubah, cuma dipetakan ke class avatar-*.
    const kelasAvatarStatus = {
      "badge-hijau": "avatar-hijau",
      "badge-kuning": "avatar-kuning",
      "badge-merah": "avatar-merah"
    }[statusKeseluruhanPelajar(p).kelas] || "";
    return `<div class="pelajar-cell">
      <div class="avatar ${kelasAvatarStatus}">${inisialNama}</div>
      <div class="pelajar-info">
        <div class="pelajar-nama">${p.nama || "(tiada nama)"}${tagHtml}${p.adaRekodLama ? `<span class="badge-rekod-lama" title="Ada rekod lesen lama (tambah kelas) — tengok bawah sekali kad ni"><i class="fa-solid fa-box-archive"></i> Ada rekod lama (${p.bilanganLesenTamat || 1})</span>` : ""}${adaPermintaanPending ? '<span class="badge-notif" title="Ada permintaan tukar tarikh menunggu"><i class="fa-solid fa-bell"></i></span>' : ""}<button type="button" class="btn-maklumat-lengkap" data-aksi="maklumat-lengkap" data-uid="${p.uid}"><i class="fa-solid fa-address-card"></i> Maklumat Lengkap</button><button type="button" class="btn-cetak-slip" data-aksi="cetak-laporan" data-uid="${p.uid}"><i class="fa-solid fa-print"></i> Cetak</button></div>
        <div class="pelajar-id">${p.noKP || p.uid}</div>
      </div>
    </div>`;
  }

  function baris_htmlAksiBawah(p) {
    return `<div class="aksi-nama-row">
      <button class="btn-reset-umum" data-aksi="buka-reset" data-uid="${p.uid}"><i class="fa-solid fa-rotate-left"></i> Reset Tarikh</button>
      <button class="btn-reset-semua" data-aksi="reset-semua" data-uid="${p.uid}"><i class="fa-solid fa-arrows-rotate"></i> Reset Semua</button>
      <button class="btn-padam-umum" data-aksi="padam-pelajar" data-uid="${p.uid}"><i class="fa-solid fa-trash"></i> Padam</button>
    </div>`;
  }

  // ======================================================================
  // TAMBAHAN: badge status KESELURUHAN kad pelajar (top-right, ikut mockup)
  // ======================================================================
  // Guna SEMULA klasifikasi sedia ada dari renderDonut() — bilBelum dikira
  // dgn 4 predikat SAMA (pakejBelumSah/ceramahBelumHadir/ukBelumSah/
  // bayaranBelumSah) & threshold SAMA (0 -> Selesai Semua, 4 -> Belum Mula,
  // selain -> Dalam Proses). TIADA klasifikasi baru direka — cuma dikongsi
  // jadi satu function supaya renderDonut() & kad pelajar ni sentiasa sepadan.
  function statusKeseluruhanPelajar(p) {
    const bilBelum = [pakejBelumSah(p), ceramahBelumHadir(p), ukBelumSah(p), bayaranBelumSah(p)]
      .filter(Boolean).length;
    if (bilBelum === 0) return { kelas: "badge-hijau", label: "Selesai Semua" };
    if (bilBelum === 4) return { kelas: "badge-merah", label: "Belum Mula" };
    return { kelas: "badge-kuning", label: "Dalam Proses" };
  }

  // TAMBAHAN: pembina generik SATU .kotak kategori — label statik (nama
  // kategori) + blob maklumat/badge yg fungsi sedia ada (baris_htmlXxx)
  // dah hasilkan (TAK diubah), + aksi-row yg cuma dipaparkan bila blob
  // butang (baris_htmlSelBtnXxx) tu MEMANG ada butang aktif (mengandungi
  // "data-aksi=") — bukan placeholder disabled macam "Sudah disahkan"/
  // "Tiada jadual" (ikut mockup: butang confirm cuma muncul bila perlu
  // tindakan). Keputusan paparan ni TIDAK menduplikasi predikat belum-sah
  // mana-mana — cuma tengok hasil HTML yang function sedia ada dah bagi.
  function bina_htmlKotak(labelKategori, htmlMaklumat, htmlButang) {
    const adaButangAktif = typeof htmlButang === "string" && htmlButang.includes("data-aksi=");
    return `<div class="kotak">
      <div class="label">${labelKategori}</div>
      <div class="maklumat">${htmlMaklumat}</div>
      ${adaButangAktif ? `<div class="aksi-row">${htmlButang}</div>` : ""}
    </div>`;
  }

  // ======================================================================
  // TAMBAHAN (mockup Kad A disemak semula): ikon+status bagi SETIAP baris
  // kategori dlm .senarai-kategori — "selesai" (hijau) = dah sah/hadir,
  // "proses" (kuning) = ada data tapi belum sah/hadir, "kunci" (kelabu) =
  // tiada data lagi / belum sampai peringkat tu. Guna SEMULA predikat sedia
  // ada (pakejSudahSah/ceramahHadir/ukSudahSah/latihanBelumSelesai dll) —
  // TIADA logik kelayakan baru direka, cuma dipetakan ke 3 kelas visual ni.
  // ======================================================================
  function kat_statusPakej(p) {
    if (!p.pakejLesen || !p.pakejLesen.nama) return "kunci";
    return pakejSudahSah(p) ? "selesai" : "proses";
  }
  // KEMASKINI (2 pakej): status/maklumat/aksi ceramah dikira PER ENTRI (c = {kunci,label,data})
  // TAMBAHAN (Auto Approve): check INI DULU sebelum syarat tarikh — rekod
  // Auto Approve TIADA tarikh langsung, "auto" => ikon ungu (.ikon-auto).
  function kat_statusCeramah(c) {
    if (ceramahAutoApprove(c)) return "auto";
    if (!c.data || !c.data.tarikh) return "kunci";
    return c.data.status === "HADIR" ? "selesai" : "proses";
  }
  function kat_statusUK(p) {
    if (ukAutoApprove(p)) return "auto";
    if (!p.ujianKomputer || !p.ujianKomputer.tarikh) return "kunci";
    return ukSudahSah(p) ? "selesai" : "proses";
  }
  function kat_statusBayar(p) {
    if (!p.pembayaran || !p.pembayaran.status) return "kunci";
    return p.pembayaran.status === "SAH" ? "selesai" : "proses";
  }
  // KEMASKINI (2 pakej): per latihan (lp Moto ATAU Kereta)
  function kat_statusLatihan(lp) {
    const adaSesi = !!(lp && lp.senaraiSesi && lp.senaraiSesi.length > 0);
    const adaQti = !!(lp && lp.qti && lp.qti.tarikh);
    if (!adaSesi && !adaQti) return "kunci";
    return latihanLpBelumSelesai(lp) ? "proses" : "selesai";
  }

  // TAMBAHAN: maklumat ringkas setiap baris (TANPA badge — status skang
  // dipaparkan di lajur .aksi-kat sebelah, ikut mockup, bukan bercampur
  // dalam teks macam baris_htmlPakej/Ceramah/UK/Bayar yang asal — function
  // ASAL tu dikekalkan, cuma tak dipakai lagi oleh baris_htmlKad()).
  function kat_subPakej(p) {
    if (!p.pakejLesen || !p.pakejLesen.nama) return "—";
    return htmlSenaraiPakej(p); // KEMASKINI: 2 pakej => semua pakej + jumlah
  }
  function kat_subCeramah(c) {
    if (ceramahAutoApprove(c)) return "Diluluskan automatik (pernah buat sebelum ini)";
    if (!c.data || !c.data.tarikh) return "—";
    return `${c.data.tarikh}${c.data.masa ? " · " + c.data.masa : ""}`;
  }
  function kat_subUK(p) {
    if (ukAutoApprove(p)) return "Diluluskan automatik (pernah buat sebelum ini)";
    if (!p.ujianKomputer || !p.ujianKomputer.tarikh) return "—";
    return `${p.ujianKomputer.tarikh}${p.ujianKomputer.sesi ? " · " + p.ujianKomputer.sesi : ""}`;
  }
  function kat_subBayar(p) {
    if (!p.pembayaran) return "—";
    // KEMASKINI: pembayaran.jumlah = jumlah GABUNGAN semua pakej
    const nota = adaDuaPakej(p) ? ` <span style="color:var(--kelabu); font-size:11px;">(gabungan ${p.pakejLesen.senarai.length} pakej)</span>` : "";
    return `${p.pembayaran.jumlah || "—"}${nota}`;
  }

  // TAMBAHAN: lajur aksi — teks "Disahkan"/🔒 kunci bila tiada tindakan
  // diperlukan, ATAU butang Sahkan sebenar (guna SEMULA baris_htmlSelBtnXxx
  // sedia ada bulat-bulat, data-aksi/data-uid SAMA, so wireKadPelajarEvents
  // sedia ada terus berfungsi tanpa diubah). Syarat 🔒 di bawah SAMA EXACT
  // dgn lock-note yg baris_htmlCeramah()/baris_htmlUK() asal dah ada.
  function kat_aksiPakej(p) {
    if (pakejSudahSah(p)) return `<span class="teks-sah"><i class="fa-solid fa-check"></i> Disahkan</span>`;
    return baris_htmlSelBtnPakej(p);
  }
  function kat_aksiCeramah(p, c) {
    if (ceramahAutoApprove(c)) return `<span class="teks-auto"><i class="fa-solid fa-bolt"></i> ${c.data.status}</span>`;
    if (c.data && c.data.status === "HADIR") return `<span class="teks-sah"><i class="fa-solid fa-check"></i> Hadir</span>`;
    if (c.data && c.data.tarikh && !pakejSudahSah(p)) {
      return `<span class="teks-kunci">🔒 Tunggu Pakej</span>`;
    }
    return baris_htmlSelBtnCeramah(p, c.kunci);
  }
  function kat_aksiUK(p) {
    if (ukAutoApprove(p)) return `<span class="teks-auto"><i class="fa-solid fa-bolt"></i> ${p.ujianKomputer.status}</span>`;
    if (ukSudahSah(p)) return `<span class="teks-sah"><i class="fa-solid fa-check"></i> Disahkan</span>`;
    if (p.ujianKomputer && p.ujianKomputer.tarikh && !ceramahHadir(p)) {
      return `<span class="teks-kunci">🔒 Tunggu Ceramah</span>`;
    }
    return baris_htmlSelBtnUK(p);
  }
  function kat_aksiBayar(p) {
    if (p.pembayaran && p.pembayaran.status === "SAH") return `<span class="teks-sah"><i class="fa-solid fa-check"></i> Disahkan</span>`;
    return baris_htmlSelBtnBayar(p);
  }

  // KEMASKINI (2 PAKEJ): baris Ceramah dlm kad — pelajar 2 pakej dapat DUA baris
  // berlabel (Moto / Kereta), masing-masing dgn butang Sahkan Hadir sendiri.
  // Pelajar lama / 1 pakej = SATU baris "Ceramah" (macam asal).
  function htmlBarisCeramahKad(p) {
    const senarai = senaraiCeramahPelajar(p);
    const paparan = senarai.length ? senarai : [{ kunci: "ceramah", label: "", data: {} }];
    return paparan.map(c => {
      const label = c.label ? `Ceramah — ${c.label}` : "Ceramah";
      return `<div class="baris-kat">
              <div class="ikon-kat ikon-${kat_statusCeramah(c)}"><i class="fa-solid fa-chalkboard-user"></i></div>
              <div class="maklumat-kat"><div class="label-kat">${label}</div><div class="sub-kat">${kat_subCeramah(c)}</div></div>
              <div class="aksi-kat">${kat_aksiCeramah(p, c)}</div>
            </div>`;
    }).join("");
  }

  // KEMASKINI (mockup diluluskan): seksyen Latihan Praktikal — Moto & Kereta
  // berasingan, setiap satu SATU blok "tajuk+panel" lengkap (sendiri ada
  // ikon/label/kiraan hadir/chevron — lihat htmlBlokLatihanTajukPanel()),
  // jadi TAK dibungkus lagi dalam .baris-kat/.ikon-kat/.label-kat generik
  // (yg tu utk baris STATIK macam Pakej/UK/Bayaran — Latihan dah ada rupa
  // "tajuk" sendiri yg lagi sesuai + boleh klik). kat_statusLatihan() &
  // .baris-kat-latihan dikekalkan (tak dibuang) tapi dah tak dipanggil dari
  // sini — redundant drpd ikon-jenis dlm tajuk blok sendiri.
  function htmlBarisLatihanKad(p) {
    const senarai = senaraiLatihanPelajar(p);
    const paparan = senarai.length ? senarai : [{ kunci: KUNCI_LATIHAN_MOTO, label: "", lp: null }];
    return paparan.map(e => bina_htmlLatihanSeksyen(p, e) || "").join("");
  }

  // ======================================================================
  // TAMBAHAN: REKOD LESEN LAMA (students/{uid}/rekod_lesen_tamat) — arkib
  // yang app Android cipta bila pelajar "Daftar Tambah Kelas Lesen" (lihat
  // nota lect). Dimuat LAZY (sekali je per uid, hasil disimpan dlm
  // petaRekodLamaPelajar) bila kad pelajar dibuka — bukan terus semua 54+
  // pelajar sekaligus — sebab cuma pelajar adaRekodLama==true je perlu.
  // ======================================================================
  async function muatRekodLamaPelajar(uid) {
    if (petaRekodLamaPelajar.has(uid)) return; // dah dimuat (atau tengah dimuat)
    petaRekodLamaPelajar.set(uid, []); // tanda dulu — elak double-fetch klik laju2
    try {
      const snap = await getDocs(collection(db, "students", uid, "rekod_lesen_tamat"));
      const senarai = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // susun terbaru dulu (tiada orderBy query — elak keperluan index baru)
      senarai.sort((a, b) => {
        const ta = (a.tarikhTamat && a.tarikhTamat.toMillis) ? a.tarikhTamat.toMillis() : 0;
        const tb = (b.tarikhTamat && b.tarikhTamat.toMillis) ? b.tarikhTamat.toMillis() : 0;
        return tb - ta;
      });
      petaRekodLamaPelajar.set(uid, senarai);
      render();
    } catch (err) {
      console.error(`Gagal muat rekod lesen lama (uid=${uid}):`, err);
    }
  }

  // teks ganti bila medan kosong/null — "Dikecualikan" kalau rekod ni sendiri
  // hasil tambah kelas (ceramah/UK dikecualikan ikut peraturan), kalau tak "-"
  function rl_teksKosong(rec) { return rec.adalahTambahKelas ? "Dikecualikan" : "-"; }

  // badge kecil HADIR/SAH (hijau) atau status lain (kuning) — guna style baru
  // .rl-badge supaya tak clash dgn .badge sedia ada (kad ni bukan interaktif)
  function rl_badge(status) {
    if (status === "HADIR" || status === "SAH") return `<span class="rl-badge hadir">${status}</span>`;
    if (status) return `<span class="rl-badge pending">${status}</span>`;
    return "";
  }

  function rl_htmlCeramah(rec) {
    const senarai = Array.isArray(rec.senaraiCeramah) ? rec.senaraiCeramah : [];
    if (senarai.length === 0) {
      return `<div class="rl-baris"><span class="label">Ceramah</span><span class="nilai dikecualikan">${rl_teksKosong(rec)}</span></div>`;
    }
    return senarai.map(c => {
      const labelC = `Ceramah${c && c.label ? " — " + c.label : ""}`;
      if (!c || !c.tarikh) return `<div class="rl-baris"><span class="label">${labelC}</span><span class="nilai dikecualikan">${rl_teksKosong(rec)}</span></div>`;
      return `<div class="rl-baris"><span class="label">${labelC}</span><span class="nilai">${c.tarikh}${c.masa ? " — " + c.masa : ""} ${rl_badge(c.status)}</span></div>`;
    }).join("");
  }

  function rl_htmlUK(rec) {
    const uk = rec.ujianKomputer;
    if (!uk || !uk.tarikh) {
      return `<div class="rl-baris"><span class="label">Ujian Komputer</span><span class="nilai dikecualikan">${rl_teksKosong(rec)}</span></div>`;
    }
    return `<div class="rl-baris"><span class="label">Ujian Komputer</span><span class="nilai">${uk.tarikh}${uk.sesi ? " — " + uk.sesi : ""} ${rl_badge(uk.status)}</span></div>`;
  }

  // KEMASKINI (Design A diluluskan): dropdown "Lihat Sesi" (collapsed by
  // default) — padat, konsisten dgn gaya "Lihat Sesi" data semasa. `key`
  // = "uid|recordId|kunci" (dikongsi dgn rlLatihanTerbukaSet & listener
  // data-rl-lat-toggle dalam wireKadPelajarEvents()).
  function rl_htmlLatihan(rec, kunci, labelJenis, key, ikonFa) {
    const lp = rec[kunci];
    if (!lp) {
      return `<div class="rl-baris"><span class="label">Latihan ${labelJenis}</span><span class="nilai dikecualikan">${rl_teksKosong(rec)}</span></div>`;
    }
    const senaraiSesi = Array.isArray(lp.senaraiSesi) ? lp.senaraiSesi : [];
    const jumlahHadir = senaraiSesi.filter(s => s && s.status === "HADIR").length;
    const adaQti = !!(lp.qti && lp.qti.tarikh);
    const terbuka = rlLatihanTerbukaSet.has(key);

    const htmlSesi = senaraiSesi.map((s, i) => {
      const adaJadual = !!(s && s.tarikh);
      const labelTarikh = adaJadual ? `${s.tarikh}${s.sesi ? " — " + s.sesi : ""}` : rl_teksKosong(rec);
      return `<div class="lat-a-sesi"><span>Sesi ${i + 1} — ${labelTarikh}</span>${adaJadual ? rl_badge(s.status) : ""}</div>`;
    }).join("");
    const htmlQti = lp.qti
      ? `<div class="lat-a-sesi"><span>QTI — ${adaQti ? `${lp.qti.tarikh}${lp.qti.masa ? " — " + lp.qti.masa : ""}` : rl_teksKosong(rec)}</span>${adaQti ? rl_badge(lp.qti.status) : ""}</div>`
      : "";

    return `
      <div class="lat-a-demo${terbuka ? " terbuka" : ""}">
        <div class="lat-a-tajuk" data-rl-lat-toggle="${key}">
          <div class="lat-a-kiri"><i class="fa-solid ${ikonFa} ikon-jenis"></i> Latihan ${labelJenis}</div>
          <div class="lat-a-kanan">${jumlahHadir}/${senaraiSesi.length} sesi${adaQti ? " + QTI" : ""} <i class="fa-solid fa-chevron-down lat-a-chevron"></i></div>
        </div>
        <div class="lat-a-panel">${htmlSesi}${htmlQti}</div>
      </div>
    `;
  }

  function rl_htmlBayaran(rec) {
    const b = rec.pembayaran;
    if (!b || !b.status) {
      return `<div class="rl-baris"><span class="label">Bayaran</span><span class="nilai dikecualikan">${rl_teksKosong(rec)}</span></div>`;
    }
    return `<div class="rl-baris"><span class="label">Bayaran</span><span class="nilai">${b.jumlah || "-"} ${rl_badge(b.status)}</span></div>`;
  }

  // SATU kad "Rekod Lesen Lama #N" — read-only, tiada butang sahkan/reset/edit
  //
  // FIX (dilaporkan admin — bahagian Latihan "hilang"): sebelum ni adaMoto/
  // adaKereta cuma percaya SATU sumber (jenisLesen ATAU field latihan),
  // ikut mana ada dulu — kalau jenisLesen tu ARRAY (cth [] kosong, data tak
  // lengkap/testing manual), field latihanPraktikalMoto/Kereta TERUS
  // diabaikan terus walaupun datanya sendiri ada. Skang guna OR kedua-dua
  // sumber — Latihan dipapar selagi SATU2 petunjuk tu ada data.
  function bina_htmlRekodLesenLama(rec, nombor, uid) {
    const tarikhTamat = (rec.tarikhTamat && rec.tarikhTamat.toDate)
      ? rec.tarikhTamat.toDate().toLocaleDateString("ms-MY", { day: "2-digit", month: "long", year: "numeric" })
      : "-";
    const jenisTeks = Array.isArray(rec.jenisLesen) ? rec.jenisLesen.map(teksJenis).filter(Boolean).join(", ") : "";
    const adaMoto = (Array.isArray(rec.jenisLesen) && rec.jenisLesen.includes("MOTO")) || !!rec.latihanPraktikalMoto;
    const adaKereta = (Array.isArray(rec.jenisLesen) && rec.jenisLesen.includes("KERETA")) || !!rec.latihanPraktikalKereta;
    let htmlLatihan = "";
    if (adaMoto) htmlLatihan += rl_htmlLatihan(rec, "latihanPraktikalMoto", "Moto", `${uid}|${rec.id}|latihanPraktikalMoto`, "fa-motorcycle");
    if (adaKereta) htmlLatihan += rl_htmlLatihan(rec, "latihanPraktikalKereta", "Kereta", `${uid}|${rec.id}|latihanPraktikalKereta`, "fa-car");

    return `
      <div class="kad-rekod-lama">
        <div class="rekod-lama-tajuk">
          <div class="kiri"><i class="fa-solid fa-box-archive"></i> Rekod Lesen Lama #${nombor}</div>
          <div class="tarikh-tamat">Tamat: ${tarikhTamat}</div>
        </div>
        <span class="rekod-lama-readonly-tag"><i class="fa-solid fa-lock"></i> Baca sahaja</span>
        <div class="rekod-lama-sub"><b>${rec.pakejLesen || "-"}</b>${jenisTeks ? " — " + jenisTeks : ""}</div>
        ${rl_htmlCeramah(rec)}
        ${rl_htmlUK(rec)}
        ${htmlLatihan}
        ${rl_htmlBayaran(rec)}
      </div>
    `;
  }

  // SEMUA kad rekod lama seorang pelajar (atau "" kalau belum dimuat/tiada)
  function htmlSenaraiRekodLama(uid) {
    const senarai = petaRekodLamaPelajar.get(uid);
    if (!Array.isArray(senarai) || senarai.length === 0) return "";
    return senarai.map((rec, i) => bina_htmlRekodLesenLama(rec, senarai.length - i, uid)).join("");
  }

  // KEMASKINI: parameter `tagHtml` opsyenal (default "") — diteruskan terus
  // ke baris_htmlKepalaKad(p, tagHtml). Tab "Senarai Pelajar" (render() biasa)
  // TAK berubah langsung (dipanggil tanpa argumen kedua = sama macam asal).
  // Tab "Selesai" (renderSenaraiSelesai()) je yang hantar ikon sumber
  // pendaftaran (App/Kaunter) — lihat barisPelajar() & renderSenaraiSelesai().
  function baris_htmlKad(p, tagHtml = "") {
    // TAMBAHAN: kad ni kini collapse-by-default / expand-on-klik — lihat
    // kadTerbukaSet & CSS .kad-pelajar/.kad-pelajar-toggle/.kad-detail.
    // Header (baris_htmlKepalaKad(p): avatar+nama+id+Maklumat+Cetak, SAMA
    // fungsi TAK diubah, cuma +butang Cetak sekali) + chevron baharu kekal
    // sentiasa nampak. KEMASKINI (mockup Kad A disemak semula): 5 kategori
    // dulu .kotak-grid (grid melintang) — skang .senarai-kategori (SUSUN KE
    // BAWAH), urutan Pakej → Ceramah → Ujian Komputer → Bayaran → Latihan
    // (Latihan dipindah ke HUJUNG, asalnya selepas Ujian Komputer).
    const terbuka = kadTerbukaSet.has(p.uid);
    return `
      <div class="kad-pelajar${terbuka ? " terbuka" : ""}" data-uid="${p.uid}">
        <div class="kad-pelajar-atas kad-pelajar-toggle">
          ${baris_htmlKepalaKad(p, tagHtml)}
          <div class="kad-chevron"><i class="fa-solid fa-chevron-down"></i></div>
        </div>

        <div class="kad-detail">
          ${(!p.pakejLesen || !p.pakejLesen.nama) && p.adaRekodLama ? `<div class="state-kosong-baharu"><i class="fa-solid fa-circle-info"></i> Lesen baharu belum didaftar — pelajar sedang proses tambah kelas, bukan ralat.</div>` : ""}
          <div class="senarai-kategori">
            <div class="baris-kat">
              <div class="ikon-kat ikon-${kat_statusPakej(p)}"><i class="fa-solid fa-id-card"></i></div>
              <div class="maklumat-kat"><div class="label-kat">Pakej</div><div class="sub-kat">${kat_subPakej(p)}</div></div>
              <div class="aksi-kat">${kat_aksiPakej(p)}</div>
            </div>
            ${htmlBarisCeramahKad(p)}
            <div class="baris-kat">
              <div class="ikon-kat ikon-${kat_statusUK(p)}"><i class="fa-solid fa-computer"></i></div>
              <div class="maklumat-kat"><div class="label-kat">Ujian Komputer</div><div class="sub-kat">${kat_subUK(p)}</div></div>
              <div class="aksi-kat">${kat_aksiUK(p)}</div>
            </div>
            <div class="baris-kat">
              <div class="ikon-kat ikon-${kat_statusBayar(p)}"><i class="fa-solid fa-money-bill-wave"></i></div>
              <div class="maklumat-kat"><div class="label-kat">Bayaran</div><div class="sub-kat">${kat_subBayar(p)}</div></div>
              <div class="aksi-kat">${kat_aksiBayar(p)}</div>
            </div>
            <!-- TAMBAHAN: Latihan Praktikal — state-machine (multi-sesi + QTI,
                 "Lihat Sesi" dropdown/popup) TAK disentuh langsung; output
                 baris_htmlLatihan(p) sedia ada cuma "dipindah" bulat-bulat
                 masuk baris ni (bukan dipecah label/maklumat/aksi macam
                 kategori lain, sebab function tu sendiri dah bina UI penuh
                 dia — toggle + popup sesi — sebagai SATU blok). Diletak
                 PALING BAWAH ikut susunan baru yg diminta. -->
            ${htmlBarisLatihanKad(p)}
          </div>

          <div class="bawah-aksi">${baris_htmlAksiBawah(p)}</div>
          ${p.adaRekodLama ? htmlSenaraiRekodLama(p.uid) : ""}
        </div>
      </div>
    `;
  }

  // fungsi sebenar yg digunakan render()
  // KEMASKINI: `tagHtml` opsyenal diteruskan ke baris_htmlKad() — render()
  // biasa (tab Senarai Pelajar) panggil TANPA argumen kedua (tak berubah).
  function barisPelajar(p, tagHtml = "") { return baris_htmlKad(p, tagHtml); }

  // TAMBAHAN: ikon kecil hujung nama — penanda sumber pendaftaran (App vs
  // Kaunter), dipakai KHUSUS tab "Selesai" (renderSenaraiSelesai()) ikut
  // permintaan admin: "yg daftar dekat app and selesai...logo phone and yg
  // daftar kaunter and selesai buat logo kaunter". Guna SEMULA flag
  // p.daftarKaunter sedia ada (SAMA flag yg dipakai renderSenaraiKaunter()).
  function tagSumberPendaftaran(p) {
    return p.daftarKaunter === true
      ? '<span class="tag-sumber tag-sumber-kaunter" title="Didaftarkan oleh Admin (Kaunter)"><i class="fa-solid fa-cash-register"></i></span>'
      : '<span class="tag-sumber tag-sumber-app" title="Daftar Sendiri (App)"><i class="fa-solid fa-mobile-screen"></i></span>';
  }

  // ======================================================================
  // TAMBAHAN: SLIP CETAK — laporan status SEORANG pelajar (letterhead),
  // dipicu oleh butang ikon printer dalam header kad pelajar
  // (data-aksi="cetak-laporan", wiring dalam render() di atas).
  // ======================================================================
  //
  // Guna balik SEMUA data/klasifikasi sedia ada (statusKeseluruhanPelajar,
  // baris_badge, field pakejLesen/ceramah/ujianKomputer/latihanPraktikalMoto/
  // pembayaran) — TIADA field/logik baru direka. formatTarikhMasaCetak() guna
  // balik NAMA_BULAN_MS (const sedia ada, dipakai jugak oleh Kalendar) supaya
  // nama bulan konsisten dgn bahagian lain app, cuma tambah jam:minit AM/PM.
  function formatTarikhMasaCetak(d) {
    const tarikh = `${d.getDate()} ${NAMA_BULAN_MS[d.getMonth()]} ${d.getFullYear()}`;
    const jam24 = d.getHours();
    const minit = String(d.getMinutes()).padStart(2, "0");
    const zon = jam24 >= 12 ? "PM" : "AM";
    let jam12 = jam24 % 12;
    if (jam12 === 0) jam12 = 12;
    return `${tarikh}, ${jam12}:${minit} ${zon}`;
  }

  // Bina HTML kandungan slip (letterhead + info bar + tiap seksyen kategori +
  // tandatangan + footer) untuk SATU objek pelajar `p`. Dipanggil oleh
  // cetakLaporanPelajar() untuk isi #slipCetakPelajar sebelum window.print().
  function bina_htmlSlipCetak(p) {
    const tarikhJana = formatTarikhMasaCetak(new Date());
    const status = statusKeseluruhanPelajar(p);
    const inisial = (p.nama || "").trim().charAt(0).toUpperCase() || "?";

    const namaPakej = (p.pakejLesen && p.pakejLesen.nama) ? p.pakejLesen.nama : "Belum pilih pakej";
    const hargaPakej = (p.pakejLesen && p.pakejLesen.harga) ? p.pakejLesen.harga : "";

    // KEMASKINI (2 pakej): satu seksyen Ceramah PER ENTRI (Moto/Kereta), pelajar lama = satu
    const entriCeramahSlip = senaraiCeramahPelajar(p);
    const paparCeramahSlip = entriCeramahSlip.length ? entriCeramahSlip : [{ kunci: "ceramah", label: "", data: {} }];
    const htmlSeksyenCeramah = paparCeramahSlip.map(c => {
      const info = (c.data && c.data.tarikh)
        ? `${c.data.tarikh}${c.data.masa ? " — " + c.data.masa : ""}`
        : "Belum ada jadual";
      return `
        <div class="slip-seksyen">
          <h3>Ceramah${c.label ? " — " + c.label : ""}</h3>
          <div class="slip-baris"><span class="label">Tarikh Dijadualkan</span><span>${info}</span></div>
          <div class="slip-baris"><span class="label">Status</span><span>${baris_badge(c.data ? c.data.status : null, "HADIR", "Belum Hadir")}</span></div>
        </div>`;
    }).join("");
    // baris pakej individu (2 pakej sahaja)
    const htmlSenaraiPakejSlip = adaDuaPakej(p)
      ? p.pakejLesen.senarai.map((x, i) => `<div class="slip-baris"><span class="label">Pakej ${i + 1}${teksJenis(x.jenis) ? " (" + teksJenis(x.jenis) + ")" : ""}</span><span>${x.nama}${x.harga ? " — " + x.harga : ""}</span></div>`).join("")
      : "";

    const infoUK = (p.ujianKomputer && p.ujianKomputer.tarikh)
      ? `${p.ujianKomputer.tarikh}${p.ujianKomputer.sesi ? " — " + p.ujianKomputer.sesi : ""}`
      : "Belum ada jadual";
    const badgeUK = baris_badge(p.ujianKomputer ? p.ujianKomputer.status : null, "SAH", "Belum Disahkan");

    // KEMASKINI (2 pakej): satu seksyen Latihan Praktikal PER latihan (Moto / Kereta)
    const bina_seksyenLatihanSlip = (e) => {
      const lp = e.lp;
      const senaraiSesi = (lp && lp.senaraiSesi) ? lp.senaraiSesi : [];
      const jumlahSesi = senaraiSesi.length;
      const jumlahHadirSesi = senaraiSesi.filter(s => s && s.status === "HADIR").length;

      let htmlSenaraiSesi;
      if (jumlahSesi > 0) {
        htmlSenaraiSesi = senaraiSesi.map((s, i) => {
          const adaJadual = !!(s && s.tarikh);
          const labelTarikh = adaJadual ? `${s.tarikh}${s && s.sesi ? " — " + s.sesi : ""}` : "Belum Dijadualkan";
          const badgeSesi = baris_badge(adaJadual ? s.status : null, "HADIR", "Belum Hadir");
          return `<div class="slip-baris"><span class="label">Sesi ${i + 1}</span><span>${labelTarikh} ${badgeSesi}</span></div>`;
        }).join("");
      } else {
        htmlSenaraiSesi = `<div class="slip-baris"><span class="label">Sesi</span><span>Tiada Jadual</span></div>`;
      }

      const adaQti = !!(lp && lp.qti && lp.qti.tarikh);
      const htmlQti = `<div class="slip-baris"><span class="label">Status QTI</span><span>${adaQti ? lp.qti.tarikh : "Tiada Jadual"} ${baris_badge(adaQti ? lp.qti.status : null, "HADIR", "Belum Hadir")}</span></div>`;

      return `
        <div class="slip-seksyen">
          <h3>Latihan Praktikal${(perluLabelJenis(p) && e.label) ? " " + e.label : ""} (${jumlahHadirSesi}/${jumlahSesi} Sesi Hadir)</h3>
          ${htmlSenaraiSesi}
          ${htmlQti}
        </div>`;
    };
    const entriLatihanSlip = senaraiLatihanPelajar(p);
    const htmlSeksyenLatihan = (entriLatihanSlip.length ? entriLatihanSlip : [{ kunci: KUNCI_LATIHAN_MOTO, label: "", lp: null }])
      .map(bina_seksyenLatihanSlip).join("");

    const jumlahBayar = (p.pembayaran && p.pembayaran.jumlah) ? p.pembayaran.jumlah : "-";
    const badgeBayar = baris_badge(p.pembayaran ? p.pembayaran.status : null);

    return `
      <div class="slip-cetak-kandungan">
        <div class="slip-letterhead">
          <div class="slip-logo"><i class="fa-solid fa-graduation-cap"></i></div>
          <div>
            <h1>Institut Memandu Sanubari Ceria</h1>
            <p>Laporan Status Pelajar</p>
          </div>
          <div class="slip-tarikh-jana">Dijana pada:<br>${tarikhJana}</div>
        </div>

        <div class="slip-info-bar">
          <div class="slip-info-avatar">${inisial}</div>
          <div>
            <div class="slip-info-nama">${p.nama || "(tiada nama)"}</div>
            <div class="slip-info-sub">${p.noKP || p.uid} • ${namaPakej}${hargaPakej ? " — " + hargaPakej : ""}</div>
          </div>
          <div class="slip-info-kanan"><span class="badge ${status.kelas}">${status.label}</span></div>
        </div>

        <div class="slip-seksyen">
          <h3>Pakej</h3>
          <div class="slip-baris"><span class="label">Nama Pakej</span><span>${namaPakej}</span></div>
          ${htmlSenaraiPakejSlip}
          <div class="slip-baris"><span class="label">${adaDuaPakej(p) ? "Jumlah Harga" : "Harga"}</span><span>${hargaPakej || "-"}</span></div>
          <div class="slip-baris"><span class="label">Status</span><span>${baris_badge(p.pakejLesen ? p.pakejLesen.status : null, "SAH", "Belum Disahkan")}</span></div>
        </div>

        ${htmlSeksyenCeramah}

        <div class="slip-seksyen">
          <h3>Ujian Komputer</h3>
          <div class="slip-baris"><span class="label">Tarikh &amp; Sesi</span><span>${infoUK}</span></div>
          <div class="slip-baris"><span class="label">Status</span><span>${badgeUK}</span></div>
        </div>

        ${htmlSeksyenLatihan}

        <div class="slip-seksyen">
          <h3>Pembayaran</h3>
          <div class="slip-baris"><span class="label">${adaDuaPakej(p) ? "Jumlah (Gabungan)" : "Jumlah"}</span><span>${jumlahBayar}</span></div>
          <div class="slip-baris"><span class="label">Status</span><span>${badgeBayar}</span></div>
        </div>

        <div class="slip-tandatangan">
          <div class="slip-tandatangan-kotak">Tandatangan Pelajar</div>
          <div class="slip-tandatangan-kotak">Tandatangan &amp; Cop Admin</div>
        </div>

        <div class="slip-footer">Dokumen ini dijana secara automatik oleh Sistem Pengurusan Pelajar IMSC.</div>
      </div>
    `;
  }

  // Cari pelajar (uid) dari senaraiPelajar semasa, isi #slipCetakPelajar,
  // tampal marker class pada <body> supaya @media print (CSS) sembunyikan
  // seluruh app selain slip tu, panggil window.print(), lepas tu bersihkan
  // balik (onafterprint sebagai hook utama, setTimeout ~1000ms sebagai
  // fallback kalau browser tak fire onafterprint).
  function cetakLaporanPelajar(uid) {
    const p = senaraiPelajar.find(x => x.uid === uid);
    if (!p || !slipCetakPelajarEl) return;

    slipCetakPelajarEl.innerHTML = bina_htmlSlipCetak(p);
    document.body.classList.add("mod-cetak-slip");

    const bersihkanSlipCetak = () => {
      document.body.classList.remove("mod-cetak-slip");
      slipCetakPelajarEl.innerHTML = "";
    };

    window.onafterprint = () => {
      bersihkanSlipCetak();
      window.onafterprint = null;
    };

    window.print();

    setTimeout(() => {
      if (document.body.classList.contains("mod-cetak-slip")) {
        bersihkanSlipCetak();
        window.onafterprint = null;
      }
    }, 1000);
  }

  // ======================================================================
  // TAMBAHAN: tab "Daftar Memandu" — admin daftar pelajar terus dari kaunter
  // (pelajar tak reti/tak sempat guna app sendiri). Cipta akaun Firebase Auth
  // (emel+password) MENGGUNAKAN INSTANCE APP KEDUA supaya sesi admin yang
  // sedang log masuk (auth/app di atas) TAK terjejas/tertukar — teknik biasa
  // untuk admin cipta akaun pengguna lain tanpa log keluar diri sendiri.
  // Lepas akaun dicipta, terus setDoc() dokumen students/{uid} baru guna
  // struktur field YANG SAMA (nama/noKP/noTel/alamat/pakejLesen) macam yang
  // sedia ada dibaca oleh statusKeseluruhanPelajar()/baris_htmlKad()/dll —
  // TIADA field/logik render baru direka, pakejLesen sengaja TIADA "status"
  // (sama macam pelajar daftar sendiri dalam app) supaya terus melalui
  // alur "Sahkan Pakej" sedia ada macam biasa.
  // ======================================================================

  let drmDataLepasDaftar = null; // simpan data lepas daftar berjaya, untuk cetakSlipPendaftaran()

  function janaPasswordDaftar() {
    const bahagian = ["Imsc", "Sanu", "Ceri", "Laju", "Maju"];
    const kata = bahagian[Math.floor(Math.random() * bahagian.length)] + Math.floor(1000 + Math.random() * 9000);
    drmPassword.value = kata;
  }

  async function salinPasswordDaftar() {
    if (!drmPassword.value) return;
    try {
      await navigator.clipboard.writeText(drmPassword.value);
    } catch (eSalin) {
      drmPassword.select();
    }
  }

  function tunjukRalatDaftar(mesej) {
    drmRalat.textContent = mesej;
    drmRalat.classList.add("tunjuk");
  }

  function sembunyikanRalatDaftar() {
    drmRalat.textContent = "";
    drmRalat.classList.remove("tunjuk");
  }

  function resetBorangDaftar() {
    drmNama.value = "";
    drmNoKP.value = "";
    drmNoTel.value = "";
    drmAlamat.value = "";
    if (drmPakejMoto) drmPakejMoto.value = ""; // KEMASKINI (2 pakej): drmPakej -> drmPakejMoto/drmPakejKereta
    if (drmPakejKereta) drmPakejKereta.value = "";
    drmKemaskiniNotaDuaPakej();
    drmEmel.value = "";
    drmPassword.value = "";
    sembunyikanRalatDaftar();
    drmBtnDaftar.disabled = false;
    drmBtnDaftar.innerHTML = `<i class="fa-solid fa-user-plus"></i> Daftarkan Pelajar &amp; Cipta Akaun`;

    // TAMBAHAN: kosongkan pilihan kalendar Ceramah/UK + kembali ke bulan
    // semasa + tarik semula baki tempat terkini (mungkin dah berubah sejak
    // borang dibuka kali terakhir).
    drmCeramahTarikhPilih = null;
    // KEMASKINI (2 pakej): reset terus di sini jugak (jangan harap semata2
    // side-effect drmKemaskiniNotaDuaPakej() di atas — defensif, elak data
    // basi kalau mod dua-pakej "sebelum ni" tak berubah).
    drmCeramahTarikhPilihMoto = null;
    drmCeramahTarikhPilihKereta = null;
    if (drmCeramahJenisWrap) drmCeramahJenisWrap.style.display = "none";
    drmModeDuaPakejSebelumIni = false;
    drmCeramahBulanTahun = new Date();
    drmUkTarikhPilih = null;
    drmUkSesiPilih = null;
    drmUkTarikhSementara = null;
    drmUkBulanTahun = new Date();
    drmUkSesiWrap.style.display = "none";
    drmKemaskiniTeksPilihan();
    drmRenderCeramahGrid();
    drmRenderUkGrid();
  }

  async function daftarPelajarKaunter() {
    sembunyikanRalatDaftar();

    const nama = drmNama.value.trim();
    const noKP = drmNoKP.value.trim();
    const noTel = drmNoTel.value.trim();
    const alamat = drmAlamat.value.trim();
    // KEMASKINI (Request 2 — 2 pakej): baca DUA dropdown (Moto/Kereta),
    // bina senaraiPilihan [{key,nama,harga,jenis}] utk mana2 yg dipilih.
    const pakejMotoVal = drmPakejMoto ? drmPakejMoto.value : "";
    const pakejKeretaVal = drmPakejKereta ? drmPakejKereta.value : "";
    const senaraiPilihanPakej = [];
    if (pakejMotoVal) {
      const [key, nama, harga] = pakejMotoVal.split("|");
      senaraiPilihanPakej.push({ key, nama, harga, jenis: "MOTO" });
    }
    if (pakejKeretaVal) {
      const [key, nama, harga] = pakejKeretaVal.split("|");
      senaraiPilihanPakej.push({ key, nama, harga, jenis: "KERETA" });
    }
    const emel = drmEmel.value.trim();
    const password = drmPassword.value;

    if (!nama || !noKP || !noTel || !emel || !password) {
      tunjukRalatDaftar("Sila isi semua medan wajib (Nama, No. KP, No. Telefon, Emel, Kata Laluan).");
      return;
    }
    if (password.length < 6) {
      tunjukRalatDaftar("Kata laluan mesti sekurang-kurangnya 6 aksara.");
      return;
    }
    if (senaraiPelajar.some(p => (p.noKP || "") === noKP)) {
      tunjukRalatDaftar("No. KP ni dah wujud dalam senarai pelajar.");
      return;
    }

    drmBtnDaftar.disabled = true;
    drmBtnDaftar.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mendaftar...`;

    // Instance Firebase App KEDUA (nama unik ikut masa) — elak signOut/tukar
    // sesi admin yang sedang log masuk pada `auth` (instance utama) di atas.
    const namaAppKedua = "DaftarKaunter_" + Date.now();
    const appKedua = initializeApp(firebaseConfig, namaAppKedua);
    const authKedua = getAuth(appKedua);

    // TAMBAHAN: deklarasi kat SINI (bukan dalam try{}) supaya boleh dicapai
    // dari catch{} juga — perlu utk rollback (deleteUser) kalau dokumen
    // pelajar gagal disimpan lepas akaun Auth berjaya dicipta.
    let credBaru = null;

    try {
      const cred = await createUserWithEmailAndPassword(authKedua, emel, password);
      credBaru = cred;
      const uid = cred.user.uid;

      const dataBaru = {
        uid,
        nama,
        noKP,
        noTel,
        alamat: alamat || "",
        emel, // TAMBAHAN: simpan emel log masuk sekali dlm dokumen pelajar (utk modal "Maklumat Lengkap" — sblm ni emel cuma dipakai cipta akaun Auth, tak disimpan Firestore)
        daftarKaunter: true, // TAMBAHAN: tanda pelajar ni didaftar admin kat kaunter (bukan self-register app)
        tarikhDaftar: serverTimestamp() // TAMBAHAN: cap masa pendaftaran — dipakai susun senarai "Terbaru Daftar"
      };
      // KEMASKINI (Request 2 — 2 pakej): 0 pilihan => pakejLesen TAK ditetapkan
      // (SAMA "boleh tinggal kosong" asal). 1 pilihan => format LAMA (SAMA
      // persis dgn sebelum ni, {nama,harga} tunggal — tiada perubahan utk
      // pelajar kaunter 1-pakej). 2 pilihan => format BARU {nama,harga,senarai}
      // (SAMA struktur dgn adaDuaPakej() baca — nama gabung " + ", harga
      // gabung dikira dlm SEN via hargaKeSen()/senKeHarga() elak ralat float).
      const duaPakej = senaraiPilihanPakej.length === 2;
      if (senaraiPilihanPakej.length === 1) {
        const satu = senaraiPilihanPakej[0];
        dataBaru.pakejLesen = { nama: satu.nama, harga: satu.harga };
      } else if (duaPakej) {
        const jumlahSen = senaraiPilihanPakej.reduce((jum, pk) => jum + hargaKeSen(pk.harga), 0);
        dataBaru.pakejLesen = {
          nama: senaraiPilihanPakej.map(pk => pk.nama).join(" + "),
          harga: senKeHarga(jumlahSen),
          senarai: senaraiPilihanPakej
        };
      }
      // TAMBAHAN: kalendar Ceramah/UK terus dalam borang ni (boleh tinggal
      // kosong — pelajar boleh set/tukar kemudian dari seksyen "Pelajar
      // Didaftar Kaunter" di bawah).
      //
      // KEMASKINI (2 pakej): pelajar 2 PAKEJ perlu Ceramah DIPECAH
      // (ceramahMoto/ceramahKereta) — drmBukaPilihJenisCeramah() dlm
      // kalendar di atas dah bolehkan admin pilih KEDUA-DUA tarikh terus
      // dlm borang ni (klik tarikh -> pilih Moto/Kereta, ulang utk jenis
      // lain). Ujian Komputer KEKAL TUNGGAL tak kira berapa pakej.
      if (duaPakej) {
        if (drmCeramahTarikhPilihMoto) dataBaru.ceramahMoto = { tarikh: drmCeramahTarikhPilihMoto };
        if (drmCeramahTarikhPilihKereta) dataBaru.ceramahKereta = { tarikh: drmCeramahTarikhPilihKereta };
      } else if (drmCeramahTarikhPilih) {
        dataBaru.ceramah = { tarikh: drmCeramahTarikhPilih };
      }
      if (drmUkTarikhPilih && drmUkSesiPilih) dataBaru.ujianKomputer = { tarikh: drmUkTarikhPilih, sesi: drmUkSesiPilih };

      // TAMBAHAN: pembayaran kaunter dibayar TUNAI terus kat kaunter (bukan
      // upload slip macam pelajar app) — kalau ada pakej dipilih (ada
      // jumlah utk dibayar), sediakan dataBaru.pembayaran berstatus PENDING
      // drpd awal, supaya baris "Bayaran" terus actionable (admin boleh
      // "Sahkan Pembayaran" terus di panel lepas daftar, ATAU kemudian dari
      // tab "Pelajar Didaftar Kaunter" — SAMA butang/fungsi sahkanPembayaran()).
      if (dataBaru.pakejLesen) {
        dataBaru.pembayaran = { jumlah: dataBaru.pakejLesen.harga, status: "PENDING" };
      }

      const studentRef = doc(db, "students", uid);

      // KEMASKINI (2 pakej): kumpul SEMUA tarikh Ceramah yg perlu dibook
      // ikut TARIKH UNIK — boleh 0 (tiada dipilih), 1 (mod tunggal, ATAU mod
      // dua tapi admin cuma pilih 1 drpd 2 jenis), atau 2 (mod dua, kedua2
      // jenis dipilih — MUNGKIN jatuh pd tarikh SAMA, count kena ditambah 2
      // pada doc slot yg SAMA tu, sebab tu dikumpul ikut tarikh dulu sblm
      // baca/tulis, bukan 2 get+write berasingan atas snapshot "before" yg sama).
      const kiraanCeramahPerTarikh = {};
      if (dataBaru.ceramah) kiraanCeramahPerTarikh[dataBaru.ceramah.tarikh] = (kiraanCeramahPerTarikh[dataBaru.ceramah.tarikh] || 0) + 1;
      if (dataBaru.ceramahMoto) kiraanCeramahPerTarikh[dataBaru.ceramahMoto.tarikh] = (kiraanCeramahPerTarikh[dataBaru.ceramahMoto.tarikh] || 0) + 1;
      if (dataBaru.ceramahKereta) kiraanCeramahPerTarikh[dataBaru.ceramahKereta.tarikh] = (kiraanCeramahPerTarikh[dataBaru.ceramahKereta.tarikh] || 0) + 1;
      const tarikhCeramahUnik = Object.keys(kiraanCeramahPerTarikh);

      if (tarikhCeramahUnik.length > 0 || dataBaru.ujianKomputer) {
        // TAMBAHAN: book slot (dgn had kapasiti DIKUATKUASAKAN betul-betul,
        // bukan cuma tambah count buta) + cipta dokumen pelajar SEKALI dalam
        // SATU transaction — kalau tarikh/sesi tu dah penuh (mungkin org
        // lain baru je ambil tempat terakhir), transaction batal terus,
        // dokumen pelajar TAK dicipta langsung (bukan separuh jalan).
        //
        // Peraturan transaction Firestore: SEMUA get() kena jalan dulu
        // sebelum apa-apa update()/set() — sebab tu baca+semak slot (kalau
        // ada) siap dulu, baru lepas tu tulis semua sekali.
        await runTransaction(db, async (transaction) => {
          const infoCeramahIkutTarikh = {};
          for (const tarikh of tarikhCeramahUnik) {
            const ref = slotRefCeramah(tarikh);
            const snap = await transaction.get(ref);
            const wujud = snap.exists();
            const kiraanSedia = wujud ? (snap.data().count || 0) : 0;
            const tambah = kiraanCeramahPerTarikh[tarikh];
            if (kiraanSedia + tambah > HAD_CERAMAH_SEHARI) {
              throw new Error(`Tarikh Ceramah ${tarikh} tak cukup tempat (baki ${Math.max(0, HAD_CERAMAH_SEHARI - kiraanSedia)}, perlu ${tambah}). Sila pilih tarikh lain.`);
            }
            infoCeramahIkutTarikh[tarikh] = { ref, wujud, kiraanSedia, tambah };
          }

          let ukRef = null, ukWujud = false, ukKiraan = 0;
          if (dataBaru.ujianKomputer) {
            ukRef = slotRefUK(dataBaru.ujianKomputer.tarikh, dataBaru.ujianKomputer.sesi);
            const snap = await transaction.get(ukRef);
            ukWujud = snap.exists();
            ukKiraan = ukWujud ? (snap.data().count || 0) : 0;
            if (ukKiraan >= HAD_UK_SESESI) {
              throw new Error(`${dataBaru.ujianKomputer.tarikh} — ${dataBaru.ujianKomputer.sesi} dah penuh (${HAD_UK_SESESI} tempat). Sila pilih tarikh/sesi lain.`);
            }
          }

          // Semua get() dah selesai di atas — ini bahagian TULIS sahaja.
          for (const tarikh of tarikhCeramahUnik) {
            const info = infoCeramahIkutTarikh[tarikh];
            if (info.wujud) transaction.update(info.ref, { count: info.kiraanSedia + info.tambah });
            else transaction.set(info.ref, { count: info.tambah });
          }
          if (ukRef) {
            if (ukWujud) transaction.update(ukRef, { count: ukKiraan + 1 });
            else transaction.set(ukRef, { count: 1 });
          }
          transaction.set(studentRef, dataBaru);
        });
      } else {
        await setDoc(studentRef, dataBaru);
      }

      try { await signOut(authKedua); } catch (eSignOut) { /* abaikan */ }
      try { await deleteApp(appKedua); } catch (eDel) { /* abaikan */ }

      // KEMASKINI: +uid & +pembayaran (perlu utk panel "Sahkan Pembayaran
      // (Tunai)" lepas daftar — lihat drmKemaskiniPanelBayaranLepasDaftar()).
      drmDataLepasDaftar = { uid, nama, noKP, noTel, alamat, pakejLesen: dataBaru.pakejLesen || null, pembayaran: dataBaru.pembayaran || null, emel, password };

      drmSlipRingkas.innerHTML = `
        <div class="baris"><span class="label">Nama</span><span class="nilai">${nama}</span></div>
        <div class="baris"><span class="label">No. KP</span><span class="nilai">${noKP}</span></div>
        <div class="baris"><span class="label">Pakej</span><span class="nilai">${dataBaru.pakejLesen ? dataBaru.pakejLesen.nama + " — " + dataBaru.pakejLesen.harga : "Belum Pilih Pakej"}</span></div>
        <div class="baris"><span class="label">Emel Log Masuk</span><span class="nilai">${emel}</span></div>
        <div class="baris"><span class="label">Kata Laluan</span><span class="nilai">${password}</span></div>
      `;

      drmBorang.classList.remove("tunjuk");
      drmPanelJaya.classList.add("tunjuk");
      drmKemaskiniPanelBayaranLepasDaftar(); // TAMBAHAN: tunjuk/sembunyi butang "Sahkan Pembayaran (Tunai)"
    } catch (err) {
      // TAMBAHAN: kalau akaun Auth SUDAH dicipta (cred wujud) tapi dokumen
      // pelajar GAGAL disimpan (cth: slot Ceramah/UK dah penuh masa
      // transaction commit), padam balik akaun Auth yg baru dicipta tu —
      // kalau tidak, emel tu jadi "dah digunakan" secara silap bila admin
      // cuba daftar semula pelajar yg sama dgn tarikh lain.
      if (credBaru && credBaru.user) {
        try { await deleteUser(credBaru.user); } catch (eDelUser) { /* abaikan — bukan kritikal */ }
      }
      try { await deleteApp(appKedua); } catch (eDel2) { /* abaikan */ }

      let mesej = "Gagal daftar pelajar. Sila cuba lagi.";
      if (err && err.code === "auth/email-already-in-use") mesej = "Emel ni dah digunakan untuk akaun lain.";
      else if (err && err.code === "auth/invalid-email") mesej = "Format emel tak sah.";
      else if (err && err.code === "auth/weak-password") mesej = "Kata laluan terlalu lemah (minimum 6 aksara).";
      else if (err && err.message && !err.code) mesej = err.message; // TAMBAHAN: mesej slot penuh (dari throw dlm transaction)
      tunjukRalatDaftar(mesej);

      // TAMBAHAN: muat semula kalendar supaya admin nampak baki terkini
      // (berguna terutamanya kalau sebab gagal ialah slot baru je penuh).
      drmRenderCeramahGrid();
      drmRenderUkGrid();
    } finally {
      drmBtnDaftar.disabled = false;
      drmBtnDaftar.innerHTML = `<i class="fa-solid fa-user-plus"></i> Daftarkan Pelajar &amp; Cipta Akaun`;
    }
  }

  // ======================================================================
  // TAMBAHAN: kalendar Ceramah & Ujian Komputer TERUS dalam borang Daftar
  // Memandu (bawah Pilih Pakej) — admin boleh terus tetapkan tarikh masa
  // daftar, dgn had kapasiti DIKUATKUASAKAN betul (30/hari Ceramah, 15/sesi
  // UK), dan format docId slot Firestore PADAN 100% dgn struktur SEBENAR yg
  // disahkan terus dari Firebase Console (bukan tekaan/ASSUMSI lagi):
  //
  //   ceramah_slots        -> BERSARANG: ceramah_slots/{hari}/{bulan}/{tahun}
  //                            (cth doc sebenar "ceramah_slots/11/08/2026",
  //                            field `count` kat dokumen tahun tu)
  //   ujian_komputer_slots -> FLAT: docId "dd-MM-yyyy_sesiN" (sengkang,
  //                            "sesi" huruf kecil terus dgn nombor, cth
  //                            "12-08-2026_sesi1")
  //
  // slotRefCeramah()/slotRefUK() jadi SATU-SATUNYA tempat format ni ditulis
  // — dikongsi dgn borang daftar ni, kkTetapkanCeramah()/kkTetapkanUK()
  // (seksyen "Pelajar Didaftar Kaunter") DAN fungsi Reset Tarikh sedia ada
  // (resetTarikhCeramah/resetTarikhUjianKomputer), supaya SEMUA tempat yg
  // sentuh slot ni sentiasa selari antara satu sama lain & dgn app student.
  //
  // KEMASKINI: latihan_moto_slots DAH DISAHKAN dari Firebase Console —
  // format SAMA macam ujian_komputer_slots ("dd-MM-yyyy_sesiN", sengkang +
  // huruf kecil tiada ruang) — guna slotRefLatihan() di bawah.
  //
  // KEMASKINI: latihan_moto_qti_slots DAH DISAHKAN dari Firebase Console —
  // docId "dd-MM-yyyy_qti_HHMM" (dash, ADA komponen MASA/jam, cth
  // "10-10-2026_qti_1600"). QTI skang AUTO dikira 1 jam lepas Sesi 8
  // (sesi terakhir) tamat bila Sesi 8 ditetapkan — admin tak pilih tarikh
  // QTI sendiri lagi. Data model pelajar pun dah dikemaskini simpan field
  // masa (qti.masa, format "HHMM") sekali dgn qti.tarikh, supaya docId QTI
  // boleh dibina balik bila-bila (reset, dll) — lihat slotRefQti()/
  // kiraMasaQtiDrpSesi() di bawah.
  // ======================================================================

  const HAD_CERAMAH_SEHARI = 30;
  const HAD_UK_SESESI = 15;

  function slotRefCeramah(tarikhStr) {
    // tarikhStr format "dd/mm/yyyy" (SAMA macam field ceramah.tarikh pelajar).
    const [hariM, bulanM, tahunM] = tarikhStr.split("/");
    return doc(db, "ceramah_slots", hariM.padStart(2, "0"), bulanM.padStart(2, "0"), tahunM);
  }

  function kodkanSesiUK(sesiStr) {
    // Terima label bebas ("Sesi 1", "sesi 1", "1", dll) & tarik nombor sesi
    // sahaja — slot docId app SEBENAR guna "sesi1"/"sesi2" (huruf kecil,
    // tiada ruang). Kalau tiada nombor dijumpai, campak error supaya admin
    // sedar (elak book slot yg salah secara senyap).
    const padan = String(sesiStr || "").match(/\d+/);
    if (!padan) throw new Error(`Sesi "${sesiStr}" tiada nombor sesi (cth: "Sesi 1" atau "Sesi 2").`);
    return "sesi" + padan[0];
  }

  function slotRefUK(tarikhStr, sesiStr) {
    const tarikhSengkang = tarikhStr.split("/").map(p => p.padStart(2, "0")).join("-");
    return doc(db, "ujian_komputer_slots", `${tarikhSengkang}_${kodkanSesiUK(sesiStr)}`);
  }

  // TAMBAHAN: latihan_moto_slots — format DAH DISAHKAN sama macam UK
  // ("dd-MM-yyyy_sesiN"). Guna balik kodkanSesiUK() sebab logik "tarik
  // nombor sesi & huruf kecilkan" tu sama je utk kedua-dua koleksi.
  // KEMASKINI (2 pakej): `kunci` pilih koleksi — Moto => latihan_moto_slots,
  // Kereta => latihan_kereta_slots (id format SAMA). Tanpa kunci => Moto (kod lama kekal).
  function slotRefLatihan(tarikhStr, sesiStr, kunci = KUNCI_LATIHAN_MOTO) {
    const tarikhSengkang = tarikhStr.split("/").map(p => p.padStart(2, "0")).join("-");
    const koleksi = (KOLEKSI_LATIHAN[kunci] || KOLEKSI_LATIHAN[KUNCI_LATIHAN_MOTO]).sesi;
    return doc(db, koleksi, `${tarikhSengkang}_${kodkanSesiUK(sesiStr)}`);
  }

  // ======================================================================
  // TAMBAHAN: Latihan Praktikal (kaunter) skang guna 4 slot masa harian
  // TETAP (bukan label bebas admin taip) — ikut rupa "PILIH SESI (Max 2
  // sesi sehari)" app student sebenar (screenshot admin bagi: 9-11AM,
  // 11AM-1PM, 2-4PM, 4-6PM). Mockup design ni DAH DILULUSKAN admin.
  //
  // NOTA: HAD_LATIHAN_SESESI (kapasiti/tempat tiap slot) skang ANGGARAN 20
  // ikut mockup — confirm balik nombor sebenar dgn Firebase Console/Java
  // source bila sempat (senang tukar, satu pemalar je).
  // ======================================================================
  const HAD_LATIHAN_SESESI = 20;
  // Had BILANGAN SESI (bukan kapasiti slot) seorang pelajar boleh book dlm
  // SATU hari yg sama, ikut label "Max 2 sesi sehari" dlm app student.
  const HAD_LATIHAN_SEHARI = 2;

  const SESI_HARIAN_LATIHAN = [
    { label: "Sesi 1", mulaTeks: "9:00 AM", tamatTeks: "11:00 AM", tamat24: "11:00" },
    { label: "Sesi 2", mulaTeks: "11:00 AM", tamatTeks: "1:00 PM", tamat24: "13:00" },
    { label: "Sesi 3", mulaTeks: "2:00 PM", tamatTeks: "4:00 PM", tamat24: "16:00" },
    { label: "Sesi 4", mulaTeks: "4:00 PM", tamatTeks: "6:00 PM", tamat24: "18:00" }
  ];

  function formatWaktuSesiLabel(sesiLabel) {
    const s = SESI_HARIAN_LATIHAN.find(x => x.label === sesiLabel);
    return s ? ` (${s.mulaTeks}-${s.tamatTeks})` : "";
  }

  // TAMBAHAN: QTI skang AUTO ditetapkan 1 jam lepas Sesi 8 (sesi terakhir)
  // TAMAT — admin TAK pilih tarikh QTI sendiri lagi (lihat
  // kkTetapkanLatihanSesi()). docId latihan_moto_qti_slots format
  // "dd-MM-yyyy_qti_HHMM" (dash, ada komponen jam) — DAH DISAHKAN dari
  // Firebase Console (cth "10-10-2026_qti_1600").
  function kiraMasaQtiDrpSesi(sesiLabel) {
    const s = SESI_HARIAN_LATIHAN.find(x => x.label === sesiLabel);
    if (!s) return null;
    const [j, m] = s.tamat24.split(":").map(Number);
    const jQti = (j + 1) % 24;
    return `${String(jQti).padStart(2, "0")}${String(m).padStart(2, "0")}`;
  }

  // KEMASKINI (2 pakej): Moto => latihan_moto_qti_slots, Kereta => latihan_kereta_qti_slots.
  function slotRefQti(tarikhStr, masaHHMM, kunci = KUNCI_LATIHAN_MOTO) {
    const tarikhSengkang = tarikhStr.split("/").map(p => p.padStart(2, "0")).join("-");
    const koleksi = (KOLEKSI_LATIHAN[kunci] || KOLEKSI_LATIHAN[KUNCI_LATIHAN_MOTO]).qti;
    return doc(db, koleksi, `${tarikhSengkang}_qti_${masaHHMM}`);
  }

  function formatMasaQtiTeks(masaHHMM) {
    if (!masaHHMM || masaHHMM.length !== 4) return "-";
    const j = Number(masaHHMM.slice(0, 2));
    const m = masaHHMM.slice(2);
    const ptg = j >= 12 ? "PM" : "AM";
    let j12 = j % 12; if (j12 === 0) j12 = 12;
    return `${j12}:${m} ${ptg}`;
  }

  function drmFmtTarikh(tahun, bulan, hari) {
    return `${String(hari).padStart(2, "0")}/${String(bulan + 1).padStart(2, "0")}/${tahun}`;
  }

  // KEMASKINI (2 pakej): bila drmModeDuaPakej(), papar DUA tarikh (Moto &
  // Kereta) berasingan, bukan SATU drmCeramahTarikhPilih.
  function drmKemaskiniTeksPilihan() {
    if (drmModeDuaPakej()) {
      const m = drmCeramahTarikhPilihMoto ? `Moto: ${drmCeramahTarikhPilihMoto}` : "Moto: belum pilih";
      const k = drmCeramahTarikhPilihKereta ? `Kereta: ${drmCeramahTarikhPilihKereta}` : "Kereta: belum pilih";
      drmCeramahPilihanTeks.textContent = `${m}  |  ${k}`;
    } else {
      drmCeramahPilihanTeks.textContent = drmCeramahTarikhPilih ? `Dipilih: ${drmCeramahTarikhPilih}` : "Belum pilih tarikh";
    }
    drmUkPilihanTeks.textContent = (drmUkTarikhPilih && drmUkSesiPilih) ? `Dipilih: ${drmUkTarikhPilih} — ${drmUkSesiPilih}` : "Belum pilih tarikh & sesi";
  }

  // ---------- Kalendar Ceramah (Selasa & Sabtu sahaja, 30 tempat/hari) ----------
  let drmCeramahBulanTahun = new Date();
  let drmCeramahTarikhPilih = null; // "dd/mm/yyyy" | null — mod SATU pakej (atau tiada)
  // KEMASKINI (2 pakej): mod DUA pakej guna DUA tarikh berasingan ni, bukan
  // drmCeramahTarikhPilih di atas (yg dibiar null dlm mod dua).
  let drmCeramahTarikhPilihMoto = null;
  let drmCeramahTarikhPilihKereta = null;

  // TAMBAHAN (2 pakej): sub-paparan "tarikh ni utk Moto atau Kereta?" —
  // dipanggil bila admin klik satu tarikh dlm grid SEMASA mod dua pakej.
  // Sama pattern kkPilihTarikhUKModal (sub-pick sblm komit ke state tempatan;
  // tarikh ni baru betul2 ditulis Firestore lepas drmBtnDaftar diklik,
  // SAMA macam mod tunggal — TIADA write terus dr sini).
  function drmBukaPilihJenisCeramah(tarikhStr) {
    if (!drmCeramahJenisWrap) return;
    drmCeramahJenisWrap.style.display = "block";
    drmCeramahJenisTarikhTeks.textContent = tarikhStr;
    drmCeramahJenisBtnWrap.innerHTML = `
      <button type="button" class="drmkal-sesi-btn ${drmCeramahTarikhPilihMoto === tarikhStr ? "drmkal-dipilih" : ""}" data-jenis="MOTO">
        <div class="drmkal-sesi-nama"><i class="fa-solid fa-motorcycle"></i> Motosikal</div>
        <div class="drmkal-sesi-baki">${drmCeramahTarikhPilihMoto ? "Skrg: " + drmCeramahTarikhPilihMoto : "Belum pilih"}</div>
      </button>
      <button type="button" class="drmkal-sesi-btn ${drmCeramahTarikhPilihKereta === tarikhStr ? "drmkal-dipilih" : ""}" data-jenis="KERETA">
        <div class="drmkal-sesi-nama"><i class="fa-solid fa-car"></i> Kereta</div>
        <div class="drmkal-sesi-baki">${drmCeramahTarikhPilihKereta ? "Skrg: " + drmCeramahTarikhPilihKereta : "Belum pilih"}</div>
      </button>
    `;
    drmCeramahJenisBtnWrap.querySelectorAll("[data-jenis]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.jenis === "MOTO") drmCeramahTarikhPilihMoto = tarikhStr;
        else drmCeramahTarikhPilihKereta = tarikhStr;
        drmCeramahJenisWrap.style.display = "none";
        drmRenderCeramahGrid();
        drmKemaskiniTeksPilihan();
      });
    });
  }

  async function drmRenderCeramahGrid() {
    const tahun = drmCeramahBulanTahun.getFullYear();
    const bulan = drmCeramahBulanTahun.getMonth();
    drmCeramahLabel.textContent = `${NAMA_BULAN_MS[bulan]} ${tahun}`;

    const bilHari = new Date(tahun, bulan + 1, 0).getDate();
    let hariMula = new Date(tahun, bulan, 1).getDay();
    hariMula = (hariMula + 6) % 7; // Isnin = indeks 0

    // Tarik count SEBENAR hanya utk tarikh Selasa(2)/Sabtu(6) dlm bulan ni
    // (elak baca sampai 31 dokumen tiap kali render bulan).
    const calon = [];
    for (let d = 1; d <= bilHari; d++) {
      const hariMinggu = new Date(tahun, bulan, d).getDay();
      if (hariMinggu === 2 || hariMinggu === 6) calon.push(d);
    }
    const bakiIkutHari = {};
    await Promise.all(calon.map(async (d) => {
      const tarikhStr = drmFmtTarikh(tahun, bulan, d);
      try {
        const snap = await getDoc(slotRefCeramah(tarikhStr));
        bakiIkutHari[d] = HAD_CERAMAH_SEHARI - (snap.exists() ? (snap.data().count || 0) : 0);
      } catch (err) {
        bakiIkutHari[d] = HAD_CERAMAH_SEHARI; // gagal baca -> anggap kosong; transaction masa daftar tetap semak sekali lagi
      }
    }));

    let html = "";
    for (let i = 0; i < hariMula; i++) html += `<div class="drmkal-sel drmkal-kosong-slot"></div>`;
    for (let d = 1; d <= bilHari; d++) {
      const hariMinggu = new Date(tahun, bulan, d).getDay();
      const bolehHari = (hariMinggu === 2 || hariMinggu === 6);
      if (!bolehHari) {
        html += `<div class="drmkal-sel drmkal-tarikh-tutup"><span class="drmkal-angka">${d}</span></div>`;
        continue;
      }
      const tarikhStr = drmFmtTarikh(tahun, bulan, d);
      const baki = bakiIkutHari[d];
      let kelas = "";
      if (baki <= 0) kelas = "drmkal-penuh";
      else if (baki <= 5) kelas = "drmkal-sikit";
      // KEMASKINI (2 pakej): mod dua pakej -> tanda tarikh yg dah dipilih utk
      // Moto dan/atau Kereta dgn tag kecil "M"/"K" (boleh 2 serentak kalau
      // admin letak Moto & Kereta pd tarikh SAMA — tempat tetap dikira
      // GABUNGAN, lihat daftarPelajarKaunter()). Mod tunggal kekal SAMA.
      let tagJenis = "";
      if (drmModeDuaPakej()) {
        const adaMoto = drmCeramahTarikhPilihMoto === tarikhStr;
        const adaKereta = drmCeramahTarikhPilihKereta === tarikhStr;
        if (adaMoto || adaKereta) kelas += " drmkal-dipilih";
        if (adaMoto) tagJenis += "M";
        if (adaKereta) tagJenis += (tagJenis ? "+K" : "K");
      } else if (drmCeramahTarikhPilih === tarikhStr) {
        kelas += " drmkal-dipilih";
      }
      html += `<button type="button" class="drmkal-sel ${kelas}" data-tarikh="${tarikhStr}" ${baki <= 0 ? "disabled" : ""}>
        <span class="drmkal-angka">${d}</span><span class="drmkal-baki">${baki <= 0 ? "Penuh" : baki + "/" + HAD_CERAMAH_SEHARI}</span>${tagJenis ? `<span class="drmkal-tag-jenis">${tagJenis}</span>` : ""}
      </button>`;
    }
    drmCeramahGrid.innerHTML = html;
    drmCeramahGrid.querySelectorAll("[data-tarikh]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (drmModeDuaPakej()) {
          drmBukaPilihJenisCeramah(btn.dataset.tarikh);
        } else {
          drmCeramahTarikhPilih = btn.dataset.tarikh;
          drmRenderCeramahGrid();
          drmKemaskiniTeksPilihan();
        }
      });
    });
  }

  drmCeramahPrev.addEventListener("click", () => { drmCeramahBulanTahun.setMonth(drmCeramahBulanTahun.getMonth() - 1); drmRenderCeramahGrid(); });
  drmCeramahNext.addEventListener("click", () => { drmCeramahBulanTahun.setMonth(drmCeramahBulanTahun.getMonth() + 1); drmRenderCeramahGrid(); });

  // ---------- Kalendar Ujian Komputer (semua hari, 2 sesi/hari, 15 tempat/sesi) ----------
  let drmUkBulanTahun = new Date();
  let drmUkTarikhSementara = null; // tarikh diklik dlm grid, sblm admin pilih sesi
  let drmUkTarikhPilih = null;
  let drmUkSesiPilih = null;

  function drmRenderUkGrid() {
    const tahun = drmUkBulanTahun.getFullYear();
    const bulan = drmUkBulanTahun.getMonth();
    drmUkLabel.textContent = `${NAMA_BULAN_MS[bulan]} ${tahun}`;

    const bilHari = new Date(tahun, bulan + 1, 0).getDate();
    let hariMula = new Date(tahun, bulan, 1).getDay();
    hariMula = (hariMula + 6) % 7;

    let html = "";
    for (let i = 0; i < hariMula; i++) html += `<div class="drmkal-sel drmkal-kosong-slot"></div>`;
    for (let d = 1; d <= bilHari; d++) {
      const tarikhStr = drmFmtTarikh(tahun, bulan, d);
      const dipilih = (drmUkTarikhPilih === tarikhStr) || (drmUkTarikhSementara === tarikhStr);
      html += `<button type="button" class="drmkal-sel ${dipilih ? "drmkal-dipilih" : ""}" data-tarikh="${tarikhStr}">
        <span class="drmkal-angka">${d}</span>
      </button>`;
    }
    drmUkGrid.innerHTML = html;
    drmUkGrid.querySelectorAll("[data-tarikh]").forEach(btn => {
      btn.addEventListener("click", () => drmPilihTarikhUK(btn.dataset.tarikh));
    });
  }

  async function drmPilihTarikhUK(tarikhStr) {
    drmUkTarikhSementara = tarikhStr;
    drmRenderUkGrid();
    drmUkSesiWrap.style.display = "block";
    drmUkTarikhTerpilihTeks.textContent = tarikhStr;
    drmUkSesiBtnWrap.innerHTML = `<div class="drmkal-memuat">Menyemak tempat kosong...</div>`;

    let baki1 = HAD_UK_SESESI, baki2 = HAD_UK_SESESI;
    try {
      const [snap1, snap2] = await Promise.all([
        getDoc(slotRefUK(tarikhStr, "Sesi 1")),
        getDoc(slotRefUK(tarikhStr, "Sesi 2"))
      ]);
      baki1 = HAD_UK_SESESI - (snap1.exists() ? (snap1.data().count || 0) : 0);
      baki2 = HAD_UK_SESESI - (snap2.exists() ? (snap2.data().count || 0) : 0);
    } catch (err) {
      // gagal baca -> tunjuk anggapan kosong; transaction masa daftar tetap semak sekali lagi
    }

    // Kalau admin dah klik hari lain sementara fetch ni jalan, abaikan hasil basi.
    if (drmUkTarikhSementara !== tarikhStr) return;

    const senaraiSesi = [
      { label: "Sesi 1", baki: baki1 },
      { label: "Sesi 2", baki: baki2 }
    ];
    drmUkSesiBtnWrap.innerHTML = senaraiSesi.map(s => {
      const penuh = s.baki <= 0;
      const dipilih = drmUkTarikhPilih === tarikhStr && drmUkSesiPilih === s.label;
      return `<button type="button" class="drmkal-sesi-btn ${dipilih ? "drmkal-dipilih" : ""}" data-sesi="${s.label}" ${penuh ? "disabled" : ""}>
        <div class="drmkal-sesi-nama">${s.label}</div>
        <div class="drmkal-sesi-baki">${penuh ? "Penuh" : s.baki + "/" + HAD_UK_SESESI + " kosong"}</div>
      </button>`;
    }).join("");
    drmUkSesiBtnWrap.querySelectorAll("[data-sesi]").forEach(btn => {
      btn.addEventListener("click", () => {
        drmUkTarikhPilih = tarikhStr;
        drmUkSesiPilih = btn.dataset.sesi;
        drmRenderUkGrid();
        drmPilihTarikhUK(tarikhStr); // render semula butang sesi (highlight dipilih)
        drmKemaskiniTeksPilihan();
      });
    });
  }

  drmUkPrev.addEventListener("click", () => { drmUkBulanTahun.setMonth(drmUkBulanTahun.getMonth() - 1); drmRenderUkGrid(); });
  drmUkNext.addEventListener("click", () => { drmUkBulanTahun.setMonth(drmUkBulanTahun.getMonth() + 1); drmRenderUkGrid(); });

  // Bina HTML slip cetak kredential pendaftaran (guna balik struktur/class
  // "slip-*" YANG SAMA dgn bina_htmlSlipCetak() supaya konsisten & tiada
  // CSS baru diperlukan, cuma tambah seksyen "slip-kredential" utk sorot
  // emel+kata laluan).
  function bina_htmlSlipPendaftaran(d) {
    const tarikhJana = formatTarikhMasaCetak(new Date());
    const inisial = (d.nama || "").trim().charAt(0).toUpperCase() || "?";
    const namaPakej = d.pakejLesen ? d.pakejLesen.nama : "Belum pilih pakej";
    const hargaPakej = d.pakejLesen ? d.pakejLesen.harga : "";

    return `
      <div class="slip-cetak-kandungan">
        <div class="slip-letterhead">
          <div class="slip-logo"><i class="fa-solid fa-graduation-cap"></i></div>
          <div>
            <h1>Institut Memandu Sanubari Ceria</h1>
            <p>Slip Pendaftaran Pelajar (Kaunter)</p>
          </div>
          <div class="slip-tarikh-jana">Dijana pada:<br>${tarikhJana}</div>
        </div>

        <div class="slip-info-bar">
          <div class="slip-info-avatar">${inisial}</div>
          <div>
            <div class="slip-info-nama">${d.nama || "(tiada nama)"}</div>
            <div class="slip-info-sub">${d.noKP || ""} • ${d.noTel || ""}</div>
          </div>
        </div>

        <div class="slip-seksyen">
          <h3>Maklumat Peribadi</h3>
          <div class="slip-baris"><span class="label">Nama Penuh</span><span>${d.nama || "-"}</span></div>
          <div class="slip-baris"><span class="label">No. Kad Pengenalan</span><span>${d.noKP || "-"}</span></div>
          <div class="slip-baris"><span class="label">No. Telefon</span><span>${d.noTel || "-"}</span></div>
          <div class="slip-baris"><span class="label">Alamat</span><span>${d.alamat || "-"}</span></div>
          <div class="slip-baris"><span class="label">Pakej</span><span>${namaPakej}${hargaPakej ? " — " + hargaPakej : ""}</span></div>
        </div>

        <div class="slip-seksyen slip-kredential">
          <h3>Akaun Log Masuk App</h3>
          <div class="slip-baris"><span class="label">Emel</span><span>${d.emel || "-"}</span></div>
          <div class="slip-baris"><span class="label">Kata Laluan</span><span>${d.password || "-"}</span></div>
        </div>

        <div class="slip-tandatangan">
          <div class="slip-tandatangan-kotak">Tandatangan Pelajar</div>
          <div class="slip-tandatangan-kotak">Tandatangan &amp; Cop Admin</div>
        </div>

        <div class="slip-footer">Sila simpan slip ini — guna emel &amp; kata laluan di atas untuk log masuk ke app. Dokumen ini dijana secara automatik oleh Sistem Pengurusan Pelajar IMSC.</div>
      </div>
    `;
  }

  // Sama mekanisme cetak dgn cetakLaporanPelajar() (marker class body +
  // window.print() + onafterprint/setTimeout cleanup) — TIADA logik cetak
  // baru diduplikasi, cuma sumber data lain (drmDataLepasDaftar, bukan
  // senaraiPelajar) sebab pelajar baru ni belum tentu dah sampai dalam
  // senaraiPelajar tempatan lagi masa admin klik cetak sejurus lepas daftar.
  function cetakSlipPendaftaran() {
    if (!drmDataLepasDaftar || !slipCetakPelajarEl) return;

    slipCetakPelajarEl.innerHTML = bina_htmlSlipPendaftaran(drmDataLepasDaftar);
    document.body.classList.add("mod-cetak-slip");

    const bersihkanSlipCetak = () => {
      document.body.classList.remove("mod-cetak-slip");
      slipCetakPelajarEl.innerHTML = "";
    };

    window.onafterprint = () => {
      bersihkanSlipCetak();
      window.onafterprint = null;
    };

    window.print();

    setTimeout(() => {
      if (document.body.classList.contains("mod-cetak-slip")) {
        bersihkanSlipCetak();
        window.onafterprint = null;
      }
    }, 1000);
  }

  // TAMBAHAN: tunjuk/sembunyi + kemaskini panel "Sahkan Pembayaran (Tunai)"
  // dlm panel berjaya daftar — ikut drmDataLepasDaftar.pembayaran semasa.
  function drmKemaskiniPanelBayaranLepasDaftar() {
    if (!drmPanelBayaranLepasDaftar) return;
    const d = drmDataLepasDaftar;
    if (!d || !d.pembayaran) {
      drmPanelBayaranLepasDaftar.style.display = "none";
      return;
    }
    drmPanelBayaranLepasDaftar.style.display = "";
    const sudahSah = d.pembayaran.status === "SAH";
    drmNotaBayaranLepasDaftar.innerHTML = `<i class="fa-solid fa-circle-info"></i> Jumlah bayaran (Pakej: ${d.pakejLesen ? d.pakejLesen.nama : "-"}): <b>${d.pembayaran.jumlah}</b>${sudahSah ? ' — <span style="color:var(--hijau); font-weight:700;">Sudah disahkan ✓</span>' : ""}`;
    drmBtnSahBayaranLepasDaftar.disabled = sudahSah;
    drmBtnSahBayaranLepasDaftar.innerHTML = sudahSah
      ? `<i class="fa-solid fa-check"></i> Pembayaran Disahkan`
      : `<i class="fa-solid fa-money-bill-wave"></i> Sahkan Pembayaran (Tunai) Diterima`;
  }
  if (drmBtnSahBayaranLepasDaftar) {
    drmBtnSahBayaranLepasDaftar.addEventListener("click", async () => {
      if (!drmDataLepasDaftar || !drmDataLepasDaftar.uid) return;
      // KEMASKINI: guna SEMULA EXACT sahkanPembayaran() yg sama dgn tab
      // Senarai Pelajar/Kaunter (kini pulangkan true/false ikut berjaya ke
      // tidak, supaya panel ni tahu bila nak tukar rupa butang).
      const berjaya = await sahkanPembayaran(drmDataLepasDaftar.uid);
      if (berjaya && drmDataLepasDaftar.pembayaran) drmDataLepasDaftar.pembayaran.status = "SAH";
      drmKemaskiniPanelBayaranLepasDaftar();
    });
  }

  drmBtnJana.addEventListener("click", janaPasswordDaftar);
  drmBtnSalin.addEventListener("click", salinPasswordDaftar);
  drmBtnBatal.addEventListener("click", resetBorangDaftar);
  drmBtnDaftar.addEventListener("click", daftarPelajarKaunter);
  drmBtnDaftarLagi.addEventListener("click", () => {
    resetBorangDaftar();
    drmDataLepasDaftar = null;
    drmKemaskiniPanelBayaranLepasDaftar();
    drmPanelJaya.classList.remove("tunjuk");
    drmBorang.classList.add("tunjuk");
  });
  drmBtnCetakSlip.addEventListener("click", cetakSlipPendaftaran);
  // TAMBAHAN: "Selesai" — sama macam Daftar Pelajar Lain, bwk balik ke borang kosong
  drmBtnSelesai.addEventListener("click", () => {
    resetBorangDaftar();
    drmDataLepasDaftar = null;
    drmKemaskiniPanelBayaranLepasDaftar();
    drmPanelJaya.classList.remove("tunjuk");
    drmBorang.classList.add("tunjuk");
  });

  // ======================================================================
  // TAMBAHAN: senarai "Pelajar Didaftar Kaunter" (bawah borang Daftar
  // Memandu) — admin PILIH tarikh Ceramah/Ujian Komputer/Latihan Praktikal
  // (8 sesi) + QTI bagi pihak pelajar yang didaftar terus di kaunter
  // (p.daftarKaunter === true), sebab diorang tak guna app sendiri utk book
  // tarikh macam pelajar lain. Lepas tarikh ditetapkan, admin SAHKAN guna
  // fungsi sedia ada (sahkanCeramah/sahkanUjianKomputer/sahkanKehadiranSesi/
  // sahkanKehadiranQti, didefinisikan di bawah) — TIADA logik sahkan baru
  // direka, cuma wiring baru sebab markup ni duduk LUAR #tbody (delegation
  // sedia ada dalam render() cuma scope kat #tbody).
  //
  // Sama macam butang "Sahkan" sedia ada (lihat baris_htmlSelBtnUK() —
  // "admin sentiasa bebas confirm terus dari dashboard"), butang "Pilih
  // Tarikh" di sini JUGA TAK di-gate/disable ikut turutan Pakej->Ceramah->UK
  // — cuma tunjuk .lock-note info macam biasa bila urutan biasa tu belum
  // dipenuhi; admin tetap bebas pilih apa-apa dulu.
  // ======================================================================

  // ---------- kk: butang "Sahkan" (guna balik EXACT logik/class sedia ada
  // — baris_htmlSelBtnCeramah/baris_htmlSelBtnUK — cuma tambah SATU class
  // "kk-btn-sah-override" supaya muat sebaris dlm .kk-baris flex; sesi
  // latihan/QTI tak ada helper standalone sedia ada, jadi dibina sendiri
  // di sini tapi ikut EXACT condition/class/data-aksi yang baris_htmlLatihan()
  // sedia ada guna) ----------
  // KEMASKINI (2 pakej): `kunci` ditambah pada ketiga-tiga butang ni —
  // lalai kekal "ceramah"/KUNCI_LATIHAN_MOTO supaya laluan panggilan lama
  // (kalau ada) tetap berfungsi sama macam asal.
  function kkBtnSahCeramah(p, kunci = "ceramah") {
    return baris_htmlSelBtnCeramah(p, kunci).replace('<button class="', '<button class="kk-btn-sah-override ');
  }
  function kkBtnSahUK(p) {
    return baris_htmlSelBtnUK(p).replace('<button class="', '<button class="kk-btn-sah-override ');
  }
  function kkBtnSahSesi(p, index, kunci = KUNCI_LATIHAN_MOTO) {
    const lp = p[kunci];
    const s = lp && lp.senaraiSesi ? lp.senaraiSesi[index] : null;
    const adaJadualSesi = !!(s && s.tarikh);
    const sudahHadir = adaJadualSesi && s.status === "HADIR";
    if (!adaJadualSesi) return `<button type="button" class="kk-btn-sah-override btn-sesi" disabled>Sahkan</button>`;
    if (sudahHadir) return `<button type="button" class="kk-btn-sah-override btn-sesi" disabled>Sudah hadir</button>`;
    return `<button type="button" class="kk-btn-sah-override btn-sesi" data-aksi="sah-sesi-latihan" data-uid="${p.uid}" data-index="${index}" data-kunci="${kunci}">Sahkan</button>`;
  }
  function kkBtnSahQti(p, kunci = KUNCI_LATIHAN_MOTO) {
    const lp = p[kunci];
    const adaTarikh = !!(lp && lp.qti && lp.qti.tarikh);
    const sudahHadir = adaTarikh && lp.qti.status === "HADIR";
    if (!adaTarikh) return `<button type="button" class="kk-btn-sah-override btn-sesi qti" disabled>Sahkan</button>`;
    if (sudahHadir) return `<button type="button" class="kk-btn-sah-override btn-sesi qti" disabled>Sudah hadir</button>`;
    return `<button type="button" class="kk-btn-sah-override btn-sesi qti" data-aksi="sah-qti-latihan" data-uid="${p.uid}" data-kunci="${kunci}">Sahkan</button>`;
  }

  // ----------------------------------------------------------------------
  // KEMASKINI (Request 1 — kad "Pelajar Didaftar Kaunter" disamakan dgn
  // Kad A): kkAksiCeramah/kkAksiUK/kkBlokLatihan bina lajur AKSI khusus
  // kaunter — SAMA struktur status/sub (kat_statusCeramah/kat_subCeramah
  // dll, 100% guna semula) tapi lajur aksi kaunter ADA butang
  // "Pilih/Tukar Tarikh" sekali (pelajar kaunter TAK self-book guna app,
  // admin kena tetapkan tarikh utk pelajar ni), diikuti butang Sahkan
  // (kkBtnSahCeramah/kkBtnSahUK/kkBtnSahSesi/kkBtnSahQti — guna SEMULA
  // EXACT logik/class baris_htmlSelBtnXxx sedia ada, cuma +override class).
  // ----------------------------------------------------------------------
  // KEMASKINI (permintaan admin — "dekat kaunter didaftarkan tuu, bagi
  // boleh pilih tarikh jaa, sahkan mna boleh sbb sahkan kan kena buat
  // dekat bhgian ringkasan"): butang "Sahkan" (kkBtnSahCeramah/kkBtnSahUK)
  // DIBUANG drpd tab Kaunter — tab ni cuma utk TETAPKAN/TUKAR tarikh.
  // Sahkan kehadiran/lulus dibuat kat tab "Senarai Pelajar" (Ringkasan),
  // sebab pelajar kaunter pun TETAP muncul kat sana (render() #tbody tak
  // tapis ikut daftarKaunter — lihat render(), TIADA filter sebegitu).
  // kkBtnSahCeramah()/kkBtnSahUK() KEKAL wujud (tak dipadam) — cuma
  // dah tak dipanggil di sini.
  function kkAksiCeramah(p, c) {
    const idMasa = `kkCeramahMasa_${p.uid}_${c.kunci}`;
    const masaVal = (c.data && c.data.masa) || "";
    return `<div class="kk-aksi-kaunter">
      <input type="text" class="kk-input-sesi" id="${idMasa}" placeholder="Masa (cth: 9-4 PM)" value="${masaVal}">
      <button type="button" class="kk-btn-pilih" data-kk-jenis="ceramah" data-kk-uid="${p.uid}" data-kk-kunci="${c.kunci}"><i class="fa-solid fa-calendar-days"></i> ${(c.data && c.data.tarikh) ? "Tukar" : "Pilih"}</button>
      <span class="kk-nota-sah" title="Sahkan kehadiran dibuat di tab Senarai Pelajar (Ringkasan)"><i class="fa-solid fa-circle-info"></i> Sahkan di Ringkasan</span>
    </div>`;
  }

  function kkAksiUK(p) {
    const uk = p.ujianKomputer || {};
    return `<div class="kk-aksi-kaunter">
      <button type="button" class="kk-btn-pilih" data-kk-jenis="uk" data-kk-uid="${p.uid}"><i class="fa-solid fa-calendar-days"></i> ${uk.tarikh ? "Tukar Tarikh &amp; Sesi" : "Pilih Tarikh &amp; Sesi"}</button>
      <span class="kk-nota-sah" title="Sahkan lulus dibuat di tab Senarai Pelajar (Ringkasan)"><i class="fa-solid fa-circle-info"></i> Sahkan di Ringkasan</span>
    </div>`;
  }

  // KEMASKINI (mockup diluluskan, "buat macam kad pelajar jugak"): seksyen
  // Latihan Praktikal kaunter kini guna SATU fungsi SAMA dgn kad pelajar
  // biasa (htmlBlokLatihanTajukPanel() — tajuk klik + panel 4-terus/Lihat
  // Lagi), bukan senarai baris .kk-baris lama. Beza DUA butang (bukan
  // satu) tiap kad sesi — "Pilih Tarikh"/"Tukar" (kk-btn-pilih, EXACT
  // class/data-kk-* sedia ada, wiring di renderSenaraiKaunter() TAK
  // disentuh) + Sahkan (kkBtnSahSesi/kkBtnSahQti, EXACT fungsi sedia ada
  // TAK diubah) — sbb admin kaunter kena TETAPKAN tarikh sendiri (beza dgn
  // kad pelajar app yg cuma SAHKAN tarikh yg student dah book).
  // Bilangan sesi kekal ikut KOLEKSI_LATIHAN[kunci].jumlahSesiLalai (Moto=7,
  // Kereta=10) — "sesi terakhir" yg memicu auto-QTI pun ikut nombor ni.
  function kkBlokLatihan(p, e) {
    const kunci = e.kunci;
    const lp = e.lp || {};
    const senaraiSesi = lp.senaraiSesi || [];
    const qti = lp.qti || {};
    const jumlahSesiLalai = (KOLEKSI_LATIHAN[kunci] && KOLEKSI_LATIHAN[kunci].jumlahSesiLalai) || 8;
    const labelJenis = (perluLabelJenis(p) && e.label) ? ` — ${e.label}` : "";
    const ikonJenis = kunci === KUNCI_LATIHAN_KERETA ? "fa-car" : "fa-motorcycle";

    const bolehLatihan = ceramahHadir(p) && ukSudahSah(p);

    // Terkunci (Ceramah/UK belum sah) — kekal SATU blok tajuk+panel, cuma
    // isi panel tukar jadi nota kunci (SAMA mesej/syarat macam asal).
    if (!bolehLatihan) {
      const kunciState = `${p.uid}|${kunci}`;
      const terbuka = latihanTerbukaSet.has(kunciState);
      return `
        <div class="blok-latihan">
          <button type="button" class="latihan-tajuk${terbuka ? " terbuka" : ""}" data-aksi="toggle-latihan" data-uid="${p.uid}" data-kunci="${kunci}">
            <i class="fa-solid ${ikonJenis} ikon-jenis"></i>
            <span class="nama-tajuk">Latihan Praktikal${labelJenis}</span>
            <i class="fa-solid fa-lock" style="color:var(--teks-lembut); font-size:11px; margin-left:auto;"></i>
            <i class="fa-solid fa-chevron-down chevron"></i>
          </button>
          <div class="latihan-panel${terbuka ? " terbuka" : ""}">
            <div class="kk-baris" style="border:none;padding-top:0;">
              <span class="lock-note">🔒 Latihan Praktikal (termasuk QTI) terkunci — Ceramah kena disahkan HADIR &amp; Ujian Komputer kena disahkan SAH dulu</span>
            </div>
          </div>
        </div>`;
    }

    const semuaItem = [];
    let jumlahHadir = 0;
    for (let i = 0; i < jumlahSesiLalai; i++) {
      const s = senaraiSesi[i] || {};
      const sudahHadir = !!(s.tarikh && s.status === "HADIR");
      if (sudahHadir) jumlahHadir++;
      semuaItem.push(`
        <div class="sesi-item${s.tarikh ? "" : " tiada-jadual"}${sudahHadir ? " hadir" : ""}">
          <div class="sesi-label">Sesi ${i + 1}</div>
          <div class="sesi-tarikh${s.tarikh ? "" : " kosong"}">${s.tarikh ? `${s.tarikh}<br>${s.sesi ? s.sesi + formatWaktuSesiLabel(s.sesi) : "Belum pilih sesi"}` : "Belum dipilih"}</div>
          <div class="sesi-aksi">
            <button type="button" class="kk-btn-pilih" data-kk-jenis="latihan" data-kk-uid="${p.uid}" data-kk-index="${i}" data-kk-kunci="${kunci}"><i class="fa-solid fa-calendar-days"></i> ${s.tarikh ? "Tukar" : "Pilih Tarikh"}</button>
          </div>
        </div>`);
    }
    const qtiHadir = qti.status === "HADIR";
    if (qtiHadir) jumlahHadir++;
    // QTI auto terikat Sesi terakhir (lihat kkTetapkanLatihanSesi()) — kaunter
    // cuma tunjuk status, TIADA butang Sahkan di sini lagi (lihat nota di atas
    // kkAksiCeramah/kkAksiUK — Sahkan dipindah ke tab Ringkasan).
    semuaItem.push(`
      <div class="sesi-item${qti.tarikh ? "" : " tiada-jadual"}${qtiHadir ? " hadir" : ""}">
        <div class="sesi-label">QTI</div>
        <div class="sesi-tarikh${qti.tarikh ? "" : " kosong"}">${qti.tarikh ? `${qti.tarikh}<br>${formatMasaQtiTeks(qti.masa)} (Auto)` : `Auto — lepas Sesi ${jumlahSesiLalai}`}</div>
        <div class="sesi-aksi">${qti.tarikh ? `<span class="kk-nota-sah" title="Sahkan kehadiran dibuat di tab Senarai Pelajar (Ringkasan)"><i class="fa-solid fa-circle-info"></i> Sahkan di Ringkasan</span>` : ""}</div>
      </div>`);

    return htmlBlokLatihanTajukPanel({
      p, kunci, ikonJenis, labelJenis,
      hadHadirTeks: `${jumlahHadir}/${jumlahSesiLalai + 1} hadir`,
      semuaItem
    });
  }

  // ----------------------------------------------------------------------
  // KEMASKINI (Request 1): kad "Pelajar Didaftar Kaunter" disamakan TERUS
  // dgn Kad A (struktur .kad-pelajar/.kad-pelajar-atas/.kad-detail/
  // .senarai-kategori/.bawah-aksi SAMA macam baris_htmlKad()) — header guna
  // SEMULA baris_htmlKepalaKad() (ni yg betulkan pepijat "nama tak papar"
  // yg dilaporkan: kad lama kkBinaHtmlKad ada papar p.nama, tapi header baru
  // ni dah teruji 100% berfungsi dalam Senarai Pelajar & Selesai, jadi
  // dipakai terus drpd cuba cari semula pepijat display asal). Pakej &
  // Bayaran guna EXACT kat_status/kat_sub/kat_aksi sedia ada (TIADA UI
  // tarikh — pelajar kaunter pun confirm pakej/bayaran macam biasa, bukan
  // "pilih tarikh"). Ceramah/UK/Latihan KEKAL ada butang "Pilih/Tukar
  // Tarikh" (pelajar kaunter tak self-book guna app, admin kena tetapkan
  // tarikh utk pelajar ni) — guna kkAksiCeramah/kkAksiUK/kkBlokLatihan baru
  // (atas) utk lajur aksi tu, tapi status/sub ikon KEKAL guna kat_statusXxx/
  // kat_subXxx SAMA dgn Kad A. "fution dia pon bagi sma ja" dipenuhi sebab
  // wireKadPelajarEvents() (dipanggil dari renderSenaraiKaunter()) yg
  // sambung semua butang Sahkan/Reset/Padam/Cetak/Maklumat/toggle-latihan
  // ni — SATU fungsi yg sama dipakai #tbody, #selesaiWrap DAN kkSenaraiWrap.
  // ----------------------------------------------------------------------
  function kkBinaHtmlKad(p) {
    const terbuka = kadTerbukaSet.has(p.uid);

    const entriCeramah = senaraiCeramahPelajar(p);
    const paparanCeramah = entriCeramah.length ? entriCeramah : [{ kunci: "ceramah", label: "", data: {} }];
    const htmlCeramah = paparanCeramah.map(c => {
      const label = c.label ? `Ceramah — ${c.label}` : "Ceramah";
      return `<div class="baris-kat">
              <div class="ikon-kat ikon-${kat_statusCeramah(c)}"><i class="fa-solid fa-chalkboard-user"></i></div>
              <div class="maklumat-kat"><div class="label-kat">${label}</div><div class="sub-kat">${kat_subCeramah(c)}</div></div>
              <div class="aksi-kat">${kkAksiCeramah(p, c)}</div>
            </div>`;
    }).join("");

    const entriLatihan = senaraiLatihanPelajar(p);
    const paparanLatihan = entriLatihan.length ? entriLatihan : [{ kunci: KUNCI_LATIHAN_MOTO, label: "", lp: null }];
    const htmlBlokLatihan = paparanLatihan.map(e => kkBlokLatihan(p, e)).join("");

    return `
      <div class="kad-pelajar${terbuka ? " terbuka" : ""}" data-uid="${p.uid}">
        <div class="kad-pelajar-atas kad-pelajar-toggle">
          ${baris_htmlKepalaKad(p, '<span class="kk-tag">Kaunter</span>')}
          <div class="kad-chevron"><i class="fa-solid fa-chevron-down"></i></div>
        </div>

        <div class="kad-detail">
          <!-- TAMBAHAN: nota diagnostik — kenapa pelajar ni MASIH dalam
               senarai aktif kaunter (belum pindah ke tab "Selesai"). Guna
               SEMULA EXACT predikat pelajarSudahSelesai() (senaraiSebabBelumSelesai()
               cuma "explain" predikat tu baris demi baris) — jawapan terus
               kat kad, admin tak payah teka/tanya kenapa pelajar yg nampak
               macam "dah settle" tu masih tersenarai kat sini. -->
          ${(() => {
            const sebab = senaraiSebabBelumSelesai(p);
            return sebab.length ? `<div class="nota-belum-selesai">
              <div class="nota-tajuk"><i class="fa-solid fa-circle-exclamation"></i> Belum masuk tab "Selesai" sebab:</div>
              <ul>${sebab.map(s => `<li>${s}</li>`).join("")}</ul>
            </div>` : "";
          })()}
          ${(!p.pakejLesen || !p.pakejLesen.nama) && p.adaRekodLama ? `<div class="state-kosong-baharu"><i class="fa-solid fa-circle-info"></i> Lesen baharu belum didaftar — pelajar sedang proses tambah kelas, bukan ralat.</div>` : ""}
          <div class="senarai-kategori">
            <div class="baris-kat">
              <div class="ikon-kat ikon-${kat_statusPakej(p)}"><i class="fa-solid fa-id-card"></i></div>
              <div class="maklumat-kat"><div class="label-kat">Pakej</div><div class="sub-kat">${kat_subPakej(p)}</div></div>
              <div class="aksi-kat">${kat_aksiPakej(p)}</div>
            </div>
            ${htmlCeramah}
            <div class="baris-kat">
              <div class="ikon-kat ikon-${kat_statusUK(p)}"><i class="fa-solid fa-computer"></i></div>
              <div class="maklumat-kat"><div class="label-kat">Ujian Komputer</div><div class="sub-kat">${kat_subUK(p)}</div></div>
              <div class="aksi-kat">${kkAksiUK(p)}</div>
            </div>
            <div class="baris-kat">
              <div class="ikon-kat ikon-${kat_statusBayar(p)}"><i class="fa-solid fa-money-bill-wave"></i></div>
              <div class="maklumat-kat"><div class="label-kat">Bayaran</div><div class="sub-kat">${kat_subBayar(p)}</div></div>
              <div class="aksi-kat">${kat_aksiBayar(p)}</div>
            </div>
          </div>

          <!-- TAMBAHAN: Latihan Praktikal (kaunter) — blok tarikh-per-sesi
               penuh (bukan dropdown "Lihat Sesi" macam Kad A), sebab admin
               kena TETAPKAN tarikh sesi-sesi ni sendiri (bukan sekadar
               sahkan kehadiran apa yg student app dah book). -->
          ${htmlBlokLatihan}

          <div class="bawah-aksi">${baris_htmlAksiBawah(p)}</div>
          ${p.adaRekodLama ? htmlSenaraiRekodLama(p.uid) : ""}
        </div>
      </div>
    `;
  }

  function renderSenaraiKaunter() {
    if (!kkSenaraiWrap) return;
    // KEMASKINI (Request 1): pelajar kaunter yg DAH SELESAI (pelajarSudahSelesai —
    // SAMA predikat dgn tab "Selesai") dikeluarkan drpd senarai aktif ni —
    // "bila user tu dah settle tanda semua masukkan terus senarai selesai" —
    // pelajar tu terus muncul dalam tab "Selesai" (renderSenaraiSelesai(),
    // yg tapis senaraiPelajar penuh tanpa kira daftarKaunter, jadi TIADA
    // perubahan diperlukan kat sana).
    // TAMBAHAN: carian nama/no.KP (#kkCarian) — SAMA pattern dgn #carian tab
    // Senarai Pelajar, digabung (bukan ganti) dgn tapisan daftarKaunter/belum-selesai.
    const kataKunciKk = kkCarianEl ? kkCarianEl.value.trim().toLowerCase() : "";
    const senaraiKaunter = urutIkutNama(senaraiPelajar.filter(p => {
      if (!(p.daftarKaunter === true && !pelajarSudahSelesai(p))) return false;
      if (!kataKunciKk) return true;
      const nama = (p.nama || "").toLowerCase();
      const noKP = (p.noKP || "").toLowerCase();
      return nama.includes(kataKunciKk) || noKP.includes(kataKunciKk);
    }));
    if (kkKiraanEl) kkKiraanEl.textContent = senaraiKaunter.length;
    // TAMBAHAN: badge kiraan kat nav sidebar jugak (tab "Pelajar Didaftar Kaunter" dah berasingan drpd "Daftar Memandu")
    const navBadgeKaunterEl = document.getElementById("navBadgeKaunter");
    if (navBadgeKaunterEl) navBadgeKaunterEl.textContent = senaraiKaunter.length;

    if (senaraiKaunter.length === 0) {
      kkSenaraiWrap.innerHTML = `<div class="kk-kosong">Tiada pelajar didaftar kaunter setakat ni. Daftar pelajar baru dari tab "Daftar Memandu".</div>`;
      return;
    }

    kkSenaraiWrap.innerHTML = senaraiKaunter.map(p => kkBinaHtmlKad(p)).join("");

    // KEMASKINI (Request 1 — "fution dia pon bagi sma ja"): kad kaunter ni
    // skang guna struktur Kad A penuh (.kad-pelajar/.kad-pelajar-toggle dll),
    // jadi SEMUA wiring sah-pakej/sah-ceramah/sah-uk/sah-bayar/sah-sesi-latihan/
    // sah-qti-latihan/toggle-latihan/buka-reset/reset-semua/padam-pelajar/
    // cetak-laporan/maklumat-lengkap/toggle-buka-kad guna SATU fungsi SAMA
    // yg #tbody & #selesaiWrap dah pakai — TIADA lagi handler custom/
    // berasingan/berduplikat di sini.
    wireKadPelajarEvents(kkSenaraiWrap);

    // butang "Pilih/Tukar Tarikh" (Ceramah/UK/Latihan) — KEKAL khusus
    // kaunter (Kad A tiada butang ni sebab pelajar app self-book sendiri),
    // skang +data-kk-kunci supaya kalendar kongsi tahu Ceramah/Latihan mana
    // (Moto/Kereta) yang sedang ditetapkan.
    kkSenaraiWrap.querySelectorAll(".kk-btn-pilih").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        kkBukaKalendar({
          uid: btn.dataset.kkUid,
          jenis: btn.dataset.kkJenis,
          index: btn.dataset.kkIndex !== undefined ? Number(btn.dataset.kkIndex) : null,
          kunci: btn.dataset.kkKunci || null
        });
      });
    });
  }

  // ---------- kk: mini-kalendar kongsi (satu overlay, target tukar ikut butang "Pilih Tarikh" yang diklik) ----------
  let kkKalTarget = null; // { uid, jenis: "ceramah"|"uk"|"latihan"|"qti", index }
  let kkKalBulanTahun = new Date();
  let kkKalUkTarikhSementara = null; // KEMASKINI: tarikh UK diklik dlm grid, sblm admin pilih sesi

  function kkRenderKalGrid() {
    const tahun = kkKalBulanTahun.getFullYear();
    const bulan = kkKalBulanTahun.getMonth();
    kkKalLabelBulan.textContent = `${NAMA_BULAN_MS[bulan]} ${tahun}`;

    const bilHari = new Date(tahun, bulan + 1, 0).getDate();
    let hariMula = new Date(tahun, bulan, 1).getDay(); // 0 = Ahad
    hariMula = (hariMula + 6) % 7; // jadikan Isnin = indeks 0 (padan header I S R K J S A)

    let html = "";
    for (let i = 0; i < hariMula; i++) html += `<button type="button" class="kk-kosong-slot"></button>`;
    for (let d = 1; d <= bilHari; d++) html += `<button type="button" data-kk-hari="${d}">${d}</button>`;
    kkKalGrid.innerHTML = html;

    // KEMASKINI: utk jenis "uk", klik tarikh TAK terus komit — buka dulu
    // sub-paparan pilih Sesi 1/Sesi 2 (macam biasa, sama pattern borang
    // Daftar Memandu). Jenis lain (ceramah/latihan/qti) kekal komit terus.
    kkKalGrid.querySelectorAll("[data-kk-hari]").forEach(btn => {
      btn.addEventListener("click", () => {
        const hari = Number(btn.dataset.kkHari);
        if (kkKalTarget && kkKalTarget.jenis === "uk") {
          kkPilihTarikhUKModal(hari);
        } else if (kkKalTarget && kkKalTarget.jenis === "latihan") {
          kkPilihTarikhLatihanModal(hari);
        } else {
          kkPilihTarikh(hari);
        }
      });
    });
  }

  function kkBukaKalendar(target) {
    kkKalTarget = target;
    kkKalBulanTahun = new Date();
    kkKalUkTarikhSementara = null;
    kkKalGridWrap.style.display = "";
    kkKalNavWrap.style.display = "";
    kkKalUkSesiWrap.style.display = "none";
    kkKalLpSesiWrap.style.display = "none";
    kkRenderKalGrid();
    kkKalOverlay.classList.add("tunjuk");
  }

  function kkTutupKalendar() {
    kkKalOverlay.classList.remove("tunjuk");
    kkKalTarget = null;
    kkKalUkTarikhSementara = null;
    kkKalGridWrap.style.display = "";
    kkKalNavWrap.style.display = "";
    kkKalUkSesiWrap.style.display = "none";
    kkKalLpSesiWrap.style.display = "none";
  }

  function kkFormatTarikh(hari) {
    const bulan = kkKalBulanTahun.getMonth() + 1;
    const tahun = kkKalBulanTahun.getFullYear();
    return `${String(hari).padStart(2, "0")}/${String(bulan).padStart(2, "0")}/${tahun}`;
  }

  // KEMASKINI: kkPilihTarikh() skang cuma utk jenis "ceramah" — Ujian
  // Komputer & Latihan Praktikal masing2 ada sub-paparan pilih Sesi sendiri
  // (kkPilihTarikhUKModal()/kkPilihTarikhLatihanModal()) sebab kedua-duanya
  // perlu admin pilih SESI (bukan cuma tarikh) sebelum komit ke Firestore.
  async function kkPilihTarikh(hari) {
    if (!kkKalTarget) return;
    const tarikhStr = kkFormatTarikh(hari);
    const { uid, jenis, kunci } = kkKalTarget;
    kkTutupKalendar();

    try {
      if (jenis === "ceramah") {
        // KEMASKINI (2 pakej): id input masa skang ada suffix kunci
        // (kkCeramahMasa_${uid}_${kunci}) supaya Ceramah Moto & Kereta
        // pelajar 2-pakej ada input masa berasingan. Pelajar lama/1 pakej
        // (kunci="ceramah") kekal id lama (idMasaCeramah dlm kkAksiCeramah
        // guna `kkCeramahMasa_${p.uid}_${c.kunci}`, dan c.kunci dah "ceramah"
        // utk pelajar lama — SAMA, cuma dgn suffix explicit).
        const kunciSebenar = kunci || "ceramah";
        const elMasa = document.getElementById(`kkCeramahMasa_${uid}_${kunciSebenar}`);
        await kkTetapkanCeramah(uid, tarikhStr, elMasa ? elMasa.value.trim() : "", kunciSebenar);
        tunjukToast("Tarikh berjaya ditetapkan.", "success");
      }
    } catch (err) {
      tunjukToast("Gagal tetapkan tarikh: " + err.message, "error");
    }
  }

  // TAMBAHAN: sub-paparan pilih Sesi 1/Sesi 2 utk Ujian Komputer (kaunter) —
  // "macam biasa", sama pattern drmPilihTarikhUK() dlm borang Daftar Memandu.
  // Tarikh + sesi cuma ditulis ke Firestore bila admin klik satu butang sesi.
  async function kkPilihTarikhUKModal(hari) {
    if (!kkKalTarget) return;
    const tarikhStr = kkFormatTarikh(hari);
    kkKalUkTarikhSementara = tarikhStr;

    kkKalGridWrap.style.display = "none";
    kkKalNavWrap.style.display = "none";
    kkKalUkSesiWrap.style.display = "block";
    kkKalUkTarikhTeks.textContent = tarikhStr;
    kkKalUkSesiBtnWrap.innerHTML = `<div class="drmkal-memuat">Menyemak tempat kosong...</div>`;

    let baki1 = HAD_UK_SESESI, baki2 = HAD_UK_SESESI;
    try {
      const [snap1, snap2] = await Promise.all([
        getDoc(slotRefUK(tarikhStr, "Sesi 1")),
        getDoc(slotRefUK(tarikhStr, "Sesi 2"))
      ]);
      baki1 = HAD_UK_SESESI - (snap1.exists() ? (snap1.data().count || 0) : 0);
      baki2 = HAD_UK_SESESI - (snap2.exists() ? (snap2.data().count || 0) : 0);
    } catch (err) {
      // gagal baca -> tunjuk anggapan kosong; transaction masa Sahkan tetap semak sekali lagi
    }

    // Kalau admin dah tutup/tukar tarikh sementara fetch ni jalan, abaikan hasil basi.
    if (kkKalUkTarikhSementara !== tarikhStr) return;

    const senaraiSesi = [
      { label: "Sesi 1", baki: baki1 },
      { label: "Sesi 2", baki: baki2 }
    ];
    kkKalUkSesiBtnWrap.innerHTML = senaraiSesi.map(s => {
      const penuh = s.baki <= 0;
      return `<button type="button" class="drmkal-sesi-btn" data-sesi="${s.label}" ${penuh ? "disabled" : ""}>
        <div class="drmkal-sesi-nama">${s.label}</div>
        <div class="drmkal-sesi-baki">${penuh ? "Penuh" : s.baki + "/" + HAD_UK_SESESI + " kosong"}</div>
      </button>`;
    }).join("");

    kkKalUkSesiBtnWrap.querySelectorAll("[data-sesi]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const sesiLabel = btn.dataset.sesi;
        const target = kkKalTarget; // simpan dulu sblm overlay ditutup
        kkTutupKalendar();
        try {
          await kkTetapkanUK(target.uid, tarikhStr, sesiLabel);
          tunjukToast("Tarikh & sesi berjaya ditetapkan.", "success");
        } catch (err) {
          tunjukToast("Gagal tetapkan tarikh: " + err.message, "error");
        }
      });
    });
  }

  kkKalUkKembali.addEventListener("click", () => {
    kkKalUkTarikhSementara = null;
    kkKalUkSesiWrap.style.display = "none";
    kkKalGridWrap.style.display = "";
    kkKalNavWrap.style.display = "";
  });

  // TAMBAHAN: sub-paparan pilih Sesi 1-4 (slot masa harian TETAP) utk
  // Latihan Praktikal (kaunter) — ikut mockup "PILIH SESI (Max 2 sesi
  // sehari)" yg admin dah luluskan. Tarikh+sesi cuma ditulis ke Firestore
  // bila admin klik satu kad sesi (sama pattern kkPilihTarikhUKModal()).
  async function kkPilihTarikhLatihanModal(hari) {
    if (!kkKalTarget || kkKalTarget.jenis !== "latihan") return;
    const tarikhStr = kkFormatTarikh(hari);
    const { uid, index } = kkKalTarget;
    // KEMASKINI (2 pakej): kunci (Moto/Kereta) — lalai KUNCI_LATIHAN_MOTO
    // supaya laluan panggilan lama (takde kunci dlm target) tetap Moto.
    const kunci = kkKalTarget.kunci || KUNCI_LATIHAN_MOTO;
    const jumlahSesiLalai = (KOLEKSI_LATIHAN[kunci] && KOLEKSI_LATIHAN[kunci].jumlahSesiLalai) || 8;
    // Kongsi balik var "sementara" yg sama dgn UK utk semak fetch basi —
    // selamat sebab UK & Latihan tak pernah aktif serentak dlm SATU overlay.
    kkKalUkTarikhSementara = tarikhStr;

    kkKalGridWrap.style.display = "none";
    kkKalNavWrap.style.display = "none";
    kkKalLpSesiWrap.style.display = "block";
    kkKalLpTarikhTeks.textContent = tarikhStr;
    kkKalLpAmaran.style.display = "none";
    kkKalLpSesiBtnWrap.innerHTML = `<div class="drmkal-memuat">Menyemak tempat kosong...</div>`;

    const p = senaraiPelajar.find(x => x.uid === uid);
    const senaraiSesiSedia = (p && p[kunci] && p[kunci].senaraiSesi) ? p[kunci].senaraiSesi : [];
    // Kira berapa sesi LAIN (bukan index yg tengah diisi ni) pelajar ni dah
    // ada pada tarikh yg SAMA — utk kuatkuasa "Max 2 sesi sehari".
    const bilLain = senaraiSesiSedia.filter((s, i) => i !== index && s && s.tarikh === tarikhStr).length;
    const hadTercapai = bilLain >= HAD_LATIHAN_SEHARI;

    let bakiSenarai = SESI_HARIAN_LATIHAN.map(s => ({ ...s, baki: HAD_LATIHAN_SESESI }));
    try {
      const snaps = await Promise.all(SESI_HARIAN_LATIHAN.map(s => getDoc(slotRefLatihan(tarikhStr, s.label, kunci))));
      bakiSenarai = SESI_HARIAN_LATIHAN.map((s, i) => ({
        ...s,
        baki: HAD_LATIHAN_SESESI - (snaps[i].exists() ? (snaps[i].data().count || 0) : 0)
      }));
    } catch (err) {
      // gagal baca -> tunjuk anggapan kosong; kkTetapkanLatihanSesi (transaction) tetap konsisten count
    }

    // Kalau admin dah tutup/tukar tarikh sementara fetch ni jalan, abaikan hasil basi.
    if (kkKalUkTarikhSementara !== tarikhStr) return;

    kkKalLpAmaran.style.display = hadTercapai ? "block" : "none";

    // Sesi yg DAH ditetapkan utk index ni PADA tarikh yg sama ni (kalau ada) —
    // supaya kad tu tunjuk "dipilih" & tak turut disable oleh had harian.
    const sesiSediaIndex = (senaraiSesiSedia[index] && senaraiSesiSedia[index].tarikh === tarikhStr) ? senaraiSesiSedia[index].sesi : null;

    kkKalLpSesiBtnWrap.innerHTML = bakiSenarai.map(s => {
      const penuh = s.baki <= 0;
      const dipilih = sesiSediaIndex === s.label;
      const disabled = penuh || (hadTercapai && !dipilih);
      return `<button type="button" class="drmkal-sesi-btn ${dipilih ? "drmkal-dipilih" : ""}" data-sesi="${s.label}" ${disabled ? "disabled" : ""}>
        <div class="drmkal-sesi-nama">${s.label} <span style="font-weight:500;">(${s.mulaTeks}-${s.tamatTeks})</span></div>
        <div class="drmkal-sesi-baki">${penuh ? "Penuh" : s.baki + "/" + HAD_LATIHAN_SESESI + " kosong"}</div>
      </button>`;
    }).join("");

    kkKalLpSesiBtnWrap.querySelectorAll("[data-sesi]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const sesiLabel = btn.dataset.sesi;
        const target = kkKalTarget; // simpan dulu sblm overlay ditutup
        kkTutupKalendar();
        try {
          const iniSesiTerakhir = target.index === (jumlahSesiLalai - 1);
          await kkTetapkanLatihanSesi(target.uid, target.index, tarikhStr, sesiLabel, kunci);
          tunjukToast(iniSesiTerakhir ? `Sesi ${jumlahSesiLalai} ditetapkan — QTI auto dijadualkan 1 jam lepas sesi ni tamat.` : "Tarikh & sesi berjaya ditetapkan.", "success");
        } catch (err) {
          tunjukToast("Gagal tetapkan tarikh: " + err.message, "error");
        }
      });
    });
  }

  kkKalLpKembali.addEventListener("click", () => {
    kkKalUkTarikhSementara = null;
    kkKalLpSesiWrap.style.display = "none";
    kkKalGridWrap.style.display = "";
    kkKalNavWrap.style.display = "";
  });

  kkKalPrev.addEventListener("click", () => { kkKalBulanTahun.setMonth(kkKalBulanTahun.getMonth() - 1); kkRenderKalGrid(); });
  kkKalNext.addEventListener("click", () => { kkKalBulanTahun.setMonth(kkKalBulanTahun.getMonth() + 1); kkRenderKalGrid(); });
  kkKalTutup.addEventListener("click", kkTutupKalendar);
  kkKalOverlay.addEventListener("click", (e) => { if (e.target === kkKalOverlay) kkTutupKalendar(); });

  // ---------- kk: tulis Firestore (tetapkan tarikh) ----------
  //
  // KEMASKINI: kkBookSlot() skang terima terus SATU slotRef (docRef penuh),
  // bukan (koleksi, docId) berasingan — sebab ceramah_slots skang guna path
  // BERSARANG (bukan docId flat), jadi pembinaan ref kena guna helper
  // slotRefCeramah()/slotRefUK() yang dikongsi dgn borang Daftar Memandu
  // (lihat definisi function tu di atas, dekat daftarPelajarKaunter()) —
  // format ni DAH DISAHKAN betul2 dari Firebase Console, bukan tekaan lagi.
  //
  // latihan_moto_slots DAH DISAHKAN (sama format macam UK) — guna
  // slotRefLatihan(). latihan_moto_qti_slots KEKAL guna docId flat lama
  // (ada komponen JAM yg belum disokong dlm data model, lihat NOTA dekat
  // definisi slotRefUK/slotRefLatihan di atas) — TIADA had kapasiti
  // disemak utk dua slot ni lagi, confirm balik dgn Android/Java source
  // kalau perlu.
  async function kkBookSlot(transaction, slotRef) {
    const slotSnap = await transaction.get(slotRef);
    if (slotSnap.exists()) {
      const countSemasa = slotSnap.data().count || 0;
      transaction.update(slotRef, { count: countSemasa + 1 });
    } else {
      transaction.set(slotRef, { count: 1 });
    }
  }

  // KEMASKINI (2 pakej): `kunci` = "ceramah" (lalai) | "ceramahMoto" | "ceramahKereta".
  // Slot ceramah_slots KEKAL dikongsi (SATU pool, tak kira jenis) — cuma
  // field pelajar yg ditulis tukar ikut kunci, dot-path macam sahkanCeramah().
  async function kkTetapkanCeramah(uid, tarikhStr, masaStr, kunci = "ceramah") {
    const studentRef = doc(db, "students", uid);
    await runTransaction(db, async (transaction) => {
      await kkBookSlot(transaction, slotRefCeramah(tarikhStr));
      transaction.update(studentRef, {
        [`${kunci}.tarikh`]: tarikhStr,
        [`${kunci}.masa`]: masaStr || ""
      });
    });
  }

  async function kkTetapkanUK(uid, tarikhStr, sesiStr) {
    const studentRef = doc(db, "students", uid);
    await runTransaction(db, async (transaction) => {
      await kkBookSlot(transaction, slotRefUK(tarikhStr, sesiStr));
      transaction.update(studentRef, {
        "ujianKomputer.tarikh": tarikhStr,
        "ujianKomputer.sesi": sesiStr || ""
      });
    });
  }

  // KEMASKINI: kkTetapkanLatihanSesi() — pilih 1 tarikh+sesi utk 1 sesi
  // individu (Sesi 1 hingga 8 dipilih SATU-SATU dari 4 kad slot masa harian
  // TETAP, "macam app student" — lihat kkPilihTarikhLatihanModal()).
  //
  // TAMBAHAN (auto QTI): kalau index ni SESI KE-8 (index 7, sesi terakhir),
  // lepas book slot latihan tu, terus KIRA & book slot QTI automatik (+1 jam
  // lepas sesi 8 tamat, docId "dd-MM-yyyy_qti_HHMM" — lihat
  // kiraMasaQtiDrpSesi()/slotRefQti()) — admin TAK payah pilih tarikh QTI
  // sendiri lagi. Kalau sesi 8 DITUKAR (tarikh/sesi lain), slot latihan LAMA
  // *dan* slot QTI LAMA (kalau ada) dibebaskan dulu sblm yg baru dibook,
  // supaya count Firestore tak "bocor" (tersangkut dikira walau dah tak
  // dipakai). Firestore transaction: SEMUA get() kena jalan dulu sblm
  // mana2 update()/set() — ikut had library tu.
  // KEMASKINI (2 pakej): `kunci` = KUNCI_LATIHAN_MOTO (lalai) | KUNCI_LATIHAN_KERETA.
  // jumlahSesiLalai (padding senarai + penentu "sesi terakhir" pemicu auto-QTI)
  // ditarik dari KOLEKSI_LATIHAN[kunci] (Moto=7→index 6 terakhir... TAPI
  // kekal pakai "index terakhir ikut jumlahSesiLalai sedia ada" yg sama dgn
  // asal, iaitu jumlahSesiLalai-1 — utk Moto ni akan jadi index 6, BUKAN 7
  // macam kod asal; nombor sebenar sentiasa ikut KOLEKSI_LATIHAN, SATU
  // sumber kebenaran yg sama dgn kkBlokLatihan() di atas & tempat lain).
  async function kkTetapkanLatihanSesi(uid, index, tarikhStr, sesiStr, kunci = KUNCI_LATIHAN_MOTO) {
    const jumlahSesiLalai = (KOLEKSI_LATIHAN[kunci] && KOLEKSI_LATIHAN[kunci].jumlahSesiLalai) || 8;
    const p = senaraiPelajar.find(x => x.uid === uid);
    const lpLama = (p && p[kunci]) ? p[kunci] : {};
    const senaraiLama = lpLama.senaraiSesi ? lpLama.senaraiSesi.slice() : [];
    while (senaraiLama.length < jumlahSesiLalai) senaraiLama.push({});
    const sesiSebelumIni = senaraiLama[index];
    senaraiLama[index] = { tarikh: tarikhStr, sesi: sesiStr || "" };

    const iniSesiLapan = (index === jumlahSesiLalai - 1);
    const studentRef = doc(db, "students", uid);

    await runTransaction(db, async (transaction) => {
      // ---------- baca dulu (SEMUA get() sblm write) ----------
      const slotBaruRef = slotRefLatihan(tarikhStr, sesiStr, kunci);
      const slotBaruSnap = await transaction.get(slotBaruRef);

      let slotLamaRef = null, slotLamaSnap = null;
      const tukarSesi = sesiSebelumIni && sesiSebelumIni.tarikh && sesiSebelumIni.sesi &&
        (sesiSebelumIni.tarikh !== tarikhStr || sesiSebelumIni.sesi !== sesiStr);
      if (tukarSesi) {
        slotLamaRef = slotRefLatihan(sesiSebelumIni.tarikh, sesiSebelumIni.sesi, kunci);
        slotLamaSnap = await transaction.get(slotLamaRef);
      }

      let qtiLamaRef = null, qtiLamaSnap = null;
      const qtiSediaAda = lpLama.qti;
      if (iniSesiLapan && qtiSediaAda && qtiSediaAda.tarikh && qtiSediaAda.masa) {
        qtiLamaRef = slotRefQti(qtiSediaAda.tarikh, qtiSediaAda.masa, kunci);
        qtiLamaSnap = await transaction.get(qtiLamaRef);
      }

      let masaQtiBaru = null, qtiBaruRef = null, qtiBaruSnap = null;
      if (iniSesiLapan) {
        masaQtiBaru = kiraMasaQtiDrpSesi(sesiStr);
        if (masaQtiBaru) {
          qtiBaruRef = slotRefQti(tarikhStr, masaQtiBaru, kunci);
          qtiBaruSnap = await transaction.get(qtiBaruRef);
        }
      }

      // ---------- lepas tu baru write ----------
      if (slotLamaRef && slotLamaSnap && slotLamaSnap.exists()) {
        const c = slotLamaSnap.data().count || 0;
        transaction.update(slotLamaRef, { count: Math.max(0, c - 1) });
      }
      if (slotBaruSnap.exists()) {
        transaction.update(slotBaruRef, { count: (slotBaruSnap.data().count || 0) + 1 });
      } else {
        transaction.set(slotBaruRef, { count: 1 });
      }

      const kemaskini = { [`${kunci}.senaraiSesi`]: senaraiLama };

      if (iniSesiLapan) {
        if (qtiLamaRef && qtiLamaSnap && qtiLamaSnap.exists()) {
          const c = qtiLamaSnap.data().count || 0;
          transaction.update(qtiLamaRef, { count: Math.max(0, c - 1) });
        }
        if (qtiBaruRef) {
          if (qtiBaruSnap.exists()) {
            transaction.update(qtiBaruRef, { count: (qtiBaruSnap.data().count || 0) + 1 });
          } else {
            transaction.set(qtiBaruRef, { count: 1 });
          }
          kemaskini[`${kunci}.qti`] = { tarikh: tarikhStr, masa: masaQtiBaru, status: "MENUNGGU" };
        }
      }

      transaction.update(studentRef, kemaskini);
    });
  }

  // ============ AKSI ADMIN — SAHKAN ============

  // TAMBAHAN: notis "DISAHKAN" (status bar je, tiada popup) utk semua
  // butang Sahkan — beza dgn notis "TAK_HADIR" (ada popup).
  async function hantarNotifikasiDisahkan(uid, { kategori, jenisPakej = "", mesej }) {
    try {
      await addDoc(collection(db, "students", uid, "notifikasi"), {
        jenis: "DISAHKAN",
        kategori,    // "PAKEJ" | "CERAMAH" | "UJIAN_KOMPUTER" | "LATIHAN_MEMANDU" | "PEMBAYARAN"
        jenisPakej,  // "MOTO" | "KERETA" | "" (pelajar 1 pakej / tak berkaitan)
        mesej,
        dibaca: false,
        dicipta: serverTimestamp()
      });
    } catch (err) {
      // Tak throw — status dah terlanjur disahkan, cuma toast amaran.
      console.error("Gagal hantar notifikasi disahkan:", err);
      tunjukToast("Status disahkan, tapi notifikasi app gagal dihantar: " + err.message, "warning");
    }
  }

  // TAMBAHAN: Sahkan Pakej Lesen — gate sebelum Ceramah boleh dipilih di app student
  async function sahkanPakej(uid) {
    if (!confirm("Sahkan pakej lesen pelajar ni?")) return;
    try {
      await updateDoc(doc(db, "students", uid), {
        "pakejLesen.status": "SAH"
      });
      await hantarNotifikasiDisahkan(uid, {
        kategori: "PAKEJ",
        mesej: "Pendaftaran Pakej Lesen anda telah DISAHKAN oleh admin."
      });
    } catch (err) {
      tunjukToast("Gagal sahkan: " + err.message, "error");
    }
  }

  // KEMASKINI (2 pakej): `kunci` = "ceramah" (lalai, pelajar lama) | "ceramahMoto" | "ceramahKereta".
  // Guna dot-path ("ceramahMoto.status") supaya field lain (tarikh/masa/jenis) TAK ditimpa.
  async function sahkanCeramah(uid, kunci) {
    if (!["ceramah", "ceramahMoto", "ceramahKereta"].includes(kunci)) kunci = "ceramah";
    const labelJenis = teksJenis(jenisDariKunci(kunci));
    if (!confirm(`Sahkan pelajar ni HADIR Ceramah Undang-Undang${labelJenis ? " (" + labelJenis + ")" : ""}?`)) return;
    try {
      await updateDoc(doc(db, "students", uid), {
        [`${kunci}.status`]: "HADIR"
      });
      await hantarNotifikasiDisahkan(uid, {
        kategori: "CERAMAH",
        jenisPakej: jenisDariKunci(kunci),
        mesej: `Kehadiran Ceramah Undang-Undang${labelJenis ? " (" + labelJenis + ")" : ""} anda telah DISAHKAN oleh admin.`
      });
    } catch (err) {
      tunjukToast("Gagal sahkan: " + err.message, "error");
    }
  }

  async function sahkanUjianKomputer(uid) {
    if (!confirm("Sahkan pelajar ni LULUS Ujian Komputer?")) return;
    try {
      await updateDoc(doc(db, "students", uid), {
        "ujianKomputer.status": "SAH"
      });
      await hantarNotifikasiDisahkan(uid, {
        kategori: "UJIAN_KOMPUTER",
        mesej: "Keputusan Ujian Komputer anda telah DISAHKAN LULUS oleh admin."
      });
    } catch (err) {
      tunjukToast("Gagal sahkan: " + err.message, "error");
    }
  }

  // KEMASKINI: pulangkan true/false ikut berjaya ke tidak (admin batal
  // confirm() / ralat write) — dipakai oleh panel "Sahkan Pembayaran
  // (Tunai)" lepas daftar (Daftar Memandu) utk tahu bila nak tukar rupa
  // butang. Pemanggil sedia ada (wireKadPelajarEvents dll) tak kesan apa2
  // sebab semua TAK guna nilai pulangan ni (abaikan macam biasa).
  async function sahkanPembayaran(uid) {
    if (!confirm("Sahkan pembayaran pelajar ni sudah diterima?")) return false;
    try {
      await updateDoc(doc(db, "students", uid), {
        "pembayaran.status": "SAH"
      });
      await hantarNotifikasiDisahkan(uid, {
        kategori: "PEMBAYARAN",
        mesej: "Pembayaran anda telah DISAHKAN DITERIMA oleh admin."
      });
      return true;
    } catch (err) {
      tunjukToast("Gagal sahkan: " + err.message, "error");
      return false;
    }
  }

  // ---------- TAMBAHAN: Padam Pelajar (hapus terus dari Firestore) ----------
  //
  // Padam WHOLE dokumen pelajar dari collection "students". Confirm 2 lapis
  // (confirm biasa + kena taip nama betul) sebab action ni destructive & tak
  // boleh undo. NOTA: ni cuma padam data Firestore — kalau pelajar ada akaun
  // Firebase Auth (login emel/password), akaun tu TAK hilang sekali sebab
  // client SDK tak boleh padam akaun user lain. Cloud Function
  // "padamAkaunAuthLepasStudentDipadam" (deploy berasingan, dengar event
  // padam doc "students/{uid}") yang uruskan padam akaun Auth tu secara
  // automatik guna Admin SDK. Slot yg dah dibook (ceramah_slots, dll) pun
  // tak auto-free — count dia akan stuck kalau tak diuruskan berasingan.
  async function padamPelajar(uid) {
    const p = senaraiPelajar.find(x => x.uid === uid);
    if (!p) return;

    const langkah1 = confirm(`PADAM pelajar "${p.nama || uid}" dari sistem?\n\nSemua data (ceramah, UK, latihan praktikal, pembayaran) akan HILANG TERUS dari Firestore dan TAK BOLEH DIPULIHKAN.`);
    if (!langkah1) return;

    const sahkanNama = prompt(`Untuk sahkan padam, taip nama pelajar ni:\n"${p.nama || uid}"`);
    if (sahkanNama === null) return; // admin tekan cancel
    if (sahkanNama.trim() !== (p.nama || uid)) {
      tunjukToast("Nama tak sepadan. Padam dibatalkan.", "warning");
      return;
    }

    try {
      await deleteDoc(doc(db, "students", uid));
      tunjukToast(`Pelajar "${p.nama || uid}" dah dipadam dari Firestore.`, "success");
    } catch (err) {
      tunjukToast("Gagal padam pelajar: " + err.message + "\n\n(Semak Firestore Security Rules — admin kena ada permission 'delete' pada collection 'students'.)", "error");
    }
  }

  // ---------- TAMBAHAN: Sahkan Kehadiran Sesi Latihan Praktikal (Amali/Latihan Memandu) ----------
  //
  // Firestore updateDoc() TAK boleh target index array terus (contoh
  // "senaraiSesi.0.status") sebab ia akan GANTI WHOLE array field, bukan
  // nested-merge macam map. So kaedahnya: ambil array penuh dari state
  // tempatan (senaraiPelajar), salin, ubah HANYA index yang admin klik,
  // then tulis balik WHOLE array guna updateDoc biasa.
  //
  // KEMASKINI (2 PAKEJ): `kunci` = "latihanPraktikalMoto" (lalai) | "latihanPraktikalKereta".
  // Baca dokumen TERKINI dlm transaction, ubah HANYA index tu, tulis balik
  // SELURUH array (field lain latihan tu kekal), dan kalau semua sesi + QTI
  // dah HADIR => set `<kunci>.status` = "SELESAI".
  function _normKunciLatihan(kunci) {
    return KOLEKSI_LATIHAN[kunci] ? kunci : KUNCI_LATIHAN_MOTO;
  }

  async function sahkanKehadiranSesi(uid, index, kunci) {
    kunci = _normKunciLatihan(kunci);
    const p = senaraiPelajar.find(x => x.uid === uid);
    const lpLokal = p ? p[kunci] : null;
    if (!lpLokal || !lpLokal.senaraiSesi) return;

    const sesi = lpLokal.senaraiSesi[index];
    if (!sesi) return;

    const labelJenis = perluLabelJenis(p) ? ` [${KOLEKSI_LATIHAN[kunci].label}]` : "";
    if (!confirm(`Sahkan pelajar ni HADIR Sesi ${index + 1}${sesi.sesi ? " — " + sesi.sesi : ""} (${sesi.tarikh || "-"})${labelJenis}?`)) return;

    const studentRef = doc(db, "students", uid);
    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(studentRef);
        const lp = snap.exists() ? snap.data()[kunci] : null;
        if (!lp || !Array.isArray(lp.senaraiSesi) || !lp.senaraiSesi[index]) {
          throw new Error("Sesi tak dijumpai dlm data terkini pelajar");
        }
        const senaraiBaru = lp.senaraiSesi.map((s, i) => (i === index ? { ...s, status: "HADIR" } : s));
        const kemaskini = { [`${kunci}.senaraiSesi`]: senaraiBaru };
        if (latihanSelesaiSemua(senaraiBaru, lp.qti)) kemaskini[`${kunci}.status`] = "SELESAI";
        transaction.update(studentRef, kemaskini);
      });
      // TAMBAHAN: notis DISAHKAN selepas transaction (addDoc bukan sebahagian transaction)
      await hantarNotifikasiDisahkan(uid, {
        kategori: "LATIHAN_MEMANDU",
        jenisPakej: KOLEKSI_LATIHAN[kunci].jenis,
        mesej: `Kehadiran Sesi ${index + 1}${sesi.sesi ? " — " + sesi.sesi : ""} Latihan Praktikal${labelJenis} anda telah DISAHKAN oleh admin.`
      });
    } catch (err) {
      tunjukToast("Gagal sahkan kehadiran sesi: " + err.message, "error");
    }
  }

  // ---------- TAMBAHAN: Sahkan Kehadiran QTI ----------
  async function sahkanKehadiranQti(uid, kunci) {
    kunci = _normKunciLatihan(kunci);
    const p = senaraiPelajar.find(x => x.uid === uid);
    const lpLokal = p ? p[kunci] : null;
    if (!lpLokal || !lpLokal.qti) return;

    const labelJenis = perluLabelJenis(p) ? ` [${KOLEKSI_LATIHAN[kunci].label}]` : "";
    if (!confirm(`Sahkan pelajar ni HADIR sesi QTI (${lpLokal.qti.tarikh || "-"})${labelJenis}?`)) return;

    const studentRef = doc(db, "students", uid);
    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(studentRef);
        const lp = snap.exists() ? snap.data()[kunci] : null;
        if (!lp || !lp.qti) throw new Error("QTI tak dijumpai dlm data terkini pelajar");
        const kemaskini = { [`${kunci}.qti.status`]: "HADIR" };
        if (latihanSelesaiSemua(lp.senaraiSesi, { ...lp.qti, status: "HADIR" })) kemaskini[`${kunci}.status`] = "SELESAI";
        transaction.update(studentRef, kemaskini);
      });
      await hantarNotifikasiDisahkan(uid, {
        kategori: "LATIHAN_MEMANDU",
        jenisPakej: KOLEKSI_LATIHAN[kunci].jenis,
        mesej: `Kehadiran sesi QTI Latihan Praktikal${labelJenis} anda telah DISAHKAN oleh admin.`
      });
    } catch (err) {
      tunjukToast("Gagal sahkan kehadiran QTI: " + err.message, "error");
    }
  }

  // TAMBAHAN: "Tak Hadir" — reset tarikh (guna balik "_TanpaKonfirmasi"
  // sedia ada) + tulis notis ke students/{uid}/notifikasi utk app papar popup.
  async function hantarNotifikasiTakHadir(uid, { kategori, jenisPakej = "", mesej }) {
    try {
      await addDoc(collection(db, "students", uid, "notifikasi"), {
        jenis: "TAK_HADIR",
        kategori,    // "CERAMAH" | "UJIAN_KOMPUTER" | "LATIHAN_MEMANDU"
        jenisPakej,  // "MOTO" | "KERETA" | "" (pelajar 1 pakej)
        mesej,
        dibaca: false,
        dicipta: serverTimestamp()
      });
    } catch (err) {
      // Tak throw — slot dah terlanjur dibebaskan, jgn buat admin confuse
      // dgn error lepas tu, cuma log & tunjuk toast amaran lembut.
      console.error("Gagal hantar notifikasi tak hadir:", err);
      tunjukToast("Tak hadir ditanda, tapi notifikasi app gagal dihantar: " + err.message, "warning");
    }
  }

  // TAMBAHAN: notis "RESET_TARIKH" — admin reset tarikh terus (butang ↺ Reset Tarikh /
  // Reset Semua) tanpa permintaan pelajar. Server Render hantar push FCM dari dokumen ni.
  async function hantarNotifikasiResetTarikh(uid, { kategori, jenisPakej = "", mesej }) {
    try {
      await addDoc(collection(db, "students", uid, "notifikasi"), {
        jenis: "RESET_TARIKH",
        kategori,    // "CERAMAH" | "UJIAN_KOMPUTER" | "LATIHAN_MEMANDU" | "SEMUA"
        jenisPakej,  // "MOTO" | "KERETA" | ""
        mesej,
        dibaca: false,
        dicipta: serverTimestamp()
      });
    } catch (err) {
      console.error("Gagal hantar notifikasi reset tarikh:", err);
    }
  }

  async function tandaTakHadirCeramah(uid, kunci = "ceramah") {
    const p = senaraiPelajar.find(x => x.uid === uid);
    const c = p ? p[kunci] : null;
    if (!c || !c.tarikh) return;
    const labelJenis = teksJenis(jenisDariKunci(kunci));
    const { tarikh, masa } = c;

    // TAMBAHAN: snapshot UK dulu (sebelum reset) — ceramah tak hadir = UK sedia ada pun kena reset sekali.
    const adaUkSediaAda = !!(p.ujianKomputer && p.ujianKomputer.tarikh);
    const ukTarikhLama = adaUkSediaAda ? p.ujianKomputer.tarikh : null;
    const ukSesiLama = adaUkSediaAda ? (p.ujianKomputer.sesi || "-") : null;
    const amaranUk = adaUkSediaAda
      ? `\n\nTarikh Ujian Komputer (${ukTarikhLama}, ${ukSesiLama}) yg sedia ada JUGA akan direset sekali (dikira batal), sbb Ujian Komputer tak sah tanpa Ceramah disahkan hadir dulu.`
      : "";

    if (!confirm(`Tandakan ${p.nama || uid} TAK HADIR Ceramah Undang-Undang${labelJenis ? " (" + labelJenis + ")" : ""} (${tarikh}, ${masa || "-"})?\n\nSlot ni akan dibebaskan, dan pelajar akan dapat notifikasi dalam app utk pilih tarikh baru.${amaranUk}`)) return;
    try {
      await _resetTarikhCeramahTanpaKonfirmasi(uid, kunci);
      await hantarNotifikasiTakHadir(uid, {
        kategori: "CERAMAH",
        jenisPakej: jenisDariKunci(kunci),
        mesej: `Anda ditandakan TAK HADIR untuk Ceramah Undang-Undang${labelJenis ? " (" + labelJenis + ")" : ""} pada ${tarikh}. Sila pilih tarikh baru.`
      });

      let mesejToast = "Pelajar ditanda TAK HADIR. Notifikasi dihantar — pelajar perlu pilih tarikh baru dari app.";

      // TAMBAHAN: cascade reset UK (tak throw kalau gagal — ceramah dah ok, admin boleh reset UK manual)
      if (adaUkSediaAda) {
        try {
          await _resetTarikhUjianKomputerTanpaKonfirmasi(uid);
          await hantarNotifikasiTakHadir(uid, {
            kategori: "UJIAN_KOMPUTER",
            mesej: `Tarikh Ujian Komputer anda (${ukTarikhLama}) turut dibatalkan kerana Ceramah Undang-Undang${labelJenis ? " (" + labelJenis + ")" : ""} ditandakan TAK HADIR. Sila pilih tarikh baru untuk Ujian Komputer juga.`
          });
          mesejToast += " Tarikh Ujian Komputer turut direset (ikutsertaan ceramah).";
        } catch (errUk) {
          console.error("Gagal cascade reset UK selepas tak hadir ceramah:", errUk);
          mesejToast += " (AMARAN: gagal auto-reset tarikh Ujian Komputer — sila reset manual.)";
        }
      }

      tunjukToast(mesejToast, "success");
    } catch (err) {
      tunjukToast("Gagal tanda tak hadir: " + err.message, "error");
    }
  }

  async function tandaTakHadirUK(uid) {
    const p = senaraiPelajar.find(x => x.uid === uid);
    if (!p || !p.ujianKomputer || !p.ujianKomputer.tarikh) return;
    const { tarikh, sesi } = p.ujianKomputer;
    if (!confirm(`Tandakan ${p.nama || uid} TAK HADIR Ujian Komputer (${tarikh}, ${sesi || "-"})?\n\nSlot ni akan dibebaskan, dan pelajar akan dapat notifikasi dalam app utk pilih tarikh baru.`)) return;
    try {
      await _resetTarikhUjianKomputerTanpaKonfirmasi(uid);
      await hantarNotifikasiTakHadir(uid, {
        kategori: "UJIAN_KOMPUTER",
        mesej: `Anda ditandakan TAK HADIR untuk Ujian Komputer pada ${tarikh}. Sila pilih tarikh baru.`
      });
      tunjukToast("Pelajar ditanda TAK HADIR. Notifikasi dihantar — pelajar perlu pilih tarikh baru dari app.", "success");
    } catch (err) {
      tunjukToast("Gagal tanda tak hadir: " + err.message, "error");
    }
  }

  async function tandaTakHadirSesiLatihan(uid, index, kunci) {
    kunci = _normKunciLatihan(kunci);
    const p = senaraiPelajar.find(x => x.uid === uid);
    const lp = p ? p[kunci] : null;
    const sesi = lp && lp.senaraiSesi ? lp.senaraiSesi[index] : null;
    if (!sesi || !sesi.tarikh) return;
    const labelJenis = perluLabelJenis(p) ? ` [${KOLEKSI_LATIHAN[kunci].label}]` : "";
    if (!confirm(`Tandakan ${p.nama || uid} TAK HADIR Sesi ${index + 1}${sesi.sesi ? " — " + sesi.sesi : ""}${labelJenis} (${sesi.tarikh})?\n\nSlot ni akan dibebaskan, dan pelajar akan dapat notifikasi dalam app utk pilih tarikh baru.`)) return;
    try {
      await _resetSatuSesiLatihanTanpaKonfirmasi(uid, index, kunci);
      await hantarNotifikasiTakHadir(uid, {
        kategori: "LATIHAN_MEMANDU",
        jenisPakej: KOLEKSI_LATIHAN[kunci].jenis,
        mesej: `Anda ditandakan TAK HADIR untuk Sesi ${index + 1} Latihan Praktikal${labelJenis} pada ${sesi.tarikh}. Sila pilih tarikh baru.`
      });
      tunjukToast(`Sesi ${index + 1} ditanda TAK HADIR. Notifikasi dihantar — pelajar perlu pilih tarikh baru dari app.`, "success");
    } catch (err) {
      tunjukToast("Gagal tanda tak hadir: " + err.message, "error");
    }
  }

  async function tandaTakHadirQtiLatihan(uid, kunci) {
    kunci = _normKunciLatihan(kunci);
    const p = senaraiPelajar.find(x => x.uid === uid);
    const lp = p ? p[kunci] : null;
    if (!lp || !lp.qti || !lp.qti.tarikh) return;
    const labelJenis = perluLabelJenis(p) ? ` [${KOLEKSI_LATIHAN[kunci].label}]` : "";
    if (!confirm(`Tandakan ${p.nama || uid} TAK HADIR sesi QTI${labelJenis} (${lp.qti.tarikh})?\n\nSlot ni akan dibebaskan, dan pelajar akan dapat notifikasi dalam app utk pilih tarikh baru.`)) return;
    try {
      await _resetQtiLatihanTanpaKonfirmasi(uid, kunci);
      await hantarNotifikasiTakHadir(uid, {
        kategori: "LATIHAN_MEMANDU",
        jenisPakej: KOLEKSI_LATIHAN[kunci].jenis,
        mesej: `Anda ditandakan TAK HADIR untuk sesi QTI${labelJenis} pada ${lp.qti.tarikh}. Sila pilih tarikh baru.`
      });
      tunjukToast("QTI ditanda TAK HADIR. Notifikasi dihantar — pelajar perlu pilih tarikh baru dari app.", "success");
    } catch (err) {
      tunjukToast("Gagal tanda tak hadir: " + err.message, "error");
    }
  }

  // ============ MODAL RESET TARIKH (3 pilihan) ============

  function bukaModalReset(uid) {
    const p = senaraiPelajar.find(x => x.uid === uid);
    if (!p) return;

    modalNamaPelajar.textContent = `${p.nama || uid} — pilih jadual nak direset:`;

    const adaUK = !!(p.ujianKomputer && p.ujianKomputer.tarikh);

    // KEMASKINI (2 pakej): satu butang PER ceramah (Moto/Kereta) & PER latihan (Moto/Kereta)
    const entriCeramah = senaraiCeramahPelajar(p);
    const paparCeramah = entriCeramah.length ? entriCeramah : [{ kunci: "ceramah", label: "", data: {} }];
    const htmlCeramah = paparCeramah.map(c => {
      const ada = !!(c.data && c.data.tarikh);
      return `
      <button class="pilihan-reset" data-reset-ceramah="${c.kunci}" ${ada ? "" : "disabled"}>
        Ceramah Undang-Undang${c.label ? " — " + c.label : ""}
        <span class="sub">${ada ? `${c.data.tarikh} — ${c.data.masa || ""}` : "Tiada jadual"}</span>
      </button>`;
    }).join("");

    const entriLatihan = senaraiLatihanPelajar(p);
    const paparLatihan = entriLatihan.length ? entriLatihan : [{ kunci: KUNCI_LATIHAN_MOTO, label: "Moto", lp: null }];
    const perluLabel = perluLabelJenis(p);
    const htmlLatihan = paparLatihan.map(e => {
      const ada = !!(e.lp && e.lp.senaraiSesi && e.lp.senaraiSesi.length > 0);
      return `
      <button class="pilihan-reset" data-reset-latihan="${e.kunci}" ${ada ? "" : "disabled"}>
        Latihan Praktikal (${perluLabel ? (e.kunci === KUNCI_LATIHAN_KERETA ? "Kereta" : "Motosikal") : "Motosikal"})
        <span class="sub">${ada ? `${e.lp.senaraiSesi.length} sesi + QTI dijadualkan` : "Tiada jadual"}</span>
      </button>`;
    }).join("");

    modalPilihanWrap.innerHTML = `
      ${htmlCeramah}
      <button class="pilihan-reset" id="pilUK" ${adaUK ? "" : "disabled"}>
        Ujian Komputer
        <span class="sub">${adaUK ? `${p.ujianKomputer.tarikh} — ${p.ujianKomputer.sesi || ""}` : "Tiada jadual"}</span>
      </button>
      ${htmlLatihan}
    `;

    modalPilihanWrap.querySelectorAll("[data-reset-ceramah]:not([disabled])").forEach(btn => {
      btn.addEventListener("click", () => { tutupModal(); resetTarikhCeramah(uid, btn.dataset.resetCeramah); });
    });
    if (adaUK) document.getElementById("pilUK").addEventListener("click", () => { tutupModal(); resetTarikhUjianKomputer(uid); });
    modalPilihanWrap.querySelectorAll("[data-reset-latihan]:not([disabled])").forEach(btn => {
      btn.addEventListener("click", () => bukaSubModalLatihan(uid, btn.dataset.resetLatihan));
    });

    modalOverlay.style.display = "flex";
  }

  // ---------- TAMBAHAN: sub-modal Latihan Praktikal — reset SEMUA atau SATU sesi/QTI sahaja ----------
  function bukaSubModalLatihan(uid, kunci = KUNCI_LATIHAN_MOTO) {
    kunci = _normKunciLatihan(kunci);
    const p = senaraiPelajar.find(x => x.uid === uid);
    if (!p || !p[kunci] || !p[kunci].senaraiSesi) return;
    const lp = p[kunci];
    const adaQti = !!(lp.qti && lp.qti.tarikh);
    const tajukJenis = perluLabelJenis(p) ? ` (${KOLEKSI_LATIHAN[kunci].label})` : "";

    modalNamaPelajar.textContent = `${p.nama || uid} — reset SEMUA jadual${tajukJenis} atau satu sesi sahaja?`;

    let html = `<button type="button" class="btn-kembali-modal" id="btnKembaliUtamaLatihan">← Kembali</button>`;
    html += `<div id="pilihanSubLatihanWrap">`;
    html += `
      <button class="pilihan-reset" id="pilResetSemuaLatihan">
        Reset SEMUA${adaQti ? " (sesi + QTI)" : " sesi"}${tajukJenis}
        <span class="sub">${lp.senaraiSesi.length} sesi${adaQti ? " + 1 QTI" : ""} akan dibebaskan semua</span>
      </button>`;
    lp.senaraiSesi.forEach((s, index) => {
      const adaJadual = !!(s && s.tarikh);
      html += `
        <button class="pilihan-reset" id="pilResetSesi${index}" ${adaJadual ? "" : "disabled"}>
          Reset Sesi ${index + 1}${s && s.sesi ? " — " + s.sesi : ""} sahaja
          <span class="sub">${adaJadual ? s.tarikh : "Tiada jadual"}</span>
        </button>`;
    });
    if (adaQti) {
      html += `
        <button class="pilihan-reset" id="pilResetQti">
          Reset QTI sahaja${kunci === KUNCI_LATIHAN_MOTO ? " (Auto)" : ""}
          <span class="sub">${lp.qti.tarikh} — ${formatMasaQtiTeks(lp.qti.masa)}</span>
        </button>`;
    }
    html += `</div>`;

    modalPilihanWrap.innerHTML = html;

    document.getElementById("btnKembaliUtamaLatihan").addEventListener("click", () => bukaModalReset(uid));
    document.getElementById("pilResetSemuaLatihan").addEventListener("click", () => { tutupModal(); resetTarikhLatihanPraktikal(uid, kunci); });
    lp.senaraiSesi.forEach((s, index) => {
      const btnSesi = document.getElementById(`pilResetSesi${index}`);
      if (btnSesi && s && s.tarikh) {
        btnSesi.addEventListener("click", () => { tutupModal(); resetSatuSesiLatihan(uid, index, kunci); });
      }
    });
    if (adaQti) {
      document.getElementById("pilResetQti").addEventListener("click", () => { tutupModal(); resetQtiLatihan(uid, kunci); });
    }
  }

  function tutupModal() {
    modalOverlay.style.display = "none";
    modalPilihanWrap.innerHTML = "";
  }

  btnTutupModal.addEventListener("click", tutupModal);
  modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) tutupModal(); });

  // TAMBAHAN: wiring modal Kalendar
  btnBukaKalendar.addEventListener("click", bukaModalKalendar);
  if (btnBukaKalendarDashboard) btnBukaKalendarDashboard.addEventListener("click", bukaModalKalendar);
  if (btnBukaKalendarHeatmap) btnBukaKalendarHeatmap.addEventListener("click", bukaModalKalendar);
  if (btnTambahPakej) btnTambahPakej.addEventListener("click", tambahPakejBaru);
  btnTutupModalKalendar.addEventListener("click", tutupModalKalendar);
  modalKalenderOverlay.addEventListener("click", (e) => { if (e.target === modalKalenderOverlay) tutupModalKalendar(); });

  // ======================================================================
  // TAMBAHAN: modal "Maklumat Lengkap" — papar nama/IC/no.tel/alamat/pakej/
  // emel (kalau ada) seorang pelajar, guna balik data YANG SAMA dari
  // senaraiPelajar (TIADA fetch baru diperlukan, kecuali field `emel` yang
  // kini turut disimpan bila pelajar didaftar dari kaunter — lihat
  // daftarPelajarKaunter() di atas; pelajar daftar sendiri dari app mungkin
  // tiada field ni, papar "-" kalau takde). Dikongsi oleh butang kecil
  // sebelah nama kat Senarai Pelajar (baris_htmlKepalaKad) & Pelajar
  // Didaftar Kaunter (kkBinaHtmlKad).
  // ======================================================================
  function bukaModalMaklumat(uid) {
    const p = senaraiPelajar.find(x => x.uid === uid);
    if (!p) return;

    const namaPakej = (p.pakejLesen && p.pakejLesen.nama) ? p.pakejLesen.nama : "Belum pilih pakej";
    const hargaPakej = (p.pakejLesen && p.pakejLesen.harga) ? p.pakejLesen.harga : "";

    modalMaklumatWrap.innerHTML = `
      <div class="ml-baris"><span class="label">Nama Penuh</span><span class="nilai">${p.nama || "-"}</span></div>
      <div class="ml-baris"><span class="label">No. Kad Pengenalan</span><span class="nilai">${p.noKP || "-"}</span></div>
      <div class="ml-baris"><span class="label">No. Telefon</span><span class="nilai">${p.noTel || "-"}</span></div>
      <div class="ml-baris"><span class="label">Alamat</span><span class="nilai">${p.alamat || "-"}</span></div>
      <div class="ml-baris"><span class="label">Pakej Lesen</span><span class="nilai">${(p.pakejLesen && p.pakejLesen.nama) ? htmlSenaraiPakej(p) : "Belum pilih pakej"}</span></div>
      ${p.pembayaran && p.pembayaran.jumlah ? `<div class="ml-baris"><span class="label">Jumlah Bayaran${adaDuaPakej(p) ? " (Gabungan)" : ""}</span><span class="nilai">${p.pembayaran.jumlah}</span></div>` : ""}
      <div class="ml-baris"><span class="label">Emel Log Masuk</span><span class="nilai">${p.emel || "-"}</span></div>
      <div style="text-align:center;">
        <span class="ml-tag-sumber"><i class="fa-solid ${p.daftarKaunter ? "fa-user-plus" : "fa-mobile-screen"}"></i> ${p.daftarKaunter ? "Didaftarkan oleh Admin (Kaunter)" : "Daftar Sendiri (App)"}</span>
      </div>
    `;
    modalMaklumatOverlay.style.display = "flex";
  }

  function tutupModalMaklumat() {
    modalMaklumatOverlay.style.display = "none";
    modalMaklumatWrap.innerHTML = "";
  }

  btnTutupModalMaklumat.addEventListener("click", tutupModalMaklumat);
  modalMaklumatOverlay.addEventListener("click", (e) => { if (e.target === modalMaklumatOverlay) tutupModalMaklumat(); });

  // ======================================================================
  // KONTRAK "RESET" (JANGAN LANGGAR bila edit/tambah function reset baru):
  //
  //   1. Reset HANYA kosongkan field TARIKH berikut (guna deleteField(),
  //      dot-path spesifik — TAK PERNAH overwrite whole document):
  //        ceramah / ceramahMoto / ceramahKereta
  //        ujianKomputer
  //        latihanPraktikalMoto / latihanPraktikalKereta
  //
  //   2. TAK PERNAH sentuh (walaupun pelajar ada/tiada pembayaran SAH):
  //        pakejLesen, pembayaran, pengecualianTeori (kalau field ni wujud
  //        dalam data pelajar — admin dashboard ni sendiri tak render field
  //        tu lagi, tapi reset tetap selamat sebab setiap write guna
  //        dot-path/field spesifik, bukan replace whole doc), nama, noKP,
  //        noTel, alamat, emel, daftarKaunter, tarikhDaftar, dan field
  //        profil lain.
  //
  //   3. 4 kategori reset yang disokong (semua guna core "TanpaKonfirmasi"
  //      yang sama supaya logic slot-freeing konsisten):
  //        - "reset ceramah sahaja"  -> resetTarikhCeramah(uid, kunci)
  //        - "reset ujian sahaja"    -> resetTarikhUjianKomputer(uid)
  //        - "reset latihan sahaja"  -> resetTarikhLatihanPraktikal(uid, kunci)
  //                                     (atau resetSatuSesiLatihan/resetQtiLatihan
  //                                      utk reset sebahagian sahaja)
  //        - "reset semua tarikh"    -> resetSemuaJadual(uid, btnEl)
  //
  //   4. Setiap slot count (ceramah_slots, ujian_komputer_slots,
  //      latihan_moto_slots / latihan_kereta_slots, latihan_moto_qti_slots /
  //      latihan_kereta_qti_slots) dikurangkan guna Math.max(0, count - 1) —
  //      TAK BOLEH jadi negatif.
  //
  //   KALAU nak tambah field baru pelajar (contoh pengecualianTeori) kat
  //   admin dashboard ni kemudian hari: janji di atas AUTOMATIK terjamin
  //   selagi write Firestore guna updateDoc/transaction.update() dgn
  //   field-path (bukan setDoc tanpa merge / spread objek penuh), sebab
  //   Firestore cuma tulis path yg diberi, field lain kekal.
  // ======================================================================

  // ---------- Reset: Ceramah ----------
  //
  // KEMASKINI: format docId ceramah_slots DAH DISAHKAN dari Firebase Console
  // — BERSARANG (ceramah_slots/{hari}/{bulan}/{tahun}), BUKAN docId flat
  // macam yang diassume dulu. Guna balik slotRefCeramah() (definisi di atas,
  // dekat daftarPelajarKaunter()) supaya SATU-SATUNYA tempat format ni
  // ditulis, elak tersasar lagi.
  //
  // Dipisahkan jadi 2 function: yang ada "confirm" (dipanggil bila admin
  // tekan butang manual dalam modal), dan versi "TanpaKonfirmasi" (core logic
  // sebenar) yang dikongsi dengan flow approveDanReset() DAN resetSemuaJadual()
  // supaya TAK ada confirm() berganda bila proses borong.
  //
  // KEMASKINI (2 PAKEJ): `kunci` = "ceramah" (lalai) | "ceramahMoto" | "ceramahKereta".
  // Cuma field ceramah YANG BERKAITAN dikosongkan (dot-path) — ceramah jenis
  // lain & field lain pelajar TAK disentuh. ceramah_slots dikongsi (satu
  // koleksi, id tarikh) jadi count dikurangkan 1 pada tarikh ceramah tu.
  async function resetTarikhCeramah(uid, kunci = "ceramah") {
    const p = senaraiPelajar.find(x => x.uid === uid);
    const c = p ? p[kunci] : null;
    if (!c || !c.tarikh) return;

    const { tarikh, masa } = c;
    const labelJenis = teksJenis(jenisDariKunci(kunci));
    if (!confirm(`Reset tarikh Ceramah Undang-Undang${labelJenis ? " (" + labelJenis + ")" : ""} untuk ${p.nama || uid}?\n\nTarikh sekarang: ${tarikh} (${masa || "-"})\n\nSlot ni akan dibebaskan, dan pelajar ni WAJIB pilih tarikh baru dari app.`)) return;

    try {
      await _resetTarikhCeramahTanpaKonfirmasi(uid, kunci);
      hantarNotifikasiResetTarikh(uid, { kategori: "CERAMAH", jenisPakej: jenisDariKunci(kunci),
        mesej: `Tarikh Ceramah Undang-Undang${labelJenis ? " (" + labelJenis + ")" : ""} anda telah direset oleh admin. Sila pilih tarikh baharu di app.` });
      tunjukToast("Tarikh Ceramah dah direset. Pelajar boleh pilih tarikh baru dari app.", "success");
    } catch (err) {
      tunjukToast("Gagal reset: " + err.message + "\n\n(Semak Firestore Rules & format docId ceramah_slots.)", "error");
    }
  }

  async function _resetTarikhCeramahTanpaKonfirmasi(uid, kunci = "ceramah") {
    kunci = kunci || "ceramah";
    const p = senaraiPelajar.find(x => x.uid === uid);
    const c = p ? p[kunci] : null;
    if (!c || !c.tarikh) throw new Error("Tiada jadual Ceramah untuk pelajar ni");

    const { tarikh } = c;
    const slotRef = slotRefCeramah(tarikh);
    const studentRef = doc(db, "students", uid);

    await runTransaction(db, async (transaction) => {
      const slotSnap = await transaction.get(slotRef);
      if (slotSnap.exists()) {
        const countSemasa = slotSnap.data().count || 0;
        transaction.update(slotRef, { count: Math.max(0, countSemasa - 1) });
      }
      transaction.update(studentRef, {
        [`${kunci}.tarikh`]: deleteField(),
        [`${kunci}.masa`]: deleteField(),
        [`${kunci}.status`]: deleteField()
      });
    });

    // TAMBAHAN (FIX): tutup mana-mana permintaan "MENUNGGU" sepadan (kategori
    // CERAMAH + jenis yg sama) walaupun reset ni dipanggil terus dari butang
    // "↺ Reset Tarikh" (bukan dari kotak kuning "Approve & Reset").
    await tutupPermintaanTukarTarikhSepadan(uid, "CERAMAH", jenisDariKunci(kunci));
  }

  // ---------- Reset: Ujian Komputer ----------
  // (sama macam sebelum ni — free-kan slot count, kosongkan field student)
  async function resetTarikhUjianKomputer(uid) {
    const p = senaraiPelajar.find(x => x.uid === uid);
    if (!p || !p.ujianKomputer || !p.ujianKomputer.tarikh) return;

    const { tarikh, sesi } = p.ujianKomputer;
    if (!confirm(`Reset tarikh Ujian Komputer untuk ${p.nama || uid}?\n\nTarikh sekarang: ${tarikh} (${sesi || "-"})\n\nSlot ni akan dibebaskan untuk pelajar lain, dan pelajar ni WAJIB pilih tarikh baru dari app.`)) return;

    try {
      await _resetTarikhUjianKomputerTanpaKonfirmasi(uid);
      hantarNotifikasiResetTarikh(uid, { kategori: "UJIAN_KOMPUTER",
        mesej: "Tarikh Ujian Komputer anda telah direset oleh admin. Sila pilih tarikh baharu di app." });
      tunjukToast("Tarikh Ujian Komputer dah direset. Pelajar boleh pilih tarikh baru dari app.", "success");
    } catch (err) {
      tunjukToast("Gagal reset: " + err.message + "\n\n(Semak sama ada Firestore Rules bagi admin akses tulis kat collection ujian_komputer_slots, dan sama ada docId slot format tu betul.)", "error");
    }
  }

  async function _resetTarikhUjianKomputerTanpaKonfirmasi(uid) {
    const p = senaraiPelajar.find(x => x.uid === uid);
    if (!p || !p.ujianKomputer || !p.ujianKomputer.tarikh) throw new Error("Tiada jadual Ujian Komputer untuk pelajar ni");

    const { tarikh, sesi } = p.ujianKomputer;
    const slotRef = slotRefUK(tarikh, sesi);
    const studentRef = doc(db, "students", uid);

    await runTransaction(db, async (transaction) => {
      const slotSnap = await transaction.get(slotRef);
      if (slotSnap.exists()) {
        const countSemasa = slotSnap.data().count || 0;
        transaction.update(slotRef, { count: Math.max(0, countSemasa - 1) });
      }
      transaction.update(studentRef, {
        "ujianKomputer.tarikh": deleteField(),
        "ujianKomputer.sesi": deleteField(),
        "ujianKomputer.status": deleteField()
      });
    });

    // TAMBAHAN (FIX): tutup mana-mana permintaan "MENUNGGU" sepadan (kategori
    // UJIAN_KOMPUTER), walau reset ni dipanggil dari butang biasa.
    await tutupPermintaanTukarTarikhSepadan(uid, "UJIAN_KOMPUTER");
  }

  // ---------- Reset: Latihan Praktikal (Motosikal) — SEMUA sesi + QTI ----------
  //
  // `latihanPraktikalMoto.senaraiSesi` ada BEBERAPA sesi (7 biasanya) — kena
  // free-kan count utk SETIAP sesi dalam latihan_moto_slots, PLUS 1 lagi utk
  // QTI dalam latihan_moto_qti_slots. Lepas tu padam WHOLE field
  // latihanPraktikalMoto dari student (bukan setengah-setengah), sebab kalau
  // reset separuh, logic "7 sesi + 1 QTI mesti lengkap" kat app boleh pincang.
  //
  // KEMASKINI: docId latihan_moto_slots DAH DISAHKAN dari Firebase Console —
  // "dd-MM-yyyy_sesiN" (sengkang, huruf kecil), guna slotRefLatihan().
  //
  // KEMASKINI: docId latihan_moto_qti_slots pun DAH DISAHKAN —
  // "dd-MM-yyyy_qti_HHMM" (guna slotRefQti(), perlukan qti.masa yg disimpan
  // skang sejak QTI jadi auto — lihat kkTetapkanLatihanSesi()).
  //
  // KEMASKINI (2 PAKEJ): `kunci` = "latihanPraktikalMoto" (lalai) | "latihanPraktikalKereta".
  // Slot dibebaskan pada koleksi YANG BETUL (moto: latihan_moto_slots /
  // latihan_moto_qti_slots; kereta: latihan_kereta_slots / latihan_kereta_qti_slots).
  // Hanya field latihan jenis tu yg dipadam — latihan jenis lain TAK disentuh.
  async function resetTarikhLatihanPraktikal(uid, kunci = KUNCI_LATIHAN_MOTO) {
    kunci = _normKunciLatihan(kunci);
    const p = senaraiPelajar.find(x => x.uid === uid);
    const lp = p ? p[kunci] : null;
    if (!lp || !lp.senaraiSesi || lp.senaraiSesi.length === 0) return;

    const jumlahSesi = lp.senaraiSesi.length;
    const adaQti = !!(lp.qti && lp.qti.tarikh);
    const labelJenis = KOLEKSI_LATIHAN[kunci].label === "Kereta" ? "Kereta" : "Motosikal";

    if (!confirm(`Reset SEMUA jadual Latihan Praktikal (${labelJenis}) untuk ${p.nama || uid}?\n\n${jumlahSesi} sesi${adaQti ? " + 1 QTI" : ""} akan dibebaskan.\n\nPelajar ni WAJIB book semula semua sesi dari app.`)) return;

    try {
      await _resetTarikhLatihanPraktikalTanpaKonfirmasi(uid, kunci);
      hantarNotifikasiResetTarikh(uid, { kategori: "LATIHAN_MEMANDU",
        jenisPakej: kunci === KUNCI_LATIHAN_KERETA ? "KERETA" : "MOTO",
        mesej: `Jadual Latihan Memandu (${labelJenis}) anda telah direset oleh admin. Sila pilih tarikh baharu di app.` });
      tunjukToast("Jadual Latihan Praktikal dah direset. Pelajar boleh book semula dari app.", "success");
    } catch (err) {
      tunjukToast("Gagal reset: " + err.message + `\n\n(Semak Firestore Rules utk ${KOLEKSI_LATIHAN[kunci].sesi} & ${KOLEKSI_LATIHAN[kunci].qti}, dan confirm format docId betul.)`, "error");
    }
  }

  async function _resetTarikhLatihanPraktikalTanpaKonfirmasi(uid, kunci = KUNCI_LATIHAN_MOTO) {
    kunci = _normKunciLatihan(kunci);
    const p = senaraiPelajar.find(x => x.uid === uid);
    const lp = p ? p[kunci] : null;
    if (!lp || !lp.senaraiSesi || lp.senaraiSesi.length === 0) {
      throw new Error("Tiada jadual Latihan Praktikal untuk pelajar ni");
    }

    const adaQti = !!(lp.qti && lp.qti.tarikh);
    const studentRef = doc(db, "students", uid);

    await runTransaction(db, async (transaction) => {
      // --- baca semua slot dulu (Firestore transaction: semua get() sebelum write) ---
      // cuma proses sesi yg DAH ada tarikh+sesi (bukan {} kosong)
      const sesiSudahDitetapkan = lp.senaraiSesi.filter(s => s && s.tarikh && s.sesi);
      const slotSesiRefs = sesiSudahDitetapkan.map(s => slotRefLatihan(s.tarikh, s.sesi, kunci));
      const slotSesiSnaps = await Promise.all(slotSesiRefs.map(ref => transaction.get(ref)));

      let slotQtiRef = null;
      let slotQtiSnap = null;
      if (adaQti && lp.qti.masa) {
        slotQtiRef = slotRefQti(lp.qti.tarikh, lp.qti.masa, kunci);
        slotQtiSnap = await transaction.get(slotQtiRef);
      }

      // --- lepas tu baru write ---
      slotSesiSnaps.forEach((snap, i) => {
        if (snap.exists()) {
          const countSemasa = snap.data().count || 0;
          transaction.update(slotSesiRefs[i], { count: Math.max(0, countSemasa - 1) });
        }
      });

      if (adaQti && slotQtiSnap && slotQtiSnap.exists()) {
        const countSemasa = slotQtiSnap.data().count || 0;
        transaction.update(slotQtiRef, { count: Math.max(0, countSemasa - 1) });
      }

      transaction.update(studentRef, {
        [kunci]: deleteField()
      });
    });

    // TAMBAHAN (FIX): tutup permintaan "MENUNGGU" sepadan (LATIHAN_MEMANDU + jenis sama)
    await tutupPermintaanTukarTarikhSepadan(uid, "LATIHAN_MEMANDU", KOLEKSI_LATIHAN[kunci].jenis);
  }

  // ---------- TAMBAHAN: Reset SATU sesi Latihan Praktikal sahaja ----------
  //
  // Guna bila pelajar cuma perlu ubah SATU sesi (contoh: sesi 3 kena tukar
  // tarikh sebab cuti/cancel), tak payah reset semua 7 sesi + QTI dia. Ni
  // JUGA function yang dipanggil oleh flow "Approve & Reset" kotak kuning
  // bila kategori permintaan = LATIHAN_MEMANDU (sebab student flow
  // "Minta Tukar Tarikh" mohon SATU sesi je, bukan semua). Free-kan count
  // slot utk sesi tu SAHAJA, lepas tu kosongkan elemen array pada index tu
  // je (jadi {} — bukan splice/buang, supaya nombor "Sesi N" pelajar lain
  // dalam array tak tergeser).
  //
  // KEMASKINI: guna slotRefLatihan() (format DAH DISAHKAN — sama macam UK).
  async function resetSatuSesiLatihan(uid, index, kunci = KUNCI_LATIHAN_MOTO) {
    kunci = _normKunciLatihan(kunci);
    const p = senaraiPelajar.find(x => x.uid === uid);
    const lp = p ? p[kunci] : null;
    if (!lp || !lp.senaraiSesi) return;

    const sesi = lp.senaraiSesi[index];
    if (!sesi || !sesi.tarikh) return;

    // Sesi 8 (index 7) KAUNTER (Moto) ada QTI auto terikat — reset sesi 8 mesti free QTI jugak.
    // Peraturan ni KEKAL utk Moto sahaja (aliran kaunter lama); Kereta tiada ikatan ni.
    const iniSesiLapan = (kunci === KUNCI_LATIHAN_MOTO && index === 7);
    const adaQtiTerjejas = iniSesiLapan && !!(lp.qti && lp.qti.tarikh);
    const labelJenis = perluLabelJenis(p) ? ` [${KOLEKSI_LATIHAN[kunci].label}]` : "";
    if (!confirm(`Reset Sesi ${index + 1}${sesi.sesi ? " — " + sesi.sesi : ""}${labelJenis} untuk ${p.nama || uid}?\n\nTarikh sekarang: ${sesi.tarikh} (${sesi.sesi || "-"})\n\nSlot ni akan dibebaskan${adaQtiTerjejas ? " (sekali dgn QTI auto yg terikat dgn sesi ni)" : ""}, dan pelajar ni WAJIB pilih tarikh baru untuk SESI NI SAHAJA dari app.`)) return;

    try {
      await _resetSatuSesiLatihanTanpaKonfirmasi(uid, index, kunci);
      hantarNotifikasiResetTarikh(uid, { kategori: "LATIHAN_MEMANDU",
        jenisPakej: kunci === KUNCI_LATIHAN_KERETA ? "KERETA" : "MOTO",
        mesej: `Tarikh Sesi ${index + 1} latihan memandu anda telah direset oleh admin. Sila pilih tarikh baharu di app.` });
      tunjukToast(`Sesi ${index + 1} dah direset. Pelajar boleh pilih tarikh baru untuk sesi ni dari app.`, "success");
    } catch (err) {
      tunjukToast("Gagal reset sesi: " + err.message + `\n\n(Semak Firestore Rules & format docId ${KOLEKSI_LATIHAN[kunci].sesi}.)`, "error");
    }
  }

  async function _resetSatuSesiLatihanTanpaKonfirmasi(uid, index, kunci = KUNCI_LATIHAN_MOTO) {
    kunci = _normKunciLatihan(kunci);
    const p = senaraiPelajar.find(x => x.uid === uid);
    const lp = p ? p[kunci] : null;
    if (!lp || !lp.senaraiSesi) {
      throw new Error("Tiada data Latihan Praktikal untuk pelajar ni");
    }

    const sesi = lp.senaraiSesi[index];
    if (!sesi || !sesi.tarikh) throw new Error(`Sesi ${index + 1} tiada jadual untuk direset`);

    const slotRef = slotRefLatihan(sesi.tarikh, sesi.sesi, kunci);
    const studentRef = doc(db, "students", uid);
    const senaraiBaru = lp.senaraiSesi.map((s, i) => (i === index ? {} : s));

    // QTI auto terikat sesi ke-8 — Moto (kaunter) sahaja (lihat resetSatuSesiLatihan).
    const iniSesiLapan = (kunci === KUNCI_LATIHAN_MOTO && index === 7);
    const qtiTerjejas = iniSesiLapan && lp.qti && lp.qti.tarikh && lp.qti.masa ? lp.qti : null;

    await runTransaction(db, async (transaction) => {
      // --- baca dulu (semua get() sblm write) ---
      const slotSnap = await transaction.get(slotRef);
      let slotQtiRef = null, slotQtiSnap = null;
      if (qtiTerjejas) {
        slotQtiRef = slotRefQti(qtiTerjejas.tarikh, qtiTerjejas.masa, kunci);
        slotQtiSnap = await transaction.get(slotQtiRef);
      }

      // --- lepas tu baru write ---
      if (slotSnap.exists()) {
        const countSemasa = slotSnap.data().count || 0;
        transaction.update(slotRef, { count: Math.max(0, countSemasa - 1) });
      }
      const kemaskini = { [`${kunci}.senaraiSesi`]: senaraiBaru };
      if (qtiTerjejas) {
        if (slotQtiSnap && slotQtiSnap.exists()) {
          const c = slotQtiSnap.data().count || 0;
          transaction.update(slotQtiRef, { count: Math.max(0, c - 1) });
        }
        kemaskini[`${kunci}.qti`] = deleteField();
      }
      // latihan tak lagi lengkap — buang penanda "SELESAI" (kalau ada)
      if (lp.status === "SELESAI") kemaskini[`${kunci}.status`] = deleteField();
      transaction.update(studentRef, kemaskini);
    });

    await tutupPermintaanTukarTarikhSepadan(uid, "LATIHAN_MEMANDU", KOLEKSI_LATIHAN[kunci].jenis);
  }

  // ---------- TAMBAHAN: Reset QTI sahaja ----------
  //
  // NOTA: QTI skang AUTO terikat dgn Sesi 8 (lihat kkTetapkanLatihanSesi())
  // — reset ni cuma free-kan SLOT & padam field qti tanpa sentuh Sesi 8
  // sendiri (jadi Sesi 8 & QTI boleh jadi "tak segerak" buat sementara).
  // QTI akan AUTO dijadualkan semula secara automatik bila admin
  // pilih/tukar tarikh Sesi 8 lagi sekali dari kaunter.
  async function resetQtiLatihan(uid, kunci = KUNCI_LATIHAN_MOTO) {
    kunci = _normKunciLatihan(kunci);
    const p = senaraiPelajar.find(x => x.uid === uid);
    const lp = p ? p[kunci] : null;
    if (!lp || !lp.qti || !lp.qti.tarikh) return;

    const qti = lp.qti;
    const labelJenis = perluLabelJenis(p) ? ` [${KOLEKSI_LATIHAN[kunci].label}]` : "";
    if (!confirm(`Reset tarikh QTI${labelJenis} untuk ${p.nama || uid}?\n\nTarikh sekarang: ${qti.tarikh} — ${formatMasaQtiTeks(qti.masa)}\n\nSlot ni akan dibebaskan. Pelajar WAJIB pilih/dijadualkan semula QTI.`)) return;

    try {
      await _resetQtiLatihanTanpaKonfirmasi(uid, kunci);
      hantarNotifikasiResetTarikh(uid, { kategori: "LATIHAN_MEMANDU",
        jenisPakej: kunci === KUNCI_LATIHAN_KERETA ? "KERETA" : "MOTO",
        mesej: "Tarikh QTI anda telah direset oleh admin. Sila semak jadual baharu di app." });
      tunjukToast("Tarikh QTI dah direset. Pelajar boleh pilih tarikh baru dari app.", "success");
    } catch (err) {
      tunjukToast("Gagal reset QTI: " + err.message + `\n\n(Semak Firestore Rules & format docId ${KOLEKSI_LATIHAN[kunci].qti}.)`, "error");
    }
  }

  // TAMBAHAN: dipisahkan drpd resetQtiLatihan() (pattern SAMA dgn fungsi
  // "_TanpaKonfirmasi" lain) supaya boleh dikongsi dgn tandaTakHadirQtiLatihan()
  // — DUA laluan (Reset biasa / Tak Hadir) sama-sama free slot + padam
  // field qti dgn CARA SAMA, beza cuma confirm-dialog & notifikasi tambahan.
  async function _resetQtiLatihanTanpaKonfirmasi(uid, kunci = KUNCI_LATIHAN_MOTO) {
    kunci = _normKunciLatihan(kunci);
    const p = senaraiPelajar.find(x => x.uid === uid);
    const lp = p ? p[kunci] : null;
    if (!lp || !lp.qti || !lp.qti.tarikh) throw new Error("Tiada jadual QTI untuk pelajar ni");

    const qti = lp.qti;
    const slotRef = qti.masa ? slotRefQti(qti.tarikh, qti.masa, kunci) : null;
    const studentRef = doc(db, "students", uid);

    await runTransaction(db, async (transaction) => {
      // slotRef boleh null utk data lama (qti tiada field masa) — skip free slot, padam field je.
      const slotSnap = slotRef ? await transaction.get(slotRef) : null;
      if (slotSnap && slotSnap.exists()) {
        const countSemasa = slotSnap.data().count || 0;
        transaction.update(slotRef, { count: Math.max(0, countSemasa - 1) });
      }
      const kemaskini = { [`${kunci}.qti`]: deleteField() };
      if (lp.status === "SELESAI") kemaskini[`${kunci}.status`] = deleteField();
      transaction.update(studentRef, kemaskini);
    });

    await tutupPermintaanTukarTarikhSepadan(uid, "LATIHAN_MEMANDU", KOLEKSI_LATIHAN[kunci].jenis);
  }

  // ---------- TAMBAHAN: Reset SEMUA jadual sekaligus (Ceramah + UK + Latihan Praktikal) ----------
  //
  // Butang "↺↺ Reset Semua" sebelah "↺ Reset Tarikh". Bukan buka modal pilih
  // satu-satu — terus reset SEMUA kategori yang pelajar ni ADA jadual (kalau
  // dia belum book UK lagi contoh, kategori tu automatik di-skip, TAK throw
  // error). Guna balik function "_TanpaKonfirmasi" yang sedia ada supaya
  // logic transaction/slot-freeing sama, cuma SATU confirm dialog untuk
  // semua (bukan 3 kali confirm berasingan).
  //
  // Setiap kategori dijalankan dalam try/catch berasingan supaya kalau satu
  // gagal (contoh Firestore Rules sekat latihan_moto_slots), yang lain masih
  // sempat berjaya — bukan all-or-nothing.
  async function resetSemuaJadual(uid, btnEl) {
    const p = senaraiPelajar.find(x => x.uid === uid);
    if (!p) return;

    // KEMASKINI (2 pakej): kumpul SEMUA ceramah (Moto/Kereta) & latihan (Moto/Kereta) yg ada jadual
    const ceramahUntukReset = senaraiCeramahPelajar(p).filter(c => c.data && c.data.tarikh);
    const latihanUntukReset = senaraiLatihanPelajar(p).filter(e => e.lp && e.lp.senaraiSesi && e.lp.senaraiSesi.length > 0);
    const adaCeramah = ceramahUntukReset.length > 0;
    const adaUK = !!(p.ujianKomputer && p.ujianKomputer.tarikh);
    const adaLatihan = latihanUntukReset.length > 0;
    const _lbl = (x) => (x.label && perluLabelJenis(p)) ? ` (${x.label})` : "";

    if (!adaCeramah && !adaUK && !adaLatihan) {
      tunjukToast(`${p.nama || uid} tiada apa-apa jadual untuk direset.`, "warning");
      return;
    }

    const senaraiNakDireset = [];
    ceramahUntukReset.forEach(c => senaraiNakDireset.push(`Ceramah Undang-Undang${_lbl(c)}`));
    if (adaUK) senaraiNakDireset.push("Ujian Komputer");
    latihanUntukReset.forEach(e => senaraiNakDireset.push(`Latihan Praktikal${_lbl(e)} (semua sesi + QTI)`));

    const teks = `Reset SEMUA jadual untuk ${p.nama || uid}?\n\n${senaraiNakDireset.map(s => "• " + s).join("\n")}\n\nSemua slot di atas akan dibebaskan, dan pelajar ni WAJIB pilih tarikh baru untuk SEMUA jadual di atas dari app.`;
    if (!confirm(teks)) return;

    // TAMBAHAN: disable butang semasa proses (boleh amik 1-3 saat sebab
    // sampai 3 transaction Firestore berturutan) — elak admin double-click
    // yang boleh sebabkan slot count ter-decrement dua kali (bug senyap,
    // tak throw error pun). Pattern sama macam approveDanReset().
    const teksAsalBtn = btnEl ? btnEl.textContent : null;
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.textContent = "Memproses...";
    }

    const kejayaan = [];
    const kegagalan = [];

    try {
      for (const c of ceramahUntukReset) {
        try {
          await _resetTarikhCeramahTanpaKonfirmasi(uid, c.kunci);
          kejayaan.push(`Ceramah Undang-Undang${_lbl(c)}`);
        } catch (err) {
          kegagalan.push(`Ceramah Undang-Undang${_lbl(c)} (${err.message})`);
        }
      }

      if (adaUK) {
        try {
          await _resetTarikhUjianKomputerTanpaKonfirmasi(uid);
          kejayaan.push("Ujian Komputer");
        } catch (err) {
          kegagalan.push(`Ujian Komputer (${err.message})`);
        }
      }

      for (const e of latihanUntukReset) {
        try {
          await _resetTarikhLatihanPraktikalTanpaKonfirmasi(uid, e.kunci);
          kejayaan.push(`Latihan Praktikal${_lbl(e)}`);
        } catch (err) {
          kegagalan.push(`Latihan Praktikal${_lbl(e)} (${err.message})`);
        }
      }

      let mesejAkhir = "";
      if (kejayaan.length > 0) mesejAkhir += `Berjaya direset: ${kejayaan.join(", ")}.`;
      if (kegagalan.length > 0) mesejAkhir += `${mesejAkhir ? "\n" : ""}Gagal direset: ${kegagalan.join(", ")}.`;
      if (kejayaan.length > 0) {
        hantarNotifikasiResetTarikh(uid, { kategori: "SEMUA",
          mesej: "Jadual anda telah direset oleh admin. Sila pilih tarikh baharu di app." });
      }
      tunjukToast(mesejAkhir, "info");
    } finally {
      // Nota: dalam keadaan normal, onSnapshot listener dah re-render tbody
      // (jadi btnEl ni dah tak wujud dalam DOM), so ni cuma jaga-jaga kalau
      // render belum sempat jalan (contoh semua kategori gagal serta-merta).
      if (btnEl && document.body.contains(btnEl)) {
        btnEl.disabled = false;
        btnEl.textContent = teksAsalBtn;
      }
    }
  }

  // ======================================================================
  // TAMBAHAN: KALENDAR — lihat senarai pelajar ikut tarikh (Ceramah/UK)
  // ======================================================================
  //
  // 3 langkah dalam SATU modal (#modalKalenderOverlay, berasingan dari modal
  // Reset Tarikh supaya dua flow ni tak clash sesama sendiri):
  //   Langkah 1: pilih tarikh dari kalendar (grid bulan, boleh next/prev bulan,
  //              titik oren dekat tarikh yang ada sekurang-kurangnya SATU
  //              jadual Ceramah/UK)
  //   Langkah 2: pilih kategori — Ceramah Undang-Undang / Ujian Komputer
  //              (sekali tunjuk berapa ramai pelajar dijadualkan)
  //   Langkah 3: senarai nama pelajar + status untuk kategori & tarikh tu
  //
  // NOTA: field `ceramah.tarikh` / `ujianKomputer.tarikh` (pada dokumen
  // pelajar) disimpan sebagai string format "dd/mm/yyyy" (contoh
  // "27/08/2026") — DAH DISAHKAN (bukan tekaan) dari data sebenar (medan
  // tarikhAsal dlm permintaanTukarTarikh pun guna format sama). Function
  // formatTarikhKalendar() di bawah generate string dlm format SAMA supaya
  // boleh padan terus (===) dgn field tu. NOTA: ni beza drpd format docId
  // dalam collection *_slots (lihat slotRefCeramah()/slotRefUK() dekat
  // daftarPelajarKaunter() di atas) — dua benda ni sengaja tak sama format.

  const NAMA_BULAN_MS = ["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"];
  const NAMA_HARI_MS = ["Ahad","Isnin","Selasa","Rabu","Khamis","Jumaat","Sabtu"];

  let kalenderBulanTahun = new Date(); // bulan/tahun yang sedang dipaparkan dlm grid
  let kalenderTarikhDipilih = null;    // string "dd/mm/yyyy" lepas admin klik satu tarikh

  function formatTarikhKalendar(dateObj) {
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function bukaModalKalendar() {
    kalenderBulanTahun = new Date();
    kalenderTarikhDipilih = null;
    renderLangkah1Kalendar();
    modalKalenderOverlay.style.display = "flex";
  }

  // TAMBAHAN: buka modal Kalendar SEDIA ADA terus pada Langkah 2 (pilih
  // kategori) untuk satu tarikh yang admin dah tentukan lebih awal (contoh:
  // klik satu sel dalam heatmap "Jadual Akan Datang") — langkau Langkah 1
  // (grid bulan) sebab tarikh dah diketahui. Guna semula renderLangkah2Kategori()
  // 100% tak diubah; "← Kembali ke kalendar" dalam step tu tetap bawa balik
  // ke grid bulan macam biasa kalau admin nak tukar tarikh lain.
  function bukaModalKalendarPadaTarikh(tarikhStr) {
    kalenderBulanTahun = new Date();
    kalenderTarikhDipilih = tarikhStr;
    renderLangkah2Kategori();
    modalKalenderOverlay.style.display = "flex";
  }

  function tutupModalKalendar() {
    modalKalenderOverlay.style.display = "none";
    kalendarIsiWrap.innerHTML = "";
  }

  // ---------- Langkah 1: Grid kalendar ----------
  function renderLangkah1Kalendar() {
    const tahun = kalenderBulanTahun.getFullYear();
    const bulan = kalenderBulanTahun.getMonth();

    const hariPertama = new Date(tahun, bulan, 1).getDay(); // 0 = Ahad
    const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
    const hariIniStr = formatTarikhKalendar(new Date());

    // set tarikh yang ada SEKURANG-KURANGNYA satu jadual (Ceramah atau UK)
    // — untuk letak titik penanda kat kalendar
    const tarikhAdaJadual = new Set();
    senaraiPelajar.forEach(p => {
      senaraiCeramahPelajar(p).forEach(c => { if (c.data && c.data.tarikh) tarikhAdaJadual.add(c.data.tarikh); });
      if (p.ujianKomputer && p.ujianKomputer.tarikh) tarikhAdaJadual.add(p.ujianKomputer.tarikh);
    });

    let gridHtml = `<div class="kalendar-nav">
      <button type="button" id="btnBulanSebelum">‹</button>
      <span class="label-bulan">${NAMA_BULAN_MS[bulan]} ${tahun}</span>
      <button type="button" id="btnBulanSeterusnya">›</button>
    </div>`;

    gridHtml += `<div class="kalendar-grid">`;
    NAMA_HARI_MS.forEach(h => {
      gridHtml += `<div class="kalendar-hari-label">${h.slice(0, 2)}</div>`;
    });
    for (let i = 0; i < hariPertama; i++) {
      gridHtml += `<div class="kalendar-tarikh kosong"></div>`;
    }
    for (let hari = 1; hari <= jumlahHari; hari++) {
      const tarikhObj = new Date(tahun, bulan, hari);
      const tarikhStr = formatTarikhKalendar(tarikhObj);
      const adaJadual = tarikhAdaJadual.has(tarikhStr);
      const isHariIni = tarikhStr === hariIniStr;
      gridHtml += `<button type="button" class="kalendar-tarikh${isHariIni ? " hari-ini" : ""}${adaJadual ? " ada-jadual" : ""}" data-tarikh="${tarikhStr}">${hari}</button>`;
    }
    gridHtml += `</div>`;

    kalendarIsiWrap.innerHTML = gridHtml;

    document.getElementById("btnBulanSebelum").addEventListener("click", () => {
      kalenderBulanTahun = new Date(tahun, bulan - 1, 1);
      renderLangkah1Kalendar();
    });
    document.getElementById("btnBulanSeterusnya").addEventListener("click", () => {
      kalenderBulanTahun = new Date(tahun, bulan + 1, 1);
      renderLangkah1Kalendar();
    });
    kalendarIsiWrap.querySelectorAll(".kalendar-tarikh[data-tarikh]").forEach(btn => {
      btn.addEventListener("click", () => {
        kalenderTarikhDipilih = btn.dataset.tarikh;
        renderLangkah2Kategori();
      });
    });
  }

  // ---------- Langkah 2: Pilih kategori (Ceramah / Ujian Komputer / Latihan Praktikal) ----------
  function renderLangkah2Kategori() {
    const bilCeramah = senaraiPelajar.filter(p => senaraiCeramahPelajar(p).some(c => !!(c.data && c.data.tarikh === kalenderTarikhDipilih))).length;
    const bilUK = senaraiPelajar.filter(p => p.ujianKomputer && p.ujianKomputer.tarikh === kalenderTarikhDipilih).length;
    // TAMBAHAN: bilangan pelajar yang ada MANA-MANA sesi ATAU QTI pada tarikh
    // ni (untuk subtitle butang "Latihan Praktikal" — jumlah kasar, bukan per-sesi)
    const bilLatihan = senaraiPelajar.filter(p => senaraiLatihanPelajar(p).some(e => {
      const lp = e.lp;
      const adaSesi = !!(lp.senaraiSesi && lp.senaraiSesi.some(s => s && s.tarikh === kalenderTarikhDipilih));
      const adaQti = !!(lp.qti && lp.qti.tarikh === kalenderTarikhDipilih);
      return adaSesi || adaQti;
    })).length;

    kalendarIsiWrap.innerHTML = `
      <button type="button" class="btn-kembali-modal" id="btnKembaliKalendar">← Kembali ke kalendar</button>
      <p class="modal-sub" style="margin-top:-4px;">Tarikh: <b>${kalenderTarikhDipilih}</b> — pilih jadual mana nak dilihat:</p>
      <button class="pilihan-reset" id="pilKalendarCeramah">
        Ceramah Undang-Undang
        <span class="sub">${bilCeramah} pelajar dijadualkan</span>
      </button>
      <button class="pilihan-reset" id="pilKalendarUK">
        Ujian Komputer
        <span class="sub">${bilUK} pelajar dijadualkan</span>
      </button>
      <button class="pilihan-reset" id="pilKalendarLatihan">
        Latihan Praktikal (Moto &amp; Kereta)
        <span class="sub">${bilLatihan} pelajar dijadualkan</span>
      </button>
    `;

    document.getElementById("btnKembaliKalendar").addEventListener("click", renderLangkah1Kalendar);
    document.getElementById("pilKalendarCeramah").addEventListener("click", () => tapisTable("CERAMAH"));
    document.getElementById("pilKalendarUK").addEventListener("click", () => tapisTable("UJIAN_KOMPUTER"));
    document.getElementById("pilKalendarLatihan").addEventListener("click", () => renderLangkah2bLatihanSesi());
  }

  // ---------- TAMBAHAN: Langkah 2b — pilih sesi (Sesi 1..N / QTI) untuk Latihan Praktikal ----------
  //
  // Beza dengan Ceramah/UK: satu pelajar ada BEBERAPA sesi Latihan Praktikal
  // (senaraiSesi[]) + 1 QTI berasingan, masing-masing ada tarikh sendiri. So
  // lepas pilih "Latihan Praktikal" kat Langkah 2, kena pilih SATU sesi/QTI
  // dulu (macam sub-modal Reset Tarikh yang dah sedia ada) sebelum boleh
  // tapis table ikut tarikh yang dipilih kat Langkah 1.
  //
  // Jumlah "Sesi N" yang dipaparkan dikira dari senaraiSesi.length TERPANJANG
  // merentasi semua pelajar (fallback 7 kalau tiada data langsung — ikut
  // jumlah biasa yang disebut dalam komen resetTarikhLatihanPraktikal()).
  // KEMASKINI (2 PAKEJ): Moto & Kereta dipaparkan sbg dua kumpulan berasingan
  // (kumpulan Kereta cuma muncul kalau ada pelajar ada latihanPraktikalKereta).
  // Jumlah sesi per kumpulan = senaraiSesi.length TERPANJANG (fallback Moto 7 / Kereta 9).
  function renderLangkah2bLatihanSesi() {
    const kunciPapar = Object.keys(KOLEKSI_LATIHAN).filter(k => k === KUNCI_LATIHAN_MOTO || senaraiPelajar.some(p => p[k]));
    const banyakKumpulan = kunciPapar.length > 1;

    let html = `<button type="button" class="btn-kembali-modal" id="btnKembaliKategoriDariLatihan">← Kembali</button>`;
    html += `<p class="modal-sub" style="margin-top:-4px;">Tarikh: <b>${kalenderTarikhDipilih}</b> — Latihan Praktikal, pilih sesi mana:</p>`;

    kunciPapar.forEach(kunci => {
      const jumlahSesiMax = Math.max(0, ...senaraiPelajar.map(p =>
        (p[kunci] && p[kunci].senaraiSesi) ? p[kunci].senaraiSesi.length : 0
      ));
      const jumlahSesi = jumlahSesiMax > 0 ? jumlahSesiMax : KOLEKSI_LATIHAN[kunci].jumlahSesiLalai;

      if (banyakKumpulan) html += `<p class="modal-sub" style="margin:10px 0 4px;"><b>${KOLEKSI_LATIHAN[kunci].label}</b></p>`;

      for (let i = 1; i <= jumlahSesi; i++) {
        const bilSesi = senaraiPelajar.filter(p => {
          const lp = p[kunci];
          const sesi = lp && lp.senaraiSesi && lp.senaraiSesi[i - 1];
          return !!(sesi && sesi.tarikh === kalenderTarikhDipilih);
        }).length;
        html += `
          <button class="pilihan-reset" data-sesi-ke="${i}" data-kunci="${kunci}">
            Sesi ${i}${banyakKumpulan ? " (" + KOLEKSI_LATIHAN[kunci].label + ")" : ""}
            <span class="sub">${bilSesi} pelajar dijadualkan</span>
          </button>`;
      }

      const bilQti = senaraiPelajar.filter(p =>
        p[kunci] && p[kunci].qti && p[kunci].qti.tarikh === kalenderTarikhDipilih
      ).length;
      html += `
        <button class="pilihan-reset" data-sesi-ke="QTI" data-kunci="${kunci}">
          QTI${banyakKumpulan ? " (" + KOLEKSI_LATIHAN[kunci].label + ")" : ""}
          <span class="sub">${bilQti} pelajar dijadualkan</span>
        </button>`;
    });

    kalendarIsiWrap.innerHTML = html;

    document.getElementById("btnKembaliKategoriDariLatihan").addEventListener("click", renderLangkah2Kategori);
    kalendarIsiWrap.querySelectorAll("[data-sesi-ke]").forEach(btn => {
      btn.addEventListener("click", () => {
        const sesiKe = btn.dataset.sesiKe === "QTI" ? "QTI" : Number(btn.dataset.sesiKe);
        tapisTableLatihan(sesiKe, btn.dataset.kunci);
      });
    });
  }

  // ---------- TAMBAHAN: apply tapisan Latihan Praktikal (Sesi N / QTI) kat table utama ----------
  function tapisTableLatihan(sesiKe, kunci = KUNCI_LATIHAN_MOTO) {
    tapisanKalendar = { kategori: "LATIHAN_MEMANDU", tarikh: kalenderTarikhDipilih, sesiKe, kunci: _normKunciLatihan(kunci) };
    tapisanKad = null; // TAMBAHAN: tapisan kalendar & tapisan kad saling eksklusif
    tutupModalKalendar();
    // KEMASKINI (FIX): guna tukarTab("senarai") (bukan render() terus) supaya
    // admin yang buka modal Kalendar dari tab Dashboard (kad heatmap/panel
    // Permintaan) automatik dibawa ke tab Senarai Pelajar utk NAMPAK senarai
    // tertapis tu — sebelum ni tapisan tersimpan betul tapi tab tak bertukar,
    // jadi nampak macam "takde senarai nama keluar" walhal cuma tersorok
    // kat tab lain. tukarTab() sendiri dah panggil render() kat hujung dia.
    tukarTab("senarai");
  }

  // ---------- TAMBAHAN: apply tapisan kalendar terus kat table utama (bukan popup) ----------
  // Tutup modal kalendar, set tapisanKalendar, then render() — table pelajar
  // kat bawah automatik tunjuk cuma yang match kategori+tarikh tu, sama
  // macam behaviour box "Cari nama / no. KP" tapi ikut jadual bukan nama.
  function tapisTable(kategori) {
    tapisanKalendar = { kategori, tarikh: kalenderTarikhDipilih };
    tapisanKad = null; // TAMBAHAN: tapisan kalendar & tapisan kad saling eksklusif
    tutupModalKalendar();
    // KEMASKINI (FIX): sama sebab macam tapisTableLatihan() di atas — pastikan
    // admin dibawa ke tab Senarai Pelajar supaya senarai tertapis tu NAMPAK,
    // tak kira dari tab mana modal Kalendar dibuka.
    tukarTab("senarai");
  }

  function padamTapisanKalendar() {
    tapisanKalendar = null;
    render();
  }

  // TAMBAHAN: butang "✕ Padam Tapisan" pada chip kad (PAKEJ/CERAMAH/UK/BAYAR/
  // AKTIF) — ni kena padam tapisan BETUL2 (tapisanKad = null, papar LITERAL
  // semua pelajar termasuk yg dah selesai), lain dgn aktifkanTapisanKad("SEMUA")
  // yang sekarang bawa balik ke baseline "AKTIF" (bila kad "Jumlah Pelajar"
  // sendiri diklik). Kalau chip ni guna aktifkanTapisanKad("SEMUA") terus,
  // klik "✕" semasa tapisan AKTIF aktif jadi tak buat apa-apa (set semula
  // AKTIF ke AKTIF) — nampak macam butang tu rosak.
  function padamTapisanKad() {
    tapisanKad = null;
    render();
  }

  // ======================================================================
  // TAMBAHAN: tapisan dari klik KAD RINGKASAN (KPI card) kat atas table.
  // ======================================================================
  //
  // jenis: "SEMUA" (kad "Jumlah Pelajar" — kembali ke tapisan "AKTIF", iaitu
  // baseline/asal kad tu: pelajar belum selesai sahaja, & kosongkan tapisan
  // kalendar) | "PAKEJ" | "CERAMAH" | "UK" | "BAYAR".
  //
  // KEMASKINI (FIX — dilaporkan admin): "SEMUA" ("Jumlah Pelajar") balik
  // papar LITERAL semua pelajar (tapisanKad = null), tak kira settle ka
  // belum — tab "Senarai Pelajar" MESTI sentiasa ada semua nama. Angka
  // "Jumlah Pelajar" kekal kira pelajar AKTIF sahaja (bilPelajarAktif,
  // TAK diubah) — angka tu cuma "statistik", list bawah tak payah sepadan
  // 1-1 dgn angka tu lagi. Pelajar dah selesai tetap di tab "Selesai".
  //
  // Klik kad status (PAKEJ/CERAMAH/UK/BAYAR) sentiasa kosongkan tapisanKalendar
  // dulu (mutually exclusive) — elak dua mekanisme tapisan bercanggah/gabung
  // dengan cara yang mengelirukan admin.
  function aktifkanTapisanKad(jenis) {
    if (jenis === "SEMUA") {
      tapisanKad = null;
      tapisanKalendar = null;
    } else if (tapisanKad === jenis) {
      tapisanKad = null; // toggle off — klik kad aktif sekali lagi
    } else {
      tapisanKad = jenis;
      tapisanKalendar = null;
    }
    render();
  }

  // TAMBAHAN: klik kad "Permintaan Tukar Tarikh" — ni bukan data row-based
  // (ia hidup dalam kotak notifikasi kuning #notifPermintaan, bukan baris
  // table), jadi TAK menapis table. Cuma gulung skrin ke kotak tu & bagi
  // sorotan visual sekejap supaya admin nampak dengan jelas.
  function gulungKeNotifPermintaan() {
    const kotak = notifPermintaanEl.querySelector(".notif-kuning");
    if (!kotak) return; // takde permintaan menunggu — takde apa nak ditunjuk
    kotak.scrollIntoView({ behavior: "smooth", block: "start" });
    kotak.classList.add("notif-sorot");
    setTimeout(() => kotak.classList.remove("notif-sorot"), 1600);
  }

  // ---------- TAMBAHAN: chip "tapisan aktif" di atas table utama ----------
  function renderTapisanAktif() {
    if (tapisanKalendar) {
      let labelKategori;
      if (tapisanKalendar.kategori === "CERAMAH") {
        labelKategori = "Ceramah Undang-Undang";
      } else if (tapisanKalendar.kategori === "UJIAN_KOMPUTER") {
        labelKategori = "Ujian Komputer";
      } else {
        const labelSesi = tapisanKalendar.sesiKe === "QTI" ? "QTI" : `Sesi ${tapisanKalendar.sesiKe}`;
        const labelJenisTapis = KOLEKSI_LATIHAN[tapisanKalendar.kunci || KUNCI_LATIHAN_MOTO].label;
        labelKategori = `Latihan Praktikal (${labelJenisTapis}) — ${labelSesi}`;
      }
      tapisanAktifWrapEl.innerHTML = `
        <div class="tapisan-aktif-chip">
          📅 Menapis: <b>${labelKategori}</b> — ${tapisanKalendar.tarikh}
          <button type="button" id="btnPadamTapisanKalendar">✕ Padam Tapisan</button>
        </div>
      `;
      document.getElementById("btnPadamTapisanKalendar").addEventListener("click", padamTapisanKalendar);
      return;
    }

    // TAMBAHAN: chip yang sama untuk tapisan kad ringkasan (KPI card) — satu
    // sahaja penunjuk "tapisan aktif" kat UI tak kira dari kalendar atau kad.
    if (tapisanKad) {
      const labelKad = {
        PAKEJ: "Pakej Belum Sah",
        CERAMAH: "Ceramah Belum Hadir",
        UK: "UK Belum Sah",
        LATIHAN_MOTO: "Latihan Moto Belum Sah",
        LATIHAN_KERETA: "Latihan Kereta Belum Sah",
        BAYAR: "Bayaran Belum Sah",
        TAMBAH_KELAS: "Pernah Tambah Kelas",
        AKTIF: "Pelajar Belum Selesai"
      }[tapisanKad] || tapisanKad;
      tapisanAktifWrapEl.innerHTML = `
        <div class="tapisan-aktif-chip">
          <i class="fa-solid fa-filter"></i> Menapis: <b>${labelKad}</b>
          <button type="button" id="btnPadamTapisanKad">✕ Padam Tapisan</button>
        </div>
      `;
      document.getElementById("btnPadamTapisanKad").addEventListener("click", padamTapisanKad);
      return;
    }

    tapisanAktifWrapEl.innerHTML = "";
  }

  // ======================================================================
  // TAMBAHAN: pensuisan TAB (sidebar) — Dashboard / Senarai Pelajar.
  // ======================================================================
  //
  // Fungsi kecil BERASINGAN — tak sentuh/gantikan apa-apa function sedia ada.
  // Cuma tukar class "aktif" pada .nav-item & .tab-isi yang berkenaan, dan
  // kemaskini tajuk kat topbar. Data/logik dalam setiap tab (table, modal,
  // notifikasi) 100% tak berubah — cuma bungkusan/paparan dia yang ditogol.
  const TAJUK_TAB = { dashboard: "Dashboard", senarai: "Senarai Pelajar", permintaan: "Permintaan Tukar Tarikh", daftar: "Daftar Memandu", kaunter: "Pelajar Didaftar Kaunter", selesai: "Pelajar Selesai" };

  function tukarTab(nama) {
    document.querySelectorAll(".nav-item[data-tab]").forEach(n => n.classList.remove("aktif"));
    const navAktif = document.querySelector(`.nav-item[data-tab="${nama}"]`);
    if (navAktif) navAktif.classList.add("aktif");

    document.querySelectorAll(".tab-isi").forEach(t => t.classList.remove("aktif"));
    const tabAktif = document.getElementById("tab-" + nama);
    if (tabAktif) tabAktif.classList.add("aktif");

    const tajukEl = document.getElementById("tajukTab");
    if (tajukEl) tajukEl.textContent = TAJUK_TAB[nama] || nama;

    // TAMBAHAN (FIX): rekod tab semasa & bina semula kad ringkasan supaya
    // kad "Permintaan Tukar Tarikh" (atau kad tapisan lain) sentiasa disorot
    // .aktif dengan betul ikut tab yang admin sedang lihat sekarang — sama
    // pattern render() yang dipanggil lepas aktifkanTapisanKad() tukar tapisanKad.
    tabSemasa = nama;
    render();
  }

  document.querySelectorAll(".nav-item[data-tab]").forEach(el => {
    el.addEventListener("click", () => tukarTab(el.dataset.tab));
  });

  // ======================================================================
  // TAMBAHAN: carta DONUT "Status Keseluruhan Pelajar" (tab Dashboard).
  // ======================================================================
  //
  // Dikira BENAR dari senaraiPelajar guna 4 predikat sedia ada
  // (pakejBelumSah/ceramahBelumHadir/ukBelumSah/bayaranBelumSah) — TAKDE
  // angka hardcode. Untuk setiap pelajar, kira berapa banyak dari 4 predikat
  // tu TRUE:
  //   0 dari 4  -> "Selesai Semua"  (hijau/baik)
  //   4 dari 4  -> "Belum Mula"     (merah/bahaya)
  //   1-3 dari 4 -> "Dalam Proses"  (kuning/amaran)
  // Dilukis sebagai SVG tangan (teknik stroke-dasharray), sama macam
  // preview_dashboard_v3.html — tiada library carta luar.
  function renderDonut() {
    const svg = document.getElementById("chartDonut");
    const legenda = document.getElementById("donutLegenda");
    if (!svg || !legenda) return; // jaga-jaga kalau tab/elemen belum wujud

    let selesai = 0, dalamProses = 0, belumMula = 0;
    senaraiPelajar.forEach(p => {
      const bilBelum = [pakejBelumSah(p), ceramahBelumHadir(p), ukBelumSah(p), bayaranBelumSah(p)]
        .filter(Boolean).length;
      if (bilBelum === 0) selesai++;
      else if (bilBelum === 4) belumMula++;
      else dalamProses++;
    });

    const jumlah = senaraiPelajar.length;
    const r = 60, cx = 80, cy = 80, circumf = 2 * Math.PI * r;
    // TAMBAHAN: palet status yang telah disahkan — JANGAN tukar warna ni.
    const segmen = [
      { bil: selesai, warna: "#0ca30c", nama: "Selesai Semua" },
      { bil: dalamProses, warna: "#fab219", nama: "Dalam Proses" },
      { bil: belumMula, warna: "#d03b3b", nama: "Belum Mula" }
    ];

    let acc = 0;
    let svgHtml = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e7e8ec" stroke-width="20"/>`;
    if (jumlah > 0) {
      segmen.forEach(s => {
        if (s.bil <= 0) return;
        const len = (s.bil / jumlah) * circumf;
        svgHtml += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.warna}" stroke-width="20"
          stroke-dasharray="${len} ${circumf - len}" stroke-dashoffset="${-acc}" transform="rotate(-90 ${cx} ${cy})">
          <title>${s.nama}: ${s.bil}</title></circle>`;
        acc += len;
      });
    }
    // TAMBAHAN: tengah donut tukar dari jumlah pelajar mentah kepada peratus
    // siap keseluruhan (Selesai Semua ÷ Jumlah) — ring & legend TAK diubah,
    // kiraan "selesai"/"jumlah" pun guna terus nilai sedia ada di atas.
    const peratusSiap = jumlah > 0 ? Math.round((selesai / jumlah) * 100) : 0;
    svgHtml += `<text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="20" font-weight="800" fill="#0ca30c" font-family="Inter,sans-serif">${peratusSiap}%</text>`;
    svgHtml += `<text x="${cx}" y="${cy + 15}" text-anchor="middle" font-size="9.5" fill="#6b7180" font-family="Inter,sans-serif">Siap Semua</text>`;
    svg.innerHTML = svgHtml;

    legenda.innerHTML = segmen.map(s => {
      const peratus = jumlah > 0 ? Math.round((s.bil / jumlah) * 100) : 0;
      return `<div class="item"><span class="titik-legenda" style="background:${s.warna}"></span> ${s.nama} &nbsp;<b>${s.bil}</b> <span class="peratus">(${peratus}%)</span></div>`;
    }).join("");
  }

  // ======================================================================
  // TAMBAHAN: carta BAR "Pecahan Status Mengikut Kategori" (tab Dashboard).
  // ======================================================================
  //
  // NOTA (semak data sebenar dulu): collection "students" TAKDE medan
  // timestamp pendaftaran sebenar (contoh createdAt/tarikhDaftar) — satu²
  // serverTimestamp() dalam apps ni ditulis atas dokumen
  // "permintaanTukarTarikh" (medan tarikhDiluluskan), BUKAN atas dokumen
  // pelajar sendiri. Sebab tu carta trend/garis ikut tarikh TAK dibina di
  // sini (elak reka angka sejarah palsu) — carta bar per-kategori ni yang
  // dibina sebaliknya, dikira BENAR dari data status semasa.
  //
  // Untuk setiap kategori (Pakej/Ceramah/Ujian Komputer/Latihan
  // Praktikal/Pembayaran): "Belum Selesai" guna terus predikat sedia ada
  // (pakejBelumSah/ceramahBelumHadir/ukBelumSah/latihanBelumSelesai/
  // bayaranBelumSah — TAK diubah/reimplement). "Selesai" = baki
  // (jumlah pelajar - Belum Selesai) supaya dua bar tiap kategori sentiasa
  // jumlah tepat dengan jumlah pelajar keseluruhan.
  function renderBarChart() {
    const svg = document.getElementById("chartBar");
    const legenda = document.getElementById("barLegenda");
    if (!svg || !legenda) return; // jaga-jaga kalau tab/elemen belum wujud

    const jumlah = senaraiPelajar.length;
    const kategori = [
      { label: "Pakej", belum: senaraiPelajar.filter(pakejBelumSah).length },
      { label: "Ceramah", belum: senaraiPelajar.filter(ceramahBelumHadir).length },
      { label: "Ujian Komputer", belum: senaraiPelajar.filter(ukBelumSah).length },
      { label: "Latihan Moto", belum: senaraiPelajar.filter(latihanMotoBelumSelesai).length },
      { label: "Latihan Kereta", belum: senaraiPelajar.filter(latihanKeretaBelumSelesai).length },
      { label: "Pembayaran", belum: senaraiPelajar.filter(bayaranBelumSah).length }
    ].map(k => ({ label: k.label, belum: k.belum, selesai: Math.max(0, jumlah - k.belum) }));

    // TAMBAHAN: palet kategorikal tervalidasi — biru (#2a78d6) utk "Selesai"
    // (nilai sama yang disahkan dlm preview_dashboard_v3.html), kuning sedia
    // ada (nilai --kuning, #B7791F) utk "Belum Selesai" — TIADA hue baru.
    // Dihardcode terus (sama macam renderDonut() di atas) supaya fill SVG
    // konsisten merentasi browser (bukan var() dlm atribut SVG).
    const WARNA_SELESAI = "#2a78d6";
    const WARNA_BELUM = "#B7791F";

    const W = 460, H = 220, pad = { l: 28, r: 10, t: 14, b: 34 };
    const maxY = Math.max(1, jumlah);
    const lebarKumpulan = (W - pad.l - pad.r) / kategori.length;
    const jurang = 6;
    const lebarBar = Math.max(4, (lebarKumpulan - jurang * 3) / 2);
    const tinggiPlot = H - pad.t - pad.b;
    const yFor = v => H - pad.b - (v / maxY) * tinggiPlot;
    const tinggiFor = v => (v / maxY) * tinggiPlot;

    let svgHtml = "";
    for (let g = 0; g <= 3; g++) {
      const y = pad.t + g * (tinggiPlot / 3);
      svgHtml += `<line x1="${pad.l}" y1="${y.toFixed(1)}" x2="${W - pad.r}" y2="${y.toFixed(1)}" stroke="#e7e8ec" stroke-width="1"/>`;
    }
    svgHtml += `<line x1="${pad.l}" y1="${H - pad.b}" x2="${W - pad.r}" y2="${H - pad.b}" stroke="#c3c2b7" stroke-width="1"/>`;

    kategori.forEach((k, i) => {
      const xKumpulan = pad.l + i * lebarKumpulan + jurang;
      const xSelesai = xKumpulan;
      const xBelum = xKumpulan + lebarBar + jurang;

      svgHtml += `<rect x="${xSelesai.toFixed(1)}" y="${yFor(k.selesai).toFixed(1)}" width="${lebarBar.toFixed(1)}" height="${tinggiFor(k.selesai).toFixed(1)}" rx="3" fill="${WARNA_SELESAI}"><title>${k.label} — Selesai: ${k.selesai}</title></rect>`;
      svgHtml += `<rect x="${xBelum.toFixed(1)}" y="${yFor(k.belum).toFixed(1)}" width="${lebarBar.toFixed(1)}" height="${tinggiFor(k.belum).toFixed(1)}" rx="3" fill="${WARNA_BELUM}"><title>${k.label} — Belum Selesai: ${k.belum}</title></rect>`;

      const xLabel = xKumpulan + (lebarBar * 2 + jurang) / 2;
      svgHtml += `<text x="${xLabel.toFixed(1)}" y="${H - 8}" font-size="8.6" fill="#6b7180" text-anchor="middle" font-family="Inter,sans-serif">${k.label}</text>`;
    });

    svg.innerHTML = svgHtml;

    legenda.innerHTML = `
      <div class="legenda-item"><span class="titik-legenda" style="background:${WARNA_SELESAI}"></span>Selesai</div>
      <div class="legenda-item"><span class="titik-legenda" style="background:${WARNA_BELUM}"></span>Belum Selesai</div>
    `;
  }

  // ======================================================================
  // TAMBAHAN: heatmap "Jadual Akan Datang (14 Hari)" (tab Dashboard, kad
  // carta ke-3).
  // ======================================================================
  //
  // Kira BENAR jumlah sesi berjadual bagi SETIAP satu drpd 14 hari akan
  // datang (mula HARI NI), merentasi SEMUA pelajar, jumlahkan:
  //   - p.ceramah.tarikh
  //   - p.ujianKomputer.tarikh
  //   - setiap entri p.latihanPraktikalMoto.senaraiSesi[].tarikh
  //   - p.latihanPraktikalMoto.qti.tarikh (medan BENAR — disahkan dlm data
  //     sedia ada, guna dlm renderLangkah1Kalendar/aktifkanTapisanKalendar)
  // Guna formatTarikhKalendar() — function SAMA yg dipakai dlm Kalendar utk
  // bina tarikhStr "dd/mm/yyyy" bagi tiap hari — & padanan STRING EQUALITY
  // terus, teknik SAMA yang renderLangkah1Kalendar() guna utk set
  // tarikhAdaJadual (titik penanda). Elak reimplement parser/pemadan tarikh
  // kedua yang boleh tak konsisten dgn Kalendar.
  function renderJadualAkanDatang() {
    const wrap = document.getElementById("heatmapAkanDatang");
    const legenda = document.getElementById("heatmapLegenda");
    if (!wrap || !legenda) return; // jaga-jaga kalau tab/elemen belum wujud

    const NAMA_HARI_PENDEK = ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"];
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    // 14 hari akan datang, mula HARI NI (index 0) hingga +13.
    const hari14 = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(hariIni);
      d.setDate(d.getDate() + i);
      hari14.push({ tarikhStr: formatTarikhKalendar(d), nama: NAMA_HARI_PENDEK[d.getDay()], tgl: d.getDate(), bln: d.getMonth() + 1, bil: 0 });
    }
    const indeksTarikh = {};
    hari14.forEach((h, i) => { indeksTarikh[h.tarikhStr] = i; });

    const tambahBil = (tarikhStr) => {
      if (tarikhStr && Object.prototype.hasOwnProperty.call(indeksTarikh, tarikhStr)) {
        hari14[indeksTarikh[tarikhStr]].bil++;
      }
    };

    senaraiPelajar.forEach(p => {
      // KEMASKINI (2 pakej): ceramah Moto+Kereta & latihan Moto+Kereta dikira semua
      senaraiCeramahPelajar(p).forEach(c => { if (c.data && c.data.tarikh) tambahBil(c.data.tarikh); });
      if (p.ujianKomputer && p.ujianKomputer.tarikh) tambahBil(p.ujianKomputer.tarikh);
      senaraiLatihanPelajar(p).forEach(({ lp }) => {
        if (lp && lp.senaraiSesi) {
          lp.senaraiSesi.forEach(s => { if (s && s.tarikh) tambahBil(s.tarikh); });
        }
        if (lp && lp.qti && lp.qti.tarikh) tambahBil(lp.qti.tarikh);
      });
    });

    const bilMax = Math.max(0, ...hari14.map(h => h.bil));
    const kelasIntensiti = (bil) => {
      if (bil <= 0 || bilMax <= 0) return "kosong";
      const nisbah = bil / bilMax;
      if (nisbah <= 0.33) return "rendah";
      if (nisbah <= 0.66) return "sederhana";
      return "tinggi";
    };

    // KEMASKINI (permintaan admin): sel heatmap sekarang papar HARIBULAN
    // sebagai angka utama (bukan jumlah sesi mentah lagi) — warna latar
    // (kelasIntensiti, TAK diubah) tetap kekal jadi penanda "sikit/ramai".
    // Jumlah sesi sebenar (h.bil) kekal dikira SAMA seperti sebelum ni,
    // cuma dipindah jadi tooltip (title=) dan trigger utk buka modal
    // Kalendar terus pada Langkah 2 (kategori) bagi tarikh tu — lihat
    // bukaModalKalendarPadaTarikh() & wiring .heatmap-sel[data-tarikh]
    // di bawah. Sel dijadikan <button> supaya boleh diklik & accessible.
    wrap.innerHTML = hari14.map(h => {
      return `<button type="button" class="heatmap-sel heatmap-${kelasIntensiti(h.bil)}" data-tarikh="${h.tarikhStr}" title="${h.tarikhStr} — ${h.bil} sesi dijadualkan (klik untuk lihat butiran)">
        <div class="hari">${h.nama}</div>
        <div class="bil">${h.tgl}</div>
        <div class="tarikh">/${String(h.bln).padStart(2, "0")}</div>
      </button>`;
    }).join("");

    wrap.querySelectorAll(".heatmap-sel[data-tarikh]").forEach(sel => {
      sel.addEventListener("click", () => bukaModalKalendarPadaTarikh(sel.dataset.tarikh));
    });

    legenda.innerHTML = `
      <div class="legenda-item">Sikit</div>
      <div class="legenda-item"><span class="heatmap-swatch kosong"></span></div>
      <div class="legenda-item"><span class="heatmap-swatch rendah"></span></div>
      <div class="legenda-item"><span class="heatmap-swatch sederhana"></span></div>
      <div class="legenda-item"><span class="heatmap-swatch tinggi"></span></div>
      <div class="legenda-item">Ramai</div>
    `;
  }
