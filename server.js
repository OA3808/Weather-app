require('dotenv').config()
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from the current directory (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create searches table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS searches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// API endpoint to get recent searches (last 10)
app.get('/api/history', (req, res) => {
    const query = `SELECT * FROM searches ORDER BY timestamp DESC LIMIT 10`;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// API endpoint to save a new search
app.post('/api/history', (req, res) => {
    const { location } = req.body;
    if (!location) {
        res.status(400).json({ error: 'Location is required' });
        return;
    }

    const query = `INSERT INTO searches (location) VALUES (?)`;
    db.run(query, [location], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, location: location });
    });
});

// API endpoint to proxy weather requests securely
app.get('/api/weather', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ error: "City is required" });
    }
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${q}&aqi=no`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Error fetching from WeatherAPI:", err);
        res.status(500).json({ error: "Not able to fetch weather data" });

    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
