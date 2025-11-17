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

    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    if (!mapboxToken) {
      console.error('MAPBOX_PUBLIC_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Geocoding service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let latitude = null;
    let longitude = null;
    let foundLocation = false;

    // Try multiple strategies for better Indian location coverage
    const searchStrategies = [];
    
    if (usePincode) {
      // For pincodes, try multiple formats
      const pincode = location.replace(', India', '').trim();
      searchStrategies.push(
        { query: `Patna ${pincode}`, types: 'place,postcode' },
        { query: `Bihar ${pincode}`, types: 'region,postcode' },
        { query: `${pincode}`, types: 'postcode' },
        { query: location, types: '' }
      );
    } else {
      // For general locations, try city-level if exact address fails
      searchStrategies.push(
        { query: location, types: '' },
        { query: 'Patna, Bihar, India', types: 'place' }
      );
    }

    for (const strategy of searchStrategies) {
      if (foundLocation) break;
      
      const typesParam = strategy.types ? `&types=${strategy.types}` : '';
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(strategy.query)}.json?access_token=${mapboxToken}&country=IN${typesParam}&limit=1`;
      
      console.log(`Trying geocoding strategy: ${strategy.query}`);
      
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        [longitude, latitude] = data.features[0].center;
        foundLocation = true;
        console.log(`Geocoded successfully using "${strategy.query}": ${latitude}, ${longitude}`);
        break;
      }

      // Small delay between retries
      await new Promise(resolve => setTimeout(resolve, 100));
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
