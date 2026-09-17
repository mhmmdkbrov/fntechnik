import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://mhmmdkbrov.github.io').split(',').map(v => v.trim());

app.use(helmet());
app.use(cors({ origin(origin, cb) { if (!origin || allowedOrigins.includes(origin)) return cb(null, true); cb(new Error('Origin not allowed')); } }));
app.use(express.json({ limit: '100kb' }));

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(150).optional().default(''),
  message: z.string().trim().min(5).max(3000),
  language: z.enum(['az', 'en', 'ru']).optional().default('az')
});

type Inquiry = z.infer<typeof inquirySchema> & { id: string; createdAt: string };
const inquiries: Inquiry[] = [];

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'FN-TECHNIK API' }));

app.post('/api/inquiries', (req, res) => {
  const parsed = inquirySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'Invalid form data', fields: parsed.error.flatten().fieldErrors });
  const inquiry: Inquiry = { ...parsed.data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  inquiries.push(inquiry);
  console.log('[FN-TECHNIK inquiry]', inquiry);
  return res.status(201).json({ ok: true, id: inquiry.id });
});

app.use((_req, res) => res.status(404).json({ ok: false, error: 'Not found' }));
app.listen(port, () => console.log(`FN-TECHNIK API listening on ${port}`));
