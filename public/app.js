'use strict';

// =============================================
// KEY LAYOUT (894x328 -> 780x286)
// =============================================
const KEY_LAYOUT = [
  ['esc',          30,  14,  44, 44, 'Esc'],
  ['1',            76,  14,  44, 44, '!1'],
  ['2',           123,  14,  44, 44, '@2'],
  ['3',           170,  14,  44, 44, '#3'],
  ['4',           217,  14,  44, 44, '$4'],
  ['5',           264,  14,  44, 44, '%5'],
  ['6',           311,  14,  44, 44, '^6'],
  ['7',           359,  14,  44, 44, '&7'],
  ['8',           406,  14,  44, 44, '*8'],
  ['9',           453,  14,  44, 44, '(9'],
  ['0',           500,  14,  44, 44, ')0'],
  ['-',           547,  14,  44, 44, '-_'],
  ['=',           594,  14,  44, 44, '+='],
  ['backspace',   640,  14,  76, 44, 'Back\nSpace'],
  ['ins',         720,  14,  44, 44, 'Insert'],
  ['tab',          30,  61,  68, 44, 'Tab'],
  ['q',           100,  61,  44, 44, 'Q'],
  ['w',           146,  61,  44, 44, 'W'],
  ['e',           192,  61,  44, 44, 'E'],
  ['r',           238,  61,  44, 44, 'R'],
  ['t',           284,  61,  44, 44, 'T'],
  ['y',           331,  61,  44, 44, 'Y'],
  ['u',           377,  61,  44, 44, 'U'],
  ['i',           423,  61,  44, 44, 'I'],
  ['o',           469,  61,  44, 44, 'O'],
  ['p',           516,  61,  44, 44, 'P'],
  ['[',           562,  61,  44, 44, '{['],
  [']',           609,  61,  44, 44, '}]'],
  ['\\',          656,  61,  61, 44, '|\\'],
  ['delete',      720,  61,  44, 44, 'Delete'],
  ['caps lock',    30, 108,  81, 44, 'Caps\nLock'],
  ['a',           113, 108,  44, 44, 'A'],
  ['s',           160, 108,  44, 44, 'S'],
  ['d',           206, 108,  44, 44, 'D'],
  ['f',           252, 108,  44, 44, 'F'],
  ['g',           298, 108,  44, 44, 'G'],
  ['h',           345, 108,  44, 44, 'H'],
  ['j',           391, 108,  44, 44, 'J'],
  ['k',           437, 108,  44, 44, 'K'],
  ['l',           483, 108,  44, 44, 'L'],
  [';',           530, 108,  44, 44, ':;'],
  ["'",           576, 108,  44, 44, "\"'"],
  ['enter',       622, 108,  95, 44, 'Enter'],
  ['pgup',        720, 108,  44, 44, 'Page\nUp'],
  ['shift',        30, 155,  92, 44, 'Left\nShift'],
  ['z',           125, 155,  44, 44, 'Z'],
  ['x',           171, 155,  44, 44, 'X'],
  ['c',           217, 155,  44, 44, 'C'],
  ['v',           264, 155,  44, 44, 'V'],
  ['b',           310, 155,  44, 44, 'B'],
  ['n',           356, 155,  44, 44, 'N'],
  ['m',           402, 155,  44, 44, 'M'],
  [',',           448, 155,  44, 44, '<,'],
  ['.',           495, 155,  44, 44, '>.'],
  ['/',           542, 155,  44, 44, '?/'],
  ['right shift', 589, 155,  81, 44, 'Right\nShift'],
  ['up',          673, 155,  44, 44, 'Up'],
  ['pgdn',        720, 155,  44, 44, 'Page\nDown'],
  ['ctrl',         30, 202,  55, 44, 'Left\nCtrl'],
  ['left windows', 88, 202,  55, 44, 'Left\nWin'],
  ['alt',         147, 202,  55, 44, 'Left\nAlt'],
  ['space',       205, 202, 279, 44, 'Space'],
  ['alt gr',      488, 202,  44, 44, 'Right\nAlt'],
  ['fn',          534, 202,  44, 44, 'FN1'],
  ['right ctrl',  580, 202,  44, 44, 'Right\nCtrl'],
  ['left',        626, 202,  44, 44, 'Left'],
  ['down',        673, 202,  44, 44, 'Down'],
  ['right',       720, 202,  44, 44, 'Right'],
];

// =============================================
// STATE
// =============================================
let ws = null;
let animations = [];
let currentAnim = null;
let currentParams = {};
let rainbowOn = true;
let pickedColor = [255, 0, 0];
let wheelBrightness = 1.0;
let wheelHue = 0, wheelSat = 1.0;
const keyEls = {};
let initialCache = null;
let animationsLoaded = false;
let receivedInitialState = false;

let gradientOn = false;
let gradientColors = [];
let activeGradientSlot = 0;
let gradWheelHue = 0, gradWheelSat = 1.0, gradWheelBrightness = 1.0;

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  buildKeyboard();
  connectWS();
  loadAnimations();
  initColorWheel();
  initBrightSlider();
  initGradColorWheel();

  const handleHexInput = (e, isGrad) => {
    let val = e.target.value.trim();
    if (val.startsWith('#')) val = val.substring(1);
    if (val.length === 6) {
      const r = parseInt(val.substring(0, 2), 16);
      const g = parseInt(val.substring(2, 4), 16);
      const b = parseInt(val.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        const [h, s, v] = rgbToHsv(r, g, b);
        if (isGrad) {
          gradWheelHue = h; gradWheelSat = s; gradWheelBrightness = v;
          updateGradWheelUI();
          applyGradHSV();
        } else {
          wheelHue = h; wheelSat = s; wheelBrightness = v;
          const canvas = document.getElementById('colorWheel');
          const cursor = document.getElementById('wheelCursor');
          positionWheelCursor(canvas.width/2, wheelHue, wheelSat, cursor, canvas);
          const bCanvas = document.getElementById('brightSlider');
          const bCursor = document.getElementById('brightCursor');
          bCursor.style.left = (bCanvas.offsetLeft + 7 + wheelBrightness * (bCanvas.width - 14)) + 'px';
          applyHSV();
        }
      }
    }
  };
  
  document.getElementById('hexDisplay').addEventListener('input', e => handleHexInput(e, false));
  document.getElementById('gradHexDisplay').addEventListener('input', e => handleHexInput(e, true));

  document.getElementById('gradRemoveBtn').addEventListener('click', () => {
    gradientColors[activeGradientSlot] = [0, 0, 0];
    gradWheelBrightness = 0;
    updateGradWheelUI();
    document.getElementById('gradHexDisplay').value = '#000000';
    document.getElementById('gradRgbR').textContent = 0;
    document.getElementById('gradRgbG').textContent = 0;
    document.getElementById('gradRgbB').textContent = 0;
    buildGradientSlots(currentAnim.max_colors);
    sendParams();
  });

  document.getElementById('gradientToggle').addEventListener('change', e => {
    gradientOn = e.target.checked;
    if (gradientOn && rainbowOn) {
      rainbowOn = false;
      document.getElementById('rainbowToggle').checked = false;
    }
    updateGradientUIState();
    sendParams();
  });

  document.getElementById('rainbowToggle').addEventListener('change', e => {
    rainbowOn = e.target.checked;
    updateColorWheelState();
    sendParams();
  });

  document.querySelectorAll('.preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const [r, g, b] = btn.dataset.rgb.split(',').map(Number);
      setColor(r, g, b);
      document.querySelectorAll('.preset').forEach(p => p.classList.remove('sel'));
      btn.classList.add('sel');
      sendParams();
    });
  });

  document.getElementById('animSelect').addEventListener('change', e => {
    const anim = animations.find(a => a.id === e.target.value);
    if (anim) selectAnimation(anim);
  });

  document.getElementById('resetAnimBtn').addEventListener('click', () => {
    if (!currentAnim) return;
    if (initialCache && initialCache.profiles) {
      delete initialCache.profiles[currentAnim.id];
    }
    selectAnimation(currentAnim, true);
  });
});

// =============================================
// KEYBOARD VIEW
// =============================================
function buildKeyboard() {
  const kb = document.getElementById('keyboardBg');
  KEY_LAYOUT.forEach(([key, left, top, w, h, label]) => {
    const el = document.createElement('div');
    el.className = 'key';
    el.style.left   = left + 'px';
    el.style.top    = top  + 'px';
    el.style.width  = w    + 'px';
    el.style.height = h    + 'px';

    const lbl = document.createElement('span');
    lbl.className = 'key-label';
    lbl.textContent = label;
    el.appendChild(lbl);
    kb.appendChild(el);
    keyEls[key.toLowerCase()] = el;
  });
}

function applyFrame(colors) {
  for (const [name, rgb] of Object.entries(colors)) {
    const el = keyEls[name.toLowerCase()];
    if (!el) continue;
    const [r, g, b] = rgb;
    if (r + g + b < 6) {
      el.style.background = 'var(--key-bg)';
      el.style.boxShadow = 'none';
    } else {
      el.style.background = `rgba(${r},${g},${b},0.88)`;
      el.style.boxShadow = `0 0 10px rgba(${r},${g},${b},0.65)`;
    }
  }
}

// =============================================
// ANIMATION LOGIC
// =============================================
async function loadAnimations() {
  try {
    const res = await fetch('/api/animations');
    animations = await res.json();
    const sel = document.getElementById('animSelect');
    sel.innerHTML = '';
    animations.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.id; opt.textContent = a.name;
      sel.appendChild(opt);
    });
    animationsLoaded = true;
    tryInit();
  } catch (e) { console.error('Animation error:', e); }
}

function tryInit() {
  if (!animationsLoaded || !receivedInitialState) return;
  const activeId = initialCache ? (initialCache.active || initialCache.animation) : null;
  if (activeId) {
    const anim = animations.find(a => a.id === activeId);
    if (anim) {
      selectAnimation(anim);
      return;
    }
  }
  if (animations.length > 0) selectAnimation(animations[0]);
}

function selectAnimation(anim, forceDefault = false) {
  currentAnim = anim;
  currentParams = {};
  Object.entries(anim.params).forEach(([k, v]) => { currentParams[k] = v.default; });

  const profile = (!forceDefault && initialCache && initialCache.profiles && initialCache.profiles[anim.id]) ? initialCache.profiles[anim.id] : null;

  if (profile) {
    Object.assign(currentParams, profile);
    if (profile.rainbow !== undefined) rainbowOn = profile.rainbow;
    if (profile.color !== undefined) {
      const [r, g, b] = profile.color;
      setColor(r, g, b);
      const [h, s, v] = rgbToHsv(r, g, b);
      wheelHue = h; wheelSat = s; wheelBrightness = v;
      const canvas = document.getElementById('colorWheel');
      const cursor = document.getElementById('wheelCursor');
      positionWheelCursor(canvas.width/2, wheelHue, wheelSat, cursor, canvas);
      const bCanvas = document.getElementById('brightSlider');
      const bCursor = document.getElementById('brightCursor');
      const rad = 7;
      bCursor.style.left = (bCanvas.offsetLeft + rad + wheelBrightness * (bCanvas.width - 2 * rad)) + 'px';
    }
  } else {
    rainbowOn = anim.supports_rainbow ? anim.default_rainbow : false;
  }

  document.getElementById('animSelect').value = anim.id;
  document.getElementById('animDesc').textContent = anim.description;
  buildSliders(anim);
  
  const tog = document.getElementById('rainbowToggle');
  const rowEl = tog.closest('.rainbow-row');
  tog.disabled = !anim.supports_rainbow;
  rowEl.style.opacity = anim.supports_rainbow ? '1' : '.4';
  tog.checked = rainbowOn;
  updateColorWheelState();

  const gradCard = document.getElementById('gradientCard');
  if (anim.supports_gradient) {
     gradCard.style.display = 'block';
     document.querySelector('.bottom-panel').style.gridTemplateColumns = '200px 1fr 206px 206px';
     gradientOn = profile && profile.gradientOn !== undefined ? profile.gradientOn : false;
     gradientColors = profile && profile.gradientColors ? profile.gradientColors : [];
     activeGradientSlot = 0;
     document.getElementById('gradientToggle').checked = gradientOn;
     buildGradientSlots(anim.max_colors);
     updateGradientUIState();
  } else {
     gradCard.style.display = 'none';
     document.querySelector('.bottom-panel').style.gridTemplateColumns = '200px 1fr 206px';
     gradientOn = false;
     updateGradientUIState();
  }

  if (!initialCache) initialCache = { active: anim.id, profiles: {} };
  initialCache.active = anim.id;
  if (!initialCache.profiles) initialCache.profiles = {};
  initialCache.profiles[anim.id] = buildPayload();
  wsSend({ type: 'set_full', animation: anim.id, params: buildPayload() });
}

// =============================================
// SLIDERS & PARAMETERS
// =============================================
function buildSliders(anim) {
  const wrap = document.getElementById('slidersWrap');
  wrap.innerHTML = '';
  Object.entries(anim.params).forEach(([key, cfg]) => {
    const val = currentParams[key] ?? cfg.default;
    const row = document.createElement('div');
    row.className = 'slider-row';

    if (cfg.type === 'boolean') {
      row.innerHTML = `
        <div class="slider-header" style="align-items: center; margin-bottom: 12px;">
          <span class="slider-label" style="flex:1;">${cfg.label}</span>
          <label class="toggle">
            <input type="checkbox" id="sl-${key}" ${val ? 'checked' : ''}>
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>`;
      wrap.appendChild(row);
      row.querySelector(`#sl-${key}`).addEventListener('change', e => {
        currentParams[key] = e.target.checked;
        sendParams();
      });
    } else {
      row.innerHTML = `
        <div class="slider-header">
          <span class="slider-label">${cfg.label}</span>
          <span class="slider-val" id="sv-${key}">${fmt(val,cfg.step)}${cfg.unit||''}</span>
        </div>
        <input type="range" id="sl-${key}" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${val}">`;
      wrap.appendChild(row);
      row.querySelector(`#sl-${key}`).addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        currentParams[key] = v;
        document.getElementById(`sv-${key}`).textContent = fmt(v,cfg.step)+(cfg.unit||'');
        sendParams();
      });
    }
  });
}
function fmt(val, step) {
  if (step >= 1) return String(Math.round(val));
  return val.toFixed(String(step).split('.')[1]?.length || 3);
}

// =============================================
// COLOR SELECTION
// =============================================
function initColorWheel() {
  const canvas = document.getElementById('colorWheel');
  const ctx    = canvas.getContext('2d');
  const R = canvas.width / 2;
  const cursor = document.getElementById('wheelCursor');
  drawWheel(ctx, canvas.width, R);
  positionWheelCursor(R, 0, 1.0, cursor, canvas);

  canvas.addEventListener('mousedown', e => {
    handleWheelPick(e.clientX, e.clientY, canvas, R, cursor);
    const mm = ev => handleWheelPick(ev.clientX, ev.clientY, canvas, R, cursor);
    const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
  });
}

function drawWheel(ctx, W, R) {
  const img = ctx.createImageData(W, W);
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - R, dy = y - R, dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > R) continue;
      const hue = (Math.atan2(dy, dx) / (Math.PI*2) + 1) % 1;
      const sat = dist / R;
      const [r, g, b] = hsvToRgb(hue, sat, 1.0);
      const i = (y*W + x)*4;
      img.data[i]=r; img.data[i+1]=g; img.data[i+2]=b; img.data[i+3]=255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function handleWheelPick(cx, cy, canvas, R, cursor) {
  const rect = canvas.getBoundingClientRect();
  const dx = cx - rect.left - R, dy = cy - rect.top - R;
  const dist = Math.min(Math.sqrt(dx*dx + dy*dy), R);
  wheelHue = (Math.atan2(dy, dx) / (Math.PI*2) + 1) % 1;
  wheelSat = dist / R;
  positionWheelCursor(R, wheelHue, wheelSat, cursor, canvas);
  applyHSV();
}

function positionWheelCursor(R, hue, sat, cursor, canvas) {
  const angle = hue * Math.PI * 2;
  const r = sat * R;
  cursor.style.left = (canvas.offsetLeft + R + r * Math.cos(angle)) + 'px';
  cursor.style.top  = (canvas.offsetTop  + R + r * Math.sin(angle)) + 'px';
}

function initBrightSlider() {
  const canvas = document.getElementById('brightSlider');
  const ctx    = canvas.getContext('2d');
  const cursor = document.getElementById('brightCursor');
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  grad.addColorStop(0, '#000'); grad.addColorStop(1, '#fff');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
  cursor.style.left = (canvas.offsetLeft + canvas.width - 7) + 'px';

  canvas.addEventListener('mousedown', e => {
    handleBrightPick(e.clientX, canvas, cursor);
    const mm = ev => handleBrightPick(ev.clientX, canvas, cursor);
    const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
  });
}

function handleBrightPick(cx, canvas, cursor) {
  const rect = canvas.getBoundingClientRect();
  wheelBrightness = Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
  const r = 7;
  cursor.style.left = (canvas.offsetLeft + r + wheelBrightness * (canvas.width - 2 * r)) + 'px';
  applyHSV();
}

function applyHSV() {
  const [r, g, b] = hsvToRgb(wheelHue, wheelSat, wheelBrightness);
  setColor(r, g, b);
  sendParams();
}

function setColor(r, g, b) {
  pickedColor = [r, g, b];
  const hex = '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('').toUpperCase();
  document.getElementById('hexDisplay').value = hex;
  document.getElementById('rgbR').textContent = r;
  document.getElementById('rgbG').textContent = g;
  document.getElementById('rgbB').textContent = b;
}

function updateColorWheelState() {
  const ok = currentAnim?.supports_color && !rainbowOn;
  document.getElementById('colorPickerWrap').classList.toggle('disabled', !ok);
  const pr = document.getElementById('presetsRow');
  pr.style.opacity = ok ? '1' : '.35';
  pr.style.pointerEvents = ok ? 'auto' : 'none';
}

// =============================================
// COMMUNICATION (WEBSOCKET)
// =============================================
function connectWS() {
  ws = new WebSocket(`ws://${location.host}`);
  ws.onopen = () => console.log('[WS] Connected');
  ws.onmessage = ev => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'engine_status') {
        const pill = document.getElementById('statusPill');
        const lbl  = document.getElementById('statusLabel');
        pill.className = 'status-pill';
        if (msg.status === 'connected') { pill.classList.add('ok'); lbl.textContent = 'Connected'; }
        else lbl.textContent = 'Disconnected';
      }
      if (msg.type === 'engine_error') {
        document.getElementById('statusLabel').textContent = 'Error: ' + msg.error;
        document.getElementById('statusPill').classList.add('err');
      }
      if (msg.type === 'initial_state') {
        initialCache = msg.cache;
        receivedInitialState = true;
        tryInit();
      }
      if (msg.type === 'frame') applyFrame(msg.colors);
    } catch {}
  };
  ws.onclose = () => { console.log('[WS] Reconnecting...'); setTimeout(connectWS, 3000); };
}

function wsSend(data) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}

function sendParams() { 
  if (initialCache && currentAnim) {
    if (!initialCache.profiles) initialCache.profiles = {};
    initialCache.profiles[currentAnim.id] = buildPayload();
  }
  wsSend({ type: 'set_params', params: buildPayload() }); 
}

function buildPayload() { 
  return { 
    ...currentParams, 
    rainbow: rainbowOn, 
    color: pickedColor,
    gradientOn: gradientOn,
    gradientColors: gradientColors
  }; 
}

// =============================================
// GRADIENT LOGIC
// =============================================
function updateGradientUIState() {
  const colCard = document.querySelector('.color-card');
  if (!currentAnim?.supports_gradient) {
    colCard.style.opacity = '1';
    colCard.style.pointerEvents = 'auto';
    return;
  }
  if (gradientOn) {
    colCard.style.opacity = '0.35';
    colCard.style.pointerEvents = 'none';
    document.getElementById('gradientContent').classList.remove('disabled');
  } else {
    colCard.style.opacity = '1';
    colCard.style.pointerEvents = 'auto';
    document.getElementById('gradientContent').classList.add('disabled');
  }
}

function buildGradientSlots(maxColors) {
  const row = document.getElementById('gradientSlotsRow');
  row.innerHTML = '';
  while(gradientColors.length < maxColors) gradientColors.push([0,0,0]);
  if (gradientColors.length > maxColors) gradientColors.length = maxColors;

  for(let i=0; i<maxColors; i++) {
    const slot = document.createElement('div');
    slot.className = 'color-slot';
    if(i === activeGradientSlot) slot.classList.add('active');
    
    const [r,g,b] = gradientColors[i];
    if(r+g+b === 0) slot.classList.add('empty');
    else slot.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
    
    slot.textContent = i+1;
    slot.addEventListener('click', () => {
      activeGradientSlot = i;
      const [cr,cg,cb] = gradientColors[i];
      if (cr+cg+cb > 0) {
          const [h,s,v] = rgbToHsv(cr,cg,cb);
          gradWheelHue = h; gradWheelSat = s; gradWheelBrightness = v;
      } else {
          gradWheelBrightness = 0;
      }
      const hex = '#' + [cr,cg,cb].map(v => v.toString(16).padStart(2,'0')).join('').toUpperCase();
      document.getElementById('gradHexDisplay').value = hex;
      document.getElementById('gradRgbR').textContent = cr;
      document.getElementById('gradRgbG').textContent = cg;
      document.getElementById('gradRgbB').textContent = cb;
      updateGradWheelUI();
      buildGradientSlots(maxColors);
    });
    row.appendChild(slot);
  }
}

function initGradColorWheel() {
  const canvas = document.getElementById('gradColorWheel');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const R = canvas.width / 2;
  const cursor = document.getElementById('gradWheelCursor');
  drawWheel(ctx, canvas.width, R);

  canvas.addEventListener('mousedown', e => {
    const handlePick = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const dx = ev.clientX - rect.left - R, dy = ev.clientY - rect.top - R;
      const dist = Math.min(Math.sqrt(dx*dx + dy*dy), R);
      gradWheelHue = (Math.atan2(dy, dx) / (Math.PI*2) + 1) % 1;
      gradWheelSat = dist / R;
      updateGradWheelUI();
      applyGradHSV();
    };
    handlePick(e);
    const mm = ev => handlePick(ev);
    const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
  });

  const bCanvas = document.getElementById('gradBrightSlider');
  const bCtx = bCanvas.getContext('2d');
  const bCursor = document.getElementById('gradBrightCursor');
  const grad = bCtx.createLinearGradient(0, 0, bCanvas.width, 0);
  grad.addColorStop(0, '#000'); grad.addColorStop(1, '#fff');
  bCtx.fillStyle = grad; bCtx.fillRect(0, 0, bCanvas.width, bCanvas.height);

  bCanvas.addEventListener('mousedown', e => {
    const handleBPick = (ev) => {
      const rect = bCanvas.getBoundingClientRect();
      gradWheelBrightness = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      const r = 7;
      bCursor.style.left = (bCanvas.offsetLeft + r + gradWheelBrightness * (bCanvas.width - 2 * r)) + 'px';
      applyGradHSV();
    };
    handleBPick(e);
    const mm = ev => handleBPick(ev);
    const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
  });
}

function updateGradWheelUI() {
  const canvas = document.getElementById('gradColorWheel');
  const cursor = document.getElementById('gradWheelCursor');
  positionWheelCursor(canvas.width/2, gradWheelHue, gradWheelSat, cursor, canvas);
  const bCanvas = document.getElementById('gradBrightSlider');
  const bCursor = document.getElementById('gradBrightCursor');
  const r = 7;
  bCursor.style.left = (bCanvas.offsetLeft + r + gradWheelBrightness * (bCanvas.width - 2 * r)) + 'px';
}

function applyGradHSV() {
  const [r, g, b] = hsvToRgb(gradWheelHue, gradWheelSat, gradWheelBrightness);
  gradientColors[activeGradientSlot] = [r, g, b];
  const hex = '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('').toUpperCase();
  document.getElementById('gradHexDisplay').value = hex;
  document.getElementById('gradRgbR').textContent = r;
  document.getElementById('gradRgbG').textContent = g;
  document.getElementById('gradRgbB').textContent = b;
  buildGradientSlots(currentAnim.max_colors);
  sendParams();
}

// =============================================
// CONVERSION UTILS
// =============================================
function hsvToRgb(h, s, v) {
  const i = Math.floor(h*6), f = h*6-i;
  const p = v*(1-s), q = v*(1-f*s), t = v*(1-(1-f)*s);
  let r, g, b;
  switch(i%6) {
    case 0: r=v;g=t;b=p; break; case 1: r=q;g=v;b=p; break;
    case 2: r=p;g=v;b=t; break; case 3: r=p;g=q;b=v; break;
    case 4: r=t;g=p;b=v; break; case 5: r=v;g=p;b=q; break;
  }
  return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, v = max;
  let d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) h = 0;
  else {
    switch(max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, v];
}
