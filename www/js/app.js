/**
 * INISIALISASI & EVENT LISTENERS UTAMA
 */

window.addEventListener('hashchange', () => {
    let hash = window.location.hash.substring(1);
    if (!hash) hash = 'loginView';

    document.querySelectorAll('.view-page').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('flex', 'page-enter');
    });

    const activeEl = document.getElementById(hash);
    if (activeEl) {
        activeEl.classList.remove('hidden');
        activeEl.classList.add('flex', 'page-enter');
    }

    const mainHeader = document.getElementById('mainHeader');
    const bottomNav = document.getElementById('bottomNav');

    if (hash === 'loginView') {
        mainHeader.classList.add('hidden');
        mainHeader.classList.remove('flex');
        bottomNav.classList.add('hidden');
        bottomNav.classList.remove('flex');
    } else {
        mainHeader.classList.remove('hidden');
        mainHeader.classList.add('flex');
        bottomNav.classList.remove('hidden');
        bottomNav.classList.add('flex');

        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('text-brand-600');
            btn.classList.add('text-slate-400');
        });
        const activeBtn = document.getElementById('nav_' + hash);
        if (activeBtn) {
            activeBtn.classList.add('text-brand-600');
            activeBtn.classList.remove('text-slate-400');
        }
    }

    if (hash === 'dashboardView') refreshDashboard();
    if (hash === 'dataSasaranView') switchTab(currentTabCategory);
});

window.addEventListener('DOMContentLoaded', () => {
    initAppConfig();

    const kpmName = localStorage.getItem('ehdw_kpm_name');
    if (kpmName) {
        if (!window.location.hash || window.location.hash === '#loginView') {
            window.location.hash = 'dashboardView';
        }
    } else {
        window.location.hash = 'loginView';
    }
    window.dispatchEvent(new Event('hashchange'));
});

function initAppConfig() {
    const cfg = DBManager.getConfig();
    const loginSelect = document.getElementById('loginSelect');
    if (loginSelect) {
        loginSelect.innerHTML = cfg.kader.map(k => `<option value="${k}">${k}</option>`).join('');
    }

    if (document.getElementById('hdrVillageName')) document.getElementById('hdrVillageName').innerText = cfg.villageName;
    if (document.getElementById('loginVillageInput')) document.getElementById('loginVillageInput').value = cfg.villageName;

    const currentKader = localStorage.getItem('ehdw_kpm_name') || 'Kader KPM';
    if (document.getElementById('hdrKaderName')) document.getElementById('hdrKaderName').innerText = currentKader;
    if (document.getElementById('dashWelcome')) document.getElementById('dashWelcome').innerText = `Halo, ${currentKader}`;
}

function handleLogin() {
    const kader = document.getElementById('loginSelect').value;
    const village = document.getElementById('loginVillageInput').value.trim();

    if (!kader) return showToast('Pilih profil kader terlebih dahulu!', 'error');

    const cfg = DBManager.getConfig();
    if (village) cfg.villageName = village;
    DBManager.saveConfig(cfg);

    localStorage.setItem('ehdw_kpm_name', kader);
    initAppConfig();
    navTo('dashboardView');
}

function handleLogout() {
    localStorage.removeItem('ehdw_kpm_name');
    navTo('loginView');
}