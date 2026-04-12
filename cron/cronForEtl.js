// A cron that runs every sunday morning at 5:00 to run the ETL process for nutrition and physical activity data
import cron from 'node-cron';
import { launchEtlPipeline } from '../services/etlService/etl.service.js';

export const etlCron = cron.schedule('0 5 * * 0', async () => {
  try {
    console.log('Running ETL pipelines with the cron job');

    // The nutrition pipeline
    await launchEtlPipeline("nutrition");

    // The exercises pipeline
    await launchEtlPipeline("exercises");

  } catch (error) {
    console.error('Error running ETL pipelines with the cron job :', error);
  }
});