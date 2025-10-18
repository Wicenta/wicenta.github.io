const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Scripts klasörü
const SCRIPTS_DIR = path.join(__dirname, 'scripts');
if (!fs.existsSync(SCRIPTS_DIR)) {
    fs.mkdirSync(SCRIPTS_DIR);
}

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, SCRIPTS_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Scripts listesini getir
app.get('/api/scripts', (req, res) => {
    try {
        const files = fs.readdirSync(SCRIPTS_DIR);
        const scripts = files.map(filename => {
            const filepath = path.join(SCRIPTS_DIR, filename);
            const stats = fs.statSync(filepath);
            const ext = path.extname(filename).toLowerCase();
            
            let type = 'Unknown';
            if (ext === '.py') type = 'Python';
            else if (ext === '.sql') type = 'SQL';
            else if (ext === '.js') type = 'JavaScript';
            
            return {
                name: filename,
                type: type,
                size: formatFileSize(stats.size),
                date: stats.mtime.toLocaleString('tr-TR'),
                path: filepath
            };
        });
        
        res.json(scripts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Script içeriğini getir
app.get('/api/script/:filename', (req, res) => {
    try {
        const filepath = path.join(SCRIPTS_DIR, req.params.filename);
        const content = fs.readFileSync(filepath, 'utf8');
        res.json({ content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Script yükle
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        res.json({ 
            success: true, 
            filename: req.file.filename 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Script çalıştır
app.post('/api/run/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(SCRIPTS_DIR, filename);
    const ext = path.extname(filename).toLowerCase();
    const mode = req.query.mode || 'desktop'; // 'desktop' veya 'server'
    
    let command = '';
    let execOptions = { 
        timeout: 60000,
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        windowsHide: mode === 'server' // Server modda pencere gizli
    };
    
    if (ext === '.py') {
        if (mode === 'desktop') {
            // Python'u yeni terminal penceresinde aç
            command = `start "Python Script - ${filename}" cmd /k "chcp 65001 && python -u "${filepath}" && pause"`;
            
            exec(command, { windowsHide: false }, (error) => {
                if (error) {
                    console.error('Python başlatma hatası:', error);
                }
            });
            
            return res.json({
                output: `✓ ${filename} masaüstünde yeni pencerede başlatıldı!\n\nScript masaüstünde çalışıyor...`,
                error: null
            });
        } else {
            // Server'da çalıştır ve sonucu döndür
            command = `chcp 65001 >nul && python -u "${filepath}"`;
        }
        
    } else if (ext === '.sql') {
        return res.json({ 
            output: 'SQL çalıştırma için veritabanı bağlantısı gerekiyor.\nŞu an sadece Python ve JavaScript destekleniyor.',
            error: null
        });
        
    } else if (ext === '.js') {
        if (mode === 'desktop') {
            // JavaScript'i yeni terminal penceresinde aç
            command = `start "JavaScript Script - ${filename}" cmd /k "node "${filepath}" && pause"`;
            
            exec(command, { windowsHide: false }, (error) => {
                if (error) {
                    console.error('Node.js başlatma hatası:', error);
                }
            });
            
            return res.json({
                output: `✓ ${filename} masaüstünde yeni pencerede başlatıldı!\n\nScript masaüstünde çalışıyor...`,
                error: null
            });
        } else {
            // Server'da çalıştır
            command = `node "${filepath}"`;
        }
    } else {
        return res.status(400).json({ 
            error: 'Desteklenmeyen dosya tipi' 
        });
    }
    
    // Server modda çalıştır ve çıktıyı döndür
    if (mode === 'server') {
        exec(command, execOptions, (error, stdout, stderr) => {
            let output = stdout || stderr;
            
            if (output && Buffer.isBuffer(output)) {
                output = output.toString('utf8');
            }
            
            res.json({
                output: output || 'Kod çalıştırıldı (çıktı yok)',
                error: error ? `Hata Kodu: ${error.code}\n${error.message}` : null
            });
        });
    }
});

// Script sil
app.delete('/api/script/:filename', (req, res) => {
    try {
        const filepath = path.join(SCRIPTS_DIR, req.params.filename);
        fs.unlinkSync(filepath);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Yardımcı fonksiyon
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

app.listen(PORT, () => {
    console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
    console.log(`📁 Scripts klasörü: ${SCRIPTS_DIR}`);
});
