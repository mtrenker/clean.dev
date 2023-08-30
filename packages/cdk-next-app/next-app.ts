import { Construct } from "constructs";
import * as child_process from 'child_process';

export interface NextAppProps {
  nextDir: string;
}

export class NextApp extends Construct {
  constructor(scope: Construct, id: string, props: NextAppProps) {
    super(scope, id);
    const { nextDir } = props;

    this.build(nextDir);
  }

  private async build(nextDir: string) {
    await this.buildNext(nextDir);
    await this.buildOpenNext(nextDir);
  }

  private buildNext(nextDir: string) {
    return new Promise((resolve, reject) => {
      const child = child_process.spawn('pnpm run build', {
        cwd: `../../${nextDir}`,
        shell: true,
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        console.log(data);
      });
      child.on('close', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject();
        }
      });
    });
  }

  private buildOpenNext(nextDir: string) {
    return new Promise((resolve, reject) => {
      const child = child_process.spawn('npx open-next build', {
        cwd: `../../${nextDir}`,
        shell: true,
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        console.log(data);
      });
      child.on('close', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject();
        }
      });
    });
  }
}
