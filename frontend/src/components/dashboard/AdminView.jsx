export default function AdminView() {
  return (
    <>
      {/* CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container p-6 rounded-xl shadow">
          <h2>Usuarios</h2>
          <p className="text-2xl font-bold">120</p>
        </div>

        <div className="bg-surface-container p-6 rounded-xl shadow">
          <h2>Proyectos</h2>
          <p className="text-2xl font-bold">35</p>
        </div>

        <div className="bg-surface-container p-6 rounded-xl shadow">
          <h2>Impresiones</h2>
          <p className="text-2xl font-bold">8</p>
        </div>
      </section>

      {/* ACCIONES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-primary text-white p-4 rounded">
          Gestionar usuarios
        </button>
        <button className="bg-primary text-white p-4 rounded">
          Ver proyectos
        </button>
        <button className="bg-primary text-white p-4 rounded">
          Impresiones
        </button>
      </section>
    </>
  );
}
