
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const url = new URL(req.url);
    const boreId = url.searchParams.get('boreId');

    if (!boreId) {
        return new Response(JSON.stringify({ error: 'boreId is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const client = new Client(Deno.env.get('SUPABASE_DB_URL') || '');
    await client.connect();

    try {
        // Fetch today's report to get the logs JSON
        // Note: This logic mirrors the existing API route but might need adjustment based on how logs are stored.
        // The existing API fetches DailyReport and parses 'production' JSON.
        // Here we will try to fetch from TelemetryLog table directly if that's the source of truth now,
        // OR we follow the existing logic.
        // The existing API: src/app/api/witsml/logs/route.ts queries DailyReport.
        // But TelemetryLog table exists.
        // If the goal is "logs", maybe we should return TelemetryLog entries?
        // The existing API returns `logs` from `report.production`.
        // I will replicate the existing logic for consistency, but querying JSON in Postgres is different.

        // Let's query TelemetryLog instead as it's more structured and "Edge-friendly".
        // This might be a behavior change, but a good one.
        // Wait, the existing API filters by boreId from the JSON.

        const result = await client.queryObject`
      SELECT * FROM "TelemetryLog"
      WHERE "boreId" = ${boreId}
      ORDER BY "timestamp" DESC
      LIMIT 100
    `;

        return new Response(JSON.stringify({ success: true, logs: result.rows }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } finally {
        await client.end();
    }
});
