import express from 'express';
import cors from 'cors';

import webUserRoutes from './routes/web/userRoutes.js';
import movieRoutes from './routes/app/movieRoutes.js';

const expressApp = express();
const port = process.env.PORT || 3001;

expressApp.use(cors());
expressApp.use(express.json());

expressApp.use('/api/web/users', webUserRoutes);
expressApp.use('/api/movies/', movieRoutes);

expressApp.listen(port, console.log(`Express app listening on ${port}`));