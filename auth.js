// SHA-256 Hash Fonksiyonu
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Varsayılan kullanıcı bilgileri (SHA-256 hash'li)
const DEFAULT_USERS = {
    'wicenta': {
        // Şifre: "proje123" - SHA256 hash'i
        passwordHash: '97fdb2489a99cb3b866740c2ee4a4768a3a1be64796fd03d25d771463f93daaa',
        role: 'admin'
    }
};

// Admin panel şifresi (aynı: proje123)
const ADMIN_PANEL_PASSWORD = '97fdb2489a99cb3b866740c2ee4a4768a3a1be64796fd03d25d771463f93daaa';

// Session kontrolü
function checkSession() {
    const session = localStorage.getItem('scriptRunner_session');
    
    if (session) {
        const sessionData = JSON.parse(session);
        const now = Date.now();
        
        // Session süresi 1 saat
        const maxAge = 60 * 60 * 1000;
        
        if (now - sessionData.timestamp < maxAge) {
            return sessionData.username;
        } else {
            // Session süresi doldu
            logout();
        }
    }
    return null;
}

// Login işlemi
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');
            
            // Loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '⏳ Giriş yapılıyor...';
            submitBtn.disabled = true;
            
            try {
                // Şifreyi hash'le
                const passwordHash = await sha256(password);
                
                // Kullanıcı kontrolü
                if (DEFAULT_USERS[username] && DEFAULT_USERS[username].passwordHash === passwordHash) {
                    // Başarılı giriş
                    const sessionData = {
                        username: username,
                        role: DEFAULT_USERS[username].role,
                        timestamp: Date.now()
                    };
                    
                    localStorage.setItem('scriptRunner_session', JSON.stringify(sessionData));
                    
                    // Ana sayfaya yönlendir
                    window.location.href = 'index.html';
                } else {
                    // Hatalı giriş
                    errorDiv.textContent = '❌ Kullanıcı adı veya şifre hatalı!';
                    errorDiv.style.display = 'block';
                    
                    // Animasyon
                    loginForm.classList.add('shake');
                    setTimeout(() => loginForm.classList.remove('shake'), 500);
                }
            } catch (error) {
                errorDiv.textContent = '❌ Bir hata oluştu: ' + error.message;
                errorDiv.style.display = 'block';
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

// Logout işlemi
function logout() {
    localStorage.removeItem('scriptRunner_session');
    window.location.href = 'login.html';
}

// Ana sayfa için session kontrolü
function requireAuth() {
    const username = checkSession();
    if (!username) {
        // Uyarı göster
        alert('⚠️ GÜVENLİK UYARISI!\n\nBu sayfaya erişim için giriş yapmanız gerekiyor.\n\nLütfen önce login sayfasından giriş yapın.');
        
        // Login sayfasına yönlendir
        window.location.href = 'login.html';
        return false;
    }
    
    // Kullanıcı bilgisini göster
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) {
        const session = JSON.parse(localStorage.getItem('scriptRunner_session'));
        userInfoElement.textContent = `👤 ${username} (${session.role === 'admin' ? 'Admin' : 'Kullanıcı'})`;
    }
    
    return username;
}

// Şifre hash'i oluşturma fonksiyonu (yeni kullanıcılar eklemek için)
async function generatePasswordHash(password) {
    const hash = await sha256(password);
    console.log('Password Hash:', hash);
    return hash;
}
