const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/', limiter); // Apply rate limiting to all API routes

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'water_platform.db'));

// Initialize database schema
function initDatabase() {
  // Water stations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS water_stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      status TEXT DEFAULT 'active'
    )
  `);

  // Water level monitoring table
  db.exec(`
    CREATE TABLE IF NOT EXISTS water_levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id INTEGER NOT NULL,
      water_level REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (station_id) REFERENCES water_stations(id)
    )
  `);

  // Flow rate monitoring table
  db.exec(`
    CREATE TABLE IF NOT EXISTS flow_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id INTEGER NOT NULL,
      flow_rate REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (station_id) REFERENCES water_stations(id)
    )
  `);

  // Alarms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alarms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id INTEGER NOT NULL,
      alarm_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      resolved INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (station_id) REFERENCES water_stations(id)
    )
  `);

  // Insert sample data if tables are empty
  const stationCount = db.prepare('SELECT COUNT(*) as count FROM water_stations').get();
  if (stationCount.count === 0) {
    const insertStation = db.prepare('INSERT INTO water_stations (name, location, latitude, longitude) VALUES (?, ?, ?, ?)');
    insertStation.run('长江监测站', '湖北武汉', 30.5928, 114.3055);
    insertStation.run('黄河监测站', '河南郑州', 34.7466, 113.6253);
    insertStation.run('珠江监测站', '广东广州', 23.1291, 113.2644);
    
    // Insert sample water level data
    const insertLevel = db.prepare('INSERT INTO water_levels (station_id, water_level) VALUES (?, ?)');
    for (let i = 1; i <= 3; i++) {
      for (let j = 0; j < 10; j++) {
        insertLevel.run(i, 5.0 + Math.random() * 3.0);
      }
    }
    
    // Insert sample flow rate data
    const insertFlow = db.prepare('INSERT INTO flow_rates (station_id, flow_rate) VALUES (?, ?)');
    for (let i = 1; i <= 3; i++) {
      for (let j = 0; j < 10; j++) {
        insertFlow.run(i, 1000 + Math.random() * 500);
      }
    }
    
    // Insert sample alarm
    const insertAlarm = db.prepare('INSERT INTO alarms (station_id, alarm_type, severity, message) VALUES (?, ?, ?, ?)');
    insertAlarm.run(1, 'high_water_level', 'warning', '水位超过警戒线');
  }
}

initDatabase();

// API Routes

// Get all water stations
app.get('/api/stations', (req, res) => {
  try {
    const stations = db.prepare('SELECT * FROM water_stations').all();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get station by id
app.get('/api/stations/:id', (req, res) => {
  try {
    const station = db.prepare('SELECT * FROM water_stations WHERE id = ?').get(req.params.id);
    if (station) {
      res.json(station);
    } else {
      res.status(404).json({ error: 'Station not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get water level data for a station
app.get('/api/stations/:id/water-levels', (req, res) => {
  try {
    const levels = db.prepare(
      'SELECT * FROM water_levels WHERE station_id = ? ORDER BY timestamp DESC LIMIT 50'
    ).all(req.params.id);
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get flow rate data for a station
app.get('/api/stations/:id/flow-rates', (req, res) => {
  try {
    const flows = db.prepare(
      'SELECT * FROM flow_rates WHERE station_id = ? ORDER BY timestamp DESC LIMIT 50'
    ).all(req.params.id);
    res.json(flows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get latest data for all stations
app.get('/api/dashboard', (req, res) => {
  try {
    const stations = db.prepare('SELECT * FROM water_stations').all();
    const dashboard = stations.map(station => {
      const latestLevel = db.prepare(
        'SELECT * FROM water_levels WHERE station_id = ? ORDER BY timestamp DESC LIMIT 1'
      ).get(station.id);
      
      const latestFlow = db.prepare(
        'SELECT * FROM flow_rates WHERE station_id = ? ORDER BY timestamp DESC LIMIT 1'
      ).get(station.id);
      
      return {
        station,
        latestLevel,
        latestFlow
      };
    });
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alarms
app.get('/api/alarms', (req, res) => {
  try {
    const resolved = req.query.resolved === 'true' ? 1 : 0;
    const alarms = db.prepare(
      'SELECT a.*, s.name as station_name FROM alarms a JOIN water_stations s ON a.station_id = s.id WHERE a.resolved = ? ORDER BY a.timestamp DESC'
    ).all(resolved);
    res.json(alarms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new alarm
app.post('/api/alarms', (req, res) => {
  try {
    const { station_id, alarm_type, severity, message } = req.body;
    const result = db.prepare(
      'INSERT INTO alarms (station_id, alarm_type, severity, message) VALUES (?, ?, ?, ?)'
    ).run(station_id, alarm_type, severity, message);
    res.json({ id: result.lastInsertRowid, message: 'Alarm created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve alarm
app.put('/api/alarms/:id/resolve', (req, res) => {
  try {
    db.prepare('UPDATE alarms SET resolved = 1 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Alarm resolved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new water level reading
app.post('/api/water-levels', (req, res) => {
  try {
    const { station_id, water_level } = req.body;
    const result = db.prepare(
      'INSERT INTO water_levels (station_id, water_level) VALUES (?, ?)'
    ).run(station_id, water_level);
    res.json({ id: result.lastInsertRowid, message: 'Water level recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new flow rate reading
app.post('/api/flow-rates', (req, res) => {
  try {
    const { station_id, flow_rate } = req.body;
    const result = db.prepare(
      'INSERT INTO flow_rates (station_id, flow_rate) VALUES (?, ?)'
    ).run(station_id, flow_rate);
    res.json({ id: result.lastInsertRowid, message: 'Flow rate recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Water Platform API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Smart Water Platform API server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});