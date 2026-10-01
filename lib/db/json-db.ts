import fs from 'fs';
import path from 'path';

// ═══════════════════════════════════════════════════════════════
// GESTIONNAIRE DE BASE DE DONNÉES LOCALE JSON - IUC REQUÊTES
// ═══════════════════════════════════════════════════════════════

const isServer = typeof window === 'undefined';
const DB_FILE_PATH = isServer && path && typeof path.join === 'function' ? path.join(process.cwd(), 'data', 'database.json') : '';

export interface DatabaseSchema {
  roles: any[];
  services: any[];
  request_statuses: any[];
  priorities: any[];
  request_categories: any[];
  users: any[];
  requests: any[];
  request_comments: any[];
  request_attachments: any[];
  request_history: any[];
  request_ratings: any[];
  notifications: any[];
  activity_logs: any[];
  ai_suggestions: any[];
  sessions: any[];
  courses?: any[];
  grades?: any[];
  rooms?: any[];
  timetable?: any[];
}

// Lecture synchrone/asynchrone sécurisée
export function getLocalDB(): DatabaseSchema {
  if (!isServer || !fs || typeof fs.readFileSync !== 'function') {
    return {
      roles: [],
      services: [],
      request_statuses: [],
      priorities: [],
      request_categories: [],
      users: [],
      requests: [],
      request_comments: [],
      request_attachments: [],
      request_history: [],
      request_ratings: [],
      notifications: [],
      activity_logs: [],
      ai_suggestions: [],
      sessions: [],
      courses: [],
      grades: [],
      rooms: [],
      timetable: [],
    };
  }
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      throw new Error(`Base de données introuvable à ${DB_FILE_PATH}`);
    }
    const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      roles: [],
      services: [],
      request_statuses: [],
      priorities: [],
      request_categories: [],
      users: [],
      requests: [],
      request_comments: [],
      request_attachments: [],
      request_history: [],
      request_ratings: [],
      notifications: [],
      activity_logs: [],
      ai_suggestions: [],
      sessions: [],
      courses: [],
      grades: [],
      rooms: [],
      timetable: [],
      ...parsed,
    };
  } catch (error) {
    console.error('[JSON-DB] Erreur de lecture de la base:', error);
    throw error;
  }
}

export function saveLocalDB(data: DatabaseSchema): void {
  if (!isServer || !fs || typeof fs.writeFileSync !== 'function') {
    return;
  }
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('[JSON-DB] Erreur d\'écriture de la base:', error);
    throw error;
  }
}

// Générateur d'UUID v4
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ═══════════════════════════════════════════════════════════════
// LOGIQUE DE JOINTURES ET EXPANSION DE RELATIONS
// ═══════════════════════════════════════════════════════════════

function resolveJoins(item: any, tableName: string, db: DatabaseSchema): any {
  const result = { ...item };

  if (tableName === 'users') {
    if (result.role_id) {
      result.role = db.roles.find((r) => r.id === result.role_id) || null;
    }
    if (result.service_id) {
      result.service = db.services.find((s) => s.id === result.service_id) || null;
    }
  }

  if (tableName === 'requests') {
    if (result.student_id) {
      const student = db.users.find((u) => u.id === result.student_id);
      result.student = student ? {
        id: student.id,
        matricule: student.matricule,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        phone: student.phone,
        niveau: student.niveau,
        filiere: student.filiere
      } : null;
    }
    if (result.category_id) {
      result.category = db.request_categories.find((c) => c.id === result.category_id) || null;
    }
    if (result.status_id) {
      result.status = db.request_statuses.find((s) => s.id === result.status_id) || null;
    }
    if (result.priority_id) {
      result.priority = db.priorities.find((p) => p.id === result.priority_id) || null;
    }
    if (result.assigned_to) {
      const agent = db.users.find((u) => u.id === result.assigned_to);
      result.assigned_agent = agent ? {
        id: agent.id,
        matricule: agent.matricule,
        first_name: agent.first_name,
        last_name: agent.last_name,
        email: agent.email,
        phone: agent.phone
      } : null;
    } else {
      result.assigned_agent = null;
    }
    if (result.service_id) {
      result.service = db.services.find((s) => s.id === result.service_id) || null;
    }
  }

  if (tableName === 'request_categories') {
    if (result.service_id) {
      result.service = db.services.find((s) => s.id === result.service_id) || null;
    }
  }

  if (tableName === 'request_comments') {
    if (result.user_id) {
      const user = db.users.find((u) => u.id === result.user_id);
      result.user = user ? {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: db.roles.find((r) => r.id === user.role_id)?.name
      } : null;
    }
  }

  if (tableName === 'grades') {
    if (result.course_id) {
      result.course = (db.courses || []).find((c) => c.id === result.course_id) || null;
    }
  }

  if (tableName === 'timetable') {
    if (result.course_id) {
      result.course = (db.courses || []).find((c) => c.id === result.course_id) || null;
    }
    if (result.room_id) {
      result.room = (db.rooms || []).find((r) => r.id === result.room_id) || null;
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// CLASSE QUERY BUILDER COMPATIBLE SUPABASE
// ═══════════════════════════════════════════════════════════════

export class LocalQueryBuilder {
  private tableName: keyof DatabaseSchema;
  private selectedColumns: string = '*';
  private exactCount: boolean = false;
  private filters: Array<(item: any) => boolean> = [];
  private sortField: string | null = null;
  private sortAscending: boolean = true;
  private offsetVal: number = 0;
  private limitVal: number | null = null;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;

  // Opérations d'écriture
  private pendingInsert: any = null;
  private pendingUpdate: any = null;
  private isDelete: boolean = false;

  constructor(tableName: keyof DatabaseSchema) {
    this.tableName = tableName;
  }

  select(columns: string = '*', options?: { count?: 'exact'; head?: boolean }): this {
    this.selectedColumns = columns;
    if (options?.count === 'exact') {
      this.exactCount = true;
    }
    return this;
  }

  not(field: string, operator: string, value: any): this {
    this.filters.push((item) => {
      if (operator === 'is') {
        if (value === null) return item[field] !== null && item[field] !== undefined;
        return item[field] !== value;
      }
      if (operator === 'in') {
        return !value.map(String).includes(String(item[field]));
      }
      if (operator === 'eq') {
        return String(item[field]) !== String(value);
      }
      return true;
    });
    return this;
  }

  eq(field: string, value: any): this {
    this.filters.push((item) => {
      if (value === null) return item[field] === null || item[field] === undefined;
      return String(item[field]) === String(value);
    });
    return this;
  }

  neq(field: string, value: any): this {
    this.filters.push((item) => String(item[field]) !== String(value));
    return this;
  }

  is(field: string, value: any): this {
    this.filters.push((item) => {
      if (value === null) {
        return item[field] === null || item[field] === undefined;
      }
      return item[field] === value;
    });
    return this;
  }

  in(field: string, values: any[]): this {
    this.filters.push((item) => values.map(String).includes(String(item[field])));
    return this;
  }

  gte(field: string, value: any): this {
    this.filters.push((item) => item[field] >= value);
    return this;
  }

  lte(field: string, value: any): this {
    this.filters.push((item) => item[field] <= value);
    return this;
  }

  like(field: string, pattern: string): this {
    const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i');
    this.filters.push((item) => regex.test(item[field] || ''));
    return this;
  }

  ilike(field: string, pattern: string): this {
    return this.like(field, pattern);
  }

  or(conditions: string): this {
    // Ex: "title.ilike.%search%,description.ilike.%search%,reference.ilike.%search%"
    const parts = conditions.split(',').map((c) => c.trim());
    this.filters.push((item) => {
      return parts.some((cond) => {
        const [f, op, val] = cond.split('.');
        const cleanVal = (val || '').replace(/%/g, '').toLowerCase();
        const fieldVal = String(item[f] || '').toLowerCase();
        return fieldVal.includes(cleanVal);
      });
    });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }): this {
    this.sortField = field;
    this.sortAscending = options?.ascending !== false;
    return this;
  }

  range(from: number, to: number): this {
    this.offsetVal = from;
    this.limitVal = to - from + 1;
    return this;
  }

  limit(count: number): this {
    this.limitVal = count;
    return this;
  }

  single(): Promise<{ data: any; error: any }> {
    this.isSingle = true;
    return this.execute();
  }

  maybeSingle(): Promise<{ data: any; error: any }> {
    this.isMaybeSingle = true;
    return this.execute();
  }

  insert(data: any): this {
    this.pendingInsert = data;
    return this;
  }

  update(data: any): this {
    this.pendingUpdate = data;
    return this;
  }

  delete(): this {
    this.isDelete = true;
    return this;
  }

  // Permet d'appeler await builder directement
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<{ data: any; error: any; count?: number }> {
    try {
      const db = getLocalDB();
      const table = db[this.tableName];

      if (!table || !Array.isArray(table)) {
        return { data: null, error: new Error(`Table ${String(this.tableName)} introuvable`) };
      }

      // OPÉRATION D'INSERTION
      if (this.pendingInsert) {
        const itemsToInsert = Array.isArray(this.pendingInsert) ? this.pendingInsert : [this.pendingInsert];
        const insertedItems: any[] = [];

        for (const item of itemsToInsert) {
          let ref = item.reference;
          if (this.tableName === 'requests' && !ref) {
            const count = (db.requests?.length || 0) + insertedItems.length + 1;
            ref = `REQ-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
          }
          const newItem = {
            id: item.id || generateUUID(),
            ...(ref ? { reference: ref } : {}),
            ...item,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
          };
          table.push(newItem);
          insertedItems.push(resolveJoins(newItem, String(this.tableName), db));
        }

        saveLocalDB(db);
        const returnData = Array.isArray(this.pendingInsert) ? insertedItems : insertedItems[0];
        return { data: returnData, error: null };
      }

      // OPÉRATION DE MISE À JOUR
      if (this.pendingUpdate) {
        let updatedCount = 0;
        const updatedItems: any[] = [];

        for (let i = 0; i < table.length; i++) {
          const matches = this.filters.every((fn) => fn(table[i]));
          if (matches) {
            table[i] = {
              ...table[i],
              ...this.pendingUpdate,
              updated_at: new Date().toISOString(),
            };
            updatedItems.push(resolveJoins(table[i], String(this.tableName), db));
            updatedCount++;
          }
        }

        saveLocalDB(db);
        const returnData = this.isSingle ? updatedItems[0] || null : updatedItems;
        return { data: returnData, error: null, count: updatedCount };
      }

      // OPÉRATION DE SUPPRESSION
      if (this.isDelete) {
        const initialLen = table.length;
        db[this.tableName] = table.filter((item: any) => !this.filters.every((fn) => fn(item)));
        const deletedCount = initialLen - (db[this.tableName]?.length || 0);
        saveLocalDB(db);
        return { data: null, error: null, count: deletedCount };
      }

      // OPÉRATION DE LECTURE (SELECT)
      let results = table.filter((item: any) => this.filters.every((fn) => fn(item)));
      const totalCount = results.length;

      // Tri
      if (this.sortField) {
        const sf = this.sortField;
        const asc = this.sortAscending;
        results.sort((a: any, b: any) => {
          const valA = a[sf] ?? '';
          const valB = b[sf] ?? '';
          if (valA < valB) return asc ? -1 : 1;
          if (valA > valB) return asc ? 1 : -1;
          return 0;
        });
      }

      // Pagination
      if (this.offsetVal > 0 || this.limitVal !== null) {
        const start = this.offsetVal;
        const end = this.limitVal !== null ? start + this.limitVal : undefined;
        results = results.slice(start, end);
      }

      // Résolution des jointures et enrichissements
      const resolvedResults = results.map((item: any) => resolveJoins(item, String(this.tableName), db));

      if (this.isSingle) {
        if (resolvedResults.length === 0) {
          return { data: null, error: { message: 'Row not found', code: 'PGRST116' } };
        }
        return { data: resolvedResults[0], error: null };
      }

      if (this.isMaybeSingle) {
        return { data: resolvedResults[0] || null, error: null };
      }

      return {
        data: resolvedResults,
        error: null,
        ...(this.exactCount ? { count: totalCount } : {}),
      };
    } catch (err: any) {
      console.error('[JSON-DB Execute Error]', err);
      return { data: null, error: err };
    }
  }
}
