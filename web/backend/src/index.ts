import { createApp } from './app.js';
import { loadConfig } from './config/appConfig.js';

const config = loadConfig();
const app = createApp({ config });

app.listen(config.port, () => {
  console.log(`goose-web-backend listening on port ${config.port}`);
});
