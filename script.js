// API Base URL
const API_URL = 'http://localhost:3000/api';

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

// Dosya yükleme
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    loadScriptsTable();
});

async function handleFileSelect(event) {
    const files = event.target.files;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            console.log('Dosya yüklendi:', result.filename);
        } catch (error) {
            console.error('Yükleme hatası:', error);
            alert('Dosya yüklenirken hata oluştu: ' + error.message);
        }
    }
    
    // Input'u temizle ve tabloyu yenile
    event.target.value = '';
    loadScriptsTable();
}

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
                        <button class="action-btn btn-view" onclick="viewScript('${script.name}')" title="Görüntüle">
                            👁️ Görüntüle
                        </button>
                        <button class="action-btn btn-delete" onclick="deleteScript('${script.name}')" title="Sil">
                            🗑️ Sil
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

// Script'i görüntüle
async function viewScript(filename) {
    const preview = document.getElementById('scriptPreview');
    
    try {
        const response = await fetch(`${API_URL}/script/${filename}`);
        const data = await response.json();
        
        preview.innerHTML = `<span class="info">📄 ${filename}</span>\n\n` + 
                           `<span class="success">--- Script İçeriği ---</span>\n\n` +
                           data.content;
    } catch (error) {
        preview.innerHTML = `<span class="error">✗ Hata: ${error.message}</span>`;
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

// Script'i sil
async function deleteScript(filename) {
    if (confirm(`"${filename}" dosyasını silmek istediğinize emin misiniz?`)) {
        try {
            await fetch(`${API_URL}/script/${filename}`, {
                method: 'DELETE'
            });
            
            loadScriptsTable();
            clearScriptOutput();
            showNotification('✓ Script silindi!', 'success');
        } catch (error) {
            alert('Silme hatası: ' + error.message);
        }
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

// Python Script Çalıştırma (Simülasyon)
function runPythonScript() {
    const code = document.getElementById("pythonEditor").value;
    const output = document.getElementById("pythonOutput");
    
    output.innerHTML = '<span class="info">🐍 Python script çalıştırılıyor...</span>\n\n';
    
    setTimeout(() => {
        try {
            // Python kodunu simüle et (gerçek Python çalıştırması için backend gerekir)
            let result = simulatePython(code);
            output.innerHTML += `<span class="success">✓ Başarıyla çalıştırıldı!</span>\n\n${result}`;
        } catch (error) {
            output.innerHTML += `<span class="error">✗ Hata: ${error.message}</span>`;
        }
    }, 500);
}

// Python simülasyonu (basit bir yorumlayıcı)
function simulatePython(code) {
    let result = "";
    
    // Print statement'leri yakala
    const printRegex = /print\((.*?)\)/g;
    const prints = code.match(printRegex);
    
    if (prints) {
        prints.forEach(print => {
            let content = print.replace(/print\(|\)/g, '');
            content = content.replace(/"/g, '').replace(/'/g, '');
            result += content + '\n';
        });
    }
    
    // Basit hesaplamalar
    if (code.includes('toplam(5, 3)')) {
        result = result.replace('toplam(5, 3)', '8');
    }
    if (code.includes('carpim(4, 7)')) {
        result = result.replace('carpim(4, 7)', '28');
    }
    if (code.includes('sum(sayilar)')) {
        result = result.replace('sum(sayilar)', '15');
    }
    if (code.includes('[x**2 for x in sayilar]')) {
        result = result.replace('[x**2 for x in sayilar]', '[1, 4, 9, 16, 25]');
    }
    
    return result || "Kod çalıştırıldı ancak çıktı üretilmedi.";
}

// SQL Script Çalıştırma (Demo Veritabanı)
function runSQLScript() {
    const code = document.getElementById("sqlEditor").value;
    const output = document.getElementById("sqlOutput");
    
    output.innerHTML = '<span class="info">🗄️ SQL sorgusu çalıştırılıyor...</span>\n\n';
    
    setTimeout(() => {
        try {
            let result = executeSQL(code);
            output.innerHTML += `<span class="success">✓ Sorgu başarıyla çalıştırıldı!</span>\n\n${result}`;
        } catch (error) {
            output.innerHTML += `<span class="error">✗ SQL Hatası: ${error.message}</span>`;
        }
    }, 500);
}

// Demo SQL veritabanı
const demoDatabase = {
    users: [
        { id: 1, name: "Ahmet Yılmaz", age: 28, city: "İstanbul" },
        { id: 2, name: "Ayşe Demir", age: 34, city: "Ankara" },
        { id: 3, name: "Mehmet Kaya", age: 25, city: "İzmir" },
        { id: 4, name: "Fatma Şahin", age: 31, city: "İstanbul" },
        { id: 5, name: "Ali Yıldız", age: 29, city: "Bursa" }
    ]
};

// SQL sorgu simülasyonu
function executeSQL(query) {
    query = query.toLowerCase().trim();
    
    // SELECT * FROM users
    if (query.includes('select * from users') && !query.includes('where')) {
        return createTable(demoDatabase.users);
    }
    
    // ORDER BY age DESC
    if (query.includes('order by age desc')) {
        const sorted = [...demoDatabase.users].sort((a, b) => b.age - a.age);
        return createTable(sorted);
    }
    
    // WHERE city = 'İstanbul'
    if (query.includes("where city = 'istanbul'") || query.includes('where city = "istanbul"')) {
        const filtered = demoDatabase.users.filter(u => u.city.toLowerCase() === 'istanbul');
        return createTable(filtered);
    }
    
    // AVG(age)
    if (query.includes('avg(age)')) {
        const avg = demoDatabase.users.reduce((sum, u) => sum + u.age, 0) / demoDatabase.users.length;
        return `Ortalama Yaş: ${avg.toFixed(2)}`;
    }
    
    // SELECT specific columns
    if (query.includes('select name, age, city')) {
        const data = demoDatabase.users.map(u => ({ name: u.name, age: u.age, city: u.city }));
        return createTable(data);
    }
    
    return "Sorgu sonuçlandırıldı. (Basit demo veritabanı - tüm SQL özellikleri desteklenmeyebilir)";
}

// HTML tablo oluştur
function createTable(data) {
    if (data.length === 0) return "Sonuç bulunamadı.";
    
    const keys = Object.keys(data[0]);
    let table = '<table><thead><tr>';
    
    keys.forEach(key => {
        table += `<th>${key.toUpperCase()}</th>`;
    });
    table += '</tr></thead><tbody>';
    
    data.forEach(row => {
        table += '<tr>';
        keys.forEach(key => {
            table += `<td>${row[key]}</td>`;
        });
        table += '</tr>';
    });
    
    table += '</tbody></table>';
    return table;
}

// JavaScript Çalıştırma
function runJavaScript() {
    const code = document.getElementById("jsEditor").value;
    const output = document.getElementById("jsOutput");
    
    output.innerHTML = '<span class="info">⚡ JavaScript kodu çalıştırılıyor...</span>\n\n';
    
    // Console.log'u yakala
    const originalLog = console.log;
    let logs = [];
    
    console.log = function(...args) {
        logs.push(args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
            }
            return String(arg);
        }).join(' '));
        originalLog.apply(console, args);
    };
    
    setTimeout(() => {
        try {
            // Kodu çalıştır
            eval(code);
            
            // Sonuçları göster
            if (logs.length > 0) {
                output.innerHTML += '<span class="success">✓ Başarıyla çalıştırıldı!</span>\n\n' + logs.join('\n');
            } else {
                output.innerHTML += '<span class="success">✓ Kod çalıştırıldı (çıktı yok)</span>';
            }
        } catch (error) {
            output.innerHTML += `<span class="error">✗ JavaScript Hatası:\n${error.message}\n${error.stack}</span>`;
        } finally {
            // Console.log'u geri yükle
            console.log = originalLog;
        }
    }, 100);
}

// Editör temizleme
function clearEditor(type) {
    document.getElementById(`${type}Editor`).value = '';
}

// Çıktı temizleme
function clearOutput(type) {
    if (type === 'javascript') {
        document.getElementById('jsOutput').innerHTML = '';
    } else if (type === 'python') {
        document.getElementById('pythonOutput').innerHTML = '';
    } else if (type === 'sql') {
        document.getElementById('sqlOutput').innerHTML = '';
    }
}

// Klavye kısayolları
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter: Çalıştır
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const tabId = activeTab.id;
            if (tabId === 'python') runPythonScript();
            else if (tabId === 'sql') runSQLScript();
            else if (tabId === 'javascript') runJavaScript();
        }
        e.preventDefault();
    }
});

// Sayfa yüklendiğinde bilgilendirme
window.addEventListener('load', () => {
    console.log('🚀 Script Runner hazır!');
    console.log('💡 İpucu: Ctrl+Enter ile kodu hızlıca çalıştırabilirsiniz');
});
