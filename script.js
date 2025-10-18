// API Base URL
const API_URL = 'http://localhost:3000/api';

// Kullanıcı bilgisini göster ve admin tab kontrolü
document.addEventListener('DOMContentLoaded', function() {
    const session = localStorage.getItem('scriptRunner_session');
    if (session) {
        const sessionData = JSON.parse(session);
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.textContent = `👤 ${sessionData.username}`;
        }
    }
    
    loadScriptsTable();
});

// Python kurulum .bat dosyası indir
function downloadSetupBat() {
    const batContent = `@echo off
chcp 65001 >nul
echo ================================================
echo    Wicenta Mini Proje - Python Setup
echo    Gerekli Kütüphaneler Kuruluyor...
echo ================================================
echo.

echo [1/5] Python versiyonu kontrol ediliyor...
python --version
if errorlevel 1 (
    echo.
    echo [HATA] Python bulunamadı!
    echo Lütfen önce Python'u kurun: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo.

echo [2/5] pip güncelleniyor...
python -m pip install --upgrade pip
echo.

echo [3/5] Temel kütüphaneler yükleniyor...
pip install requests urllib3 certifi
echo.

echo [4/5] Veri işleme kütüphaneleri yükleniyor...
pip install pandas numpy openpyxl
echo.

echo [5/5] Ek kütüphaneler yükleniyor...
pip install beautifulsoup4 pillow python-dotenv
echo.

echo ================================================
echo    ✅ Kurulum Tamamlandı!
echo ================================================
echo.
echo Yüklenen kütüphaneler:
pip list
echo.
echo Python scriptlerinizi çalıştırmaya hazırsınız!
echo.
pause
`;

    // Blob oluştur ve indir
    const blob = new Blob([batContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wicenta-python-setup.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Log ekle
    if (typeof addLog === 'function') {
        addLog('info', 'Setup dosyası indirildi', 'Python kurulum .bat dosyası oluşturuldu');
    }
    
    // Bilgi ekranı göster
    alert('✅ Kurulum Dosyası İndirildi!\n\n' +
          '📁 Dosya Adı: wicenta-python-setup.bat\n\n' +
          '📋 Yapmanız Gerekenler:\n' +
          '1. İndirilen dosyayı bulun (genelde İndirilenler klasöründe)\n' +
          '2. Dosyaya çift tıklayarak çalıştırın\n' +
          '3. Kurulum otomatik olarak tamamlanacaktır\n\n' +
          '⚠️ Önemli: Kurulum sırasında herhangi bir hata alırsanız,\n' +
          'ekran görüntüsü alıp Doğukan Yeşilyurt ile iletişime geçin.\n\n' +
          'Kurulum dosyası yukarıdaki rehbere göre hazırlanmıştır.');
}

// Python indirme sonrası bilgilendirme
function showPythonInstallGuide() {
    setTimeout(() => {
        alert('📥 Python İndiriliyor...\n\n' +
              '📋 İndirme Tamamlandıktan Sonra:\n\n' +
              '1. İndirilen "python-3.14.0-amd64.exe" dosyasını açın\n' +
              '2. ✅ "Add Python to PATH" kutusunu işaretleyin (ÇOK ÖNEMLİ!)\n' +
              '3. "Install Now" butonuna tıklayın\n' +
              '4. Kurulum bitince bilgisayarı yeniden başlatın\n\n' +
              '⚠️ Kurulum sırasında sorun yaşarsanız:\n' +
              'Ekran görüntüsü alıp Doğukan Yeşilyurt ile iletişime geçin.\n\n' +
              'Python kurulumu bittikten sonra "2. Adım" olan\n' +
              '"Kütüphane Kurulum Dosyasını İndir" butonuna tıklayın!');
    }, 500);
}

// Tab değiştirme fonksiyonu
function openTab(evt, tabName) {
    // Tüm tab içeriklerini gizle
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }
    
    // Tüm tab butonlarından active sınıfını kaldır
    const tabButtons = document.getElementsByClassName("tab-button");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }
    
    // Seçili tab'ı göster ve butonu aktif et
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
    
    // Scripts tab'ına geçildiğinde tabloyu yükle
    if (tabName === 'scripts') {
        loadScriptsTable();
    }
}

// Dosya yükleme kaldırıldı - Kullanıcılar manuel olarak scripts klasörüne ekleyecek

// Script tipini belirle
function getScriptType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
        'py': 'Python',
        'sql': 'SQL',
        'js': 'JavaScript',
        'txt': 'Text'
    };
    return types[ext] || 'Unknown';
}

// Dosya boyutunu formatla
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Scriptleri yenile
function refreshScripts() {
    loadScriptsTable();
    showNotification('✓ Scriptler yenilendi!', 'success');
}

// Tabloyu yükle (sunucudan)
async function loadScriptsTable() {
    const tbody = document.getElementById('scriptsTableBody');
    
    if (!tbody) return;
    
    try {
        const response = await fetch(`${API_URL}/scripts`);
        const scripts = await response.json();
        
        if (scripts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-state">
                            <div class="icon">📂</div>
                            <h3>Henüz script eklenmedi</h3>
                            <p>"➕ Script Ekle" butonuna tıklayarak başlayın veya "scripts" klasörüne dosya koyun</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = scripts.map((script, index) => `
            <tr>
                <td><strong>${script.name}</strong></td>
                <td><span class="script-type-badge badge-${script.type.toLowerCase()}">${script.type}</span></td>
                <td>${script.size}</td>
                <td>${script.date}</td>
                <td>
                    <div class="script-actions">
                        <button class="action-btn btn-run" onclick="runScript('${script.name}')" title="Çalıştır">
                            ▶ Çalıştır
                        </button>
                        <button class="action-btn btn-stop" onclick="stopScript('${script.name}')" title="Durdur">
                            ⏹ Durdur
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <div class="icon">❌</div>
                        <h3>Sunucuya bağlanılamadı</h3>
                        <p>Lütfen "npm start" ile sunucuyu başlatın</p>
                        <p style="color: #e74c3c; margin-top: 10px;">${error.message}</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Script'i çalıştır (GERÇEK ÇALIŞTIRMA!)
async function runScript(filename, mode = 'desktop') {
    const preview = document.getElementById('scriptPreview');
    
    if (mode === 'desktop') {
        preview.innerHTML = `<span class="info">🖥️ ${filename} masaüstünde başlatılıyor...</span>\n<span class="warning">Yeni pencere açılacak...</span>\n\n`;
    } else {
        preview.innerHTML = `<span class="info">⚙️ ${filename} server'da çalıştırılıyor...</span>\n<span class="warning">Lütfen bekleyin...</span>\n\n`;
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        const response = await fetch(`${API_URL}/run/${filename}?mode=${mode}`, {
            method: 'POST',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (data.error && !data.output) {
            preview.innerHTML = `<span class="error">✗ Hata: ${data.error}</span>`;
        } else {
            if (mode === 'desktop') {
                preview.innerHTML = `<span class="success">✓ ${filename} masaüstünde başlatıldı!</span>\n\n${data.output}`;
            } else {
                preview.innerHTML = `<span class="success">✓ ${filename} server'da çalıştırıldı!</span>\n\n${data.output}`;
            }
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            preview.innerHTML = `<span class="error">✗ Timeout: Script çok uzun sürdü (60 saniye)</span>`;
        } else {
            preview.innerHTML = `<span class="error">✗ Bağlantı Hatası: ${error.message}\n\nSunucunun çalıştığından emin olun!</span>`;
        }
    }
}

// Script'i durdur
async function stopScript(filename) {
    try {
        await fetch(`${API_URL}/script/stop/${filename}`, {
            method: 'POST'
        });
        
        showNotification('⏹ Script durduruldu: ' + filename, 'info');
        
        if (typeof addLog === 'function') {
            addLog('info', 'Script durduruldu', filename);
        }
    } catch (error) {
        alert('Durdurma hatası: ' + error.message);
    }
}

// Çıktıyı temizle
function clearScriptOutput() {
    const preview = document.getElementById('scriptPreview');
    if (preview) {
        preview.innerHTML = 'Script seçin veya çalıştırın...';
    }
}

// Bildirim göster
function showNotification(message, type = 'info') {
    const preview = document.getElementById('scriptPreview');
    if (preview) {
        const oldContent = preview.innerHTML;
        preview.innerHTML = `<span class="${type}">${message}</span>\n\n${oldContent}`;
    }
}
