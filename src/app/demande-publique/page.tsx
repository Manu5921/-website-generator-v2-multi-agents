'use client';
import { useState } from 'react';

export default function DemandePubliquePage() {
  const [formData, setFormData] = useState({
    nom: '',
    secteur: '',
    email: '',
    telephone: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/demandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ Demande envoyée avec succès ! Votre site sera généré en 25 minutes.');
        setFormData({ nom: '', secteur: '', email: '', telephone: '', description: '' });
      } else {
        setMessage(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333', textAlign: 'center' }}>
        📝 Demande de Site Web
      </h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#666', textAlign: 'center' }}>
        Créez votre site professionnel en 25 minutes avec l&apos;IA
      </p>
      
      {message && (
        <div style={{ 
          padding: '15px', 
          marginBottom: '20px', 
          borderRadius: '8px',
          background: message.includes('✅') ? '#dcfce7' : '#fee2e2',
          color: message.includes('✅') ? '#166534' : '#dc2626',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '15px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Nom de votre entreprise *
            </label>
            <input 
              type="text" 
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              placeholder="Ex: Restaurant Chez Marie"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Secteur d&apos;activité *
            </label>
            <select 
              name="secteur"
              value={formData.secteur}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">-- Sélectionnez votre secteur --</option>
              <option value="restaurant">🍽️ Restaurant / Café</option>
              <option value="coiffeur">✂️ Coiffeur / Beauté</option>
              <option value="artisan">🔧 Artisan / Service</option>
              <option value="medical">🏥 Médical / Santé</option>
              <option value="commerce">🛍️ Commerce / Retail</option>
              <option value="autre">📋 Autre</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Votre email *
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="votre@email.com"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Téléphone *
            </label>
            <input 
              type="tel" 
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
              placeholder="06 12 34 56 78"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Description de votre activité
            </label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez brièvement votre activité, vos services, votre clientèle..."
              rows={4}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ 
            background: '#f0f9ff', 
            padding: '20px', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#333', margin: '0 0 10px 0' }}>💰 Tarif : 399€</h3>
            <p style={{ color: '#555', margin: '0 0 15px 0', fontSize: '14px' }}>
              Site professionnel livré en 25 minutes • Paiement sécurisé Stripe
            </p>
            <button 
              type="submit"
              disabled={isSubmitting}
              style={{ 
                background: isSubmitting ? '#9ca3af' : '#10b981', 
                color: 'white', 
                padding: '15px 30px', 
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
            >
              {isSubmitting ? '⏳ Envoi en cours...' : '🚀 Créer mon site maintenant'}
            </button>
          </div>
        </form>
      </div>
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          ← Retour à l&apos;accueil
        </a>
      </div>
    </div>
  );
}