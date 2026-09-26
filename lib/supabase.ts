// ═══════════════════════════════════════════════════════════════
// CLIENT ADAPTATEUR LOCAL JSON (COMPATIBLE SUPABASE)
// Zéro dépendance externe - Stockage local dans data/database.json
// ═══════════════════════════════════════════════════════════════

const isServer = typeof window === 'undefined';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ═══════════════════════════════════════════════════════════════
// QUERY BUILDER CLIENT-SIDE (appelle /api/db)
// ═══════════════════════════════════════════════════════════════

class BrowserQueryBuilder {
  private table: string;
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private columns: string = '*';
  private countExact: boolean = false;
  private filters: Array<{ type: string; field: string; value: any }> = [];
  private sort?: { field: string; ascending: boolean };
  private rangeVal?: { from: number; to: number };
  private limitVal?: number;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private payloadData: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*', options?: { count?: 'exact'; head?: boolean }): this {
    this.columns = columns;
    if (options?.count === 'exact') {
      this.countExact = true;
    }
    return this;
  }

  not(field: string, operator: string, value: any): this {
    this.filters.push({ type: 'not', field, value: { operator, value } });
    return this;
  }

  eq(field: string, value: any): this {
    this.filters.push({ type: 'eq', field, value });
    return this;
  }

  neq(field: string, value: any): this {
    this.filters.push({ type: 'neq', field, value });
    return this;
  }

  is(field: string, value: any): this {
    this.filters.push({ type: 'is', field, value });
    return this;
  }

  in(field: string, values: any[]): this {
    this.filters.push({ type: 'in', field, value: values });
    return this;
  }

  gte(field: string, value: any): this {
    this.filters.push({ type: 'gte', field, value });
    return this;
  }

  lte(field: string, value: any): this {
    this.filters.push({ type: 'lte', field, value });
    return this;
  }

  like(field: string, pattern: string): this {
    this.filters.push({ type: 'like', field, value: pattern });
    return this;
  }

  ilike(field: string, pattern: string): this {
    this.filters.push({ type: 'ilike', field, value: pattern });
    return this;
  }

  or(conditions: string): this {
    this.filters.push({ type: 'or', field: '', value: conditions });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }): this {
    this.sort = { field, ascending: options?.ascending !== false };
    return this;
  }

  range(from: number, to: number): this {
    this.rangeVal = { from, to };
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
    this.action = 'insert';
    this.payloadData = data;
    return this;
  }

  update(data: any): this {
    this.action = 'update';
    this.payloadData = data;
    return this;
  }

  delete(): this {
    this.action = 'delete';
    return this;
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<{ data: any; error: any; count?: number }> {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: this.table,
          action: this.action,
          columns: this.columns,
          filters: this.filters,
          sort: this.sort,
          range: this.rangeVal,
          limit: this.limitVal,
          single: this.isSingle,
          maybeSingle: this.isMaybeSingle,
          data: this.payloadData,
          countExact: this.countExact,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { data: null, error: errJson.error || new Error('Erreur de requête') };
      }

      return await response.json();
    } catch (err: any) {
      console.error('[BrowserQueryBuilder Error]', err);
      return { data: null, error: err };
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SYSTÈME D'AUTHENTIFICATION LOCAL
// ═══════════════════════════════════════════════════════════════

const authListeners: Array<(event: string, session: any) => void> = [];

export const auth = {
  async signInWithPassword({ email, password }: { email: string; password?: string }) {
    if (!isServer) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { data: { user: null, session: null }, error: { message: data.message || 'Identifiants invalides' } };
      }
      return {
        data: {
          user: data.data?.user || null,
          session: data.data?.session || null,
        },
        error: null,
      };
    }

    // Server-side
    const { getLocalDB, saveLocalDB } = require('./db/json-db');
    const db = getLocalDB();
    const user = db.users.find(
      (u: any) => (u.email?.toLowerCase() === email.toLowerCase() || u.matricule?.toLowerCase() === email.toLowerCase())
    );

    if (!user) {
      return { data: { user: null, session: null }, error: { message: 'Utilisateur introuvable' } };
    }

    if (user.password && password && user.password !== password) {
      return { data: { user: null, session: null }, error: { message: 'Mot de passe incorrect' } };
    }

    const token = `iuc_token_${user.id}_${Date.now()}`;
    const session = {
      access_token: token,
      refresh_token: `refresh_${token}`,
      user: {
        id: user.auth_user_id || user.id,
        email: user.email,
      },
    };

    // Enregistrer la session
    if (!db.sessions) db.sessions = [];
    db.sessions = db.sessions.filter((s: any) => s.user_id !== user.id);
    db.sessions.push({
      token,
      user_id: user.id,
      auth_user_id: user.auth_user_id || user.id,
      created_at: new Date().toISOString(),
    });
    saveLocalDB(db);

    return {
      data: {
        user: session.user,
        session,
      },
      error: null,
    };
  },

  async signOut() {
    if (!isServer) {
      localStorage.removeItem('iuc_user');
      localStorage.removeItem('iuc_token');
      document.cookie = 'iuc_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      authListeners.forEach((cb) => cb('SIGNED_OUT', null));
    }
    return { error: null };
  },

  async getSession() {
    if (!isServer) {
      const token = localStorage.getItem('iuc_token');
      const userStr = localStorage.getItem('iuc_user');
      if (!token || !userStr) {
        return { data: { session: null }, error: null };
      }
      try {
        const user = JSON.parse(userStr);
        return {
          data: {
            session: {
              access_token: token,
              refresh_token: `refresh_${token}`,
              user: {
                id: user.auth_user_id || user.id,
                email: user.email,
              },
            },
          },
          error: null,
        };
      } catch {
        return { data: { session: null }, error: null };
      }
    }
    return { data: { session: null }, error: null };
  },

  async setSession({ access_token }: { access_token: string; refresh_token?: string }) {
    if (!isServer) {
      localStorage.setItem('iuc_token', access_token);
      document.cookie = `iuc_token=${access_token}; path=/; max-age=604800; SameSite=Lax`;
    }
    return { data: { session: { access_token } }, error: null };
  },

  async getUser(token?: string) {
    if (isServer) {
      if (!token) return { data: { user: null }, error: { message: 'Token manquant' } };
      const { getLocalDB } = require('./db/json-db');
      const db = getLocalDB();
      const session = (db.sessions || []).find((s: any) => s.token === token);
      if (session) {
        const user = db.users.find((u: any) => u.id === session.user_id || u.auth_user_id === session.auth_user_id);
        if (user) {
          return { data: { user: { id: user.auth_user_id || user.id, email: user.email } }, error: null };
        }
      }
      // Tolérance pour token basé sur user id
      const parts = token.split('_');
      if (parts.length >= 3 && parts[0] === 'iuc' && parts[1] === 'token') {
        const userId = parts[2];
        const user = db.users.find((u: any) => u.id === userId || u.auth_user_id === userId);
        if (user) {
          return { data: { user: { id: user.auth_user_id || user.id, email: user.email } }, error: null };
        }
      }
      return { data: { user: null }, error: { message: 'Session invalide' } };
    }

    const { data } = await this.getSession();
    return { data: { user: data.session?.user || null }, error: null };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    authListeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = authListeners.indexOf(callback);
            if (index > -1) authListeners.splice(index, 1);
          },
        },
      },
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// OBJETS EXPORTÉS SUPABASE & SUPABASE_ADMIN
// ═══════════════════════════════════════════════════════════════

export const supabase = {
  from(tableName: any) {
    if (isServer) {
      const { LocalQueryBuilder } = require('./db/json-db');
      return new LocalQueryBuilder(tableName);
    }
    return new BrowserQueryBuilder(tableName);
  },
  auth,
};

export const supabaseAdmin = {
  from(tableName: any) {
    if (isServer) {
      const { LocalQueryBuilder } = require('./db/json-db');
      return new LocalQueryBuilder(tableName);
    }
    return new BrowserQueryBuilder(tableName);
  },
  auth: {
    ...auth,
    admin: {
      async createUser({ email, password }: { email: string; password?: string; email_confirm?: boolean }) {
        const authId = `auth-${generateUUID()}`;
        return {
          data: {
            user: {
              id: authId,
              email,
            },
          },
          error: null,
        };
      },
      async updateUserById(id: string, updates: { password?: string }) {
        if (isServer) {
          const { getLocalDB, saveLocalDB } = require('./db/json-db');
          const db = getLocalDB();
          const user = db.users.find((u: any) => u.auth_user_id === id || u.id === id);
          if (user && updates.password) {
            user.password = updates.password;
            user.must_set_password = false;
            saveLocalDB(db);
          }
        }
        return { data: { user: { id } }, error: null };
      },
      async deleteUser(id: string) {
        if (isServer) {
          const { getLocalDB, saveLocalDB } = require('./db/json-db');
          const db = getLocalDB();
          db.users = db.users.filter((u: any) => u.auth_user_id !== id && u.id !== id);
          saveLocalDB(db);
        }
        return { data: null, error: null };
      },
    },
  },
};

export function getSupabaseClient(token?: string) {
  return supabase;
}
