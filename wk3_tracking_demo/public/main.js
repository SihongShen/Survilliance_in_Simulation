const socket = io.connect();
let keyBuffer = "";
let clickHistory = []; 
window.addEventListener('DOMContentLoaded', () => {
    generateFingerprint();
    setupEventListeners();
});

const generateFingerprint = async () => {
    const canvas = document.getElementById('fp-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillText('Surveillance.65@345876', 2, 15);
    const b64 = canvas.toDataURL();
    const id = b64.substring(b64.length - 24); 
    document.getElementById('fp-id').innerText = id;
    socket.emit('finger', id);
};

function setupEventListeners() {

    document.addEventListener('mousemove', (e) => {
        updateWatcherUI({ type: 'mousemove', x: e.clientX, y: e.clientY });
    });

    document.addEventListener('click', (e) => {
        const clickData = { x: e.clientX, y: e.clientY, timestamp: Date.now() };
        clickHistory.push(clickData); 
        socket.emit('event', { type: 'click', ...clickData });
        renderClickPoint(clickData); 
    });

    document.addEventListener('keypress', (e) => {
        keyBuffer += e.key;
        if (keyBuffer.length > 30) keyBuffer = keyBuffer.substring(1); 
        updateWatcherUI({ type: 'keypress', key: e.key, buffer: keyBuffer });
    });
}

function renderClickPoint(point) {
    const trackingArea = document.getElementById('tracking-area');
    const clickDot = document.createElement('div');
    
    clickDot.className = 'click-heat-point';
    clickDot.style.left = point.x + 'px';
    clickDot.style.top = point.y + 'px';
    
    trackingArea.appendChild(clickDot);
}

function updateWatcherUI(data) {
    const lastEventSpan = document.getElementById('last-event');
    const keyBufferSpan = document.getElementById('key-buffer');
    const trackingArea = document.getElementById('tracking-area');

    if (data.type === 'mousemove') {
        lastEventSpan.innerText = `X: ${data.x} | Y: ${data.y}`;
        let dot = document.getElementById('cursor-dot');
        if (!dot) {
            dot = document.createElement('div');
            dot.id = 'cursor-dot';
            trackingArea.appendChild(dot);
        }
        dot.style.left = data.x + 'px';
        dot.style.top = data.y + 'px';
    } 
    
    if (data.type === 'keypress') {
        lastEventSpan.innerText = `KEY_IN: ${data.key}`;
        keyBufferSpan.innerText = `> ${keyBuffer}`;
    }
}