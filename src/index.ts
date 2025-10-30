import { createApp } from './app.js';
import { loadConfig } from './config/index.js';
import { logger } from './lib/logger.js';

async function main() {
  try {
    const config = loadConfig();
    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(`Server started on port ${config.port}`, {
        environment: config.nodeEnv,
        svnUrl: config.svn.url,
      });
    });

    const shutdown = () => {
      logger.info('Shutting down server...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

main();
