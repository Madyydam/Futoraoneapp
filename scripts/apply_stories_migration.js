
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURATION (Matched from apply-all-migrations.js)
const SUPABASE_URL = "https://sbzsgeokspmkewrmuqgi.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienNnZW9rc3Bta2V3cm11cWdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM3NjQ1OCwiZXhwIjoyMDgxOTUyNDU4fQ.X8-vdb4DaQ4_sOuOXo5Z5Spm6DDuYzyW9KjNmoAcWwo";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function applyMigration() {
    console.log('🚀 Applying stories bucket migration...');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251222_create_stories_bucket.sql');

    try {
        const sql = fs.readFileSync(migrationPath, 'utf-8');
        console.log(`\n📄 Processing ${path.basename(migrationPath)}...`);

        // Execute via RPC
        const { error } = await supabase.rpc('exec_sql', { query: sql });

        if (error) {
            console.error(`❌ Error executing migration:`, error.message);
            // Fallback: Statement by statement
            console.log('   Attempting statement-by-statement execution...');
            const statements = sql.split(';').map(s => s.trim()).filter(Boolean);

            for (const stmt of statements) {
                if (stmt.length < 5) continue;
                const { error: stmtError } = await supabase.rpc('exec_sql', { query: stmt + ';' });
                if (stmtError) {
                    if (stmtError.message.includes("already exists") || stmtError.message.includes("duplicate key")) {
                        console.log(`   ⚠️ Skipped existing: ${stmt.substring(0, 50)}...`);
                    } else {
                        console.warn(`   ⚠️ Statement failed: ${stmtError.message}`);
                    }
                }
            }
        } else {
            console.log(`✅ Migration applied successfully!`);
        }
    } catch (err) {
        console.error(`❌ Failed:`, err.message);
    }
}

applyMigration();
