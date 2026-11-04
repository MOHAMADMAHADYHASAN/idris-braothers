import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { globalErrorHandler } from './common/errors/errorHandler';
import { AppError } from './common/errors/AppError';
import { inventoryRoutes } from './modules/inventory/inventory.routes';
import { salesRoutes } from './modules/sales/sales.routes';
import { customerRoutes } from './modules/customers/customers.routes';
import { supplierRoutes } from './modules/suppliers/suppliers.routes';
import { purchaseRoutes } from './modules/purchases/purchases.routes';

const app: Application = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Idris Brothers Grocery POS API',
  });
});

// API Routes
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/purchases', purchaseRoutes);

// 404 Route Handler
app.use((req: Request, res: Response, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
