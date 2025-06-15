import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Configuration de la connexion Neon
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export du schéma pour utilisation dans l'app
export * from './schema';