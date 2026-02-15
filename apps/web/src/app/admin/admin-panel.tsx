'use client';

import { useState } from 'react';

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
          message: data.message || 'Migrationen erfolgreich ausgeführt',
        });
      } else {
        setResult({
          success: false,
          message: 'Migration fehlgeschlagen',
          error: data.error || 'Unbekannter Fehler',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Migration fehlgeschlagen',
        error: error instanceof Error ? error.message : 'Netzwerkfehler',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Datenbankmigrationen</h2>
        <p className="mb-4 text-gray-600">
          Führt ausstehende Datenbankmigrationen aus. Dies aktualisiert das Datenbankschema auf die
          neueste Version.
        </p>

        <button
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isRunning}
          onClick={runMigration}
          type="button"
        >
          {isRunning ? 'Migrationen werden ausgeführt...' : 'Migrationen ausführen'}
        </button>

        {result && (
          <div
            className={`mt-4 rounded-lg p-4 ${
              result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            <p className="font-semibold">{result.message}</p>
            {result.error && (
              <pre className="mt-2 overflow-x-auto text-sm">
                {result.error}
              </pre>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Systeminformationen</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Datenbank:</dt>
            <dd className="font-mono">
              {process.env.NODE_ENV === 'production' ? 'PostgreSQL (Production)' : 'PostgreSQL (Development)'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Node-Umgebung:</dt>
            <dd className="font-mono">{process.env.NODE_ENV}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
