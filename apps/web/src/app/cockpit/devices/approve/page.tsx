import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { approveDeviceAction, listPendingPairingsAction } from '../../actions';
import { Badge, Button, Card, Heading, Input, Label, Link } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Cockpit — Approve device',
};

export const dynamic = 'force-dynamic';

interface ApproveDevicePageProps {
  searchParams: Promise<{
    userCode?: string | string[];
    approved?: string | string[];
    error?: string | string[];
  }>;
}

function firstSearchParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function normalizeUserCode(value: FormDataEntryValue | null): string {
  return String(value ?? '').trim().toUpperCase();
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

async function approveDevice(formData: FormData) {
  'use server';

  const userCode = normalizeUserCode(formData.get('userCode'));
  const tokenLabel = String(formData.get('tokenLabel') ?? '').trim();

  if (!userCode) {
    redirect('/cockpit/devices/approve?error=Device%20code%20is%20required');
  }

  let errorMessage: string | null = null;

  try {
    await approveDeviceAction({
      userCode,
      tokenLabel: tokenLabel || null,
    });
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Failed to approve device';
  }

  if (errorMessage) {
    redirect(
      `/cockpit/devices/approve?userCode=${encodeURIComponent(userCode)}&error=${encodeURIComponent(errorMessage)}`,
    );
  }

  redirect(`/cockpit/devices/approve?approved=${encodeURIComponent(userCode)}`);
}

const ApproveDevicePage = async ({ searchParams }: ApproveDevicePageProps) => {
  const params = await searchParams;
  const userCode = firstSearchParam(params.userCode).toUpperCase();
  const approved = firstSearchParam(params.approved).toUpperCase();
  const error = firstSearchParam(params.error);
  const pendingPairings = await listPendingPairingsAction();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <Heading as="h1" variant="section" className="text-2xl sm:text-3xl">
          Approve cockpit device
        </Heading>
        <p className="text-sm text-muted-foreground">
          Confirm a local cockpit daemon pairing request. The daemon receives a scoped bearer token only after this browser-session approval.
        </p>
      </div>

      {approved && (
        <Card className="border-green-500/40 bg-green-500/5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-green-700">
                Device approved
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Code <span className="font-mono text-foreground">{approved}</span> was approved. Return to the daemon; it should finish exchanging the token automatically.
              </p>
            </div>
            <Badge variant="success">Approved</Badge>
          </div>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <p className="font-mono text-xs uppercase tracking-wider text-destructive">
            Approval failed
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </Card>
      )}

      <Card>
        <form action={approveDevice} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="userCode" required>
              Device code
            </Label>
            <Input
              id="userCode"
              name="userCode"
              defaultValue={userCode}
              placeholder="ABCDE-FGHIJ"
              autoComplete="one-time-code"
              className="font-mono uppercase tracking-wider"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use the code shown by `cockpit-daemon login`.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenLabel">Token label</Label>
            <Input
              id="tokenLabel"
              name="tokenLabel"
              placeholder="dev-laptop"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Optional label for later revocation and audit context.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit">Approve device</Button>
            <Link href="/cockpit" variant="nav" className="text-sm">
              Back to cockpit
            </Link>
          </div>
        </form>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pending requests
          </h2>
          <Badge variant={pendingPairings.length > 0 ? 'info' : 'muted'}>
            {pendingPairings.length} pending
          </Badge>
        </div>

        {pendingPairings.length === 0 ? (
          <Card className="bg-muted/20">
            <p className="text-sm text-muted-foreground">
              No pending device pairing requests. Start `cockpit-daemon login` locally to create one.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingPairings.map((pairing) => (
              <Card key={pairing.userCode} className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-lg font-semibold tracking-wider">
                      {pairing.userCode}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {pairing.deviceName}
                      {pairing.instanceName ? ` · ${pairing.instanceName}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Expires {formatDate(pairing.expiresAt)}
                    </p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>

                <form action={approveDevice} className="flex flex-col gap-3 sm:flex-row">
                  <input type="hidden" name="userCode" value={pairing.userCode} />
                  <Input
                    name="tokenLabel"
                    placeholder={`${pairing.deviceName} token`}
                    aria-label={`Token label for ${pairing.deviceName}`}
                  />
                  <Button type="submit" className="shrink-0">
                    Approve
                  </Button>
                </form>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ApproveDevicePage;
