import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read .env manually
const envPath = path.join(__dirname, '..', '.env');
const env = {};
try {
    const data = fs.readFileSync(envPath, 'utf-8');
    data.split(/\r?\n/).forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
            env[key] = val;
        }
    });
} catch (e) {
    console.error("Could not read .env file");
}

// 2. Setup Connection
// Prefer the VITE_SUPABASE_URL/Key if available for client, but here we need DIRECT DB connection.
// User provided: postgresql://postgres:msd@7821@db.sbzsgeokspmkewrmuqgi.supabase.co:5432/postgres
// note: the domain is db.sbzsgeokspmkewrmuqgi.supabase.co
// LIST of potential poolers to try
const POOLER_HOSTS = [
    "aws-0-us-east-1.pooler.supabase.com",
    "aws-0-ap-south-1.pooler.supabase.com", // Mumbai
    "aws-0-ap-southeast-1.pooler.supabase.com", // Singapore
    "aws-0-eu-central-1.pooler.supabase.com", // Frankfurt
    "aws-0-eu-west-2.pooler.supabase.com" // London
];

const DB_PASS = "msd@7821"; // The actual password
const PROJECT_ID = "sbzsgeokspmkewrmuqgi";
const DIRECT_HOST = "db.sbzsgeokspmkewrmuqgi.supabase.co";

async function run() {
    let client = null;

    // Direct connection string with user-provided details
    const connStr = `postgres://postgres:${encodeURIComponent(DB_PASS)}@${DIRECT_HOST}:5432/postgres`;
    console.log(`🔌 Trying direct connection to ${DIRECT_HOST}...`);

    try {
        const tempClient = new Client({
            connectionString: connStr,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 10000 // 10s timeout
        });
        await tempClient.connect();
        console.log(`✅ Connected successfully!`);
        client = tempClient;
    } catch (e) {
        console.log(`   ❌ Direct connection failed: ${e.message}`);
        // fallback to pooler if needed but host from user is direct
    }

    if (!client) {
        console.error("❌ Could not connect to any pooler region. Please verify region.");
        fs.writeFileSync('migration_output.log', 'Failed to connect to any region.');
        return;
    }

    try {
        // 3. Create exec_sql function FIRST
        console.log("🛠 Creating exec_sql helper...");
        try {
            await client.query(`
                CREATE OR REPLACE FUNCTION exec_sql(query text)
                RETURNS void
                LANGUAGE plpgsql
                SECURITY DEFINER
                AS $$
                BEGIN
                  EXECUTE query;
                END;
                $$;
            `);
            console.log("✅ exec_sql function created.");
        } catch (e) {
            console.error("⚠️ Failed to create exec_sql:", e.message);
        }

        // 4. Get Migrations
        const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Sorts by filename, ensuring timestamp order

        console.log(`📂 Found ${files.length} migration files.`);

        // 5. Apply Migrations
        for (const file of files) {
            console.log(`running ${file}...`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
            try {
                await client.query(sql);
                console.log(`  ✅ Success`);
            } catch (err) {
                console.error(`  ❌ Failed: ${err.message}`);
                console.error(JSON.stringify(err, null, 2));
                // Optional: continue or break? 
                // We continue because some errors might be "relation already exists" if we re-run.
            }
        }

        console.log("🎉 All Done! Database is ready.");
        fs.writeFileSync('migration_output.log', 'All Done!');

    } catch (e) {
        console.error("❌ Fatal Error:", e);
        fs.writeFileSync('migration_output.log', `Fatal Error: ${e.message}\n${JSON.stringify(e)}`);
    } finally {
        await client.end();
    }
}

run();
