import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://cfelyseagxpbmsrlxhfo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZWx5c2VhZ3hwYm1zcmx4aGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMDY5MzEsImV4cCI6MjA4MjU4MjkzMX0.5WKkWS5j4wMRsSIpq7wz6f-eXpDBPOIEfgK3BGjMmxk";

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyCounts() {
    console.log("Verifying Database Counts...");

    // Count Funcionando
    const { count: funcionandoCount, error: errorFunc } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('conservation_state', 'Funcionando');

    if (errorFunc) {
        console.error("Error counting Funcionando:", errorFunc);
    } else {
        console.log(`Total 'Funcionando': ${funcionandoCount}`);
    }

    // Count Sucata (mapped to Inexistente in app)
    const { count: sucataCount, error: errorSucata } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('conservation_state', 'Sucata');

    if (errorSucata) {
        console.error("Error counting Sucata:", errorSucata);
    } else {
        console.log(`Total 'Sucata' (Inexistente): ${sucataCount}`);
    }

    // Count Manutenção
    const { count: manutencaoCount, error: errorManut } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('conservation_state', 'Manutenção');

    if (errorManut) {
        console.error("Error counting Manutenção:", errorManut);
    } else {
        console.log(`Total 'Manutenção': ${manutencaoCount}`);
    }
}

verifyCounts();
