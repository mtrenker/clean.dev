import { Auth } from '@aws-amplify/auth';
import { IconLogin, IconLogout, IconUserCircle } from '@tabler/icons';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuthenticator } from '../../features/users/hooks/useAuthenticator';

export interface LayoutProps {
  children: React.ReactNode;
}

export interface NavItem {
  href: string;
  label: string;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, setUser } = useAuthenticator();
  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setUser(user);
      } catch (error) {
        console.info(error);
      }
    };
    getUser();
  }, [setUser]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-50">

      <header className="flex h-20 grow-0 items-center p-4 print:hidden">
        <div className="container mx-auto flex">
          <h1 className="flex-1 text-xl">
            <Link href="/">
              <span className="font-bold">clean</span>
              <span className="font-light">.dev</span>
            </Link>
          </h1>
          <nav className="w-fit flex-initial">
            <ul className="flex justify-end divide-x divide-slate-400">
              <li>
                <Link className="px-4" href="/">Home</Link>
              </li>
              <li>
                <Link className="px-4" href="/contact">Contact</Link>
              </li>
            </ul>
            {user ? (
              <ul className="hidden">
                <li className="flex-1 px-4 text-center first:pl-0 last:pr-0">
                  <Link href="/projects">
                    Projects
                  </Link>
                </li>
                <li className="flex-1 px-4 text-center first:pl-0 last:pr-0">
                  <Link className="block font-medium text-slate-400 hover:text-slate-300" href="/user/profile">
                    <IconUserCircle />
                  </Link>
                </li>
                <li className="flex-1 px-4 text-center first:pl-0 last:pr-0">
                  <Link className="block font-medium text-slate-400 hover:text-slate-300" href="/signout">
                    <IconLogout />
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="hidden">
                <li className="flex-1 px-4 text-center first:pl-0 last:pr-0">
                  <Link className="block font-medium text-slate-400 hover:text-slate-300" href="/signin">
                    <IconLogin />
                  </Link>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </header>

      <div className="flex flex-1">
        {children}
      </div>

      <footer className="h-40 w-full grow-0 p-4 dark:bg-zinc-900 print:hidden">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-zinc-400">
                clean.dev
              </p>
            </div>
            <div className="flex-1">
              <p className="text-zinc-400">
                &copy; 2022 Martin Trenker
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
