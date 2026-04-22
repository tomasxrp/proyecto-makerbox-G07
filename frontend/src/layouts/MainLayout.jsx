import Sidebar from '../components/Sidebar';

export default function MainLayout({ children }) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido */}
      <div className="flex-1 p-6 bg-background min-h-screen">{children}</div>
    </div>
  );
}
