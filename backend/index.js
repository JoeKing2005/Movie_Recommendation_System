import express from 'express';
import Env from './env.config.js';
import cors from 'cors';
import webUserRoutes from './routes/web/userRoutes.js';

const env = new Env();

const expressApp = express();
const port = process.env.PORT || 3001;

expressApp.use(cors());
expressApp.use(express.json());

expressApp.use('/api/web/users', webUserRoutes);

expressApp.listen(port, console.log(`Express app listening on ${port}`));