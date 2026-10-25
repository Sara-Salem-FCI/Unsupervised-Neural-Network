import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { TutorButton } from './TutorButton';
import { SelectionZoomLens } from './ui/SelectionZoomLens';
import { useEffect } from 'react';

export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-void flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <TutorButton />
      <SelectionZoomLens />
    </div>
  );
}
