const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Debug Registration Script')
console.log('Supabase URL:', supabaseUrl)
console.log('Anon Key exists:', !!supabaseAnonKey)
console.log('Service Key exists:', !!supabaseServiceKey)

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugRegistration() {
  console.log('\n📋 Testing Database Schema...')
  
  try {
    // Check if tables exist
    const { data: tables, error: tablesError } = await adminSupabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_profiles', 'enostics_endpoints'])
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError)
    } else {
      console.log('✅ Tables found:', tables.map(t => t.table_name))
    }
    
    // Check trigger function
    const { data: functions, error: funcError } = await adminSupabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .eq('routine_schema', 'public')
      .eq('routine_name', 'handle_new_user')
    
    if (funcError) {
      console.error('❌ Error checking functions:', funcError)
    } else {
      console.log('✅ Trigger function exists:', functions.length > 0)
    }
    
    // Check triggers
    const { data: triggers, error: triggerError } = await adminSupabase
      .from('information_schema.triggers')
      .select('trigger_name, event_object_table')
      .eq('trigger_name', 'on_auth_user_created')
    
    if (triggerError) {
      console.error('❌ Error checking triggers:', triggerError)
    } else {
      console.log('✅ Auth trigger exists:', triggers.length > 0)
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message)
  }
  
  console.log('\n🔐 Testing Registration...')
  
  const testEmail = `test-${Date.now()}@example.com`
  const testUsername = `testuser${Date.now()}`
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        emailRedirectTo: 'http://localhost:3001/auth/callback',
        data: {
          username: testUsername,
          full_name: testUsername
        }
      }
    })
    
    if (error) {
      console.error('❌ Registration failed:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText
      })
    } else {
      console.log('✅ Registration successful!')
      console.log('User ID:', data.user?.id)
      console.log('Email confirmation required:', !data.session)
      
      // Check if profile was created
      if (data.user?.id) {
        const { data: profile, error: profileError } = await adminSupabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('❌ Profile not created:', profileError)
        } else {
          console.log('✅ Profile created:', profile)
        }
        
        // Check if endpoint was created
        const { data: endpoint, error: endpointError } = await adminSupabase
          .from('enostics_endpoints')
          .select('*')
          .eq('user_id', data.user.id)
          .single()
        
        if (endpointError) {
          console.error('❌ Endpoint not created:', endpointError)
        } else {
          console.log('✅ Endpoint created:', endpoint)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Registration test failed:', error)
  }
}

debugRegistration().then(() => {
  console.log('\n🏁 Debug complete')
  process.exit(0)
}).catch(console.error) 