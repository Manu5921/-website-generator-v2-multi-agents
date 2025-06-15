'use client';

interface CTAWidgetProps {
  variant?: 'button' | 'banner' | 'card';
  size?: 'sm' | 'md' | 'lg';
  targetUrl?: string;
}

export default function CTAWidget({ 
  variant = 'button', 
  size = 'md',
  targetUrl = 'https://site-pro-one.vercel.app/demande'
}: CTAWidgetProps) {
  
  const handleClick = () => {
    window.open(targetUrl, '_blank');
  };

  if (variant === 'button') {
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    return (
      <button
        onClick={handleClick}
        className={`bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center space-x-2 ${sizeClasses[size]}`}
      >
        <span>🌐</span>
        <span>Créer mon site web</span>
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2">🚀 Besoin d'un site web professionnel ?</h3>
            <p className="text-orange-100">Création automatisée avec paiement sécurisé Stripe</p>
          </div>
          <button
            onClick={handleClick}
            className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
          >
            🌐 Commencer maintenant
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-white border-2 border-orange-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
        <div className="text-center">
          <div className="text-4xl mb-4">🌐</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Site Web Professionnel</h3>
          <p className="text-gray-600 mb-4">
            Génération automatisée avec paiement Stripe sécurisé
          </p>
          <button
            onClick={handleClick}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full"
          >
            Créer mon site web
          </button>
        </div>
      </div>
    );
  }

  return null;
}