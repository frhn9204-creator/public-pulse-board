import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    if (!mapboxToken) {
      console.error('MAPBOX_PUBLIC_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Geocoding service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all issues without coordinates but with location data
    const { data: issues, error: fetchError } = await supabaseClient
      .from('issues')
      .select('id, location, pincode')
      .is('latitude', null)
      .is('longitude', null)
      .not('location', 'is', null);

    if (fetchError) {
      console.error('Error fetching issues:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch issues', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!issues || issues.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No issues need geocoding', count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${issues.length} issues to geocode`);

    let successCount = 0;
    let failCount = 0;

    // Geocode each issue with a small delay to avoid rate limiting
    for (const issue of issues) {
      try {
        let latitude = null;
        let longitude = null;
        let foundLocation = false;

        // Try multiple search strategies with progressively broader searches
        // Prioritize pincode if available
        const searchStrategies = issue.pincode 
          ? [
              { query: `${issue.pincode}`, types: 'postcode' }, // Pincode with postcode type
              { query: `Patna ${issue.pincode}`, types: 'place,postcode' }, // City + Pincode
              { query: `Bihar ${issue.pincode}`, types: 'region,postcode' }, // State + Pincode
              { query: `${issue.pincode}, India`, types: '' }, // Standard search
              { query: issue.location || '', types: '' },
            ]
          : [
              { query: `Patna, Bihar, India`, types: 'place' }, // Default to Patna if no pincode
              { query: issue.location || '', types: '' },
              { query: (issue.location || '').split(',').slice(-3).join(','), types: '' },
              { query: (issue.location || '').split(',').slice(-2).join(','), types: '' },
            ];

        const validSearchStrategies = searchStrategies.filter(s => s.query);

        for (const searchStrategy of validSearchStrategies) {
          if (foundLocation) break;
          
          const typesParam = searchStrategy.types ? `&types=${searchStrategy.types}` : '';
          const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchStrategy.query)}.json?access_token=${mapboxToken}&country=IN${typesParam}&limit=1`;
          
          console.log(`Trying: ${searchStrategy.query} with types: ${searchStrategy.types || 'none'}`);
          
          const response = await fetch(geocodeUrl);
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            [longitude, latitude] = data.features[0].center;
            foundLocation = true;
            console.log(`Found coordinates for issue ${issue.id} using "${searchStrategy.query}": ${latitude}, ${longitude}`);
          }

          // Small delay between retries
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (foundLocation && latitude && longitude) {
          // Update the issue with coordinates
          const { error: updateError } = await supabaseClient
            .from('issues')
            .update({ latitude, longitude })
            .eq('id', issue.id);

          if (updateError) {
            console.error(`Failed to update issue ${issue.id}:`, updateError);
            failCount++;
          } else {
            console.log(`Successfully geocoded issue ${issue.id}`);
            successCount++;
          }
        } else {
          console.log(`No coordinates found for issue ${issue.id}: ${issue.location}`);
          failCount++;
        }

        // Delay to avoid rate limiting (Mapbox allows 600 requests/minute)
        await new Promise(resolve => setTimeout(resolve, 150));
        
      } catch (error) {
        console.error(`Error geocoding issue ${issue.id}:`, error);
        failCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Batch geocoding completed',
        total: issues.length,
        success: successCount,
        failed: failCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Batch geocoding error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to batch geocode issues', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
