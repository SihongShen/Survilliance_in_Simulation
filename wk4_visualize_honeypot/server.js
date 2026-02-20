const net = require('net');
const fs = require('fs');
const path = require('path');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const TCP_PORT = 2222;  // honeypot listening port
const HTTP_PORT = 3000; // web server port
const LOG_FILE = path.join(__dirname, 'attacks.json');

// make sure log file exists
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '[]');

// --- 1. TCP honeypot ---
const tcpServer = net.createServer((socket) => {
    let remoteIp = socket.remoteAddress.replace(/^.*:/, '');

    // local testing: if IP is localhost, replace with random public IP for demo purposes
    if (remoteIp === '1' || remoteIp === '127.0.0.1') {
        const testIps = ['8.8.8.8', '1.1.1.1', '202.38.64.1', '139.162.19.141'];
        remoteIp = testIps[Math.floor(Math.random() * testIps.length)];
    }

    console.log(`[!] Trigger Honeypot: ${remoteIp}`);

    // get geolocation info and log attack
    axios.get(`http://ip-api.com/json/${remoteIp}`)
        .then(response => {
            const data = response.data;
            if (data.status === 'success') {
                const logs = JSON.parse(fs.readFileSync(LOG_FILE));
                logs.push({
                    ip: remoteIp,
                    lat: data.lat,
                    lon: data.lon,
                    city: data.city,
                    country: data.country,
                    time: new Date().toLocaleString()
                });
                // limit log size to last 100 entries
                if (logs.length > 100) logs.shift(); 
                fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
            }
        }).catch(e => console.error('IP 查询失败'));

    socket.destroy(); // close connection immediately
});

tcpServer.listen(TCP_PORT, '0.0.0.0', () => {
    console.log(`📡 Honeypot listening on port ${TCP_PORT}`);
});

// --- 2. HTTP server logic ---
app.use(cors());
app.use(express.static('public')); // serve static files from public folder

// data API: for map visualization
app.get('/api/logs', (req, res) => {
    const data = fs.readFileSync(LOG_FILE);
    res.json(JSON.parse(data));
});

app.listen(HTTP_PORT, () => {
    console.log(`🌐 web start : http://localhost:${HTTP_PORT}`);
});