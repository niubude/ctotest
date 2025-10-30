import express from 'express';
import reviewRoutes from './routes/reviewRoutes';
import { config, validateConfig } from './config';

try {
  validateConfig();
} catch (error) {
  console.error('Configuration error:', error);
  process.exit(1);
}

const app = express();

app.use(express.json());

app.use('/api', reviewRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`AI Provider: ${config.ai.useMock ? 'mock' : config.ai.provider}`);
});

export { app, server };
