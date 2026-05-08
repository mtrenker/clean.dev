import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveDistributionTarget } from '../src/distribution';

const main = () => {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const packageDir = path.resolve(scriptDir, '..');
  const target = resolveDistributionTarget(undefined, {
    platform: process.platform,
    arch: process.arch,
  });
  const installScriptPath = path.join(
    packageDir,
    'dist',
    'release',
    target.id,
    'cockpit-daemon',
    'install.sh',
  );

  const installResult = spawnSync('sh', [installScriptPath], {
    stdio: 'inherit',
    env: process.env,
  });

  if (installResult.status !== 0) {
    process.exitCode = installResult.status ?? 1;
  }
};

main();
