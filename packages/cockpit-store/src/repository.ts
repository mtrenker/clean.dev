import { and, asc, desc, eq, gt, inArray, isNull, lte, lt, max, or, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import {
  cockpitProtocolSchemaVersion,
  eventBatchAckSchema,
  eventBatchSchema,
  telemetryProfilePresets,
  type CockpitEvent,
  type EventBatchAck,
  type ProjectObservationConfig,
} from '@cleandev/cockpit-protocol';

import * as schema from '@cleandev/db';
import type { CockpitProjectedProjectState } from '@cleandev/db';
import type {
  ApproveCockpitDevicePairingInput,
  CockpitDeviceWithDetails,
  CockpitProjectEventSummary,
  CockpitProjectionStatus,
  CreateCockpitDeviceInput,
  CreateCockpitDevicePairingInput,
  CreateCockpitDeviceResult,
  CreateCockpitProjectInput,
  CreateCockpitSessionInput,
  ExchangeCockpitDevicePairingInput,
  ExchangeCockpitDevicePairingResult,
  ICockpitRepository,
  InsertCockpitEventBatchInput,
  ListCockpitDevicesInput,
  MarkCockpitProjectDirtyInput,
  PruneCockpitRawEventsInput,
  PruneCockpitRawEventsResult,
  RevokeCockpitDeviceInput,
  SetPlanArchiveReviewInput,
  SetTaskArchiveReviewInput,
  TaskArchiveReviewRecord,
  UpdateCockpitProjectConfigInput,
  UpsertProjectedProjectStateInput,
} from './types';

const DEFAULT_TELEMETRY = telemetryProfilePresets.balanced;

const asDate = (value?: string | Date | null): Date | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
};

const emptyProjectedState = (summary: {
  projectId: string;
  projectSlug?: string;
  projectName?: string | null;
  localRootPath?: string | null;
  worktreeRootPath?: string | null;
  telemetry?: typeof DEFAULT_TELEMETRY;
  observation?: ProjectObservationConfig;
  dirty?: boolean;
  latestEvent?: CockpitProjectedProjectState['lastEvent'];
}): CockpitProjectedProjectState => ({
  schemaVersion: cockpitProtocolSchemaVersion,
  projectId: summary.projectId,
  projectSlug: summary.projectSlug,
  projectName: summary.projectName ?? null,
  localRootPath: summary.localRootPath ?? null,
  worktreeRootPath: summary.worktreeRootPath ?? null,
  telemetry: summary.telemetry ?? DEFAULT_TELEMETRY,
  observation: summary.observation ?? null,
  dirty: summary.dirty ?? true,
  lastEvent: summary.latestEvent ?? null,
  lastHeartbeat: null,
  devices: {},
  worktrees: {},
  worktreeGroups: {},
  plans: {},
  archivedPlanIds: [],
  tasks: {},
  archivedTaskIds: [],
  activeFleet: [],
  engineUsage: {},
  modelUsage: {},
  profileUsage: {},
  projectUsage: { inputTokens: 0, outputTokens: 0 },
  projectCostEstimate: { currency: 'USD', inputCost: 0, outputCost: 0, totalCost: 0 },
});

export const summarizeProjectsFromEvents = (events: CockpitEvent[]): CockpitProjectEventSummary[] => {
  const summaries = new Map<string, CockpitProjectEventSummary & { metadataSequence?: number }>();

  for (const event of events) {
    const summary = summaries.get(event.projectId) ?? {
      projectId: event.projectId,
      latestEventId: event.eventId,
      latestSequence: event.sequence,
      latestOccurredAt: event.occurredAt,
    };

    if (event.sequence >= summary.latestSequence) {
      summary.latestEventId = event.eventId;
      summary.latestSequence = event.sequence;
      summary.latestOccurredAt = event.occurredAt;
    }

    if (event.type === 'project_seen' && event.sequence >= (summary.metadataSequence ?? -1)) {
      summary.projectName = event.payload.projectName ?? summary.projectName ?? null;
      summary.localRootPath = event.payload.localRootPath ?? summary.localRootPath ?? null;
      summary.worktreeRootPath = event.payload.worktreeRootPath ?? summary.worktreeRootPath ?? null;
      summary.telemetry = event.payload.telemetry;
      summary.observation = event.payload.observation ?? summary.observation;
      summary.metadataSequence = event.sequence;
    }

    summaries.set(event.projectId, summary);
  }

  return [...summaries.values()].map(({ metadataSequence: _metadataSequence, ...summary }) => summary);
};

export class PostgresCockpitRepository implements ICockpitRepository {
  private db;

  constructor(pool: Pool) {
    this.db = drizzle(pool, { schema });
  }

  async createProject(input: CreateCockpitProjectInput) {
    const now = new Date();

    const [project] = await this.db
      .insert(schema.cockpitProjects)
      .values({
        projectId: input.projectId,
        projectSlug: input.projectSlug,
        projectName: input.projectName,
        localRootPath: input.localRootPath,
        worktreeRootPath: input.worktreeRootPath,
        telemetry: input.telemetry ?? DEFAULT_TELEMETRY,
        observation: input.observation ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.cockpitProjects.projectId,
        set: {
          projectSlug: input.projectSlug,
          projectName: input.projectName,
          localRootPath: input.localRootPath,
          worktreeRootPath: input.worktreeRootPath,
          telemetry: input.telemetry ?? DEFAULT_TELEMETRY,
          observation: input.observation ?? null,
          updatedAt: now,
        },
      })
      .returning();

    return project;
  }

  async listProjects() {
    return this.db.select().from(schema.cockpitProjects).orderBy(
      asc(schema.cockpitProjects.projectName),
      asc(schema.cockpitProjects.projectId),
    );
  }

  async getProject(projectId: string) {
    const [project] = await this.db
      .select()
      .from(schema.cockpitProjects)
      .where(eq(schema.cockpitProjects.projectId, projectId))
      .limit(1);
    return project ?? null;
  }

  async updateProjectConfig(input: UpdateCockpitProjectConfigInput) {
    const now = new Date();
    const [project] = await this.db
      .update(schema.cockpitProjects)
      .set({
        ...(input.observation !== undefined ? { observation: input.observation } : {}),
        ...(input.telemetry !== undefined ? { telemetry: input.telemetry } : {}),
        ...(input.worktreeRootPath !== undefined ? { worktreeRootPath: input.worktreeRootPath } : {}),
        updatedAt: now,
      })
      .where(eq(schema.cockpitProjects.projectId, input.projectId))
      .returning();

    if (!project) {
      throw new Error(`Cannot update config: no project found with id ${input.projectId}`);
    }

    return project;
  }

  async createDevice(input: CreateCockpitDeviceInput): Promise<CreateCockpitDeviceResult> {
    const now = new Date();

    return this.db.transaction(async (tx) => {
      const [device] = await tx
        .insert(schema.cockpitPairedDevices)
        .values({
          deviceId: input.deviceId,
          deviceName: input.deviceName,
          instanceName: input.instanceName ?? null,
          metadata: input.metadata ?? null,
          pairedAt: now,
          createdAt: now,
          updatedAt: now,
          revokedAt: null,
          revokedReason: null,
        })
        .onConflictDoUpdate({
          target: schema.cockpitPairedDevices.deviceId,
          set: {
            deviceName: input.deviceName,
            instanceName: input.instanceName ?? null,
            metadata: input.metadata ?? null,
            pairedAt: now,
            revokedAt: null,
            revokedReason: null,
            updatedAt: now,
          },
        })
        .returning();

      let token = null;

      if (input.tokenHash) {
        [token] = await tx
          .insert(schema.cockpitDeviceTokens)
          .values({
            deviceId: input.deviceId,
            tokenHash: input.tokenHash,
            tokenLabel: input.tokenLabel ?? null,
            issuedAt: now,
            expiresAt: asDate(input.expiresAt),
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: schema.cockpitDeviceTokens.tokenHash,
            set: {
              deviceId: input.deviceId,
              tokenLabel: input.tokenLabel ?? null,
              expiresAt: asDate(input.expiresAt),
              revokedAt: null,
              revokedReason: null,
              updatedAt: now,
            },
          })
          .returning();
      }

      return { device, token };
    });
  }

  async listDevices(input?: ListCockpitDevicesInput) {
    if (input?.includeRevoked) {
      return this.db
        .select()
        .from(schema.cockpitPairedDevices)
        .orderBy(desc(schema.cockpitPairedDevices.pairedAt));
    }

    return this.db
      .select()
      .from(schema.cockpitPairedDevices)
      .where(isNull(schema.cockpitPairedDevices.revokedAt))
      .orderBy(desc(schema.cockpitPairedDevices.pairedAt));
  }

  async listDevicesWithDetails(input?: ListCockpitDevicesInput): Promise<CockpitDeviceWithDetails[]> {
    const devices = await this.listDevices(input);
    if (devices.length === 0) return [];

    const deviceIds = devices.map((d) => d.deviceId);

    // ── Active session counts ──────────────────────────────────────────────────
    const sessionCountRows = await this.db
      .select({
        deviceId: schema.cockpitDeviceSessions.deviceId,
        count: sql<string>`cast(count(*) as text)`.as('count'),
      })
      .from(schema.cockpitDeviceSessions)
      .where(and(
        inArray(schema.cockpitDeviceSessions.deviceId, deviceIds),
        isNull(schema.cockpitDeviceSessions.endedAt),
      ))
      .groupBy(schema.cockpitDeviceSessions.deviceId);

    const sessionCountMap = new Map<string, number>(
      sessionCountRows.map((r) => [r.deviceId, parseInt(r.count, 10)]),
    );

    // ── Latest token per device (no hash exposed) ──────────────────────────────
    // Fetch ordered rows via Drizzle's `inArray` helper instead of raw ANY($1)
    // array SQL so node-postgres receives a real parameter list. tokenHash is
    // intentionally excluded — it must never leave the server.
    const latestTokenRows = await this.db
      .select({
        tokenId: schema.cockpitDeviceTokens.tokenId,
        deviceId: schema.cockpitDeviceTokens.deviceId,
        tokenLabel: schema.cockpitDeviceTokens.tokenLabel,
        issuedAt: schema.cockpitDeviceTokens.issuedAt,
        expiresAt: schema.cockpitDeviceTokens.expiresAt,
        lastUsedAt: schema.cockpitDeviceTokens.lastUsedAt,
        revokedAt: schema.cockpitDeviceTokens.revokedAt,
        revokedReason: schema.cockpitDeviceTokens.revokedReason,
      })
      .from(schema.cockpitDeviceTokens)
      .where(inArray(schema.cockpitDeviceTokens.deviceId, deviceIds))
      .orderBy(schema.cockpitDeviceTokens.deviceId, desc(schema.cockpitDeviceTokens.issuedAt));

    const latestTokenMap = new Map<string, CockpitDeviceWithDetails['latestToken']>();
    for (const row of latestTokenRows) {
      if (latestTokenMap.has(row.deviceId)) continue;
      latestTokenMap.set(row.deviceId, {
        tokenId: row.tokenId,
        tokenLabel: row.tokenLabel,
        issuedAt: row.issuedAt instanceof Date ? row.issuedAt : new Date(row.issuedAt as unknown as string),
        expiresAt: row.expiresAt ? (row.expiresAt instanceof Date ? row.expiresAt : new Date(row.expiresAt as unknown as string)) : null,
        lastUsedAt: row.lastUsedAt ? (row.lastUsedAt instanceof Date ? row.lastUsedAt : new Date(row.lastUsedAt as unknown as string)) : null,
        revokedAt: row.revokedAt ? (row.revokedAt instanceof Date ? row.revokedAt : new Date(row.revokedAt as unknown as string)) : null,
        revokedReason: row.revokedReason ?? null,
      });
    }

    // ── Max raw-event sequence per device ──────────────────────────────────────
    const maxSeqRows = await this.db
      .select({
        deviceId: schema.cockpitRawEvents.deviceId,
        maxSeq: max(schema.cockpitRawEvents.sequence).as('max_seq'),
      })
      .from(schema.cockpitRawEvents)
      .where(inArray(schema.cockpitRawEvents.deviceId, deviceIds))
      .groupBy(schema.cockpitRawEvents.deviceId);

    const maxSeqMap = new Map<string, number>(
      maxSeqRows
        .filter((r) => r.maxSeq !== null)
        .map((r) => [r.deviceId, r.maxSeq as number]),
    );

    return devices.map((device) => ({
      ...device,
      activeSessionCount: sessionCountMap.get(device.deviceId) ?? 0,
      latestToken: latestTokenMap.get(device.deviceId) ?? null,
      maxEventSequence: maxSeqMap.get(device.deviceId) ?? null,
    }));
  }

  async revokeDevice(input: RevokeCockpitDeviceInput) {
    const now = new Date();

    return this.db.transaction(async (tx) => {
      const [device] = await tx
        .update(schema.cockpitPairedDevices)
        .set({
          revokedAt: now,
          revokedReason: input.reason ?? null,
          updatedAt: now,
        })
        .where(eq(schema.cockpitPairedDevices.deviceId, input.deviceId))
        .returning();

      if (!device) {
        throw new Error(`Cannot revoke device: no device found with id ${input.deviceId}`);
      }

      await tx
        .update(schema.cockpitDeviceTokens)
        .set({
          revokedAt: now,
          revokedReason: input.reason ?? null,
          updatedAt: now,
        })
        .where(and(
          eq(schema.cockpitDeviceTokens.deviceId, input.deviceId),
          isNull(schema.cockpitDeviceTokens.revokedAt),
        ));

      await tx
        .update(schema.cockpitDeviceSessions)
        .set({
          endedAt: now,
          lastSeenAt: now,
          updatedAt: now,
        })
        .where(and(
          eq(schema.cockpitDeviceSessions.deviceId, input.deviceId),
          isNull(schema.cockpitDeviceSessions.endedAt),
        ));

      return device;
    });
  }

  async createDevicePairing(input: CreateCockpitDevicePairingInput) {
    const now = new Date();

    const [pairing] = await this.db
      .insert(schema.cockpitDevicePairings)
      .values({
        deviceCodeHash: input.deviceCodeHash,
        userCode: input.userCode.toUpperCase(),
        deviceId: input.deviceId,
        deviceName: input.deviceName,
        instanceName: input.instanceName ?? null,
        status: 'pending',
        expiresAt: asDate(input.expiresAt) ?? new Date(now.getTime() + 5 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.cockpitDevicePairings.deviceCodeHash,
        set: {
          userCode: input.userCode.toUpperCase(),
          deviceId: input.deviceId,
          deviceName: input.deviceName,
          instanceName: input.instanceName ?? null,
          status: 'pending',
          tokenLabel: null,
          approvedBy: null,
          approvedAt: null,
          exchangedAt: null,
          expiresAt: asDate(input.expiresAt) ?? new Date(now.getTime() + 5 * 60 * 1000),
          updatedAt: now,
        },
      })
      .returning();

    return pairing;
  }

  async findDevicePairingByUserCode(userCode: string) {
    const [pairing] = await this.db
      .select()
      .from(schema.cockpitDevicePairings)
      .where(eq(schema.cockpitDevicePairings.userCode, userCode.toUpperCase()))
      .limit(1);

    return pairing ?? null;
  }

  async listPendingDevicePairings() {
    const now = new Date();

    return this.db
      .select()
      .from(schema.cockpitDevicePairings)
      .where(and(
        eq(schema.cockpitDevicePairings.status, 'pending'),
        gt(schema.cockpitDevicePairings.expiresAt, now),
      ))
      .orderBy(asc(schema.cockpitDevicePairings.expiresAt));
  }

  async approveDevicePairing(input: ApproveCockpitDevicePairingInput) {
    const now = new Date();
    const userCode = input.userCode.toUpperCase();

    const existing = await this.findDevicePairingByUserCode(userCode);
    if (!existing || existing.expiresAt.getTime() <= now.getTime()) {
      throw new Error('Device pairing request not found or expired');
    }
    if (existing.status !== 'pending') {
      throw new Error(`Cannot approve a pairing with status: ${existing.status}`);
    }

    const [pairing] = await this.db
      .update(schema.cockpitDevicePairings)
      .set({
        status: 'approved',
        tokenLabel: input.tokenLabel ?? null,
        approvedBy: input.approvedBy ?? null,
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(schema.cockpitDevicePairings.userCode, userCode))
      .returning();

    return pairing;
  }

  async exchangeDevicePairing(input: ExchangeCockpitDevicePairingInput): Promise<ExchangeCockpitDevicePairingResult> {
    const now = new Date();

    return this.db.transaction(async (tx) => {
      const [pairing] = await tx
        .select()
        .from(schema.cockpitDevicePairings)
        .where(eq(schema.cockpitDevicePairings.deviceCodeHash, input.deviceCodeHash))
        .limit(1);

      if (!pairing || pairing.expiresAt.getTime() <= now.getTime()) {
        if (pairing && pairing.status !== 'expired') {
          await tx
            .update(schema.cockpitDevicePairings)
            .set({ status: 'expired', updatedAt: now })
            .where(eq(schema.cockpitDevicePairings.pairingId, pairing.pairingId));
        }
        return { status: 'expired', pairing: pairing ?? null, device: null, token: null };
      }

      if (pairing.deviceId !== input.deviceId) {
        return { status: 'device_mismatch', pairing, device: null, token: null };
      }

      if (pairing.status === 'pending') {
        return { status: 'pending', pairing, device: null, token: null };
      }

      if (pairing.status !== 'approved') {
        return { status: 'expired', pairing, device: null, token: null };
      }

      const [device] = await tx
        .insert(schema.cockpitPairedDevices)
        .values({
          deviceId: pairing.deviceId,
          deviceName: pairing.deviceName,
          instanceName: pairing.instanceName ?? null,
          pairedAt: now,
          createdAt: now,
          updatedAt: now,
          revokedAt: null,
          revokedReason: null,
        })
        .onConflictDoUpdate({
          target: schema.cockpitPairedDevices.deviceId,
          set: {
            deviceName: pairing.deviceName,
            instanceName: pairing.instanceName ?? null,
            pairedAt: now,
            revokedAt: null,
            revokedReason: null,
            updatedAt: now,
          },
        })
        .returning();

      const [token] = await tx
        .insert(schema.cockpitDeviceTokens)
        .values({
          deviceId: pairing.deviceId,
          tokenHash: input.tokenHash,
          tokenLabel: pairing.tokenLabel ?? input.fallbackTokenLabel ?? `token-${now.toISOString().slice(0, 10)}`,
          issuedAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.cockpitDeviceTokens.tokenHash,
          set: {
            deviceId: pairing.deviceId,
            tokenLabel: pairing.tokenLabel ?? input.fallbackTokenLabel ?? `token-${now.toISOString().slice(0, 10)}`,
            revokedAt: null,
            revokedReason: null,
            updatedAt: now,
          },
        })
        .returning();

      const [exchanged] = await tx
        .update(schema.cockpitDevicePairings)
        .set({
          status: 'exchanged',
          exchangedAt: now,
          updatedAt: now,
        })
        .where(eq(schema.cockpitDevicePairings.pairingId, pairing.pairingId))
        .returning();

      return { status: 'approved', pairing: exchanged, device, token };
    });
  }

  async createSession(input: CreateCockpitSessionInput) {
    const now = new Date();

    const [session] = await this.db
      .insert(schema.cockpitDeviceSessions)
      .values({
        sessionId: input.sessionId,
        deviceId: input.deviceId,
        tokenId: input.tokenId ?? null,
        connectionId: input.connectionId ?? null,
        instanceName: input.instanceName ?? null,
        lastAckedSequence: input.lastAckedSequence ?? 0,
        startedAt: now,
        lastSeenAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.cockpitDeviceSessions.sessionId,
        set: {
          deviceId: input.deviceId,
          tokenId: input.tokenId ?? null,
          connectionId: input.connectionId ?? null,
          instanceName: input.instanceName ?? null,
          lastAckedSequence: input.lastAckedSequence ?? 0,
          lastSeenAt: now,
          endedAt: null,
          updatedAt: now,
        },
      })
      .returning();

    return session;
  }

  async touchSession(sessionId: string, lastAckedSequence?: number) {
    const now = new Date();

    const [session] = await this.db
      .update(schema.cockpitDeviceSessions)
      .set({
        lastAckedSequence: lastAckedSequence ?? sql`${schema.cockpitDeviceSessions.lastAckedSequence}`,
        lastSeenAt: now,
        updatedAt: now,
      })
      .where(eq(schema.cockpitDeviceSessions.sessionId, sessionId))
      .returning();

    if (!session) {
      throw new Error(`Cannot touch session: no session found with id ${sessionId}`);
    }

    return session;
  }

  async findActiveTokenByHash(tokenHash: string) {
    const now = new Date();
    const [token] = await this.db
      .select()
      .from(schema.cockpitDeviceTokens)
      .where(and(
        eq(schema.cockpitDeviceTokens.tokenHash, tokenHash),
        isNull(schema.cockpitDeviceTokens.revokedAt),
        or(
          isNull(schema.cockpitDeviceTokens.expiresAt),
          gt(schema.cockpitDeviceTokens.expiresAt, now),
        ),
      ))
      .limit(1);

    if (token) {
      await this.db
        .update(schema.cockpitDeviceTokens)
        .set({ lastUsedAt: now, updatedAt: now })
        .where(eq(schema.cockpitDeviceTokens.tokenId, token.tokenId));
    }

    return token ?? null;
  }

  async insertEventBatch(input: InsertCockpitEventBatchInput): Promise<EventBatchAck> {
    const batch = eventBatchSchema.parse(input);
    const summaries = summarizeProjectsFromEvents(batch.events);
    const now = new Date();
    const eventsById = new Map(batch.events.map((event) => [event.eventId, event] as const));

    return this.db.transaction(async (tx) => {
      if (summaries.length > 0) {
        await tx
          .insert(schema.cockpitProjects)
          .values(summaries.map((summary) => ({
            projectId: summary.projectId,
            projectSlug: summary.projectSlug,
            projectName: summary.projectName,
            localRootPath: summary.localRootPath,
            telemetry: summary.telemetry ?? DEFAULT_TELEMETRY,
            projectionDirty: true,
            dirtyMarkedAt: now,
            createdAt: now,
            updatedAt: now,
          })))
          .onConflictDoNothing();
      }

      const inserted = await tx
        .insert(schema.cockpitRawEvents)
        .values(batch.events.map((event) => ({
          eventId: event.eventId,
          batchId: batch.batchId,
          projectId: event.projectId,
          deviceId: event.deviceId,
          sessionId: event.sessionId ?? null,
          schemaVersion: event.schemaVersion,
          sequence: event.sequence,
          occurredAt: new Date(event.occurredAt),
          receivedAt: now,
          source: event.source,
          runId: event.runId ?? null,
          type: event.type,
          payload: event.payload,
          event,
        })))
        .onConflictDoNothing()
        .returning({
          eventId: schema.cockpitRawEvents.eventId,
          projectId: schema.cockpitRawEvents.projectId,
          sequence: schema.cockpitRawEvents.sequence,
        });

      const insertedProjectIds = new Set(inserted.map((row) => row.projectId));

      for (const summary of summaries) {
        if (!insertedProjectIds.has(summary.projectId)) {
          continue;
        }

        await tx
          .update(schema.cockpitProjects)
          .set({
            projectSlug: summary.projectSlug,
            projectName: summary.projectName,
            localRootPath: summary.localRootPath,
            telemetry: summary.telemetry ?? DEFAULT_TELEMETRY,
            latestEventSequence: summary.latestSequence,
            latestEventAt: new Date(summary.latestOccurredAt),
            projectionDirty: true,
            dirtyMarkedAt: now,
            updatedAt: now,
          })
          .where(eq(schema.cockpitProjects.projectId, summary.projectId));

        await tx
          .insert(schema.cockpitProjectedProjectState)
          .values({
            projectId: summary.projectId,
            schemaVersion: cockpitProtocolSchemaVersion,
            // This is the projection checkpoint, not the raw ingestion
            // checkpoint. New rows have not projected any raw events yet.
            latestEventId: null,
            latestEventSequence: 0,
            dirty: true,
            projectedAt: now,
            state: emptyProjectedState({
              projectId: summary.projectId,
              projectSlug: summary.projectSlug,
              projectName: summary.projectName,
              localRootPath: summary.localRootPath,
              telemetry: summary.telemetry ?? DEFAULT_TELEMETRY,
            }),
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoNothing();

        await tx
          .update(schema.cockpitProjectedProjectState)
          .set({
            // Do not advance latestEventSequence here. The background
            // projector advances it only after folding raw events into state.
            dirty: true,
            updatedAt: now,
          })
          .where(eq(schema.cockpitProjectedProjectState.projectId, summary.projectId));
      }

      const ack = eventBatchAckSchema.parse({
        batchId: batch.batchId,
        ackedThroughSequence: Math.max(...batch.events.map((event) => event.sequence)),
        acceptedCount: inserted.length,
        duplicateCount: batch.events.length - inserted.length,
        rejected: [],
        serverTime: now.toISOString(),
      });

      return ack;
    });
  }

  async markProjectDirty(input: MarkCockpitProjectDirtyInput) {
    const now = new Date();

    await this.createProject({
      projectId: input.projectId,
      projectSlug: input.projectSlug,
      projectName: input.projectName,
      localRootPath: input.localRootPath,
      worktreeRootPath: input.worktreeRootPath,
      telemetry: input.telemetry,
      observation: input.observation,
    });

    await this.db
      .insert(schema.cockpitProjectedProjectState)
      .values({
        projectId: input.projectId,
        schemaVersion: cockpitProtocolSchemaVersion,
        latestEventId: input.latestEventId ?? null,
        latestEventSequence: input.latestEventSequence ?? 0,
        dirty: true,
        projectedAt: now,
        state: emptyProjectedState({
          projectId: input.projectId,
          projectSlug: input.projectSlug,
          projectName: input.projectName,
          localRootPath: input.localRootPath,
          worktreeRootPath: input.worktreeRootPath,
          telemetry: input.telemetry ?? DEFAULT_TELEMETRY,
          observation: input.observation ?? undefined,
        }),
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing();

    const [project] = await this.db
      .update(schema.cockpitProjects)
      .set({
        projectSlug: input.projectSlug,
        projectName: input.projectName,
        localRootPath: input.localRootPath,
        worktreeRootPath: input.worktreeRootPath,
        telemetry: input.telemetry ?? DEFAULT_TELEMETRY,
        observation: input.observation ?? null,
        latestEventSequence: input.latestEventSequence ?? sql`${schema.cockpitProjects.latestEventSequence}`,
        projectionDirty: true,
        dirtyMarkedAt: now,
        updatedAt: now,
      })
      .where(eq(schema.cockpitProjects.projectId, input.projectId))
      .returning();

    await this.db
      .update(schema.cockpitProjectedProjectState)
      .set({
        latestEventId: input.latestEventId ?? sql`${schema.cockpitProjectedProjectState.latestEventId}`,
        latestEventSequence: input.latestEventSequence ?? sql`${schema.cockpitProjectedProjectState.latestEventSequence}`,
        dirty: true,
        updatedAt: now,
      })
      .where(eq(schema.cockpitProjectedProjectState.projectId, input.projectId));

    return project;
  }

  async getProjectedProjectState(projectId: string) {
    const [state] = await this.db
      .select({ state: schema.cockpitProjectedProjectState.state })
      .from(schema.cockpitProjectedProjectState)
      .where(eq(schema.cockpitProjectedProjectState.projectId, projectId))
      .limit(1);

    return state?.state ?? null;
  }

  async getProjectedProjectStateRecord(projectId: string) {
    const [record] = await this.db
      .select()
      .from(schema.cockpitProjectedProjectState)
      .where(eq(schema.cockpitProjectedProjectState.projectId, projectId))
      .limit(1);

    return record ?? null;
  }

  async upsertProjectedProjectState(input: UpsertProjectedProjectStateInput) {
    const projectedAt = asDate(input.projectedAt) ?? new Date();

    await this.createProject({
      projectId: input.projectId,
      projectSlug: input.state.projectSlug ?? undefined,
      projectName: input.state.projectName ?? undefined,
      localRootPath: input.state.localRootPath ?? undefined,
      worktreeRootPath: input.state.worktreeRootPath ?? undefined,
      telemetry: input.state.telemetry ?? DEFAULT_TELEMETRY,
      observation: input.state.observation ?? undefined,
    });

    const [record] = await this.db
      .insert(schema.cockpitProjectedProjectState)
      .values({
        projectId: input.projectId,
        schemaVersion: input.state.schemaVersion,
        latestEventId: input.latestEventId ?? input.state.lastEvent?.eventId ?? null,
        latestEventSequence: input.latestEventSequence,
        dirty: false,
        projectedAt,
        state: input.state,
        createdAt: projectedAt,
        updatedAt: projectedAt,
      })
      .onConflictDoUpdate({
        target: schema.cockpitProjectedProjectState.projectId,
        set: {
          schemaVersion: input.state.schemaVersion,
          latestEventId: input.latestEventId ?? input.state.lastEvent?.eventId ?? null,
          latestEventSequence: input.latestEventSequence,
          dirty: false,
          projectedAt,
          state: input.state,
          updatedAt: projectedAt,
        },
      })
      .returning();

    await this.db
      .update(schema.cockpitProjects)
      .set({
        projectSlug: input.state.projectSlug ?? undefined,
        projectName: input.state.projectName ?? undefined,
        localRootPath: input.state.localRootPath ?? undefined,
        telemetry: input.state.telemetry ?? DEFAULT_TELEMETRY,
        latestEventSequence: input.latestEventSequence,
        latestEventAt: input.state.lastEvent ? new Date(input.state.lastEvent.occurredAt) : undefined,
        projectionDirty: false,
        dirtyMarkedAt: null,
        updatedAt: projectedAt,
      })
      .where(eq(schema.cockpitProjects.projectId, input.projectId));

    return record;
  }

  async pruneRawEvents(input: PruneCockpitRawEventsInput): Promise<PruneCockpitRawEventsResult> {
    if (input.throughSequence === undefined && input.occurredBefore === undefined) {
      throw new Error('Pruning raw events requires throughSequence or occurredBefore');
    }

    const conditions = [];

    if (input.projectId) {
      conditions.push(eq(schema.cockpitRawEvents.projectId, input.projectId));
    }

    if (input.throughSequence !== undefined) {
      conditions.push(lte(schema.cockpitRawEvents.sequence, input.throughSequence));
    }

    if (input.occurredBefore !== undefined) {
      conditions.push(lt(schema.cockpitRawEvents.occurredAt, asDate(input.occurredBefore)!));
    }

    const whereClause = and(...conditions);
    const now = new Date();

    return this.db.transaction(async (tx) => {
      const deletedEvents = await tx
        .delete(schema.cockpitRawEvents)
        .where(whereClause)
        .returning({
          projectId: schema.cockpitRawEvents.projectId,
        });

      const [pruneRun] = await tx
        .insert(schema.cockpitManualPruneRuns)
        .values({
          projectId: input.projectId ?? null,
          requestedBy: input.requestedBy ?? null,
          reason: input.reason ?? null,
          prunedThroughSequence: input.throughSequence ?? null,
          prunedBefore: asDate(input.occurredBefore),
          deletedEventCount: deletedEvents.length,
          createdAt: now,
        })
        .returning();

      return {
        deletedEventCount: deletedEvents.length,
        projectsAffected: [...new Set(deletedEvents.map((event) => event.projectId))],
        pruneRun,
      };
    });
  }

  async listDirtyProjects(minDirtyAgeMs: number) {
    // Only return projects that have been dirty for at least `minDirtyAgeMs` ms.
    // This implements the debounce: if events keep arriving the dirtyMarkedAt
    // timestamp is refreshed and the project won't surface until it's quiet.
    const cutoff = new Date(Date.now() - minDirtyAgeMs);

    return this.db
      .select()
      .from(schema.cockpitProjects)
      .where(and(
        eq(schema.cockpitProjects.projectionDirty, true),
        lte(schema.cockpitProjects.dirtyMarkedAt, cutoff),
      ))
      .orderBy(asc(schema.cockpitProjects.dirtyMarkedAt))
      .limit(100);
  }

  async listRawEventsSince(
    projectId: string,
    afterSequence: number,
    limit = 10_000,
  ): Promise<CockpitEvent[]> {
    const rows = await this.db
      .select({ event: schema.cockpitRawEvents.event })
      .from(schema.cockpitRawEvents)
      .where(and(
        eq(schema.cockpitRawEvents.projectId, projectId),
        gt(schema.cockpitRawEvents.sequence, afterSequence),
      ))
      .orderBy(asc(schema.cockpitRawEvents.sequence))
      .limit(limit);

    return rows.map((row) => row.event);
  }

  async getProjectionStatus(projectId: string): Promise<CockpitProjectionStatus | null> {
    // Load the project row (existence check + dirty state)
    const project = await this.getProject(projectId);
    if (!project) return null;

    // Load the projected-state record for projectedSequence + projectedAt
    const stateRecord = await this.getProjectedProjectStateRecord(projectId);

    // Load the highest raw-event sequence for this project
    const [maxSeqRow] = await this.db
      .select({ maxSeq: max(schema.cockpitRawEvents.sequence).as('max_seq') })
      .from(schema.cockpitRawEvents)
      .where(eq(schema.cockpitRawEvents.projectId, projectId));

    const rawMaxSequence = maxSeqRow?.maxSeq ?? null;
    const projectedSequence = stateRecord?.latestEventSequence ?? 0;
    const sequenceLag =
      rawMaxSequence !== null ? rawMaxSequence - projectedSequence : null;

    return {
      projectId,
      rawMaxSequence,
      projectedSequence,
      isDirty: project.projectionDirty ?? false,
      dirtyMarkedAt: project.dirtyMarkedAt ?? null,
      projectedAt: stateRecord?.projectedAt ?? null,
      sequenceLag,
    };
  }

  async resetProjectionCheckpoint(projectId: string, requestedBy?: string | null): Promise<void> {
    const now = new Date();

    // Reset the projection sequence to 0 — the next projection cycle will
    // fold all events from the beginning of the log.
    await this.db
      .update(schema.cockpitProjectedProjectState)
      .set({
        latestEventSequence: 0,
        latestEventId: null,
        dirty: true,
        updatedAt: now,
      })
      .where(eq(schema.cockpitProjectedProjectState.projectId, projectId));

    // Mark the project dirty so the background projector schedules it.
    await this.db
      .update(schema.cockpitProjects)
      .set({
        projectionDirty: true,
        dirtyMarkedAt: now,
        updatedAt: now,
      })
      .where(eq(schema.cockpitProjects.projectId, projectId));

    // Structured log entry: stored in the server process stdout. This record
    // is intentionally minimal — the full audit trail is the projector log.
    const logEntry = {
      ts: now.toISOString(),
      event: 'cockpit.projection.checkpoint_reset',
      projectId,
      requestedBy: requestedBy ?? null,
    };
    process.stdout.write(JSON.stringify(logEntry) + '\n');
  }

  async setTaskArchiveReview(input: SetTaskArchiveReviewInput): Promise<void> {
    const now = new Date();
    const source = input.source ?? 'archive';

    return this.db.transaction(async (tx) => {
      // 1. Find existing detail row for this (project, source, task).
      const [detail] = await tx
        .select()
        .from(schema.cockpitTaskDetails)
        .where(
          and(
            eq(schema.cockpitTaskDetails.projectId, input.projectId),
            eq(schema.cockpitTaskDetails.source, source),
            eq(schema.cockpitTaskDetails.taskId, input.taskId),
          ),
        )
        .limit(1);

      // 2. Look up the projected state so we can both patch it and
      //    discover the planId for new task-detail rows.
      const [stateRow] = await tx
        .select()
        .from(schema.cockpitProjectedProjectState)
        .where(eq(schema.cockpitProjectedProjectState.projectId, input.projectId))
        .limit(1);
      const state = stateRow?.state as CockpitProjectedProjectState | undefined;
      const projectedTask = state?.tasks?.[input.taskId];
      const planId = detail?.planId ?? projectedTask?.planId ?? '';

      if (detail) {
        await tx
          .update(schema.cockpitTaskDetails)
          .set({
            archiveReviewStatus: input.reviewStatus,
            archiveReviewNotes: input.reviewNotes ?? null,
            archiveReviewedAt: now,
            updatedAt: now,
          })
          .where(eq(schema.cockpitTaskDetails.taskDetailId, detail.taskDetailId));
      } else {
        await tx.insert(schema.cockpitTaskDetails).values({
          projectId: input.projectId,
          planId,
          taskId: input.taskId,
          source,
          archiveReviewStatus: input.reviewStatus,
          archiveReviewNotes: input.reviewNotes ?? null,
          archiveReviewedAt: now,
          createdAt: now,
          updatedAt: now,
          state: {},
        });
      }

      // 3. Mirror the verdict into the projected state JSON so subsequent
      //    reads see the new status without waiting for re-projection.
      if (state && projectedTask) {
        const nextArchive = {
          ...(projectedTask.archive ?? {}),
          reviewStatus: input.reviewStatus,
          reviewNotes: input.reviewNotes ?? null,
          reviewedAt: now.toISOString(),
        };
        const nextTask = { ...projectedTask, archive: nextArchive };
        const nextState: CockpitProjectedProjectState = {
          ...state,
          tasks: {
            ...(state.tasks ?? {}),
            [input.taskId]: nextTask,
          },
        };
        await tx
          .update(schema.cockpitProjectedProjectState)
          .set({ state: nextState, updatedAt: now })
          .where(eq(schema.cockpitProjectedProjectState.projectId, input.projectId));
      }
    });
  }

  async setPlanArchiveReview(input: SetPlanArchiveReviewInput): Promise<void> {
    const now = new Date();

    return this.db.transaction(async (tx) => {
      const [stateRow] = await tx
        .select()
        .from(schema.cockpitProjectedProjectState)
        .where(eq(schema.cockpitProjectedProjectState.projectId, input.projectId))
        .limit(1);
      const state = stateRow?.state as CockpitProjectedProjectState | undefined;
      if (!state) return;

      const plan = state.plans?.[input.planId];
      if (!plan) return;

      const nextArchive = {
        ...(plan.archive ?? {}),
        reviewStatus: input.reviewStatus,
        reviewNotes: input.reviewNotes ?? null,
        reviewedAt: now.toISOString(),
      };
      const nextPlan = { ...plan, archive: nextArchive };
      const nextState: CockpitProjectedProjectState = {
        ...state,
        plans: {
          ...(state.plans ?? {}),
          [input.planId]: nextPlan,
        },
      };
      await tx
        .update(schema.cockpitProjectedProjectState)
        .set({ state: nextState, updatedAt: now })
        .where(eq(schema.cockpitProjectedProjectState.projectId, input.projectId));
    });
  }

  async listTaskArchiveReviews(projectId: string): Promise<TaskArchiveReviewRecord[]> {
    const rows = await this.db
      .select({
        taskId: schema.cockpitTaskDetails.taskId,
        source: schema.cockpitTaskDetails.source,
        archiveReviewStatus: schema.cockpitTaskDetails.archiveReviewStatus,
        archiveReviewNotes: schema.cockpitTaskDetails.archiveReviewNotes,
        archiveReviewedAt: schema.cockpitTaskDetails.archiveReviewedAt,
      })
      .from(schema.cockpitTaskDetails)
      .where(eq(schema.cockpitTaskDetails.projectId, projectId));

    return rows.map((row) => ({
      taskId: row.taskId,
      source: row.source ?? 'archive',
      reviewStatus: row.archiveReviewStatus ?? null,
      reviewNotes: row.archiveReviewNotes ?? null,
      reviewedAt: row.archiveReviewedAt ?? null,
    }));
  }
}

export const createCockpitRepository = (pool: Pool): ICockpitRepository => new PostgresCockpitRepository(pool);
