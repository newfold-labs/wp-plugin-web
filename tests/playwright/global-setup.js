import { execSync } from 'child_process';
import utils from './helpers/utils.mjs';

async function globalSetup(config) {
  utils.fancyLog('Running global setup...', 55, 'gray', '');
  
  try {
    // work around for the flaky activation of the plugin which causes the AI page designer
    // spec to fail on the first run due to the nfd_site_capabilities transient not being set.
    utils.fancyLog('🔥 Consuming plugin fresh-activation flag...', 55, 'gray', '');
    execSync('npx wp-env run cli -- wp option delete nfd_activated_fresh || true', {
      stdio: 'inherit',
      encoding: 'utf-8',
      timeout: 60000,
    });

    // Set permalink structure via WP-CLI (runs before browser is created)
    const permalinkStructure = '/%postname%/';
    utils.fancyLog(`🔗 Setting permalink structure to: ${permalinkStructure}`, 55, 'gray', '');
    
    execSync(`npx wp-env run cli -- wp rewrite structure '${permalinkStructure}'`, {
      stdio: 'inherit',
      encoding: 'utf-8',
      timeout: 60000,
    });
    
    // Flush rewrite rules to apply the new permalink structure
    utils.fancyLog('🔄 Flushing rewrite rules...', 55, 'gray', '');
    execSync('npx wp-env run cli -- wp rewrite flush --hard', {
      stdio: 'inherit',
      encoding: 'utf-8',
      timeout: 60000,
    });
    
    utils.fancyLog('✔ Global setup completed successfully', 55, 'green', '');
  } catch (error) {
    utils.fancyLog(`✘ Global setup failed: ${error.message}`, 55, 'red', '');
    process.exit(1);
  }
}

export default globalSetup;
