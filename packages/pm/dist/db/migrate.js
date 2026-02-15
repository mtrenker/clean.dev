"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const migrator_1 = require("drizzle-orm/node-postgres/migrator");
const pg_1 = require("pg");
const schema = __importStar(require("./schema"));
async function runMigrations(pool) {
    const db = (0, node_postgres_1.drizzle)(pool, { schema });
    console.log('Running migrations...');
    await (0, migrator_1.migrate)(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
}
// CLI usage
if (require.main === module) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL environment variable is not set');
        process.exit(1);
    }
    const pool = new pg_1.Pool({ connectionString: databaseUrl });
    runMigrations(pool)
        .then(() => {
        console.log('Migration script completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    })
        .finally(() => {
        pool.end();
    });
}
