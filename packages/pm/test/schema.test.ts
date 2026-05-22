import test from 'node:test';
import assert from 'node:assert/strict';

import { clients, invoices, timeEntries } from '../src/db/schema';

test('pm schema exports billing tables', () => {
  assert.ok(clients);
  assert.ok(invoices);
  assert.ok(timeEntries);
});
