import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName } = await req.json();
    
    console.log("New user signed up:", email);
    
    // Send email to admin
    const emailResponse = await resend.emails.send({
      from: "VoiceUp <onboarding@resend.dev>",
      to: ["frhn9204@gmail.com"],
      subject: "New User Signup - VoiceUp",
      html: `
        <h1>New User Signup</h1>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Full Name:</strong> ${fullName || 'Not provided'}</p>
        <p><strong>Signed up at:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    console.log("Admin notification email sent:", emailResponse);
    
    return new Response(
      JSON.stringify({ success: true, email }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
