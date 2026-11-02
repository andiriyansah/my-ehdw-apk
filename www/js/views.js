/**
 * LOGIKA RENDERING UI, TAMPILAN PAGE, MODAL, CHART & CUSTOM PICKERS WITH EDIT SASARAN
 */

// State untuk Custom Date/Month/Dropdown Picker
let activeCustomPickerInputId = null;
let pickerCurrentYear = new Date().getFullYear();
let pickerCurrentMonth = new Date().getMonth();
let cdpMode = 'days';

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function navTo(viewId) {
    window.location.hash = viewId;
}

function showToast(msg, type = 'success') {
    const modal = document.getElementById('alertModal');
    if (!modal) return alert(msg);

    document.getElementById('alertMsg').innerHTML = msg;
    document.getElementById('alertTitle').innerText = type === 'success' ? 'Berhasil' : 'Perhatian';
    
    const icon = document.getElementById('alertIcon');
    if (type === 'success') {
        icon.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-500"></i>';
    } else {
        icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-amber-500"></i>';
    }

    modal.classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('alertModal').classList.add('hidden');
}

// Update Teks Tombol Pemicu Dropdown Kustom
function updateSelectTriggerLabel(selectId) {
    const selectEl = document.getElementById(selectId);
    const labelEl = document.getElementById(selectId + '_label');
    if (selectEl && labelEl) {
        const selectedOpt = selectEl.options[selectEl.selectedIndex];
        if (selectedOpt && selectedOpt.value !== "") {
            labelEl.innerText = selectedOpt.text;
            labelEl.classList.remove('text-slate-400');
            labelEl.classList.add('text-slate-800');
        } else {
            labelEl.innerText = selectedOpt ? selectedOpt.text : '-- Pilih --';
            labelEl.classList.add('text-slate-400');
            labelEl.classList.remove('text-slate-800');
        }
    }
}

// ==================== A. LOGIKA DROPDOWN KUSTOM (BOTTOM SHEET + HOVER TANPA FLICKER) ====================
function openCustomSelectModal(selectId, title = 'Pilihan Opsi') {
    const selectEl = document.getElementById(selectId);
    if (!selectEl) return;

    document.getElementById('customSelectTitle').innerText = title;
    const container = document.getElementById('customSelectOptionsList');
    container.innerHTML = '';

    const options = Array.from(selectEl.options);
    options.forEach(opt => {
        if (opt.disabled) return;
        const isSelected = selectEl.value === opt.value;
        const activeClass = isSelected 
            ? 'bg-brand-50/90 border-brand-500 text-brand-900 font-bold shadow-sm' 
            : 'bg-white border-slate-200 text-slate-800';

        container.innerHTML += `
            <button type="button" onclick="selectCustomOptionValue('${selectId}', '${opt.value}')" 
                class="custom-option-item w-full p-3.5 rounded-2xl border ${activeClass} text-xs text-left flex justify-between items-center transition-colors duration-150 active:scale-[0.99] shrink-0">
                <span class="truncate pr-2">${opt.text}</span>
                ${isSelected 
                    ? '<i class="fa-solid fa-circle-check text-brand-600 text-sm shrink-0"></i>' 
                    : '<i class="fa-regular fa-circle text-slate-300 text-sm shrink-0"></i>'}
            </button>
        `;
    });

    document.getElementById('customSelectModal').classList.remove('hidden');
}

function closeCustomSelectModal() {
    document.getElementById('customSelectModal').classList.add('hidden');
}

function selectCustomOptionValue(selectId, value) {
    const selectEl = document.getElementById(selectId);
    if (selectEl) {
        selectEl.value = value;
        selectEl.dispatchEvent(new Event('change'));
        updateSelectTriggerLabel(selectId);
    }
    closeCustomSelectModal();
}

// ==================== B. LOGIKA CUSTOM DATE PICKER ====================
function openCustomDatePicker(inputId) {
    activeCustomPickerInputId = inputId;
    cdpMode = 'days';
    const inputEl = document.getElementById(inputId);
    
    if (inputEl && inputEl.value) {
        const parts = inputEl.value.split('-');
        if (parts.length === 3) {
            pickerCurrentYear = parseInt(parts[0]);
            pickerCurrentMonth = parseInt(parts[1]) - 1;
        }
    } else {
        const today = new Date();
        pickerCurrentYear = today.getFullYear();
        pickerCurrentMonth = today.getMonth();
    }

    renderCustomCalendar();
    document.getElementById('customDatePickerModal').classList.remove('hidden');
}

function closeCustomDatePicker() {
    document.getElementById('customDatePickerModal').classList.add('hidden');
}

function toggleCalendarYearMode() {
    cdpMode = (cdpMode === 'days') ? 'years' : 'days';
    renderCustomCalendar();
}

function selectPickerYear(year) {
    pickerCurrentYear = year;
    cdpMode = 'days';
    renderCustomCalendar();
}

function changePickerMonth(offset) {
    if (cdpMode === 'years') {
        pickerCurrentYear += offset;
    } else {
        pickerCurrentMonth += offset;
        if (pickerCurrentMonth > 11) {
            pickerCurrentMonth = 0;
            pickerCurrentYear++;
        } else if (pickerCurrentMonth < 0) {
            pickerCurrentMonth = 11;
            pickerCurrentYear--;
        }
    }
    renderCustomCalendar();
}

function renderCustomCalendar() {
    const monthYearTitle = document.getElementById('cdp_month_year');
    const daysGrid = document.getElementById('cdp_days_grid');
    const dayHeaders = document.getElementById('cdp_day_headers');

    if (cdpMode === 'years') {
        monthYearTitle.innerHTML = `<span class="flex items-center justify-center gap-1">Tahun: ${pickerCurrentYear} <i class="fa-solid fa-chevron-up text-xs text-brand-600"></i></span>`;
        if (dayHeaders) dayHeaders.classList.add('hidden');

        let yearsHtml = `<div class="col-span-7 grid grid-cols-4 gap-2 max-h-56 overflow-y-auto custom-scrollbar p-1">`;
        const maxYear = new Date().getFullYear();
        for (let y = maxYear; y >= 1950; y--) {
            const isSel = (y === pickerCurrentYear);
            const bg = isSel ? 'bg-brand-600 text-white font-bold shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-brand-500 hover:text-white';
            yearsHtml += `<button type="button" onclick="selectPickerYear(${y})" class="py-2.5 rounded-xl text-xs ${bg} transition active:scale-95 cursor-pointer">${y}</button>`;
        }
        yearsHtml += `</div>`;
        daysGrid.innerHTML = yearsHtml;
    } else {
        monthYearTitle.innerHTML = `<span class="flex items-center justify-center gap-1">${MONTH_NAMES[pickerCurrentMonth]} ${pickerCurrentYear} <i class="fa-solid fa-chevron-down text-xs text-brand-500"></i></span>`;
        if (dayHeaders) dayHeaders.classList.remove('hidden');

        daysGrid.innerHTML = '';
        const firstDay = new Date(pickerCurrentYear, pickerCurrentMonth, 1).getDay();
        const daysInMonth = new Date(pickerCurrentYear, pickerCurrentMonth + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            daysGrid.innerHTML += `<div></div>`;
        }

        const currentInputVal = activeCustomPickerInputId ? document.getElementById(activeCustomPickerInputId).value : '';

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${pickerCurrentYear}-${String(pickerCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = currentInputVal === dateStr;
            const bgClass = isSelected ? 'bg-brand-600 text-white shadow-md font-bold' : 'bg-slate-100 text-slate-800 hover:bg-brand-500 hover:text-white';

            daysGrid.innerHTML += `
                <button type="button" onclick="selectCustomDate('${dateStr}')" class="calendar-day-btn ${bgClass}">
                    ${day}
                </button>
            `;
        }
    }
}

function selectCustomDate(dateStr) {
    if (activeCustomPickerInputId) {
        const input = document.getElementById(activeCustomPickerInputId);
        if (input) {
            input.value = dateStr;
            input.dispatchEvent(new Event('change'));
        }
    }
    closeCustomDatePicker();
}

function selectCustomDateToday() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    selectCustomDate(dateStr);
}

// ==================== C. LOGIKA CUSTOM MONTH PICKER ====================
function openCustomMonthPicker(inputId) {
    activeCustomPickerInputId = inputId;
    const inputEl = document.getElementById(inputId);

    if (inputEl && inputEl.value) {
        const parts = inputEl.value.split('-');
        if (parts.length >= 2) {
            pickerCurrentYear = parseInt(parts[0]);
        }
    } else {
        pickerCurrentYear = new Date().getFullYear();
    }

    renderCustomMonthGrid();
    document.getElementById('customMonthPickerModal').classList.remove('hidden');
}

function closeCustomMonthPicker() {
    document.getElementById('customMonthPickerModal').classList.add('hidden');
}

function changePickerYear(offset) {
    pickerCurrentYear += offset;
    renderCustomMonthGrid();
}

function renderCustomMonthGrid() {
    document.getElementById('cmp_year').innerText = pickerCurrentYear;
    const grid = document.getElementById('cmp_months_grid');
    grid.innerHTML = '';

    const currentInputVal = activeCustomPickerInputId ? document.getElementById(activeCustomPickerInputId).value : '';

    MONTH_NAMES.forEach((mName, idx) => {
        const monthStr = `${pickerCurrentYear}-${String(idx + 1).padStart(2, '0')}`;
        const isSelected = currentInputVal === monthStr;
        const bgClass = isSelected ? 'bg-brand-600 text-white font-bold' : 'bg-slate-100 text-slate-800 hover:bg-brand-500 hover:text-white';

        grid.innerHTML += `
            <button type="button" onclick="selectCustomMonth('${monthStr}')" class="py-3 px-2 rounded-xl text-xs font-semibold ${bgClass} transition active:scale-95 cursor-pointer">
                ${mName.substring(0, 3)}
            </button>
        `;
    });
}

function selectCustomMonth(monthStr) {
    if (activeCustomPickerInputId) {
        const input = document.getElementById(activeCustomPickerInputId);
        if (input) {
            input.value = monthStr;
            input.dispatchEvent(new Event('change'));
        }
    }
    closeCustomMonthPicker();
}

// ==================== D. DASHBOARD & INTERACTION ====================
function refreshDashboard() {
    const currentMonth = getCurrentMonthStr();
    if(document.getElementById('dashCurrentMonth')) document.getElementById('dashCurrentMonth').innerText = `Bulan: ${currentMonth}`;
    if(document.getElementById('chartMonthBadge')) document.getElementById('chartMonthBadge').innerText = currentMonth;

    let totalSasaran = 0;
    let totalDipantau = 0;
    let categoryStats = { anak: 0, rematri: 0, catin: 0, bumil: 0 };
    let categoryMonitored = { anak: 0, rematri: 0, catin: 0, bumil: 0 };

    let kekCount = 0;
    let anemiaCount = 0;

    ['anak', 'rematri', 'catin', 'bumil'].forEach(cat => {
        const db = DBManager.getDB(cat);
        categoryStats[cat] = db.length;
        totalSasaran += db.length;

        db.forEach(item => {
            const mon = DBManager.getPemantauanBulan(item, currentMonth);
            if (mon) {
                categoryMonitored[cat]++;
                totalDipantau++;
            }

            if (cat === 'bumil' && mon && mon.pengukuran && mon.pengukuran.lila) {
                if (parseFloat(mon.pengukuran.lila) < 23.5) kekCount++;
            }
            if (mon && mon.pengukuran && mon.pengukuran.hb) {
                if (parseFloat(mon.pengukuran.hb) < 12.0) anemiaCount++;
            }
        });
    });

    if(document.getElementById('kpiTotalSasaran')) document.getElementById('kpiTotalSasaran').innerText = totalSasaran;
    const dipantauPct = totalSasaran > 0 ? Math.round((totalDipantau / totalSasaran) * 100) : 0;
    if(document.getElementById('kpiDipantau')) document.getElementById('kpiDipantau').innerText = `${dipantauPct}%`;
    if(document.getElementById('kpiDipantauCount')) document.getElementById('kpiDipantauCount').innerText = `${totalDipantau} dari ${totalSasaran} sasaran`;

    let riskText = '';
    if (kekCount > 0 || anemiaCount > 0) {
        riskText = `Terdeteksi <b>${kekCount} Ibu Hamil KEK</b> (LILA < 23.5 cm) dan <b>${anemiaCount} sasaran Anemia</b> (Hb < 12 g/dL) bulan ini.`;
    } else {
        riskText = `Seluruh sasaran terpantau aman dari indikator KEK & Anemia berat pada bulan ${currentMonth}.`;
    }
    if(document.getElementById('dashRiskSummaryText')) document.getElementById('dashRiskSummaryText').innerHTML = riskText;

    renderDashboardChart(categoryStats, categoryMonitored);
}

function renderDashboardChart(stats, monitored) {
    const ctx = document.getElementById('dashCategoryChart');
    if (!ctx) return;

    if (dashChartInstance) dashChartInstance.destroy();

    dashChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Anak', 'Rematri', 'Catin', 'Bumil'],
            datasets: [
                { label: 'Sudah Dipantau', data: [monitored.anak, monitored.rematri, monitored.catin, monitored.bumil], backgroundColor: '#0d9488', borderRadius: 6 },
                { label: 'Total Sasaran', data: [stats.anak, stats.rematri, stats.catin, stats.bumil], backgroundColor: '#cbd5e1', borderRadius: 6 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0, font: { size: 9 } } },
                x: { ticks: { font: { size: 10, weight: 'bold' } } }
            }
        }
    });
}

function switchTambahForm() {
    const cat = document.getElementById('td_kategori').value;
    const form = document.getElementById('tambahForm');
    const emptyState = document.getElementById('td_empty');
    const container = document.getElementById('td_dynamic_fields');
    const cfg = DBManager.getConfig();

    if (!cat) {
        form.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    form.classList.remove('hidden');
    emptyState.classList.add('hidden');

    const dusunOptions = cfg.dusun.map(d => `<option value="${d}">${d}</option>`).join('');

    let html = `
        <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap *</label>
            <input type="text" id="td_nama" required placeholder="Ketik nama lengkap" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold">
        </div>
        <div class="grid grid-cols-2 gap-3">
            <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">NIK</label>
                <input type="number" id="td_nik" placeholder="16 digit NIK" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs font-semibold">
            </div>
            <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">No. KK</label>
                <input type="number" id="td_nokk" placeholder="16 digit No KK" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs font-semibold">
            </div>
        </div>
        <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Lahir *</label>
            <input type="text" id="td_tgllahir" readonly onclick="openCustomDatePicker('td_tgllahir')" placeholder="Pilih Tanggal Lahir" required onchange="updateTambahAgeInfo()" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 hover:border-brand-500 rounded-xl outline-none text-xs font-semibold text-slate-800 cursor-pointer transition-colors">
            <div id="td_age_info" class="mt-1 text-xs"></div>
        </div>
        <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-1">Dusun / RT *</label>
            <select id="td_alamat" required class="hidden">
                <option value="" disabled selected>-- Pilih Dusun --</option>
                ${dusunOptions}
            </select>
            <button type="button" id="td_alamat_btn" onclick="openCustomSelectModal('td_alamat', 'Pilih Dusun / RT')" class="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 hover:border-brand-500 rounded-xl font-bold text-xs text-slate-800 flex justify-between items-center text-left transition-all duration-200 shadow-sm hover:shadow group cursor-pointer">
                <span id="td_alamat_label" class="text-slate-400 group-hover:text-slate-600 truncate">-- Pilih Dusun --</span>
                <i class="fa-solid fa-chevron-down text-slate-400 group-hover:text-brand-600 text-xs ml-2 shrink-0"></i>
            </button>
        </div>
    `;

    if (cat === 'anak') {
        html += `
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-[11px] font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select id="td_jk" class="hidden">
                        <option value="L">Laki-Laki</option>
                        <option value="P">Perempuan</option>
                    </select>
                    <button type="button" id="td_jk_btn" onclick="openCustomSelectModal('td_jk', 'Jenis Kelamin')" class="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 hover:border-brand-500 rounded-xl font-bold text-xs text-slate-800 flex justify-between items-center text-left transition-all duration-200 shadow-sm hover:shadow group cursor-pointer">
                        <span id="td_jk_label" class="text-slate-800 group-hover:text-slate-900 truncate">Laki-Laki</span>
                        <i class="fa-solid fa-chevron-down text-slate-400 group-hover:text-brand-600 text-xs ml-1 shrink-0"></i>
                    </button>
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-slate-700 mb-1">Nama Ayah</label>
                    <input type="text" id="td_ayah" placeholder="Nama ayah" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs font-semibold">
                </div>
            </div>
            <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Nama Ibu</label>
                <input type="text" id="td_ibu" placeholder="Nama ibu" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs font-semibold">
            </div>
        `;
    } else if (cat === 'catin') {
        html += `
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-[11px] font-bold text-slate-700 mb-1">Pernikahan Ke-</label>
                    <input type="number" id="td_pernikahanke" value="1" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs font-semibold">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-slate-700 mb-1">Tgl Pernikahan</label>
                    <input type="text" id="td_tglnikah" readonly onclick="openCustomDatePicker('td_tglnikah')" placeholder="Pilih Tanggal Nikah" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 hover:border-brand-500 rounded-xl outline-none text-xs font-semibold cursor-pointer transition-colors">
                </div>
            </div>
        `;
    } else if (cat === 'bumil') {
        html += `
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-[11px] font-bold text-slate-700 mb-1">Hamil Ke-</label>
                    <input type="number" id="td_hamilke" value="1" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs font-semibold">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-slate-700 mb-1">HPHT (Tgl Perkiraan Hamil)</label>
                    <input type="text" id="td_tglhamil" readonly onclick="openCustomDatePicker('td_tglhamil')" placeholder="Pilih HPHT" onchange="autoCalculateHPL()" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 hover:border-brand-500 rounded-xl outline-none text-xs font-semibold cursor-pointer transition-colors">
                </div>
            </div>
            <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Tgl Perkiraan Lahir (HPL)</label>
                <input type="text" id="td_tgllahir_perkiraan" readonly onclick="openCustomDatePicker('td_tgllahir_perkiraan')" placeholder="Pilih HPL" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 hover:border-brand-500 rounded-xl outline-none text-xs font-semibold cursor-pointer transition-colors">
            </div>
        `;
    }

    container.innerHTML = html;
    updateSelectTriggerLabel('td_alamat');
    if (document.getElementById('td_jk')) updateSelectTriggerLabel('td_jk');
}

function autoCalculateHPL() {
    const tglHamilInput = document.getElementById('td_tglhamil');
    const hplInput = document.getElementById('td_tgllahir_perkiraan');

    if (!tglHamilInput || !hplInput || !tglHamilInput.value) return;

    const date = new Date(tglHamilInput.value);
    if (isNaN(date.getTime())) return;

    date.setDate(date.getDate() + 280);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    hplInput.value = `${yyyy}-${mm}-${dd}`;
}

function updateTambahAgeInfo() {
    const cat = document.getElementById('td_kategori').value;
    const tglVal = document.getElementById('td_tgllahir').value;
    const infoEl = document.getElementById('td_age_info');
    if (!infoEl || !tglVal) return;

    const age = calculateAge(tglVal);
    let statusHtml = `<span class="text-slate-600 font-semibold">Usia: <b>${age.text}</b></span>`;

    if (cat === 'anak') {
        if (age.totalMonths < 0) {
            statusHtml += ` <span class="text-rose-600 font-bold block"><i class="fa-solid fa-triangle-exclamation"></i> Tanggal lahir belum terjadi!</span>`;
        } else if (age.totalMonths > 59) {
            statusHtml += ` <span class="text-rose-600 font-bold block"><i class="fa-solid fa-ban"></i> Usia melebihi 59 bulan (Balita)!</span>`;
        } else {
            statusHtml += ` <span class="text-emerald-600 font-bold block"><i class="fa-solid fa-circle-check"></i> Sesuai kriteria Balita.</span>`;
        }
    }
    infoEl.innerHTML = statusHtml;
}

// ==================== LOGIKA EDIT & SIMPAN DATA SASARAN ====================
function editSasaran(cat, id) {
    closeDetail();
    navTo('tambahDataView');

    const catSelect = document.getElementById('td_kategori');
    if (catSelect) {
        catSelect.value = cat;
        updateSelectTriggerLabel('td_kategori');
        switchTambahForm();
    }

    const db = DBManager.getDB(cat);
    const person = db.find(p => p.id === id);
    if (!person) return;

    let editIdInput = document.getElementById('td_edit_id');
    if (!editIdInput) {
        editIdInput = document.createElement('input');
        editIdInput.type = 'hidden';
        editIdInput.id = 'td_edit_id';
        document.getElementById('tambahForm').appendChild(editIdInput);
    }
    editIdInput.value = id;

    if (document.getElementById('td_nama')) document.getElementById('td_nama').value = person.identitas.nama || '';
    if (document.getElementById('td_nik')) document.getElementById('td_nik').value = person.identitas.nik || '';
    if (document.getElementById('td_nokk')) document.getElementById('td_nokk').value = person.identitas.nokk || '';
    if (document.getElementById('td_tgllahir')) {
        document.getElementById('td_tgllahir').value = person.identitas.tgllahir || '';
        updateTambahAgeInfo();
    }
    if (document.getElementById('td_alamat')) {
        document.getElementById('td_alamat').value = person.identitas.alamat || '';
        updateSelectTriggerLabel('td_alamat');
    }

    if (cat === 'anak') {
        if (document.getElementById('td_jk')) {
            document.getElementById('td_jk').value = person.identitas.jk || 'L';
            updateSelectTriggerLabel('td_jk');
        }
        if (document.getElementById('td_ayah')) document.getElementById('td_ayah').value = person.identitas.ayah || '';
        if (document.getElementById('td_ibu')) document.getElementById('td_ibu').value = person.identitas.ibu || '';
    } else if (cat === 'catin') {
        if (document.getElementById('td_pernikahanke')) document.getElementById('td_pernikahanke').value = person.identitas.pernikahanke || 1;
        if (document.getElementById('td_tglnikah')) document.getElementById('td_tglnikah').value = person.identitas.tglnikah || '';
    } else if (cat === 'bumil') {
        if (document.getElementById('td_hamilke')) document.getElementById('td_hamilke').value = person.identitas.hamilke || 1;
        if (document.getElementById('td_tglhamil')) document.getElementById('td_tglhamil').value = person.identitas.tglhamil || '';
        if (document.getElementById('td_tgllahir_perkiraan')) document.getElementById('td_tgllahir_perkiraan').value = person.identitas.tgllahir_perkiraan || '';
    }

    const submitBtn = document.getElementById('td_submit_btn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk text-sm"></i> Simpan Perubahan Data';
    }
}

function saveTambahData(e) {
    e.preventDefault();
    const cat = document.getElementById('td_kategori').value;
    if (!cat) return showToast('Pilih kategori sasaran!', 'error');

    const nama = document.getElementById('td_nama').value.trim();
    if (!nama) return showToast('Nama lengkap wajib diisi!', 'error');

    const tglLahirVal = document.getElementById('td_tgllahir').value;
    if (tglLahirVal) {
        const age = calculateAge(tglLahirVal);
        if (cat === 'anak' && (age.totalMonths < 0 || age.totalMonths > 59)) {
            return showToast('Gagal: Usia anak harus berada pada rentang 0 - 59 Bulan!', 'error');
        }
    }

    const cfg = DBManager.getConfig();
    const identitas = {
        nama: nama,
        nik: document.getElementById('td_nik') ? document.getElementById('td_nik').value : '',
        nokk: document.getElementById('td_nokk') ? document.getElementById('td_nokk').value : '',
        tgllahir: tglLahirVal,
        alamat: document.getElementById('td_alamat') ? document.getElementById('td_alamat').value : '',
        posyandu: cfg.posyandu
    };

    if (cat === 'anak') {
        identitas.jk = document.getElementById('td_jk').value;
        identitas.ayah = document.getElementById('td_ayah').value;
        identitas.ibu = document.getElementById('td_ibu').value;
        identitas.paud = cfg.paud;
    } else if (cat === 'catin') {
        identitas.pernikahanke = document.getElementById('td_pernikahanke').value;
        identitas.tglnikah = document.getElementById('td_tglnikah').value;
    } else if (cat === 'bumil') {
        identitas.hamilke = document.getElementById('td_hamilke').value;
        identitas.tglhamil = document.getElementById('td_tglhamil').value;
        identitas.tgllahir_perkiraan = document.getElementById('td_tgllahir_perkiraan').value;
    }

    const editIdInput = document.getElementById('td_edit_id');
    const editId = editIdInput ? editIdInput.value : '';
    let db = DBManager.getDB(cat);

    if (editId) {
        const idx = db.findIndex(p => p.id === editId);
        if (idx !== -1) {
            db[idx].identitas = identitas;
            DBManager.saveDB(cat, db);
            showToast('Data sasaran berhasil diperbarui!', 'success');
        }
    } else {
        db.push({
            id: 'ID_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            identitas: identitas,
            pemantauan: {}
        });
        DBManager.saveDB(cat, db);
        showToast('Warga sasaran berhasil ditambahkan!', 'success');
    }

    document.getElementById('tambahForm').reset();
    if (editIdInput) editIdInput.value = '';
    const submitBtn = document.getElementById('td_submit_btn');
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk text-sm"></i> Simpan Data Sasaran';

    document.getElementById('td_kategori').value = '';
    updateSelectTriggerLabel('td_kategori');
    document.getElementById('tambahForm').classList.add('hidden');
    document.getElementById('td_empty').classList.remove('hidden');

    if (editId) {
        navTo('dataSasaranView');
    }
}

function loadPemantauanNames() {
    const cat = document.getElementById('pm_kategori').value;
    let bulan = document.getElementById('pm_bulan_pantau').value;

    if (!bulan) {
        bulan = getCurrentMonthStr();
        document.getElementById('pm_bulan_pantau').value = bulan;
    }

    document.getElementById('pemantauanForm').classList.add('hidden');
    document.getElementById('pm_selected_id').value = '';
    document.getElementById('pm_search_input').value = '';
    closeCustomDropdown();

    if (!cat) return;
    document.getElementById('pm_nama_container').classList.remove('hidden');
    renderCustomDropdownOptions();
}

function toggleCustomDropdown() {
    const list = document.getElementById('pm_custom_dropdown_list');
    if (list.classList.contains('hidden')) openCustomDropdown();
    else closeCustomDropdown();
}

function openCustomDropdown() {
    const list = document.getElementById('pm_custom_dropdown_list');
    renderCustomDropdownOptions();
    list.classList.remove('hidden');
    document.getElementById('pm_dropdown_arrow').classList.add('rotate-180');
}

function closeCustomDropdown() {
    const list = document.getElementById('pm_custom_dropdown_list');
    if (list) list.classList.add('hidden');
    const arrow = document.getElementById('pm_dropdown_arrow');
    if (arrow) arrow.classList.remove('rotate-180');
}

function renderCustomDropdownOptions() {
    const cat = document.getElementById('pm_kategori').value;
    const bulan = document.getElementById('pm_bulan_pantau').value;
    if (!cat) return;

    const db = DBManager.getDB(cat);
    const searchText = (document.getElementById('pm_search_input').value || '').toLowerCase();
    const listContainer = document.getElementById('pm_custom_dropdown_list');

    const filtered = db.filter(item =>
        item.identitas.nama.toLowerCase().includes(searchText) ||
        (item.identitas.nik && item.identitas.nik.includes(searchText))
    );

    if (filtered.length === 0) {
        listContainer.innerHTML = `<div class="p-3 text-center text-xs text-slate-400">Sasaran tidak ditemukan</div>`;
        return;
    }

    listContainer.innerHTML = filtered.map(item => {
        const isFinished = DBManager.isSasaranSelesai(cat, item.identitas, bulan);
        const isMonitored = !!DBManager.getPemantauanBulan(item, bulan);

        let badge = '';
        if (isFinished) badge = `<span class="bg-blue-100 text-blue-700 text-[9px] px-2 py-0.5 rounded-full font-bold">Lulus</span>`;
        else if (isMonitored) badge = `<span class="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-bold">Dipantau</span>`;
        else badge = `<span class="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded-full font-bold">Belum</span>`;

        const ageObj = calculateAge(item.identitas.tgllahir, bulan);

        return `
            <div onclick="selectCustomTarget('${item.id}')" class="p-2.5 hover:bg-brand-50 hover:text-brand-900 cursor-pointer flex justify-between items-center transition-all">
                <div>
                    <p class="font-bold text-xs text-slate-800">${item.identitas.nama}</p>
                    <p class="text-[10px] text-slate-500">NIK: ${item.identitas.nik || '-'} | Usia: ${ageObj.text}</p>
                </div>
                ${badge}
            </div>
        `;
    }).join('');
}

function selectCustomTarget(targetId) {
    const cat = document.getElementById('pm_kategori').value;
    const db = DBManager.getDB(cat);
    const person = db.find(p => p.id === targetId);
    if (!person) return;

    document.getElementById('pm_selected_id').value = targetId;
    document.getElementById('pm_search_input').value = person.identitas.nama;
    closeCustomDropdown();
    showPemantauanForm();
}

function showPemantauanForm() {
    const cat = document.getElementById('pm_kategori').value;
    const bulan = document.getElementById('pm_bulan_pantau').value;
    const targetId = document.getElementById('pm_selected_id').value;
    const db = DBManager.getDB(cat);
    const person = db.find(p => p.id === targetId);

    if (!person) return;

    document.getElementById('pemantauanForm').classList.remove('hidden');
    document.getElementById('pm_empty').classList.add('hidden');

    const ageObj = calculateAge(person.identitas.tgllahir, bulan);

    document.getElementById('pm_target_title').innerText = person.identitas.nama;
    document.getElementById('pm_target_sub').innerText = `NIK: ${person.identitas.nik || '-'} | Usia: ${ageObj.text}`;
    document.getElementById('pm_target_month_badge').innerText = bulan;

    const measContainer = document.getElementById('pm_measurement_inputs');
    let measHtml = '';
    if (cat === 'anak') {
        measHtml = `
            <div>
                <label class="block text-[10px] font-bold text-slate-600 mb-1">Berat Badan (kg)</label>
                <input type="number" step="0.1" id="pmm_bb" placeholder="Contoh: 10.5" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-600 mb-1">Tinggi / Panjang (cm)</label>
                <input type="number" step="0.1" id="pmm_tb" placeholder="Contoh: 75.0" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold">
            </div>
        `;
    } else if (cat === 'bumil') {
        measHtml = `
            <div>
                <label class="block text-[10px] font-bold text-slate-600 mb-1">Lingkar Lengan / LILA (cm)</label>
                <input type="number" step="0.1" id="pmm_lila" placeholder="KEK jika < 23.5" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-600 mb-1">Kadar Hb (g/dL)</label>
                <input type="number" step="0.1" id="pmm_hb" placeholder="Anemia jika < 11.0" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold">
            </div>
        `;
    } else {
        measHtml = `
            <div class="col-span-2">
                <label class="block text-[10px] font-bold text-slate-600 mb-1">Kadar Hemoglobin Hb (g/dL)</label>
                <input type="number" step="0.1" id="pmm_hb" placeholder="Anemia jika < 12.0" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold">
            </div>
        `;
    }
    measContainer.innerHTML = measHtml;

    const fSelect = (key, label) => `
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label class="block text-xs font-bold text-slate-700 mb-1">${label}</label>
            <select id="pm_${key}" class="hidden">${INDIKATOR_OPTS}</select>
            <button type="button" id="pm_${key}_btn" onclick="openCustomSelectModal('pm_${key}', '${label}')" class="w-full px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 hover:border-brand-500 rounded-xl font-bold text-xs text-slate-800 flex justify-between items-center text-left transition-all duration-200 shadow-sm hover:shadow group cursor-pointer">
                <span id="pm_${key}_label" class="text-slate-400 group-hover:text-slate-600 truncate">-- Status Intervensi --</span>
                <i class="fa-solid fa-chevron-down text-slate-400 group-hover:text-brand-600 text-xs ml-1 shrink-0"></i>
            </button>
        </div>
    `;

    let html = '';
    if (cat === 'anak') {
        html += fSelect('Imunisasi_HB0', 'Imunisasi HB0 (Usia 0-7 Hari)')
             + fSelect('Imunisasi_BCG_Polio', 'Imunisasi BCG & Polio (Usia 1 Bln)')
             + fSelect('Imunisasi_DPT_HB1_Polio2', 'Imunisasi DPT HB1 & Polio2 (Usia 2 Bln)')
             + fSelect('Imunisasi_DPT_HB2_Polio3', 'Imunisasi DPT HB2 & Polio3 (Usia 3 Bln)')
             + fSelect('Imunisasi_DPT_HB3_Polio4', 'Imunisasi DPT HB3 & Polio4 (Usia 4 Bln)')
             + fSelect('Imunisasi_Campak', 'Imunisasi Campak/MR (Usia 9 Bln)')
             + fSelect('Layanan_BKB_PAUD', 'Layanan BKB/PAUD bulan berjalan')
             + fSelect('Pemantauan_Tumbuh_Kembang', 'Pemantauan Tumbuh Kembang (Timbang/Ukur)');
    } else if (cat === 'rematri') {
        html += fSelect('Pemeriksaan_Anemia', 'Pemeriksaan Anemia (Semester Berjalan)')
             + fSelect('Tablet_Tambah_Darah_Rematri', 'Konsumsi Tablet Tambah Darah (TTD)');
    } else if (cat === 'catin') {
        html += fSelect('Tablet_Tambah_Darah', 'Pemberian TTD Catin')
             + fSelect('Periksa_Kesehatan_Vaksin', 'Periksa Kesehatan / Vaksin Pranikah')
             + fSelect('Bimbingan_Perkawinan', 'Bimbingan Perkawinan Pranikah');
    } else if (cat === 'bumil') {
        html += fSelect('Periksa_Hamil_Trimester1', 'Pemeriksaan Kehamilan Trimester I')
             + fSelect('Periksa_Hamil_Trimester2', 'Pemeriksaan Kehamilan Trimester II')
             + fSelect('Periksa_Hamil_Trimester3', 'Pemeriksaan Kehamilan Trimester III')
             + fSelect('Tablet_Tambah_Darah_Bumil', 'Konsumsi TTD (min 90 Tablet)')
             + fSelect('Kelas_Ibu_Hamil', 'Keikutsertaan Kelas Ibu Hamil')
             + fSelect('Layanan_Nifas_VitA', 'Pemeriksaan Nifas & Vit A Ibu Nifas');
    }

    document.getElementById('pm_dynamic_fields').innerHTML = html;

    const existing = DBManager.getPemantauanBulan(person, bulan);
    if (existing) {
        if (existing.pengukuran) {
            if (existing.pengukuran.bb && document.getElementById('pmm_bb')) document.getElementById('pmm_bb').value = existing.pengukuran.bb;
            if (existing.pengukuran.tb && document.getElementById('pmm_tb')) document.getElementById('pmm_tb').value = existing.pengukuran.tb;
            if (existing.pengukuran.lila && document.getElementById('pmm_lila')) document.getElementById('pmm_lila').value = existing.pengukuran.lila;
            if (existing.pengukuran.hb && document.getElementById('pmm_hb')) document.getElementById('pmm_hb').value = existing.pengukuran.hb;
        }
        if (existing.indikator) {
            Object.keys(existing.indikator).forEach(k => {
                const el = document.getElementById('pm_' + k);
                if (el) {
                    el.value = existing.indikator[k];
                    updateSelectTriggerLabel('pm_' + k);
                }
            });
        }
    }
}

function savePemantauan(e) {
    e.preventDefault();
    const cat = document.getElementById('pm_kategori').value;
    const targetId = document.getElementById('pm_selected_id').value;
    const bulan = document.getElementById('pm_bulan_pantau').value;

    let db = DBManager.getDB(cat);
    let index = db.findIndex(p => p.id === targetId);
    if (index === -1) return showToast('Pilih sasaran warga!', 'error');

    let indikator = {};
    document.getElementById('pm_dynamic_fields').querySelectorAll('select').forEach(el => {
        indikator[el.id.replace('pm_', '')] = el.value;
    });

    let pengukuran = {};
    if (document.getElementById('pmm_bb')) pengukuran.bb = document.getElementById('pmm_bb').value;
    if (document.getElementById('pmm_tb')) pengukuran.tb = document.getElementById('pmm_tb').value;
    if (document.getElementById('pmm_lila')) pengukuran.lila = document.getElementById('pmm_lila').value;
    if (document.getElementById('pmm_hb')) pengukuran.hb = document.getElementById('pmm_hb').value;

    if (!db[index].pemantauan || Array.isArray(db[index].pemantauan)) {
        db[index].pemantauan = {};
    }

    db[index].pemantauan[bulan] = {
        indikator: indikator,
        pengukuran: pengukuran
    };

    DBManager.saveDB(cat, db);
    showToast(`Pemantauan Bulan ${bulan} berhasil disimpan!`);
    renderCustomDropdownOptions();
}

function switchTab(cat) {
    currentTabCategory = cat;
    ['anak', 'rematri', 'catin', 'bumil'].forEach(c => {
        const btn = document.getElementById('tab_' + c);
        if (btn) {
            btn.classList.remove('text-brand-600', 'border-brand-600');
            btn.classList.add('text-slate-400', 'border-transparent');
        }
    });
    const activeBtn = document.getElementById('tab_' + cat);
    if (activeBtn) {
        activeBtn.classList.add('text-brand-600', 'border-brand-600');
        activeBtn.classList.remove('text-slate-400', 'border-transparent');
    }

    if (!document.getElementById('ds_filter_bulan').value) {
        document.getElementById('ds_filter_bulan').value = getCurrentMonthStr();
    }

    populateDusunFilter();
    renderDataSasaranList();
}

function populateDusunFilter() {
    const cfg = DBManager.getConfig();
    const select = document.getElementById('ds_filter_dusun');
    if (select) {
        select.innerHTML = '<option value="all">Semua Dusun</option>' +
            cfg.dusun.map(d => `<option value="${d}">${d}</option>`).join('');
        updateSelectTriggerLabel('ds_filter_dusun');
    }
}

function renderDataSasaranList() {
    const cat = currentTabCategory;
    const filterBulan = document.getElementById('ds_filter_bulan').value || getCurrentMonthStr();
    const searchText = (document.getElementById('ds_search_input')?.value || '').toLowerCase();
    const filterStatus = document.getElementById('ds_filter_status')?.value || 'all';
    const filterDusun = document.getElementById('ds_filter_dusun')?.value || 'all';

    const list = document.getElementById('ds_list');
    const db = DBManager.getDB(cat);

    if (db.length === 0) {
        list.innerHTML = `<div class="text-center text-slate-400 py-12 text-xs">Belum ada data warga untuk kategori ini.</div>`;
        return;
    }

    const filtered = db.filter(item => {
        const matchSearch = item.identitas.nama.toLowerCase().includes(searchText) ||
                            (item.identitas.nik && item.identitas.nik.includes(searchText));
        if (!matchSearch) return false;

        if (filterDusun !== 'all' && item.identitas.alamat !== filterDusun) return false;

        const isFinished = DBManager.isSasaranSelesai(cat, item.identitas, filterBulan);
        const mon = DBManager.getPemantauanBulan(item, filterBulan);

        if (filterStatus === 'dipantau') return !!mon && !isFinished;
        if (filterStatus === 'belum') return !mon && !isFinished;
        if (filterStatus === 'selesai') return isFinished;

        return true;
    });

    if (filtered.length === 0) {
        list.innerHTML = `<div class="text-center text-slate-400 py-12 text-xs">Tidak ada sasaran yang cocok dengan filter.</div>`;
        return;
    }

    list.innerHTML = filtered.map(item => {
        const isFinished = DBManager.isSasaranSelesai(cat, item.identitas, filterBulan);
        const mon = DBManager.getPemantauanBulan(item, filterBulan);

        let badge = '';
        if (isFinished) badge = `<span class="bg-blue-100 text-blue-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Lulus</span>`;
        else if (mon) badge = `<span class="bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold"><i class="fa-solid fa-check mr-1"></i> Dipantau</span>`;
        else badge = `<span class="bg-amber-100 text-amber-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold"><i class="fa-regular fa-clock mr-1"></i> Belum</span>`;

        const ageObj = calculateAge(item.identitas.tgllahir, filterBulan);

        return `
            <div onclick="showDetail('${cat}', '${item.id}')" class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-brand-500 cursor-pointer transition">
                <div class="flex justify-between items-start mb-1">
                    <h3 class="font-bold text-slate-800 text-xs">${item.identitas.nama}</h3>
                    ${badge}
                </div>
                <p class="text-[11px] text-slate-500 mb-1">NIK: ${item.identitas.nik || '-'} | Usia: <b>${ageObj.text}</b></p>
                <p class="text-[10px] text-slate-400">Dusun: ${item.identitas.alamat}</p>
            </div>
        `;
    }).join('');
}

function showDetail(cat, id) {
    const db = DBManager.getDB(cat);
    const person = db.find(p => p.id === id);
    const filterBulan = document.getElementById('ds_filter_bulan').value || getCurrentMonthStr();
    if (!person) return;

    const modal = document.getElementById('detailModal');
    const body = document.getElementById('detailBody');

    const ageObj = calculateAge(person.identitas.tgllahir, filterBulan);

    let html = `
        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div class="flex justify-between items-center mb-1 border-b border-slate-200/80 pb-2">
                <h4 class="font-bold text-brand-700 uppercase tracking-wider text-[10px]">Profil Identitas</h4>
                <button type="button" onclick="editSasaran('${cat}', '${person.id}')" class="text-[10px] font-bold text-brand-700 hover:text-brand-900 bg-brand-100 hover:bg-brand-200 px-2.5 py-1 rounded-lg border border-brand-300/60 transition flex items-center gap-1.5 active:scale-95 cursor-pointer">
                    <i class="fa-solid fa-pen-to-square"></i> Edit Data
                </button>
            </div>
            <div class="flex justify-between"><span class="text-slate-500">Nama</span><span class="font-bold text-slate-800">${person.identitas.nama}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">NIK</span><span class="font-semibold">${person.identitas.nik || '-'}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">No. KK</span><span class="font-semibold">${person.identitas.nokk || '-'}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Tgl Lahir</span><span class="font-semibold">${person.identitas.tgllahir}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Usia (Per ${filterBulan})</span><span class="font-bold text-brand-600">${ageObj.text}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Dusun/RT</span><span class="font-semibold">${person.identitas.alamat}</span></div>
        </div>
    `;

    html += `
        <div class="bg-white p-3 rounded-2xl border border-slate-200">
            <h4 class="font-bold text-slate-700 text-[10px] uppercase tracking-wider mb-2">Grafik Riwayat Pertumbuhan / Medis</h4>
            <div class="h-40 w-full relative">
                <canvas id="detailHistoryChart"></canvas>
            </div>
        </div>
    `;

    const mon = DBManager.getPemantauanBulan(person, filterBulan);
    html += `<h4 class="font-bold text-slate-700 text-xs mt-3 mb-1">Pemantauan Bulan ${filterBulan}</h4>`;
    if (mon && mon.indikator) {
        html += `<div class="space-y-1.5">`;
        Object.keys(mon.indikator).forEach(k => {
            const status = mon.indikator[k] === 'Mendapat Layanan';
            const icon = status ? '<i class="fa-solid fa-circle-check text-emerald-500"></i>' : '<i class="fa-solid fa-circle-xmark text-rose-500"></i>';
            html += `
                <div class="p-2 bg-slate-50 rounded-xl flex justify-between items-center text-xs border border-slate-100">
                    <span class="text-slate-600 text-[11px]">${k.replace(/_/g, ' ')}</span>
                    <span>${icon} <b class="${status ? 'text-emerald-700' : 'text-rose-600'} text-[10px]">${mon.indikator[k]}</b></span>
                </div>
            `;
        });
        html += `</div>`;
    } else {
        html += `<p class="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">Belum dipantau pada bulan ${filterBulan}.</p>`;
    }

    body.innerHTML = html;
    modal.classList.remove('hidden');

    setTimeout(() => renderDetailHistoryChart(person, cat), 50);
}

function renderDetailHistoryChart(person, cat) {
    const ctx = document.getElementById('detailHistoryChart');
    if (!ctx) return;

    if (detailChartInstance) detailChartInstance.destroy();

    const months = person.pemantauan ? Object.keys(person.pemantauan).sort() : [];
    const dataBB = [];
    const dataTB = [];

    months.forEach(m => {
        const meas = person.pemantauan[m].pengukuran || {};
        dataBB.push(meas.bb || meas.lila || meas.hb || 0);
        dataTB.push(meas.tb || 0);
    });

    detailChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.length > 0 ? months : ['Belum ada data'],
            datasets: [
                {
                    label: cat === 'anak' ? 'Berat (kg)' : 'LILA / Hb',
                    data: dataBB,
                    borderColor: '#0d9488',
                    backgroundColor: '#0d948820',
                    fill: true,
                    tension: 0.3
                },
                (cat === 'anak' ? {
                    label: 'Tinggi (cm)',
                    data: dataTB,
                    borderColor: '#3b82f6',
                    tension: 0.3
                } : null)
            ].filter(Boolean)
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { font: { size: 9 } } } },
            scales: { y: { beginAtZero: false, ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } }
        }
    });
}

function closeDetail() {
    document.getElementById('detailModal').classList.add('hidden');
}

function openSettingsModal() {
    const cfg = DBManager.getConfig();
    document.getElementById('cfgVillageName').value = cfg.villageName;
    document.getElementById('cfgDusunList').value = cfg.dusun.join(', ');
    document.getElementById('cfgKaderList').value = cfg.kader.join(', ');
    document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function saveSettingsConfig() {
    const cfg = DBManager.getConfig();
    cfg.villageName = document.getElementById('cfgVillageName').value.trim() || cfg.villageName;
    cfg.dusun = document.getElementById('cfgDusunList').value.split(',').map(s => s.trim()).filter(Boolean);
    cfg.kader = document.getElementById('cfgKaderList').value.split(',').map(s => s.trim()).filter(Boolean);

    DBManager.saveConfig(cfg);
    initAppConfig();
    closeSettingsModal();
    showToast("Pengaturan Desa disimpan!");
}
