import { Request, Response } from 'express';
import { connectDB } from '../src/config/database';
import app from '../src/app';

export default async (req: Request, res: Response) => {
  await connectDB();
  return app(req, res);
};
