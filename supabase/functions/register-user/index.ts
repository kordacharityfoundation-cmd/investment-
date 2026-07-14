import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apiKey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, name, phone, address } = await req.json()

    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: 'Missing required registration parameters (email, password, and name are mandatory).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server environment misconfiguration: Supabase credentials are not fully set.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // 1. Check if user already exists in profiles
    const { data: existingProfiles, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', trimmedEmail)

    if (existingProfiles && existingProfiles.length > 0) {
      return new Response(
        JSON.stringify({ error: 'An account with this email address already exists. Please login instead.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Create the user using admin auth API (sets email_confirm: true and does NOT send email)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: trimmedEmail,
      password: password,
      email_confirm: true,
      user_metadata: { name, phone }
    })

    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = userData.user
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Could not create authenticated user node.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Create the profile record
    const avatarSeed = 'SEED_' + Math.floor(Math.random() * 10000)
    let assignedRole = 'user'
    if (['kordacharityfoundation@gmail.com', 'admin@muskinvestment.com'].includes(trimmedEmail)) {
      assignedRole = 'admin'
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        name,
        email: trimmedEmail,
        phone: phone || null,
        address: address || null,
        role: assignedRole,
        status: 'Active',
        avatar_seed: avatarSeed
      })

    if (profileError) {
      // Clean up auth user to allow retries
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return new Response(
        JSON.stringify({ error: `Profile creation failed: ${profileError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Create the welcome notification
    try {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: user.id,
          user_email: trimmedEmail,
          title: 'Investor Node Certified',
          message: 'Welcome to Musk Investments. Your asset-compounding node is fully synced and operational.',
          type: 'general'
        })
    } catch (notifErr) {
      console.warn("Failed to create welcome notification inside edge function:", notifErr)
    }

    // 5. Create the activity log
    try {
      await supabaseAdmin
        .from('activity_logs')
        .insert({
          user_id: user.id,
          user_email: trimmedEmail,
          action: 'Completed investor onboarding and registered successfully.',
          type: 'User'
        })
    } catch (actErr) {
      console.warn("Failed to create activity log inside edge function:", actErr)
    }

    return new Response(
      JSON.stringify({ success: true, userId: user.id, email: trimmedEmail }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected server error occurred.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
