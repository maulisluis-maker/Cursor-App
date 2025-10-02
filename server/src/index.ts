import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth';
import { membersRouter } from './routes/members';
import { passesRouter } from './routes/passes';
import { checkinRouter } from './routes/checkin';
import { privacyRouter } from './routes/privacy';
import { emailRouter } from './routes/email';
import { statsRouter } from './routes/stats';
import { testRouter } from './routes/test';
import { cardDesignsRouter } from './routes/cardDesigns';
import { walletRouter } from './routes/wallet';

const app = express();

const origin = process.env.CORS_ORIGIN || 'http://localhost:3001';
app.use(helmet());
app.use(cors({ origin, credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({ windowMs: 60_000, max: 120 });
app.use(limiter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'fitnessstudio-server' });
});

app.use('/api/auth', authRouter);
app.use('/api/members', membersRouter);
app.use('/api/passes', passesRouter);
app.use('/api/checkin', checkinRouter);
app.use('/api/privacy', privacyRouter);
app.use('/api/email', emailRouter);
app.use('/api/stats', statsRouter);
app.use('/api/test', testRouter);
app.use('/api/card-designs', cardDesignsRouter);
app.use('/api/wallet', walletRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err?.status || 500).json({ error: err?.message || 'Internal Server Error' });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
