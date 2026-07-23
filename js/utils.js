// ============================================================
// ===== UTILITY FUNCTIONS =====
// ============================================================

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    void toast.offsetWidth;
    toast.classList.add('show');
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Format date
function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'Baru saja';
        if (diff < 3600) return Math.floor(diff / 60) + ' menit lalu';
        if (diff < 86400) return Math.floor(diff / 3600) + ' jam lalu';
        if (diff < 604800) return Math.floor(diff / 86400) + ' hari lalu';
        
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return dateStr;
    }
}

// Update date display
function updateDate() {
    const el = document.getElementById('currentDate');
    if (!el) return;
    
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    el.textContent = now.toLocaleDateString('id-ID', options);
}

// Navigation
function navigateTo(page) {
    const pages = {
        'dashboard': 'dashboard.html',
        'lembaga': 'lembaga.html',
        'pendidik': 'pendidik.html',
        'bantuan': 'bantuan.html',
        'laporan': 'laporan.html',
        'pengaturan': 'pengaturan.html',
        'import': 'import.html',
        'mutasi': 'mutasi.html'
    };
    
    const url = pages[page];
    if (url) {
        window.location.href = url;
    } else {
        showToast('Halaman sedang dalam pengembangan', 'warning');
    }
}