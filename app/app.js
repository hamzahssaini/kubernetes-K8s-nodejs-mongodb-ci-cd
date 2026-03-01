// app.js
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 80;

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const username = process.env.MONGO_USERNAME;
const password = encodeURIComponent(process.env.MONGO_PASSWORD);
const host = process.env.MONGO_HOST;
const db = process.env.MONGO_DB;

const mongoUri = `mongodb://${username}:${password}@${host}:27017/${db}?authSource=admin`;

mongoose.connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Home Page with Form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Hamza's Node.js App</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(to right, #e0f7fa, #ffffff); color: #333; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .container { background: white; padding: 30px 40px; border-radius: 16px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); text-align: center; width: 100%; max-width: 400px; }
        h1 { font-size: 1.8rem; color: #0078D7; margin-bottom: 20px; }
        input { width: 100%; padding: 12px; margin: 10px 0; border-radius: 8px; border: 1px solid #ccc; font-size: 1rem; }
        input::placeholder {
          animation: movePlaceholder 3s infinite alternate;
          color: #aaa;
        }
        button { background-color: #0078D7; color: white; padding: 12px 20px; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; }
        button:hover { background-color: #005bb5; }

        @keyframes movePlaceholder {
          0% { transform: translateX(0); }
          50% { transform: translateX(5px); }
          100% { transform: translateX(0); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌐Hello from App.js running in Kubernetes From AKS in Azure!</h1>
        <p>Welcome from <strong>Hamza Hssaini</strong></p>
        <form action="/register" method="POST">
          <input type="text" name="name" placeholder="Enter your username" required />
          <input type="email" name="email" placeholder="Enter your gmail" required />
          <button type="submit">Register</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Register route with auto-redirect after 5 seconds
app.post('/register', async (req, res) => {
  const { name, email } = req.body;
  try {
    const newUser = new User({ name, email });
    const savedUser = await newUser.save();

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Success</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f5fff5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; overflow: hidden; }
          .success-box { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); text-align: center; max-width: 500px; width: 100%; animation: fadeIn 0.6s ease-out; position: relative; }
          h1 { color: #28a745; font-size: 1.8rem; margin-bottom: 10px; }
          p { font-size: 1.1rem; color: #333; }
          .back-btn { margin-top: 20px; display: inline-block; background-color: #0078D7; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: background-color 0.3s ease; }
          .back-btn:hover { background-color: #005bb5; }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
        <script>
          // Redirect to home page after 5 seconds
          setTimeout(() => {
            window.location.href = "/";
          }, 5000);
        </script>
      </head>
      <body>
        <div class="success-box">
          <h1>👋 Hello ${name}, your registration is <span style="color: green;">successful!</span></h1>
          <p><strong>Registered Email:</strong> ${email}</p>
          <p>🎉 Thank you for joining, <strong>${name}</strong>!</p>
          <a class="back-btn" href="/">← Back to Home</a>
          <p style="margin-top: 15px; font-size: 0.9rem; color: #555;">
            Redirecting to home page in 5 seconds...
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
});

// API route to get users (for testing)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check route
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});
