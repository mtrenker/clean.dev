'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/ui';

interface MigrationResult {
  success: boolean;
  message: string;
  error?: string;
}

export const AdminPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const runMigration = async () => {
    if (!confirm('Datenbankmigrationen ausführen? Dies kann nicht rückgängig gemacht werden.')) {
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
          message: data.message || 'Datenbank-Setup erfolgreich abgeschlossen',
        });
      } else {
        setResult({
          success: false,
          message: 'Setup fehlgeschlagen',
          error: data.error || 'Unbekannter Fehler',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Setup fehlgeschlagen',
        error: error instanceof Error ? error.message : 'Netzwerkfehler',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Datenbank-Setup</h2>
        <p className="mb-4 text-foreground/80">
          Initialisiert oder aktualisiert die Datenbankstruktur. Führen Sie dies nach Updates aus, um neue Features verfügbar zu machen.
        </p>

        <Button
          variant="primary"
          disabled={isRunning}
          onClick={runMigration}
          type="button"
        >
          {isRunning ? 'Setup wird ausgeführt...' : 'Setup ausführen'}
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
        <h2 className="mb-4 text-xl font-semibold text-foreground">Systeminformationen</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/70">Datenbank:</dt>
            <dd className="font-mono text-foreground">
              {process.env.NODE_ENV === 'production' ? 'PostgreSQL (Production)' : 'PostgreSQL (Development)'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/70">Node-Umgebung:</dt>
            <dd className="font-mono text-foreground">{process.env.NODE_ENV}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
};
