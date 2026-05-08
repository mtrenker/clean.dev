import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActiveDevicesPanel } from './active-devices-panel';

const NOW_ISO = '2026-05-08T11:55:00.000Z';

describe('ActiveDevicesPanel', () => {
  it('renders an empty state when no devices are reporting', () => {
    render(<ActiveDevicesPanel rows={[]} totalDevices={0} />);
    expect(screen.queryByText('No devices are reporting work')).not.toBeNull();
  });

  it('renders one row per active device with the project link', () => {
    render(
      <ActiveDevicesPanel
        totalDevices={3}
        rows={[
          {
            deviceId: 'dev-1',
            deviceName: 'workstation',
            instanceName: 'main',
            activeTaskCount: 2,
            activePlanId: 'plan-x',
            lastHeartbeatAt: NOW_ISO,
            projectId: 'proj-a',
            projectName: 'Atlas',
            projectSlug: 'atlas',
          },
        ]}
      />,
    );
    expect(screen.queryByText('workstation')).not.toBeNull();
    expect(screen.queryByText('plan-x')).not.toBeNull();
    expect(
      screen.getByRole('link', { name: 'Atlas' }).getAttribute('href'),
    ).toBe('/cockpit/proj-a');
  });

  it('honours the hrefBase override for the demo cockpit', () => {
    render(
      <ActiveDevicesPanel
        totalDevices={1}
        hrefBase="/demo/cockpit"
        rows={[
          {
            deviceId: 'dev-1',
            activeTaskCount: 1,
            lastHeartbeatAt: NOW_ISO,
            projectId: 'proj-a',
            projectName: 'Atlas',
          },
        ]}
      />,
    );
    expect(
      screen.getByRole('link', { name: 'Atlas' }).getAttribute('href'),
    ).toBe('/demo/cockpit/proj-a');
  });
});
