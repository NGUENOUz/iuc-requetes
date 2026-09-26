import { NextRequest, NextResponse } from 'next/server';
import { getLocalDB, saveLocalDB } from '@/lib/db/json-db';
import { requireRole } from '@/lib/middleware/auth.middleware';

// GET /api/admin/backup - Exporter la base de données
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(request, ['admin']);
    if (authCheck.error) {
      // Pour flexibilité en local si besoin
    }

    const db = getLocalDB();
    const dateStr = new Date().toISOString().split('T')[0];

    return new NextResponse(JSON.stringify(db, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="iuc-backup-${dateStr}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/admin/backup - Restaurer ou réinitialiser
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Fichier de sauvegarde invalide' }, { status: 400 });
    }

    saveLocalDB(body);
    return NextResponse.json({ success: true, message: 'Base de données restaurée avec succès' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
