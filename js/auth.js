// ============================================================
// js/auth.js - VERSI SEDERHANA
// ============================================================

let currentUser = null;

// ============================================================
// CHECK AUTH
// ============================================================
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error || !session) {
            window.location.href = 'index.html';
            return false;
        }

        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('id, name, email, role, kecamatan_id, lembaga_id, active')
            .eq('id', session.user.id)
            .single();

        if (userError || !userData || !userData.active) {
            console.error('User data error:', userError);
            await supabaseClient.auth.signOut();
            window.location.href = 'index.html';
            return false;
        }

        currentUser = {
            id: userData.id,
            name: userData.name || session.user.email,
            email: session.user.email,
            role: userData.role || 'operator',
            kecamatan_id: userData.kecamatan_id,
            lembaga_id: userData.lembaga_id
        };

        // Update UI header
        updateUserUI(currentUser);

        // Cek jika user adalah OPERATOR -> redirect ke operator.html
        if (currentUser.role === 'operator') {
            const currentPage = window.location.pathname.split('/').pop();
            // Jangan redirect jika sudah di operator.html
            if (currentPage !== 'operator.html') {
                window.location.href = 'operator.html';
                return false;
            }
        }

        return true;
        
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'index.html';
        return false;
    }
}

// ============================================================
// UPDATE UI HEADER
// ============================================================
function updateUserUI(user) {
    // Nama & Avatar
    const nameEl = document.getElementById('userName');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl) nameEl.textContent = user.name;
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();

    // Role Badge
    const oldBadge = document.querySelector('.role-badge');
    if (oldBadge) oldBadge.remove();

    const roleNames = {
        'super_admin': '🛡️ Super Admin',
        'admin_kab': '🏛️ Admin Kabupaten',
        'batko': '📘 BATKO',
        'fkdt': '📗 FKDT',
        'ponpes': '📕 PONPES',
        'operator': '📋 Operator'
    };

    const badge = document.createElement('span');
    badge.className = 'role-badge';
    badge.textContent = roleNames[user.role] || user.role.toUpperCase();
    badge.style.cssText = `
        background: #006400;
        color: white;
        padding: 4px 14px;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 600;
        display: inline-block;
        margin-right: 12px;
    `;

    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
        headerRight.prepend(badge);
    }

    // Scope (kecamatan/lembaga) - hanya untuk non-admin
    const oldScope = document.querySelector('.role-scope');
    if (oldScope) oldScope.remove();

    if (user.role === 'super_admin' || user.role === 'admin_kab') {
        return;
    }

    const scope = document.createElement('span');
    scope.className = 'role-scope';
    scope.style.cssText = `
        font-size: 0.65rem;
        color: #888;
        margin-right: 12px;
    `;

    if (user.kecamatan_id) {
        supabaseClient
            .from('master_kecamatan')
            .select('nama')
            .eq('id', user.kecamatan_id)
            .single()
            .then(({ data }) => {
                const jenis = {
                    'batko': 'LPQ',
                    'fkdt': 'MDT',
                    'ponpes': 'PONPES'
                };
                scope.textContent = `📍 ${data?.nama || 'Kecamatan'} • ${jenis[user.role] || ''}`;
                if (headerRight) headerRight.prepend(scope);
            });
    } else if (user.lembaga_id) {
        supabaseClient
            .from('lembaga')
            .select('nama')
            .eq('id', user.lembaga_id)
            .single()
            .then(({ data }) => {
                scope.textContent = `🏫 ${data?.nama || 'Lembaga'}`;
                if (headerRight) headerRight.prepend(scope);
            });
    }
}

// ============================================================
// GET FUNCTIONS
// ============================================================
function getUser() {
    return currentUser;
}

function getRoleFilter() {
    if (!currentUser) return {};

    const role = currentUser.role;
    const filter = {};

    // SUPER ADMIN & ADMIN KAB → TANPA FILTER (lihat semua)
    if (role === 'super_admin' || role === 'admin_kab') {
        return {};
    }

    // BATKO, FKDT, PONPES harus punya kecamatan_id
    if (!currentUser.kecamatan_id) {
        console.warn('User role', role, 'tidak memiliki kecamatan_id');
        return { restrict: true };
    }

    filter.kecamatan_id = currentUser.kecamatan_id;

    // Filter berdasarkan jenis lembaga sesuai role
    if (role === 'batko') {
        filter.jenis_lembaga = 'LPQ';
    } else if (role === 'fkdt') {
        filter.jenis_lembaga = 'MDT';
    } else if (role === 'ponpes') {
        filter.jenis_lembaga = 'PONPES';
    }

    return filter;
}

function isAdminRole() {
    if (!currentUser) return false;
    return ['super_admin', 'admin_kab'].includes(currentUser.role);
}

function isKecamatanRole() {
    if (!currentUser) return false;
    return ['batko', 'fkdt', 'ponpes'].includes(currentUser.role);
}

function isOperatorRole() {
    if (!currentUser) return false;
    return currentUser.role === 'operator';
}