import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller } } = await supabase.auth.getUser(token)
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', caller.id).eq('role', 'admin').maybeSingle()
    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Sem permissão' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { action, ...params } = await req.json()

    if (action === 'list') {
      const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      if (error) throw error

      // Get all roles
      const { data: roles } = await supabase.from('user_roles').select('*')
      // Get all profiles
      const { data: profiles } = await supabase.from('profiles').select('*')

      const enrichedUsers = users.map(u => {
        const profile = profiles?.find(p => p.user_id === u.id)
        const userRoles = roles?.filter(r => r.user_id === u.id).map(r => r.role) || []
        return {
          id: u.id,
          email: u.email,
          full_name: profile?.full_name || u.user_metadata?.full_name || '',
          phone: profile?.phone || '',
          ubs_name: profile?.ubs_name || [],
          roles: userRoles,
          created_at: u.created_at,
        }
      })

      return new Response(JSON.stringify(enrichedUsers), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'create') {
      const { email, password, full_name, phone, ubs_names, role } = params

      // Create auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          phone: phone || '',
          ubs_name: ubs_names?.join('|||') || '',
        },
      })
      if (createError) throw createError

      // Assign role
      if (role && newUser.user) {
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: newUser.user.id,
          role: role,
        })
        if (roleError) throw roleError
      }

      return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'update_role') {
      const { user_id, role } = params

      // Remove existing roles
      await supabase.from('user_roles').delete().eq('user_id', user_id)

      // Insert new role
      if (role) {
        const { error } = await supabase.from('user_roles').insert({ user_id, role })
        if (error) throw error
      }

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'delete') {
      const { user_id } = params
      const { error } = await supabase.auth.admin.deleteUser(user_id)
      if (error) throw error

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
