
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURATION
const SUPABASE_URL = "https://sbzsgeokspmkewrmuqgi.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienNnZW9rc3Bta2V3cm11cWdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM3NjQ1OCwiZXhwIjoyMDgxOTUyNDU4fQ.X8-vdb4DaQ4_sOuOXo5Z5Spm6DDuYzyW9KjNmoAcWwo";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function applyMigrations() {
    console.log('🚀 Starting migration application via Supabase Client (RPC)...');

    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

    // Get all SQL files
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort(); // Sort alphanumerically to preserve order

    console.log(`📂 Found ${files.length} migration files.`);

    for (const filename of files) {
        console.log(`\n📄 Processing ${filename}...`);
        const filePath = path.join(migrationsDir, filename);

        try {
            let sql = fs.readFileSync(filePath, 'utf-8');

            // Cleanup for known issues
            if (filename.includes('monetization_schema')) {
                // Replace incorrect table reference if present
                sql = sql.replace(/REFERENCES public\.gigs\(id\)/g, 'REFERENCES public.gig_listings(id)');
            }

            // Execute via RPC
            const { error } = await supabase.rpc('exec_sql', { query: sql });

            if (error) {
                console.error(`❌ Error executing ${filename}:`, error.message);

                // Detailed retry for multi-statement files
                console.log('   Attempting statement-by-statement execution...');

                // Split by semicolon, but handle cases where semicolon is inside quotes/functions roughly
                // This is a naive split, but often works for simple migrations.
                // Better approach: use a robust splitter, but for now specific failures can be ignored if they are "already exists"
                const statements = sql.split(';').map(s => s.trim()).filter(Boolean);

                for (let i = 0; i < statements.length; i++) {
                    const stmt = statements[i];
                    if (stmt.length < 5) continue; // skip noise

                    const { error: stmtError } = await supabase.rpc('exec_sql', { query: stmt + ';' });
                    if (stmtError) {
                        // Ignore "relation already exists" or "column already exists" errors
                        if (stmtError.message.includes("already exists")) {
                            console.log(`   ⚠️ Skipped existing: ${stmt.substring(0, 50)}...`);
                        } else {
                            console.warn(`   ⚠️ Statement failed: ${stmtError.message.substring(0, 200)}`);
                        }
                    }
                }
            } else {
                console.log(`✅ ${filename} applied successfully!`);
            }
        } catch (err) {
            console.error(`❌ Failed to read or process ${filename}:`, err.message);
        }
    }

    console.log('\n✨ All Migrations finished!');
}

applyMigrations().catch(e => console.error("Fatal Error:", e));
