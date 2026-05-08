import { Badge } from '@/components/ui';
import { ConsolePanel } from '@/components/cockpit/console-panel';
import type { CockpitProjectionStatus } from '@cleandev/cockpit-store';
import { ForceReprojectButton } from './force-reproject-button';

interface ProjectionStatusPanelProps {
  status: CockpitProjectionStatus;
}

/**
 * Projection health panel shown in the "Operator tools" section of the project
 * detail page.  Displays the raw-ingestion sequence vs. projected sequence so
 * operators can diagnose staleness without direct DB access.
 *
 * ## Reading the panel
 *
 * | Signal                          | Meaning                                      |
 * |---------------------------------|----------------------------------------------|
 * | Lag = 0, dirty = false          | Up to date — no action needed                |
 * | Lag > 0, dirty = true           | Projector is behind — wait or force-reproject|
 * | Lag > 0, dirty = false          | Checkpoint error — force-reproject            |
 * | rawMaxSeq = null                | No events ingested — daemon may be offline   |
 *
 * ## Recovery steps (no DB access)
 *
 * 1. **Daemon offline**: check daemon connectivity; restart daemon process.
 * 2. **Ingestion stopped**: check `/cockpit/devices` for session activity.
 * 3. **Projection lag**: click "Force re-project" — the projector will re-fold
 *    all events on the next cycle (within a few seconds).
 * 4. **UI cache stale**: hard-refresh the browser (Ctrl+Shift+R) or click the
 *    Refresh button on the dashboard header.
 */
export function ProjectionStatusPanel({ status }: ProjectionStatusPanelProps) {
  const {
    projectId,
    rawMaxSequence,
    projectedSequence,
    sequenceLag,
    isDirty,
    dirtyMarkedAt,
    projectedAt,
  } = status;

  const isHealthy = sequenceLag === 0 && !isDirty;
  const hasLag = sequenceLag !== null && sequenceLag > 0;
  const noEvents = rawMaxSequence === null;

  const healthVariant = noEvents
    ? 'outline'
    : isHealthy
      ? 'success'
      : hasLag
        ? 'warning'
        : 'outline';

  const healthLabel = noEvents
    ? 'no events'
    : isHealthy
      ? 'up to date'
      : isDirty
        ? 'projecting…'
        : 'checkpoint error';

  return (
    <ConsolePanel
      title="Projection status"
      command="cockpit projection status"
      meta={<Badge variant={healthVariant}>{healthLabel}</Badge>}
    >
      <div className="space-y-4 p-4">
        {/* ── Sequence metrics ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Metric
            label="Raw max seq"
            value={rawMaxSequence !== null ? rawMaxSequence.toLocaleString() : '—'}
            title="Highest sequence stored in cockpit_raw_events for this project"
          />
          <Metric
            label="Projected seq"
            value={projectedSequence.toLocaleString()}
            title="Highest sequence the projector has folded into the snapshot"
          />
          <Metric
            label="Lag"
            value={
              sequenceLag !== null
                ? sequenceLag === 0
                  ? '0 (ok)'
                  : `+${sequenceLag.toLocaleString()}`
                : '—'
            }
            highlight={hasLag ? 'warning' : isHealthy ? 'ok' : undefined}
            title="rawMaxSequence − projectedSequence; positive means the projector is behind"
          />
          <Metric
            label="Dirty"
            value={isDirty ? 'yes' : 'no'}
            title="Whether the background projector has unprocessed events queued"
          />
        </div>

        {/* ── Timestamps ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-2 border-t border-border/50 pt-3 sm:grid-cols-2">
          <TimestampRow
            label="Last projected"
            iso={projectedAt?.toISOString() ?? null}
            title="When the projector last wrote a snapshot for this project"
          />
          <TimestampRow
            label="Dirty since"
            iso={dirtyMarkedAt?.toISOString() ?? null}
            title="When events last arrived (dirtyMarkedAt); null if not dirty"
          />
        </div>

        {/* ── Recovery guide ───────────────────────────────────────── */}
        <div className="border-t border-border/50 pt-3">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Recovery guide
          </p>
          <ul className="space-y-1 font-mono text-xs text-muted-foreground">
            <li>
              <span className="text-foreground">Lag &gt; 0 &amp;&amp; dirty</span>
              {' '}— projector is behind; click{' '}
              <span className="text-foreground">Force re-project</span> or wait.
            </li>
            <li>
              <span className="text-foreground">Lag &gt; 0 &amp;&amp; not dirty</span>
              {' '}— checkpoint error; click{' '}
              <span className="text-foreground">Force re-project</span> to reset.
            </li>
            <li>
              <span className="text-foreground">rawMaxSeq = null</span>
              {' '}— no events ingested; check daemon on{' '}
              <span className="text-foreground">/cockpit/devices</span>.
            </li>
            <li>
              <span className="text-foreground">Data stale but lag = 0</span>
              {' '}— browser cache; hard-refresh (Ctrl+Shift+R).
            </li>
          </ul>
        </div>

        {/* ── Action ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-t border-border/50 pt-3">
          <ForceReprojectButton projectId={projectId} />
          {hasLag && (
            <span className="font-mono text-xs text-warning-foreground">
              {sequenceLag?.toLocaleString()} events behind — re-projection recommended
            </span>
          )}
        </div>
      </div>
    </ConsolePanel>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface MetricProps {
  label: string;
  value: string;
  title?: string;
  highlight?: 'ok' | 'warning';
}

function Metric({ label, value, title, highlight }: MetricProps) {
  const valueClass =
    highlight === 'warning'
      ? 'text-warning-foreground'
      : highlight === 'ok'
        ? 'text-success-foreground'
        : 'text-foreground';

  return (
    <div title={title}>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className={`font-mono text-sm tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}

interface TimestampRowProps {
  label: string;
  iso: string | null;
  title?: string;
}

function TimestampRow({ label, iso, title }: TimestampRowProps) {
  return (
    <div title={title} className="flex flex-col gap-0.5">
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <time
        dateTime={iso ?? undefined}
        className="font-mono text-xs tabular-nums text-foreground"
      >
        {iso ?? '—'}
      </time>
    </div>
  );
}
