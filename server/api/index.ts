import { Request, Response } from 'express';
import { connectDB } from '../src/config/database';
import { seedAdmin } from '../src/utils/seed';
import app from '../src/app';

export default async (req: Request, res: Response) => {
  await connectDB();
  await seedAdmin();
  return app(req, res);
};

