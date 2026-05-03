const express = require('express');
const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = 3333;
const ANIMATIONS_DIR = path.join(__dirname, 'animations');
const ENGINE_SCRIPT = path.join(__dirname, 'engine', 'rgb_engine.py');
const CACHE_FILE = path.join(__dirname, 'cache.json');
const PYTHON_CMD = process.platform === 'win32' ? 'python' : 'python3';

let currentCache = { active: 'wavy', profiles: {} };
if (fs.existsSync(CACHE_FILE)) {
    try {
        const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        if (data.profiles) {
            currentCache = data;
        } else if (data.animation) {
            currentCache.active = data.animation;
            currentCache.profiles[data.animation] = data.params || {};
        }
    } catch (e) { }
}

function saveCache() {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(currentCache));
}

// ==================== EXPRESS ====================
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/animations', (req, res) => {
    try {
        const files = fs.readdirSync(ANIMATIONS_DIR).filter(f => f.endsWith('.json'));
        const animations = files.map(file => {
            const raw = fs.readFileSync(path.join(ANIMATIONS_DIR, file), 'utf8');
            const anim = JSON.parse(raw);
            const { code, ...meta } = anim;
            return meta;
        });
        res.json(animations);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

function loadAnimationCode(animId) {
    const file = path.join(ANIMATIONS_DIR, animId + '.json');
    if (!fs.existsSync(file)) return null;
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        console.error(`[Server] Błąd/Error ${animId}.json:`, e.message);
        return null;
    }
}

const server = http.createServer(app);

// ==================== WEBSOCKET ====================
const wss = new WebSocketServer({ server });

// ==================== PYTHON PROCESS ====================
let pythonProcess = null;
let engineReady = false;

function startPython() {
    console.log(`[Engine] Uruchamiam/Starting Python: ${ENGINE_SCRIPT}`);
    pythonProcess = spawn(PYTHON_CMD, [ENGINE_SCRIPT], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    pythonProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        lines.forEach(line => {
            try {
                const msg = JSON.parse(line);

                if (msg.status === 'connected') {
                    engineReady = true;
                    console.log('[Engine] Połączono z klawiaturą! / Connected to keyboard!');
                    broadcast({ type: 'engine_status', status: 'connected' });

                    const animId = currentCache.active || 'wavy';
                    const anim = loadAnimationCode(animId);
                    if (anim && anim.code) {
                        sendToPython({ code: anim.code, params: currentCache.profiles[animId] || {} });
                    }
                }

                if (msg.error) {
                    console.error('[Engine] Błąd/Error:', msg.error);
                    broadcast({ type: 'engine_error', error: msg.error });
                }

                if (msg.frame) {
                    broadcast({ type: 'frame', colors: msg.frame });
                }
            } catch (e) { }
        });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('[Engine STDERR]', data.toString().trim());
    });

    pythonProcess.on('exit', (code) => {
        engineReady = false;
        console.log(`[Engine] Zakończył się z kodem / Exited with code: ${code}`);
        broadcast({ type: 'engine_status', status: 'disconnected' });
    });
}

function sendToPython(data) {
    if (pythonProcess && engineReady) {
        pythonProcess.stdin.write(JSON.stringify(data) + '\n');
    }
}

function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(msg);
        }
    });
}

// ==================== WebSocket Handlers ====================
wss.on('connection', (ws) => {
    console.log('[WS] Nowe połączenie / New connection.');

    ws.send(JSON.stringify({
        type: 'engine_status',
        status: engineReady ? 'connected' : 'disconnected'
    }));

    ws.send(JSON.stringify({
        type: 'initial_state',
        cache: currentCache
    }));

    ws.on('message', (raw) => {
        try {
            const msg = JSON.parse(raw);

            if (msg.type === 'set_animation' || msg.type === 'set_full') {
                const animId = msg.animation;
                const anim = loadAnimationCode(animId);
                if (anim && anim.code) {
                    currentCache.active = animId;
                    if (!currentCache.profiles) currentCache.profiles = {};
                    currentCache.profiles[animId] = msg.params || {};
                    saveCache();
                    sendToPython({ code: anim.code, params: currentCache.profiles[animId] });
                    console.log(`[WS] Animacja/Animation: ${animId}`);
                } else {
                    console.warn(`[WS] Brak kodu / No code for: ${animId}`);
                }
            }

            if (msg.type === 'set_params') {
                if (!currentCache.profiles) currentCache.profiles = {};
                currentCache.profiles[currentCache.active] = msg.params;
                saveCache();
                sendToPython({ params: msg.params });
            }

        } catch (e) {
            console.error('[WS] Błąd/Error:', e.message);
        }
    });

    ws.on('close', () => {
        console.log('[WS] Rozłączono / Client disconnected.');
    });
});

// ==================== START ====================
server.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════╗`);
    console.log(`║  MAD68 Panel: http://localhost:${PORT}  ║`);
    console.log(`╚══════════════════════════════════════╝\n`);
    startPython();
});

process.on('SIGINT', () => {
    console.log('\n[Server] Zamykam/Closing...');
    if (pythonProcess) pythonProcess.kill();
    process.exit(0);
});
