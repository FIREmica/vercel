import { NextRequest, NextResponse } from 'next/server';
import { performAnalysisAction } from '../../actions';

// API temporalmente desactivada. Para reactivar, elimina el return inicial.
export async function POST() {
  return new Response(JSON.stringify({ error: 'API desactivada temporalmente. Usa el backend principal.' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
}
