import { Auth } from '@aws-amplify/auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export interface LayoutProps {
  children: React.ReactNode;
}

export interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [{
  label: 'Home',
  href: '/',
}, {
  label: 'Blog',
  href: '/blog',
}, {
  label: 'Profile',
  href: '/profile',
}, {
  label: 'Contact',
  href: '/contact',
}];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const getUser = async () => {
      const user = await Auth.currentAuthenticatedUser();
      setUser(user);
    };
    getUser();
  }, []);
  return (
    <div className="flex min-h-screen flex-col dark:bg-slate-900 dark:text-white">

      <header className="flex h-20 grow-0 items-center border-b border-b-slate-700 p-4">
        <div className="container mx-auto flex">
          <h1 className="flex-1">clean</h1>
          <nav className="w-fit flex-initial">
            <ul className="flex justify-end divide-x divide-slate-400">
              {navItems.map(({ href, label }) => (
                <li className="flex-1 px-4 text-center first:pl-0 last:pr-0" key={href}>
                  <Link href={href} passHref>
                    <a className="block font-medium text-slate-400 hover:text-slate-300" href="/">{label}</a>
                  </Link>
                </li>
              ))}
              {user ? (
                <li className="flex-1 px-4 text-center first:pl-0 last:pr-0">
                  <Link href="/signout" passHref>
                    <a className="block font-medium text-slate-400 hover:text-slate-300" href="/">Sign out</a>
                  </Link>
                </li>
              ) : (
                <li className="flex-1 px-4 text-center first:pl-0 last:pr-0">
                  <Link href="/signin" passHref>
                    <a className="block font-medium text-slate-400 hover:text-slate-300" href="/">Sign in</a>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <div className="flex-1">
        {children}
      </div>

      <footer className="h-40 w-full grow-0 bg-slate-900 p-4">
        Footer
      </footer>

    </div>
  );
};
