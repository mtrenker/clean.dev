'use client';

import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { Fragment } from 'react';
import { useIntl } from 'react-intl';
import type { Session } from 'next-auth';

interface UserMenuProps {
  session: Session;
}

export const UserMenu: React.FC<UserMenuProps> = ({ session }) => {
  const intl = useIntl();
  const initials = session.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        {initials}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md border border-border bg-card py-1 shadow-lg focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <Link
                className={`block px-4 py-2 text-sm text-card-foreground ${active ? 'bg-muted' : ''}`}
                href="/clients"
              >
                {intl.formatMessage({ id: 'clients.heading' })}
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                className={`block px-4 py-2 text-sm text-card-foreground ${active ? 'bg-muted' : ''}`}
                href="/time"
              >
                {intl.formatMessage({ id: 'time.heading' })}
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                className={`block px-4 py-2 text-sm text-card-foreground ${active ? 'bg-muted' : ''}`}
                href="/invoices"
              >
                {intl.formatMessage({ id: 'invoices.heading' })}
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                className={`block px-4 py-2 text-sm text-card-foreground ${active ? 'bg-muted' : ''}`}
                href="/settings"
              >
                {intl.formatMessage({ id: 'settings.heading' })}
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                className={`block px-4 py-2 text-sm text-card-foreground ${active ? 'bg-muted' : ''}`}
                href="/admin"
              >
                {intl.formatMessage({ id: 'admin.heading' })}
              </Link>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
