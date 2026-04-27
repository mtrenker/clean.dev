'use client';

import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Badge, Button, Card, Table, TableBody, TableCell, TableRow } from '@/components/ui';

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
        <h2 className="mb-3 text-xl font-semibold text-foreground">{intl.formatMessage({ id: 'admin.db.heading' })}</h2>
        <p className="mb-4 text-muted-foreground">
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
          <div className="mt-5 rounded-sm border border-border bg-muted/20 p-4">
            <Badge variant={result.success ? 'success' : 'destructive'}>
              {result.message}
            </Badge>
            {result.error && (
              <pre className="mt-3 overflow-x-auto rounded-sm bg-card p-3 text-sm font-mono text-muted-foreground">
                {result.error}
              </pre>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-semibold text-foreground">{intl.formatMessage({ id: 'admin.sysinfo.heading' })}</h2>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="w-56 text-muted-foreground">{intl.formatMessage({ id: 'admin.sysinfo.database' })}</TableCell>
              <TableCell className="font-mono text-foreground">
                {process.env.NODE_ENV === 'production'
                  ? intl.formatMessage({ id: 'admin.sysinfo.db.production' })
                  : intl.formatMessage({ id: 'admin.sysinfo.db.development' })}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground">{intl.formatMessage({ id: 'admin.sysinfo.env' })}</TableCell>
              <TableCell className="font-mono text-foreground">{process.env.NODE_ENV}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
