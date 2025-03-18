import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Enable JSON body parsing

// Test Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, Express + TypeScript with pnpm! 🚀' });
});
app.use('/api',userRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
