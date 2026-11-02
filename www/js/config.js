/**
 * KONFIGURASI GLOBAL & KONSTANTA APLIKASI
 */
const DEFAULT_CONFIG = {
    villageName: 'Kampung Sinar Gading',
    dusun: ['Sinar Gading RT 1', 'Sinar Gading RT 2', 'Sinar Ogan RT 1', 'Suka Merindu RT 1'],
    kader: ['Kader KPM 1', 'Kader KPM 2', 'Kader KPM 3'],
    posyandu: 'Posyandu CEMPAKA',
    paud: 'PAUD ANISHA'
};

const DB_KEYS = { 
    anak: 'ehdw_anak', 
    rematri: 'ehdw_rematri', 
    catin: 'ehdw_catin', 
    bumil: 'ehdw_bumil' 
};

const CATEGORY_NAMES = { 
    anak: 'Anak 0-59 Bulan', 
    rematri: 'Remaja Putri', 
    catin: 'Catin (Calon Pengantin)', 
    bumil: 'Ibu Hamil & Nifas' 
};

const INDIKATOR_OPTS = `
    <option value="" disabled selected>-- Status Intervensi --</option>
    <option value="Mendapat Layanan">Mendapat Layanan</option>
    <option value="Tidak Mendapat Layanan">Tidak Mendapat Layanan</option>
`;

let currentTabCategory = 'anak';
let dashChartInstance = null;
let detailChartInstance = null;