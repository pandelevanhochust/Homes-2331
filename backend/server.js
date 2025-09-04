import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { connectMongo } from './db/mongo';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import adminRoutes from './routes/adminRoutes';
import staffRoutes from './routes/staffRoutes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  // keep your current logging behavior:
  // (If you'd like logs in dev, remove these three lines)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.log = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.warn = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.error = () => {};
}

app.use(express.json());

// mount routes
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

// bootstrap with Mongo, then start HTTP server
(async () => {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`, PORT);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

export default app;
