import { NextRequest, NextResponse } from 'next/server';
import { LocalQueryBuilder } from '@/lib/db/json-db';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const {
      table,
      action = 'select',
      columns = '*',
      filters = [],
      sort,
      range,
      limit,
      single = false,
      maybeSingle = false,
      data,
      countExact = false,
    } = payload;

    if (!table) {
      return NextResponse.json({ data: null, error: { message: 'Table non spécifiée' } }, { status: 400 });
    }

    const builder = new LocalQueryBuilder(table as any);

    if (action === 'insert') {
      builder.insert(data);
    } else if (action === 'update') {
      builder.update(data);
    } else if (action === 'delete') {
      builder.delete();
    } else {
      builder.select(columns, countExact ? { count: 'exact' } : undefined);
    }

    // Appliquer les filtres
    for (const f of filters) {
      if (f.type === 'eq') builder.eq(f.field, f.value);
      else if (f.type === 'neq') builder.neq(f.field, f.value);
      else if (f.type === 'is') builder.is(f.field, f.value);
      else if (f.type === 'in') builder.in(f.field, f.value);
      else if (f.type === 'gte') builder.gte(f.field, f.value);
      else if (f.type === 'lte') builder.lte(f.field, f.value);
      else if (f.type === 'like') builder.like(f.field, f.value);
      else if (f.type === 'ilike') builder.ilike(f.field, f.value);
      else if (f.type === 'or') builder.or(f.value);
      else if (f.type === 'not') builder.not(f.field, f.value?.operator, f.value?.value);
    }

    // Tri
    if (sort?.field) {
      builder.order(sort.field, { ascending: sort.ascending !== false });
    }

    // Pagination
    if (range) {
      builder.range(range.from, range.to);
    } else if (limit) {
      builder.limit(limit);
    }

    let result;
    if (single) {
      result = await builder.single();
    } else if (maybeSingle) {
      result = await builder.maybeSingle();
    } else {
      result = await builder;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/db Error]', error);
    return NextResponse.json({ data: null, error: { message: error.message || 'Erreur interne' } }, { status: 500 });
  }
}
