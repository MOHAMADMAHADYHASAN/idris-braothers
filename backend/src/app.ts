import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { appRateLimiter } from './common/middlewares/rateLimiter';
import { globalErrorHandler } from './common/errors/errorHandler';
import { AppError } from './common/errors/AppError';
import { inventoryRoutes } from './features/inventory/inventory.routes';
import { salesRoutes } from './features/sales/sales.routes';
import { customerRoutes } from './features/customers/customers.routes';
import { supplierRoutes } from './features/suppliers/suppliers.routes';
import { purchaseRoutes } from './features/purchases/purchases.routes';
import { expenseRoutes } from './features/expenses/expenses.routes';
import { cashboxRoutes } from './features/cashbox/cashbox.routes';
import { reportsRoutes } from './features/reports/reports.routes';
import { unitMasterRoutes } from './features/unit-master/unit-master.routes';

const app: Application = express();

// 1. Security & Traffic Middlewares
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(appRateLimiter);

// 2. Logging & Parsing
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Idris Brothers Grocery POS API (Feni Bazar)',
  });
});

// 4. API Routes
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/cashbox', cashboxRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/units', unitMasterRoutes);
// 5. 404 Route Not Found Handler
app.use((req: Request, res: Response, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
});

// 6. Centralized Global Error Handler
app.use(globalErrorHandler);

export default app;
