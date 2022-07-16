import Link from "next/link";

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
  label: 'Me',
  href: '/me',
}, {
  label: 'Blog',
  href: '/blog',
}, {
  label: 'Contact',
  href: '/contact',
}];

export const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="flex min-h-screen flex-col dark:bg-slate-800 dark:text-slate-400">

    <header className="flex h-20 grow-0 items-center border-b border-b-slate-700 p-4">
      <h1 className="flex-1">clean web</h1>

      <nav className="flex-1">
        <ul className="flex justify-end gap-4 px-4">
          {navItems.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} passHref>
                <a className="font-medium text-slate-400 hover:text-slate-300" href="/">{label}</a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

    </header>

    <div className="flex-1">
      {children}
    </div>

    <footer className="h-40 w-full grow-0 bg-slate-900 p-4">
      Footer
    </footer>

  </div>
);
