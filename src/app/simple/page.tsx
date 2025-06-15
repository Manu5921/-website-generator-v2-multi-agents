export default function SimplePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
        🚀 Website Generator V2 Multi-Agents
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
        Système déployé avec succès sur Vercel !
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
        }}>
          <h3>🎨 Agent Design IA</h3>
          <p>25 templates sectoriels premium</p>
          <p>✅ Opérationnel</p>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
        }}>
          <h3>🤖 Agent Automation</h3>
          <p>3 agents IA conversationnels</p>
          <p>✅ Opérationnel</p>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
        }}>
          <h3>📊 Agent Ads</h3>
          <p>ML algorithmes optimisation</p>
          <p>✅ Opérationnel</p>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
        }}>
          <h3>💎 Agent Core</h3>
          <p>Infrastructure & orchestration</p>
          <p>✅ Opérationnel</p>
        </div>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <h2>🎯 Pages Disponibles</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><a href="/showcase">Showcase Templates</a></li>
          <li><a href="/dashboard-v2">Dashboard V2</a></li>
          <li><a href="/demande-publique">Formulaire Public</a></li>
          <li><a href="/ads-management">Ads Management</a></li>
        </ul>
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#f0f9ff', 
        borderRadius: '10px' 
      }}>
        <h3>💰 Workflow Business</h3>
        <p>399€ → Site généré en 25 minutes</p>
        <p>Système multi-agents parallèles opérationnel</p>
      </div>
    </div>
  );
}