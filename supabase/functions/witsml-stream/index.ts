
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

  const encoder = new TextEncoder();
  let lastTimestamp = 0;

  const body = new ReadableStream({
    async start(controller) {
      try {
        // Initial fetch
        const initialResult = await client.queryObject`
          SELECT * FROM "TelemetryLog"
          WHERE "boreId" = ${boreId}
          ORDER BY "timestamp" DESC
          LIMIT 1
        `;

        if (initialResult.rows.length > 0) {
          const log = initialResult.rows[0] as any;
          lastTimestamp = new Date(log.timestamp).getTime();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(log)}\n\n`));
        }

        // Poll loop
        while (true) {
          const result = await client.queryObject`
            SELECT * FROM "TelemetryLog"
            WHERE "boreId" = ${boreId}
            ORDER BY "timestamp" DESC
            LIMIT 1
          `;

          if (result.rows.length > 0) {
            const log = result.rows[0] as any;
            const logTime = new Date(log.timestamp).getTime();
            if (logTime > lastTimestamp) {
              lastTimestamp = logTime;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(log)}\n\n`));
            }
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (e) {
        console.error(e);
        controller.error(e);
      } finally {
        await client.end();
      }
    },
    cancel() {
      client.end();
    },
  });

  return new Response(body, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});
