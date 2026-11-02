/**
 * LOGIKA EKSPOR (EXCEL & PDF) SERTA FITUR BERBAGI BAWAAN ANDROID (WEB SHARE API)
 */
let currentExportedFile = null;
let currentExportedPdfFile = null;

// ==================== 1. EKSPOR EXCEL & SHARE ====================
function handleExport() {
    try {
        let wb = XLSX.utils.book_new();

        ['anak', 'rematri', 'catin', 'bumil'].forEach(cat => {
            const db = DBManager.getDB(cat);
            let exportRows = [];

            db.forEach(row => {
                let base = { ...row.identitas };
                if (row.pemantauan && typeof row.pemantauan === 'object') {
                    const mKeys = Object.keys(row.pemantauan);
                    if (mKeys.length === 0) {
                        exportRows.push({ ...base, 'Bulan Pantau': 'Belum Dipantau' });
                    } else {
                        mKeys.forEach(m => {
                            let mRow = { ...base, 'Bulan Pantau': m };
                            if (row.pemantauan[m].pengukuran) {
                                Object.keys(row.pemantauan[m].pengukuran).forEach(pk => {
                                    mRow['Pengukuran: ' + pk.toUpperCase()] = row.pemantauan[m].pengukuran[pk];
                                });
                            }
                            if (row.pemantauan[m].indikator) {
                                Object.keys(row.pemantauan[m].indikator).forEach(ik => {
                                    mRow['Intervensi: ' + ik.replace(/_/g, ' ')] = row.pemantauan[m].indikator[ik];
                                });
                            }
                            exportRows.push(mRow);
                        });
                    }
                } else {
                    exportRows.push({ ...base, 'Bulan Pantau': 'Belum Dipantau' });
                }
            });

            if (exportRows.length === 0) exportRows.push({ Keterangan: "Data Kosong" });
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportRows), CATEGORY_NAMES[cat].substring(0, 30));
        });

        const cfg = DBManager.getConfig();
        const filename = `eHDW_Laporan_${cfg.villageName.replace(/\s+/g, '_')}_${getCurrentMonthStr()}.xlsx`;

        // Olah file Excel ke bentuk ArrayBuffer & Blob di RAM
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Buat objek File JavaScript
        currentExportedFile = new File([blob], filename, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const fileSizeKB = (blob.size / 1024).toFixed(1) + ' KB';
        renderExportFileStatusCard(filename, fileSizeKB);
        showToast("File Excel berhasil diproses!", "success");

    } catch (err) {
        showToast("Gagal memproses ekspor data: " + err.message, "error");
    }
}

function renderExportFileStatusCard(fileName, fileSizeStr) {
    const container = document.getElementById('exportStatusCardContainer');
    if (!container) return;

    container.classList.remove('hidden');
    container.innerHTML = `
        <div class="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-sm space-y-3">
            <div class="flex items-center gap-3">
                <div class="h-10 w-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shrink-0">
                    <i class="fa-solid fa-file-excel"></i>
                </div>
                <div class="flex-1 overflow-hidden">
                    <div class="flex items-center gap-1.5">
                        <span class="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <p class="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">File Excel Siap Dibagikan</p>
                    </div>
                    <h4 class="font-bold text-xs text-slate-800 truncate" title="${fileName}">${fileName}</h4>
                    <p class="text-[10px] text-slate-500 mt-0.5">Ukuran: <b>${fileSizeStr}</b> • Format: .xlsx</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60">
                <button onclick="triggerNativeShare()" class="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition">
                    <i class="fa-solid fa-share-nodes text-sm"></i> Bagikan File
                </button>
                <button onclick="downloadDirectFile()" class="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
                    <i class="fa-solid fa-download"></i> Simpan File
                </button>
            </div>
        </div>
    `;
}

async function triggerNativeShare() {
    if (!currentExportedFile) return showToast("File laporan belum siap dibagikan!", "error");

    const cfg = DBManager.getConfig();
    const shareData = {
        title: 'Laporan eHDW Stunting',
        text: `Laporan eHDW KPM Desa ${cfg.villageName} Periode ${getCurrentMonthStr()}.`,
        files: [currentExportedFile]
    };

    if (navigator.canShare && navigator.canShare({ files: [currentExportedFile] })) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            if (err.name !== 'AbortError') showToast("Gagal membagikan file: " + err.message, "error");
        }
    } else {
        showToast("Web Share API tidak didukung di WebView ini. Menyimpan file secara langsung...", "error");
        downloadDirectFile();
    }
}

function downloadDirectFile() {
    if (!currentExportedFile) return;
    const url = URL.createObjectURL(currentExportedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentExportedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("File berhasil disimpan!", "success");
}

// ==================== 2. EKSPOR PDF & SHARE ====================
function generatePDFReport() {
    const bulan = document.getElementById('pdfMonthPicker').value || getCurrentMonthStr();
    const cfg = DBManager.getConfig();
    const kader = localStorage.getItem('ehdw_kpm_name') || 'Kader KPM';

    showToast("Memproses & membuat File PDF...", "success");

    // Susun Elemen HTML Laporan
    const printContainer = document.createElement('div');
    printContainer.style.padding = '20px';
    printContainer.style.fontFamily = 'Arial, sans-serif';
    printContainer.style.color = '#000';
    printContainer.style.backgroundColor = '#fff';

    let printHtml = `
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 16px; text-transform: uppercase;">LAPORAN PEMANTAUAN eHDW KPM STUNTING</h2>
            <h3 style="margin: 5px 0 0 0; font-size: 13px;">DESA / KAMPUNG: ${cfg.villageName.toUpperCase()}</h3>
            <p style="margin: 5px 0 0 0; font-size: 11px;">PERIODE BULAN: ${bulan}</p>
        </div>
        <p style="font-size: 11px; margin-bottom: 15px;"><b>Kader KPM Penanggung Jawab:</b> ${kader}</p>
    `;

    ['anak', 'bumil'].forEach(cat => {
        const db = DBManager.getDB(cat);
        printHtml += `<h4 style="font-size: 11px; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase;">Rekapitulasi Kategori: ${CATEGORY_NAMES[cat]}</h4>`;
        printHtml += `
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 15px;" border="1" cellpadding="5">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="width: 30px; text-align: center;">No</th>
                        <th>Nama Sasaran</th>
                        <th>NIK</th>
                        <th>Dusun/RT</th>
                        <th style="text-align: center;">Status Layanan Bulan ${bulan}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        db.forEach((item, idx) => {
            const mon = DBManager.getPemantauanBulan(item, bulan);
            const statusText = mon ? '✓ Dipantau' : 'Belum Dipantau';
            printHtml += `
                <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td><b>${item.identitas.nama}</b></td>
                    <td>${item.identitas.nik || '-'}</td>
                    <td>${item.identitas.alamat}</td>
                    <td style="text-align: center;">${statusText}</td>
                </tr>
            `;
        });

        printHtml += `</tbody></table>`;
    });

    printHtml += `
        <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px;">
            <div style="text-align: center; width: 200px;">
                <p>Mengetahui,<br><b>Kepala Desa / Kampung</b></p>
                <br><br><br>
                <p>( .................................... )</p>
            </div>
            <div style="text-align: center; width: 200px;">
                <p>${cfg.villageName}, ${new Date().toLocaleDateString('id-ID')}<br><b>Kader KPM eHDW</b></p>
                <br><br><br>
                <p>( <b>${kader}</b> )</p>
            </div>
        </div>
    `;

    printContainer.innerHTML = printHtml;
    const filename = `eHDW_Laporan_PDF_${cfg.villageName.replace(/\s+/g, '_')}_${bulan}.pdf`;

    const opt = {
        margin:       0.4,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(printContainer).output('blob').then(blob => {
            currentExportedPdfFile = new File([blob], filename, { type: 'application/pdf' });
            const fileSizeStr = (blob.size / 1024).toFixed(1) + ' KB';
            renderPdfStatusCard(filename, fileSizeStr);
            showToast("File PDF berhasil diproses!", "success");
        }).catch(err => {
            showToast("Gagal membuat PDF: " + err.message, "error");
        });
    } else {
        // Fallback jika pustaka html2pdf belum dimuat
        const printArea = document.getElementById('printContainer');
        if (printArea) {
            printArea.innerHTML = printHtml;
            window.print();
        }
    }
}

function renderPdfStatusCard(fileName, fileSizeStr) {
    const container = document.getElementById('pdfStatusCardContainer');
    if (!container) return;

    container.classList.remove('hidden');
    container.innerHTML = `
        <div class="bg-blue-50 border border-blue-300 rounded-2xl p-4 shadow-sm space-y-3">
            <div class="flex items-center gap-3">
                <div class="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shrink-0">
                    <i class="fa-solid fa-file-pdf"></i>
                </div>
                <div class="flex-1 overflow-hidden">
                    <div class="flex items-center gap-1.5">
                        <span class="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <p class="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">File PDF Siap Dibagikan</p>
                    </div>
                    <h4 class="font-bold text-xs text-slate-800 truncate" title="${fileName}">${fileName}</h4>
                    <p class="text-[10px] text-slate-500 mt-0.5">Ukuran: <b>${fileSizeStr}</b> • Format: .pdf</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1 border-t border-blue-200/60">
                <button onclick="triggerNativeSharePdf()" class="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition">
                    <i class="fa-solid fa-share-nodes text-sm"></i> Bagikan PDF
                </button>
                <button onclick="downloadDirectPdfFile()" class="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
                    <i class="fa-solid fa-download"></i> Simpan PDF
                </button>
            </div>
        </div>
    `;
}

async function triggerNativeSharePdf() {
    if (!currentExportedPdfFile) return showToast("File PDF belum siap dibagikan!", "error");

    const cfg = DBManager.getConfig();
    const shareData = {
        title: 'Laporan PDF eHDW Stunting',
        text: `Laporan PDF eHDW KPM Desa ${cfg.villageName}.`,
        files: [currentExportedPdfFile]
    };

    if (navigator.canShare && navigator.canShare({ files: [currentExportedPdfFile] })) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            if (err.name !== 'AbortError') showToast("Gagal membagikan PDF: " + err.message, "error");
        }
    } else {
        showToast("Web Share API tidak didukung di WebView ini. Menyimpan PDF secara langsung...", "error");
        downloadDirectPdfFile();
    }
}

function downloadDirectPdfFile() {
    if (!currentExportedPdfFile) return;
    const url = URL.createObjectURL(currentExportedPdfFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentExportedPdfFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("File PDF berhasil disimpan!", "success");
}

// ==================== 3. BACKUP & TEMPLATE EXCEL ====================
function exportJSONBackup() {
    const data = {
        config: DBManager.getConfig(),
        anak: DBManager.getDB('anak'),
        rematri: DBManager.getDB('rematri'),
        catin: DBManager.getDB('catin'),
        bumil: DBManager.getDB('bumil')
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_eHDW_Database_${getCurrentMonthStr()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importJSONBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const json = JSON.parse(evt.target.result);
            if (json.config) DBManager.saveConfig(json.config);
            if (json.anak) DBManager.saveDB('anak', json.anak);
            if (json.rematri) DBManager.saveDB('rematri', json.rematri);
            if (json.catin) DBManager.saveDB('catin', json.catin);
            if (json.bumil) DBManager.saveDB('bumil', json.bumil);

            showToast("Database berhasil di-restore!", "success");
            initAppConfig();
            refreshDashboard();
        } catch (err) {
            showToast("Format file JSON backup tidak valid!", "error");
        }
    };
    reader.readAsText(file);
}

function downloadTemplate() {
    let wb = XLSX.utils.book_new();
    const sample = [{"NIK": "1234567890123456", "No KK": "1234567890123456", "Nama": "Warga A", "Tanggal Lahir": "2023-01-01", "Alamat": "Sinar Gading RT 1"}];
    ['anak', 'rematri', 'catin', 'bumil'].forEach(cat => {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sample), CATEGORY_NAMES[cat].substring(0, 30));
    });
    XLSX.writeFile(wb, "Template_Import_eHDW.xlsx");
}

function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        const workbook = XLSX.read(new Uint8Array(evt.target.result), {type: 'array'});
        let importedCount = 0;

        ['anak', 'rematri', 'catin', 'bumil'].forEach(cat => {
            const sheet = workbook.Sheets[CATEGORY_NAMES[cat].substring(0, 30)];
            if (sheet) {
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                let db = DBManager.getDB(cat);
                jsonData.forEach(row => {
                    if (row['Nama']) {
                        db.push({
                            id: 'ID_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                            identitas: {
                                nama: row['Nama'],
                                nik: row['NIK'] || '',
                                nokk: row['No KK'] || '',
                                tgllahir: row['Tanggal Lahir'] || '',
                                alamat: row['Alamat'] || 'Dusun Sinar Gading RT 1',
                                posyandu: 'Posyandu CEMPAKA'
                            },
                            pemantauan: {}
                        });
                        importedCount++;
                    }
                });
                DBManager.saveDB(cat, db);
            }
        });

        showToast(`Berhasil mengimport ${importedCount} data sasaran!`);
    };
    reader.readAsArrayBuffer(file);
}
