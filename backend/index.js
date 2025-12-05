import express from 'express';
import cors from 'cors';

import webUserRoutes from './routes/web/userRoutes.js';

const expressApp = express();
const port = process.env.PORT || 3001;

expressApp.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
expressApp.use(express.json());

expressApp.use('/api/web/users', webUserRoutes);

expressApp.listen(port, console.log(`Express app listening on ${port}`));