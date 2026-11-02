/**
 * MANAJEMEN PENYIMPANAN DATA OFFLINE (LOCALSTORAGE)
 */
const DBManager = {
    getConfig() {
        const data = localStorage.getItem('ehdw_config');
        return data ? JSON.parse(data) : DEFAULT_CONFIG;
    },

    saveConfig(cfg) {
        localStorage.setItem('ehdw_config', JSON.stringify(cfg));
    },

    getDB(cat) {
        const data = localStorage.getItem(DB_KEYS[cat]);
        return data ? JSON.parse(data) : [];
    },

    saveDB(cat, dataArr) {
        localStorage.setItem(DB_KEYS[cat], JSON.stringify(dataArr));
    },

    getPemantauanBulan(person, bulan) {
        if (!person || !person.pemantauan) return null;
        return person.pemantauan[bulan] || null;
    },

    isSasaranSelesai(cat, identitas, refBulan = null) {
        if (!identitas || !identitas.tgllahir) return false;
        const age = calculateAge(identitas.tgllahir, refBulan);

        if (cat === 'anak') return age.totalMonths > 59;
        if (cat === 'rematri') return age.years > 24;
        if (cat === 'bumil' && identitas.tgllahir_perkiraan) {
            const estBirth = new Date(identitas.tgllahir_perkiraan);
            const ref = refBulan ? new Date(refBulan + '-01') : new Date();
            const diffMonths = (ref.getFullYear() - estBirth.getFullYear()) * 12 + (ref.getMonth() - estBirth.getMonth());
            return diffMonths > 2;
        }
        return false;
    }
};

function calculateAge(birthDateStr, refDateStr = null) {
    if (!birthDateStr) return { years: 0, months: 0, totalMonths: 0, text: '-' };
    const birth = new Date(birthDateStr);
    const ref = refDateStr ? new Date(refDateStr + '-01') : new Date();

    let years = ref.getFullYear() - birth.getFullYear();
    let months = ref.getMonth() - birth.getMonth();

    if (months < 0 || (months === 0 && ref.getDate() < birth.getDate())) {
        years--;
        months += 12;
    }

    const totalMonths = (years * 12) + months;
    let text = '';
    if (years > 0) text += `${years} Thn `;
    text += `${months} Bln (${totalMonths} Bln)`;

    return { years, months, totalMonths, text };
}

function getCurrentMonthStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
