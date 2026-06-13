'use client';

import { useEffect }    from 'react';
import { usePathname }  from 'next/navigation';
import Navbar           from '@/components/Navbar';

const NAVBAR_HIDDEN_PREFIXES = ['/dashboard', '/login', '/forgot-password'];
const DASHBOARD_PREFIXES     = ['/dashboard'];

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const showNavbar    = !NAVBAR_HIDDEN_PREFIXES.some(p => pathname.startsWith(p));
  const isDashboard   = DASHBOARD_PREFIXES.some(p => pathname.startsWith(p));

  /* Toggle dark body class for dashboard routes */
  useEffect(() => {
    if (isDashboard) {
      document.body.classList.add('dashboard');
    } else {
      document.body.classList.remove('dashboard');
    }
  }, [isDashboard]);

  return (
    <>
      {showNavbar && <Navbar />}
      <main className={showNavbar ? 'pt-28 sm:pt-32' : ''}>
        {children}
      </main>
    </>
  );
}