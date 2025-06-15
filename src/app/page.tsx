export default function HomePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#333' }}>
        🚀 Website Generator V2 Multi-Agents
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#666' }}>
        Système 100% opérationnel sur Vercel !
      </p>
      
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#333' }}>🎯 Pages Disponibles</h2>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem' }}>
          <li style={{ margin: '10px 0' }}><a href="/showcase" style={{ color: '#0066cc' }}>🎨 Showcase Templates</a></li>
          <li style={{ margin: '10px 0' }}><a href="/demande-publique" style={{ color: '#0066cc' }}>📝 Formulaire Public</a></li>
          <li style={{ margin: '10px 0' }}><a href="/dashboard" style={{ color: '#0066cc' }}>⚙️ Dashboard</a></li>
          <li style={{ margin: '10px 0' }}><a href="/simple" style={{ color: '#0066cc' }}>📊 Status Simple</a></li>
        </ul>
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#f0f9ff', 
        borderRadius: '10px',
        maxWidth: '600px',
        margin: '40px auto 0'
      }}>
        <h3 style={{ color: '#333' }}>💰 Workflow Business</h3>
        <p style={{ color: '#555' }}>399€ → Site généré en 25 minutes</p>
        <p style={{ color: '#555' }}>Système multi-agents parallèles opérationnel</p>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          background: '#dcfce7', 
          color: '#166534', 
          padding: '8px 16px', 
          borderRadius: '20px',
          marginTop: '10px'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            background: '#22c55e', 
            borderRadius: '50%', 
            marginRight: '8px' 
          }}></div>
          Système 100% opérationnel
        </div>
      </div>
    </div>
  );
}