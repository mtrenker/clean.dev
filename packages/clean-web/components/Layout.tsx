import Link from "next/link";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="h-screen dark:bg-slate-800 dark:text-slate-400">

    <header className="flex">

      <h1 className="flex-1">Clean Web</h1>

      <nav className="flex-1">
        <ul className="flex">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/me">
              Me
            </Link>
          </li>
          <li>
            <Link href="/blog">
              Blog
            </Link>
          </li>
        </ul>
      </nav>

    </header>

    {children}

  </div>
);
