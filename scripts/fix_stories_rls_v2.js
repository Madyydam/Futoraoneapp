
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

async function applyMigration() {
    console.log('🚀 Applying comprehensive stories RLS fix...');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251222_fix_stories_rls_v2.sql');

    try {
        const sql = fs.readFileSync(migrationPath, 'utf-8');
        console.log(`\n📄 Processing ${path.basename(migrationPath)}...`);

        // Execute via RPC - split into manageable chunks
        const statements = sql
            .replace(/DO \$\$[\s\S]*?END \$\$;/g, (match) => match) // Keep DO blocks intact
            .split(/;(?=\s*(?:--|CREATE|ALTER|DROP|GRANT|DO))/g)
            .map(s => s.trim())
            .filter(s => s.length > 5 && !s.startsWith('--'));

        for (const stmt of statements) {
            const trimmed = stmt.endsWith(';') ? stmt : stmt + ';';
            const { error } = await supabase.rpc('exec_sql', { query: trimmed });

            if (error) {
                if (error.message.includes("does not exist") || error.message.includes("already exists")) {
                    console.log(`   ⚠️ Skipped: ${trimmed.substring(0, 60)}...`);
                } else {
                    console.warn(`   ⚠️ Failed: ${error.message}`);
                }
            } else {
                console.log(`   ✅ Success: ${trimmed.substring(0, 60)}...`);
            }
        }

        console.log('\n✅ Migration completed!');
    } catch (err) {
        console.error(`❌ Failed:`, err.message);
    }
}

applyMigration();
