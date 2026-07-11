import app from './src/app.js';
import { initDatabase } from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Initialize MySQL Database
    await initDatabase();
    
    // Start Express Server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
