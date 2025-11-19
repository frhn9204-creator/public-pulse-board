import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const primaryKey = Deno.env.get('GEOAPIFY_PRIMARY_KEY');
    const secondaryKey = Deno.env.get('GEOAPIFY_SECONDARY_KEY');
    
    if (!primaryKey && !secondaryKey) {
      return new Response(
        JSON.stringify({ error: 'Geoapify token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        primaryKey: primaryKey || '',
        secondaryKey: secondaryKey || ''
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error fetching token:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch token' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
