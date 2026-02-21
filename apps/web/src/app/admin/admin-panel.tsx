'use client';

import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Card, Button } from '@/components/ui';

interface MigrationResult {
  success: boolean;
  message: string;
  error?: string;
}

export const AdminPanel: React.FC = () => {
  const intl = useIntl();
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const runMigration = async () => {
    if (!confirm(intl.formatMessage({ id: 'admin.db.confirm' }))) {
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || intl.formatMessage({ id: 'admin.db.success' }),
        });
      } else {
        setResult({
          success: false,
          message: intl.formatMessage({ id: 'admin.db.failed' }),
          error: data.error || intl.formatMessage({ id: 'admin.db.error.unknown' }),
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: intl.formatMessage({ id: 'admin.db.failed' }),
        error: error instanceof Error ? error.message : intl.formatMessage({ id: 'admin.db.error.network' }),
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-xl font-semibold text-foreground">{intl.formatMessage({ id: 'admin.db.heading' })}</h2>
        <p className="mb-4 text-foreground/80">
          {intl.formatMessage({ id: 'admin.db.description' })}
        </p>

        <Button
          variant="primary"
          disabled={isRunning}
          onClick={runMigration}
          type="button"
        >
          {isRunning ? intl.formatMessage({ id: 'admin.db.running' }) : intl.formatMessage({ id: 'admin.db.run' })}
        </Button>

        {result && (
          <div
            className={`mt-4 rounded-lg border-2 p-4 ${
              result.success
                ? 'border-accent/30 bg-accent/10 text-foreground'
                : 'border-red-500/30 bg-red-500/10 text-foreground'
            }`}
          >
            <p className="font-semibold">{result.message}</p>
            {result.error && (
              <pre className="mt-2 overflow-x-auto text-sm font-mono text-foreground/80">
                {result.error}
              </pre>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-semibold text-foreground">{intl.formatMessage({ id: 'admin.sysinfo.heading' })}</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/70">{intl.formatMessage({ id: 'admin.sysinfo.database' })}</dt>
            <dd className="font-mono text-foreground">
              {process.env.NODE_ENV === 'production'
                ? intl.formatMessage({ id: 'admin.sysinfo.db.production' })
                : intl.formatMessage({ id: 'admin.sysinfo.db.development' })}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/70">{intl.formatMessage({ id: 'admin.sysinfo.env' })}</dt>
            <dd className="font-mono text-foreground">{process.env.NODE_ENV}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
};
