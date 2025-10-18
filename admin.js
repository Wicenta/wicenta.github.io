// Admin Panel Yönetimi

// Admin tab'ı göster/gizle (sadece admin kullanıcılar için)
function checkAdminAccess() {
    const session = localStorage.getItem('scriptRunner_session');
    if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData.role === 'admin') {
            const adminTabButton = document.getElementById('adminTabButton');
            if (adminTabButton) {
                adminTabButton.style.display = 'block';
            }
        }
    }
}

// Sayfa yüklendiğinde admin erişimini kontrol et
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    setupAdminPanel();
});

// Admin tab'ını aç
function openAdminTab(evt) {
    openTab(evt, 'admin');
    // Admin auth durumunu kontrol et
    const adminPanelAuth = sessionStorage.getItem('adminPanelAuth');
    if (adminPanelAuth !== 'true') {
        showAdminAuth();
    } else {
        showAdminPanel();
        loadAdminScripts();
        loadLogs();
    }
}

// Admin kimlik doğrulamayı göster
function showAdminAuth() {
    document.getElementById('adminAuth').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

// Admin paneli göster
function showAdminPanel() {
    document.getElementById('adminAuth').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

// Admin paneli kilitle
function lockAdminPanel() {
    sessionStorage.removeItem('adminPanelAuth');
    showAdminAuth();
    document.getElementById('adminPassword').value = '';
    addLog('info', 'Admin paneli kilitlendi', 'Panel güvenlik kilidi aktifleştirildi');
}

// Admin panel setup
function setupAdminPanel() {
    // Admin auth form
    const adminAuthForm = document.getElementById('adminAuthForm');
    if (adminAuthForm) {
        adminAuthForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const password = document.getElementById('adminPassword').value;
            const errorDiv = document.getElementById('adminAuthError');
            
            try {
                const passwordHash = await sha256(password);
                
                if (passwordHash === ADMIN_PANEL_PASSWORD) {
                    sessionStorage.setItem('adminPanelAuth', 'true');
                    showAdminPanel();
                    loadAdminScripts();
                    loadLogs();
                    document.getElementById('adminPassword').value = '';
                    addLog('success', 'Admin paneli açıldı', 'Yönetici başarıyla giriş yaptı');
                } else {
                    errorDiv.textContent = '❌ Yanlış şifre!';
                    errorDiv.style.display = 'block';
                    setTimeout(() => {
                        errorDiv.style.display = 'none';
                    }, 3000);
                    addLog('warning', 'Admin paneli giriş hatası', 'Hatalı şifre denemesi');
                }
            } catch (error) {
                errorDiv.textContent = '❌ Hata: ' + error.message;
                errorDiv.style.display = 'block';
                addLog('error', 'Admin paneli hatası', error.message);
            }
        });
    }
}

// ==========================================
// LOG SİSTEMİ
// ==========================================

// LocalStorage'da log tut
function addLog(type, action, details) {
    const session = localStorage.getItem('scriptRunner_session');
    let username = 'Bilinmeyen';
    
    if (session) {
        const sessionData = JSON.parse(session);
        username = sessionData.username;
    }
    
    const log = {
        id: Date.now(),
        type: type, // success, error, warning, info
        action: action,
        details: details,
        username: username,
        timestamp: new Date().toISOString()
    };
    
    // Mevcut logları al
    let logs = JSON.parse(localStorage.getItem('scriptRunner_logs') || '[]');
    
    // Yeni logu başa ekle
    logs.unshift(log);
    
    // Son 1000 logu tut
    if (logs.length > 1000) {
        logs = logs.slice(0, 1000);
    }
    
    // Kaydet
    localStorage.setItem('scriptRunner_logs', JSON.stringify(logs));
    
    // Eğer log sayfası açıksa, güncelle
    const logsContainer = document.getElementById('logsContainer');
    if (logsContainer && logsContainer.parentElement.style.display !== 'none') {
        loadLogs();
    }
}

// Logları yükle
function loadLogs() {
    const logsContainer = document.getElementById('logsContainer');
    if (!logsContainer) return;
    
    const logs = JSON.parse(localStorage.getItem('scriptRunner_logs') || '[]');
    
    if (logs.length === 0) {
        logsContainer.innerHTML = '<div class="loading">Henüz log kaydı yok</div>';
        const logCount = document.getElementById('logCount');
        if (logCount) logCount.textContent = '0 Log';
        return;
    }
    
    const logCount = document.getElementById('logCount');
    if (logCount) logCount.textContent = `${logs.length} Log`;
    
    let html = '';
    logs.forEach(log => {
        const date = new Date(log.timestamp);
        const formattedTime = date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const typeEmoji = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        
        html += `
            <div class="log-entry ${log.type}">
                <div class="log-header">
                    <span class="log-type">${typeEmoji[log.type] || 'ℹ️'} ${log.action}</span>
                    <span class="log-time">${formattedTime}</span>
                </div>
                <div class="log-message">${log.details}</div>
                <div class="log-user">👤 ${log.username}</div>
            </div>
        `;
    });
    
    logsContainer.innerHTML = html;
}

// Logları temizle
function clearLogs() {
    if (confirm('⚠️ Tüm loglar silinecek! Emin misiniz?')) {
        localStorage.removeItem('scriptRunner_logs');
        loadLogs();
        addLog('warning', 'Loglar temizlendi', 'Tüm log geçmişi silindi');
    }
}

// Logları indir
function downloadLogs() {
    const logs = JSON.parse(localStorage.getItem('scriptRunner_logs') || '[]');
    
    if (logs.length === 0) {
        alert('⚠️ İndirilecek log yok!');
        return;
    }
    
    let content = '# Script Runner - Activity Logs\n';
    content += `# Oluşturulma: ${new Date().toLocaleString('tr-TR')}\n`;
    content += `# Toplam Log: ${logs.length}\n\n`;
    content += '='.repeat(80) + '\n\n';
    
    logs.forEach(log => {
        const date = new Date(log.timestamp);
        const formattedTime = date.toLocaleString('tr-TR');
        
        content += `[${formattedTime}] - ${log.type.toUpperCase()}\n`;
        content += `Kullanıcı: ${log.username}\n`;
        content += `İşlem: ${log.action}\n`;
        content += `Detay: ${log.details}\n`;
        content += '-'.repeat(80) + '\n\n';
    });
    
    // Dosyayı indir
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addLog('info', 'Loglar indirildi', `${logs.length} log dosyası olarak kaydedildi`);
}

// ==========================================
// SCRIPT YÖNETİMİ (UPLOAD KALDIRILDI - MANUEL EKLEME)
// ==========================================

// Admin scriptlerini listele
function loadAdminScripts() {
    fetch(`${API_URL}/api/scripts`)
        .then(response => response.json())
        .then(scripts => {
            displayAdminScripts(scripts);
            updateAdminStats(scripts);
        })
        .catch(error => {
            console.error('Scriptler yüklenemedi:', error);
            const adminScriptsList = document.getElementById('adminScriptsList');
            if (adminScriptsList) {
                adminScriptsList.innerHTML = '<div class="error">❌ Scriptler yüklenemedi</div>';
            }
            addLog('error', 'Script listesi hatası', error.message);
        });
}

// Admin scriptlerini göster
function displayAdminScripts(scripts) {
    const container = document.getElementById('adminScriptsList');
    if (!container) return;
    
    if (scripts.length === 0) {
        container.innerHTML = '<div class="loading">Henüz script yok</div>';
        return;
    }
    
    let html = '';
    scripts.forEach(script => {
        const typeIcon = script.type === 'python' ? '🐍' : 
                        script.type === 'sql' ? '🗄️' : '⚡';
        
        html += `
            <div class="admin-script-item" data-filename="${script.name}">
                <div class="script-info">
                    <span class="script-icon">${typeIcon}</span>
                    <div class="script-details">
                        <div class="script-name">${script.name}</div>
                        <div class="script-meta">
                            ${script.size} • ${script.modified}
                        </div>
                    </div>
                </div>
                <div class="script-actions">
                    <button onclick="viewScriptAdmin('${script.name}')" class="view-btn" title="Görüntüle">
                        👁️
                    </button>
                    <button onclick="downloadScript('${script.name}')" class="download-btn-small" title="İndir">
                        💾
                    </button>
                    <button onclick="deleteScriptAdmin('${script.name}')" class="delete-btn" title="Sil">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Admin istatistiklerini güncelle
function updateAdminStats(scripts) {
    let pythonCount = 0, sqlCount = 0, jsCount = 0, totalSize = 0;
    
    scripts.forEach(script => {
        if (script.type === 'python') pythonCount++;
        else if (script.type === 'sql') sqlCount++;
        else if (script.type === 'javascript') jsCount++;
        
        // Boyutu parse et (KB veya B)
        const sizeMatch = script.size.match(/(\d+(?:\.\d+)?)\s*(KB|B)/);
        if (sizeMatch) {
            const value = parseFloat(sizeMatch[1]);
            const unit = sizeMatch[2];
            totalSize += unit === 'KB' ? value : value / 1024;
        }
    });
    
    const pythonCountElem = document.getElementById('pythonCount');
    const sqlCountElem = document.getElementById('sqlCount');
    const jsCountElem = document.getElementById('jsCount');
    const totalSizeElem = document.getElementById('totalSize');
    const scriptCountElem = document.getElementById('scriptCount');
    
    if (pythonCountElem) pythonCountElem.textContent = pythonCount;
    if (sqlCountElem) sqlCountElem.textContent = sqlCount;
    if (jsCountElem) jsCountElem.textContent = jsCount;
    if (totalSizeElem) totalSizeElem.textContent = totalSize.toFixed(2) + ' KB';
    if (scriptCountElem) scriptCountElem.textContent = `${scripts.length} Script`;
}

// Script'i görüntüle (admin)
function viewScriptAdmin(filename) {
    fetch(`${API_URL}/api/script/${filename}`)
        .then(response => response.text())
        .then(content => {
            showScriptModal(filename, content);
            addLog('info', 'Script görüntülendi', `${filename} dosyası incelendi`);
        })
        .catch(error => {
            alert('❌ Script okunamadı: ' + error.message);
            addLog('error', 'Script görüntüleme hatası', `${filename}: ${error.message}`);
        });
}

// Script'i sil (admin)
function deleteScriptAdmin(filename) {
    if (!confirm(`⚠️ "${filename}" silinecek! Emin misiniz?`)) return;
    
    fetch(`${API_URL}/api/script/${filename}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Animasyon ile kaldır
            const item = document.querySelector(`[data-filename="${filename}"]`);
            if (item) {
                item.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    loadAdminScripts();
                }, 300);
            }
            addLog('warning', 'Script silindi', `${filename} dosyası kalıcı olarak silindi`);
        } else {
            alert('❌ Silme işlemi başarısız: ' + data.message);
            addLog('error', 'Script silme hatası', `${filename}: ${data.message}`);
        }
    })
    .catch(error => {
        alert('❌ Hata: ' + error.message);
        addLog('error', 'Script silme hatası', `${filename}: ${error.message}`);
    });
}

// Script'i indir
function downloadScript(filename) {
    fetch(`${API_URL}/api/script/${filename}`)
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addLog('success', 'Script indirildi', `${filename} dosyası bilgisayara kaydedildi`);
        })
        .catch(error => {
            alert('❌ İndirme hatası: ' + error.message);
            addLog('error', 'Script indirme hatası', `${filename}: ${error.message}`);
        });
}

// Script modal göster
function showScriptModal(filename, content) {
    const modal = document.getElementById('scriptModal');
    const modalTitle = document.getElementById('modalScriptName');
    const modalContent = document.getElementById('modalScriptContent');
    
    if (!modal) return;
    
    modalTitle.textContent = filename;
    modalContent.textContent = content;
    modal.style.display = 'flex';
}

// Script arama/filtre
function filterAdminScripts() {
    const searchInput = document.getElementById('adminSearch');
    if (!searchInput) return;
    
    const searchValue = searchInput.value.toLowerCase();
    const items = document.querySelectorAll('.admin-script-item');
    
    items.forEach(item => {
        const filename = item.getAttribute('data-filename').toLowerCase();
        if (filename.includes(searchValue)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}
