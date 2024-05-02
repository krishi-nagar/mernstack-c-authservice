import { Config } from "./config";
import app from "./app";
import logger from "./config/logger";
import { AppDataSource } from "./config/data-source";

// docker test

const startServer = async () => {
  const PORT = Config.PORT;

  try {
    await AppDataSource.initialize();
    logger.info("Hey Krishi, Database Connected Successfully !!");
    app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
    }
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

void startServer();
