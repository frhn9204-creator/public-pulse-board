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
    const { location, usePincode } = await req.json();
    
    if (!location) {
      return new Response(
        JSON.stringify({ error: 'Location is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GEOAPIFY_PRIMARY_KEY') || Deno.env.get('GEOAPIFY_SECONDARY_KEY');
    
    if (!apiKey) {
      console.error('Geoapify API key not configured');
      return new Response(
        JSON.stringify({ error: 'Geocoding service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let latitude = null;
    let longitude = null;
    let foundLocation = false;

    // Use Geoapify Geocoding API with bias towards India
    const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&apiKey=${apiKey}&filter=countrycode:in&limit=1`;
    
    console.log('Geocoding location with Geoapify:', location);
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const coords = data.features[0].geometry.coordinates;
      longitude = coords[0];
      latitude = coords[1];
      foundLocation = true;
      console.log(`Geocoded successfully: ${latitude}, ${longitude}`);
    }

    if (!foundLocation) {
      console.log('No coordinates found for location:', location);
      return new Response(
        JSON.stringify({ 
          latitude: null, 
          longitude: null,
          message: 'Location not found'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ latitude, longitude }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Geocoding error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to geocode location', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
