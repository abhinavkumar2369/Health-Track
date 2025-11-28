import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import os from "os";
import { connectDB } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import pharmacistRoutes from "./routes/pharmacistRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Function to get local IP address
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

// Add CORS headers to ALL responses - this must be first
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Configure CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Health check / API status endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Health Track API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/auth",
      admin: "/admin",
      doctor: "/doctor",
      pharmacist: "/pharmacist",
      documents: "/api/documents"
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: "connected"
  });
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/doctor", doctorRoutes);
app.use("/pharmacist", pharmacistRoutes);
app.use("/api/documents", documentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  const localIP = getLocalIP();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server is running!\n`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://${localIP}:${PORT}\n`);
  });
}

// Export for Vercel serverless
export default app;
