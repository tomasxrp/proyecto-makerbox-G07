import { useState } from 'react';
import PropTypes from 'prop-types';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-surface to-surface-container/60 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
