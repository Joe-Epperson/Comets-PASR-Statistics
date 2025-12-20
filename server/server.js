const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3001;

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'comets-pasr-statistics';

let db = null;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB:', DB_NAME);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Helper function to get database instance
function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

// Middleware
app.use(cors());
app.use(express.json());

// POST endpoint for Pass actions
app.post('/api/passes', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection('passes').insertOne(req.body);
    res.json({
      success: true,
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error('Error inserting pass:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

// POST endpoint for Dribble actions
app.post('/api/dribbles', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection('dribbles').insertOne(req.body);
    res.json({
      success: true,
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error('Error inserting dribble:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

// POST endpoint for Shot actions
app.post('/api/shots', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection('shots').insertOne(req.body);
    res.json({
      success: true,
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error('Error inserting shot:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

// POST endpoint for Set Piece actions
app.post('/api/setpieces', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection('setpieces').insertOne(req.body);
    res.json({
      success: true,
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error('Error inserting set piece:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

// POST endpoint for String actions
app.post('/api/strings', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection('strings').insertOne(req.body);
    res.json({
      success: true,
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error('Error inserting string:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Start server
async function startServer() {
  await connectToMongoDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
