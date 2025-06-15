export default function ShowcasePage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>
        🎨 Showcase Templates IA
      </h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#666' }}>
        Découvrez nos templates générés par intelligence artificielle
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>🍽️ Restaurant</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Template optimisé pour restaurants et cafés</p>
          <div style={{ 
            background: '#f3f4f6', 
            padding: '10px', 
            borderRadius: '5px',
            fontSize: '0.9rem',
            color: '#555'
          }}>
            ✅ Menu digital<br/>
            ✅ Réservations en ligne<br/>
            ✅ Galerie photos<br/>
            ✅ Avis clients
          </div>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>✂️ Coiffeur</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Template spécialisé beauté et bien-être</p>
          <div style={{ 
            background: '#f3f4f6', 
            padding: '10px', 
            borderRadius: '5px',
            fontSize: '0.9rem',
            color: '#555'
          }}>
            ✅ Galerie avant/après<br/>
            ✅ Prise de RDV<br/>
            ✅ Services et tarifs<br/>
            ✅ Équipe et expertise
          </div>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>🔧 Artisan</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Template pour artisans et services</p>
          <div style={{ 
            background: '#f3f4f6', 
            padding: '10px', 
            borderRadius: '5px',
            fontSize: '0.9rem',
            color: '#555'
          }}>
            ✅ Portfolio travaux<br/>
            ✅ Devis en ligne<br/>
            ✅ Zone d&apos;intervention<br/>
            ✅ Certifications
          </div>
        </div>
      </div>
      
      <div style={{ 
        background: '#f0f9ff', 
        padding: '20px', 
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#333' }}>🚀 Génération IA</h3>
        <p style={{ color: '#555' }}>Chaque template est personnalisé automatiquement selon votre secteur</p>
        <div style={{ marginTop: '15px' }}>
          <a 
            href="/demande-publique" 
            style={{ 
              background: '#3b82f6', 
              color: 'white', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            💎 Créer mon site en 25 minutes
          </a>
        </div>
      </div>
      
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          ← Retour à l&apos;accueil
        </a>
      </div>
    </div>
  );
}