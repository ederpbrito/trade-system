export function CockpitPage() {
  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Cockpit</h1>
      <section
        aria-labelledby="empty-title"
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          padding: "2rem",
          background: "#f8fafc",
        }}
      >
        <h2 id="empty-title" style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>
          Ainda sem dados
        </h2>
        <p style={{ color: "#475569", lineHeight: 1.5, marginBottom: "1rem" }}>
          Comece por adicionar um ativo à lista monitorizada ou configurar uma fonte de mercado. Os módulos
          seguintes do produto encaixam aqui.
        </p>
        <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#334155" }}>
          <li>Adicionar ativo à monitorização</li>
          <li>Configurar fonte de dados</li>
        </ul>
      </section>
    </main>
  );
}
