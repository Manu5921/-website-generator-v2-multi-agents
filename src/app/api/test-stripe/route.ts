import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { demandeId, amount = 50 } = body;

    console.log('🧪 Test Stripe API appelée:', { demandeId, amount });

    // Test simple sans authentification
    return NextResponse.json({
      success: true,
      message: `Test réussi pour demande ${demandeId} avec montant ${amount}€`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur test Stripe:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur dans le test Stripe',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API Test Stripe fonctionnelle",
    timestamp: new Date().toISOString()
  });
}