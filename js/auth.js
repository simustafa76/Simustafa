// ============================================================
// ===== AUTH FUNCTIONS =====
// ============================================================

// Check authentication
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error || !session) {
            window.location.href = 'index.html';
            return false;
        }
        
        // Get user profile
        const { data: userData } = await supabaseClient
            .from('users')
            .select('name, role')
            .eq('id', session.user.id)
            .single();
        
        if (userData) {
            document.getElementById('userName').textContent = userData.name || 'User';
            document.getElementById('userAvatar').textContent = (userData.name || 'U').charAt(0).toUpperCase();
        }
        
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'index.html';
        return false;
    }
}

// Logout
async function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        try {
            await supabaseClient.auth.signOut();
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            showToast('Gagal logout: ' + error.message, 'error');
        }
    }
}
