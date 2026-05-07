import test from 'node:test';
import assert from 'node:assert/strict';

import { clients, cockpitProjects } from '../src/db/schema';

test('pm schema exports billing and shared cockpit tables', () => {
  assert.ok(clients);
  assert.ok(cockpitProjects);
});
