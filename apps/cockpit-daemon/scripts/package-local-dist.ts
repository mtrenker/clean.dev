import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildDaemonDistribution,
  readPackageVersion,
  resolveDistributionTarget,
} from '../src/distribution';

const parseTargetArg = (argv: string[]) => {
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--target') {
      return argv[index + 1];
    }
    if (token.startsWith('--target=')) {
      return token.slice('--target='.length);
    }
  }

  return undefined;
};

const main = async () => {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const packageDir = path.resolve(scriptDir, '..');
  const target = resolveDistributionTarget(parseTargetArg(process.argv.slice(2)), {
    platform: process.platform,
    arch: process.arch,
  });
  const packageVersion = await readPackageVersion(path.join(packageDir, 'package.json'));
  const result = await buildDaemonDistribution({
    packageRoot: path.join(packageDir, 'dist', 'release'),
    bundlePath: path.join(packageDir, 'dist', 'bundle', 'cockpit-daemon.cjs'),
    runtimeBinaryPath: process.execPath,
    target,
    packageVersion,
    nodeVersion: process.version,
  });

  process.stdout.write(`Built cockpit-daemon distribution for ${result.target.id}\n`);
  process.stdout.write(`${result.packageDir}\n`);
  process.stdout.write(`${result.archivePath}\n`);
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
