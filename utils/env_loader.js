import { existsSync, readFileSync } from 'fs';

/**
 * Loads the appropriate environment variables for an event.
 */
const envLoader = () => {
  const env = process.env.npm_lifecycle_event || 'dev';
  const path = env.includes('test') || env.includes('cover') ? '.env.test' : '.env';

  if (existsSync(path)) {
    try {
      const data = readFileSync(path, 'utf-8').trim().split('\n');

      for (const line of data) {
        if (line.trim() === '' || !line.includes('=')) {
          continue; // Skip empty lines or lines without '='
        }

        const [variable, value] = line.split('=').map(part => part.trim());

        if (variable && value) {
          process.env[variable] = value;
        }
      }
    } catch (error) {
      console.error(`Failed to load environment variables from ${path}:`, error);
    }
  } else {
    console.warn(`Environment file ${path} does not exist.`);
  }
};

export default envLoader;
