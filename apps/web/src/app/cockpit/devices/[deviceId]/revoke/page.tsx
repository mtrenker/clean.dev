import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { revokeDeviceAction } from '../../../actions';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { Badge, Button, Card, Heading, Input, Label, Link } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Cockpit — Revoke device',
};

export const dynamic = 'force-dynamic';

interface RevokeDevicePageProps {
  params: Promise<{ deviceId: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}

function firstParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

async function revokeDevice(deviceId: string, formData: FormData) {
  'use server';

  const reason = String(formData.get('reason') ?? '').trim() || null;

  try {
    await revokeDeviceAction({ deviceId, reason });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to revoke device';
    redirect(`/cockpit/devices/${deviceId}/revoke?error=${encodeURIComponent(msg)}`);
  }

  redirect('/cockpit/devices');
}

const RevokeDevicePage = async ({ params, searchParams }: RevokeDevicePageProps) => {
  const { deviceId } = await params;
  const sp = await searchParams;
  const error = firstParam(sp.error);

  const repo = getCockpitRepository();
  const allDevices = await repo.listDevicesWithDetails({ includeRevoked: true });
  const device = allDevices.find((d) => d.deviceId === deviceId);

  if (!device) notFound();

  const revokeWithId = revokeDevice.bind(null, deviceId);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <Heading as="h1" variant="section" className="text-2xl sm:text-3xl">
          Revoke device
        </Heading>
        <p className="text-sm text-muted-foreground">
          Revoking a device immediately invalidates all its tokens and ends all active sessions.
          The daemon will no longer be able to send events.
        </p>
      </div>

      {device.revokedAt && (
        <Card className="border-destructive/40 bg-destructive/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-destructive">
                Already revoked
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                This device was revoked on{' '}
                {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(
                  device.revokedAt instanceof Date ? device.revokedAt : new Date(device.revokedAt),
                )}
                {device.revokedReason ? ` — ${device.revokedReason}` : ''}
              </p>
            </div>
            <Badge variant="destructive">Revoked</Badge>
          </div>
          <div className="mt-4">
            <Link href="/cockpit/devices" variant="nav" className="text-sm">
              ← Back to devices
            </Link>
          </div>
        </Card>
      )}

      {!device.revokedAt && (
        <>
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <p className="font-mono text-xs uppercase tracking-wider text-destructive">Error</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </Card>
          )}

          <Card>
            <div className="mb-5 space-y-1">
              <p className="font-mono text-base font-semibold text-foreground">
                {device.deviceName}
              </p>
              {device.instanceName && (
                <p className="font-mono text-xs text-muted-foreground">{device.instanceName}</p>
              )}
              <p className="font-mono text-xs text-muted-foreground/60">{device.deviceId}</p>
              {device.latestToken && (
                <p className="font-mono text-xs text-muted-foreground">
                  Token: {device.latestToken.tokenLabel ?? '(no label)'}
                </p>
              )}
            </div>

            <form action={revokeWithId} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reason">Revocation reason</Label>
                <Input
                  id="reason"
                  name="reason"
                  placeholder="e.g. laptop lost, device replaced"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Optional — stored in the audit log alongside the revocation timestamp.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" variant="destructive">
                  Revoke device
                </Button>
                <Link href="/cockpit/devices" variant="nav" className="text-sm">
                  Cancel
                </Link>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
};

export default RevokeDevicePage;
