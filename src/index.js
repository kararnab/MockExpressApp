const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const { ruleEngineBot } = require('./ruleEngine/bot');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/chat' });

const PORT = process.env.PORT || 8080;

// ---------- Helpers ----------

/**
 * fs-based loader (dynamic, hot-reload)
 * Reads file every request
 * Always up-to-date
 * Safe error handling
 * Best for mock servers
 *
 * @param folder
 * @param file
 * @returns {any|null}
 */
function loadJsonFromFile(folder, file) {
    const filePath = path.join(__dirname, '../mocks', folder, file);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        return null;
    }
}

/**
 * require()-based loader (cached, static)
 * Loads once
 * Cached forever by Node
 * Fast
 * ❌ No hot reload
 * ❌ Crashes if file missing (unless guarded)
 * @param relativePath
 * @returns {any|null}
 */
function loadJsonWithRequire(relativePath) {
    try {
        return require(relativePath);
    } catch (err) {
        return null;
    }
}

// ---------- HTTP Routes ----------

app.use(express.static(path.join(__dirname, '../public')));
app.get('/', (req, res) => {
    res.send('Mock Server is running');
});

app.get('/login-success', (req, res) => {
    const data = loadJsonWithRequire(
        '../mocks/login/loginSuccess.json'
    );

    if (!data) {
        return res.status(404).json({ error: 'Mock file not found' });
    }

    res.json(data);
});

app.get("/repoService/myClasses/:tagId/runtimeMetrics", (req, res) => {
    console.log('RuntimeMetrics for Class', req.params.tagId)
    const data = loadJsonWithRequire(
        '../mocks/runtimeMetrics.json'
    );

    if (!data) {
        return res.status(404).json({ error: 'Mock file not found' });
    }

    res.json(data);
})

/**
 * Example:
 * GET /mock/users/get
 * Loads: mocks/users/get.json
 */
app.get('/mocks/:folder/:file', (req, res) => {
    const { folder, file } = req.params;

    const mockData = loadJsonFromFile(folder, `${file}.json`);

    if (!mockData) {
        return res.status(404).json({
            error: 'Mock file not found',
        });
    }

    res.json(mockData);
});

// ---------- WebSocket Chat (Bot) ----------

wss.on('connection', (ws) => {
    console.log('✅ Client connected to chat bot');

    ws.on('message', (data) => {
        const message = data.toString();

        const { intent, confidence, response } = ruleEngineBot(message);

        ws.send(response);

        console.log(
            `🤖 Bot | Intent: ${intent} | Confidence: ${confidence.toFixed(2)}`
        );
    });

    ws.on('close', () => {
        console.log('❌ Client disconnected');
    });
});

// ---------- Start Server ----------

server.listen(PORT, function(err) {
    if (err) {
        throw err;
    }
    console.log(`🚀 Mock server running on http://localhost:${PORT}`);
    console.log(`💬 Chat bot ws://localhost:${PORT}/chat`);
});