import { chmod, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const SUPPORTED_DISTRIBUTION_TARGETS = ['darwin-arm64', 'linux-x64'] as const;

export type SupportedDistributionTarget = (typeof SUPPORTED_DISTRIBUTION_TARGETS)[number];

export interface DistributionTarget {
  readonly platform: 'darwin' | 'linux';
  readonly arch: 'arm64' | 'x64';
  readonly id: SupportedDistributionTarget;
}

export interface HostRuntime {
  readonly platform: NodeJS.Platform;
  readonly arch: NodeJS.Architecture;
  readonly execPath: string;
  readonly nodeVersion: string;
}

export interface BuildDaemonDistributionOptions {
  readonly packageRoot: string;
  readonly bundlePath: string;
  readonly runtimeBinaryPath: string;
  readonly target: DistributionTarget;
  readonly packageVersion: string;
  readonly nodeVersion: string;
}

export interface BuiltDaemonDistribution {
  readonly packageDir: string;
  readonly archivePath: string;
  readonly target: DistributionTarget;
}

const SUPPORTED_TARGET_SET = new Set<string>(SUPPORTED_DISTRIBUTION_TARGETS);

export const resolveDistributionTarget = (
  requestedTarget: string | undefined,
  host: Pick<HostRuntime, 'platform' | 'arch'>,
): DistributionTarget => {
  const targetId = requestedTarget ?? `${host.platform}-${host.arch}`;

  if (!SUPPORTED_TARGET_SET.has(targetId)) {
    throw new Error(
      `Unsupported cockpit-daemon distribution target "${targetId}". ` +
        `Supported targets: ${SUPPORTED_DISTRIBUTION_TARGETS.join(', ')}.`,
    );
  }

  if (targetId !== `${host.platform}-${host.arch}`) {
    throw new Error(
      `Cross-packaging is not supported. Requested ${targetId} from ${host.platform}-${host.arch}. ` +
        'Build on a matching host so the packaged Node 22 runtime stays executable.',
    );
  }

  const [platform, arch] = targetId.split('-') as ['darwin' | 'linux', 'arm64' | 'x64'];
  return { platform, arch, id: targetId as SupportedDistributionTarget };
};

export const buildDaemonDistribution = async (
  options: BuildDaemonDistributionOptions,
): Promise<BuiltDaemonDistribution> => {
  const { packageRoot, bundlePath, runtimeBinaryPath, target, packageVersion, nodeVersion } = options;
  const packageDir = path.join(packageRoot, target.id, 'cockpit-daemon');
  const archivePath = path.join(packageRoot, `${artifactBasename(packageVersion, target)}.tar.gz`);
  const libDir = path.join(packageDir, 'lib');
  const runtimeDir = path.join(packageDir, 'runtime');
  const binDir = path.join(packageDir, 'bin');

  await rm(packageDir, { recursive: true, force: true });
  await mkdir(libDir, { recursive: true });
  await mkdir(runtimeDir, { recursive: true });
  await mkdir(binDir, { recursive: true });

  await copyFile(bundlePath, path.join(libDir, 'cockpit-daemon.cjs'));
  await copyFile(runtimeBinaryPath, path.join(runtimeDir, 'node'));

  await writeExecutable(path.join(binDir, 'cockpit-daemon'), renderLauncherScript());
  await writeExecutable(
    path.join(packageDir, 'install.sh'),
    renderInstallScript(packageVersion, target.id),
  );
  await writeFile(
    path.join(packageDir, 'README.txt'),
    renderReadme(packageVersion, target.id, nodeVersion),
    'utf8',
  );
  await writeFile(
    path.join(packageDir, 'manifest.json'),
    `${JSON.stringify(
      {
        packageName: 'cockpit-daemon',
        packageVersion,
        target: target.id,
        nodeVersion,
        runtimeBinary: 'runtime/node',
        entrypoint: 'lib/cockpit-daemon.cjs',
        installScript: 'install.sh',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  await chmod(path.join(runtimeDir, 'node'), 0o755);
  await createTarArchive(path.dirname(packageDir), path.basename(packageDir), archivePath);

  return { packageDir, archivePath, target };
};

export const artifactBasename = (packageVersion: string, target: DistributionTarget) =>
  `cockpit-daemon-v${packageVersion}-${target.id}`;

export const renderLauncherScript = () => `#!/bin/sh
set -eu

TARGET="$0"

while [ -L "$TARGET" ]; do
  TARGET_DIR=$(CDPATH= cd -- "$(dirname -- "$TARGET")" && pwd)
  TARGET_LINK=$(readlink "$TARGET")

  case "$TARGET_LINK" in
    /*) TARGET="$TARGET_LINK" ;;
    *) TARGET="$TARGET_DIR/$TARGET_LINK" ;;
  esac
done

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$TARGET")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

exec "$ROOT_DIR/runtime/node" "$ROOT_DIR/lib/cockpit-daemon.cjs" "$@"
`;

export const renderInstallScript = (
  packageVersion: string,
  targetId: SupportedDistributionTarget,
) => `#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PACKAGE_ID="cockpit-daemon-v${packageVersion}-${targetId}"
PREFIX="\${PREFIX:-$HOME/.local}"
BIN_DIR="\${BIN_DIR:-$PREFIX/bin}"
INSTALL_ROOT="\${INSTALL_ROOT:-$PREFIX/share/cockpit-daemon}"
TARGET_DIR="$INSTALL_ROOT/$PACKAGE_ID"

mkdir -p "$BIN_DIR" "$INSTALL_ROOT"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -R "$SCRIPT_DIR/bin" "$TARGET_DIR/bin"
cp -R "$SCRIPT_DIR/lib" "$TARGET_DIR/lib"
cp -R "$SCRIPT_DIR/runtime" "$TARGET_DIR/runtime"
ln -sfn "$TARGET_DIR/bin/cockpit-daemon" "$BIN_DIR/cockpit-daemon"

echo "Installed cockpit-daemon to $TARGET_DIR"
echo "Linked command: $BIN_DIR/cockpit-daemon"

case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *)
    echo "Add $BIN_DIR to PATH before opening a fresh shell."
    ;;
esac
`;

export const renderReadme = (
  packageVersion: string,
  targetId: SupportedDistributionTarget,
  nodeVersion: string,
) => `cockpit-daemon ${packageVersion}
target: ${targetId}
bundled runtime: Node ${nodeVersion}

Install:
  ./install.sh

After installation, open a fresh shell and run:
  cockpit-daemon status
  cockpit-daemon login --device-name "<device>" --token "<token>" --device-id "<id>"
  cockpit-daemon daemon

This package is built for ${targetId} only.
`;

export const readPackageVersion = async (packageJsonPath: string) => {
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as { version?: string };
  if (!packageJson.version) {
    throw new Error(`Missing version in ${packageJsonPath}`);
  }

  return packageJson.version;
};

const writeExecutable = async (filePath: string, content: string) => {
  await writeFile(filePath, content, 'utf8');
  await chmod(filePath, 0o755);
};

const createTarArchive = async (cwd: string, packageName: string, archivePath: string) => {
  const tarResult = spawnSync('tar', ['-czf', archivePath, '-C', cwd, packageName], {
    stdio: 'pipe',
  });

  if (tarResult.status !== 0) {
    const stderr = tarResult.stderr.toString('utf8').trim();
    throw new Error(`Failed to archive distribution with tar: ${stderr || 'unknown error'}`);
  }
};
