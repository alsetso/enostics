const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugDatabase() {
  console.log('🔧 Database Debug Script')
  
  try {
    // Check if tables exist using direct SQL
    console.log('\n📋 Checking Tables...')
    
    const { data: tables, error: tablesError } = await adminSupabase
      .rpc('exec_sql', { 
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('user_profiles', 'enostics_endpoints')
        `
      })
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError)
    } else {
      console.log('✅ Tables query result:', tables)
    }
    
    // Check table structure
    console.log('\n📊 Checking user_profiles structure...')
    const { data: profileCols, error: profileError } = await adminSupabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'user_profiles' 
          AND table_schema = 'public'
        `
      })
    
    if (profileError) {
      console.error('❌ Error checking user_profiles:', profileError)
    } else {
      console.log('✅ user_profiles columns:', profileCols)
    }
    
    // Check endpoints structure
    console.log('\n📊 Checking enostics_endpoints structure...')
    const { data: endpointCols, error: endpointError } = await adminSupabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'enostics_endpoints' 
          AND table_schema = 'public'
        `
      })
    
    if (endpointError) {
      console.error('❌ Error checking enostics_endpoints:', endpointError)
    } else {
      console.log('✅ enostics_endpoints columns:', endpointCols)
    }
    
    // Check constraints
    console.log('\n🔒 Checking Constraints...')
    const { data: constraints, error: constraintError } = await adminSupabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            tc.constraint_name,
            tc.table_name,
            tc.constraint_type,
            kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_schema = 'public'
          AND tc.table_name IN ('user_profiles', 'enostics_endpoints')
        `
      })
    
    if (constraintError) {
      console.error('❌ Error checking constraints:', constraintError)
    } else {
      console.log('✅ Constraints:', constraints)
    }
    
    // Check trigger function
    console.log('\n⚡ Checking Trigger Function...')
    const { data: functions, error: funcError } = await adminSupabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            routine_name,
            routine_type,
            routine_definition
          FROM information_schema.routines
          WHERE routine_schema = 'public'
          AND routine_name = 'handle_new_user'
        `
      })
    
    if (funcError) {
      console.error('❌ Error checking function:', funcError)
    } else {
      console.log('✅ Function exists:', functions?.length > 0)
      if (functions?.length > 0) {
        console.log('Function definition preview:', functions[0].routine_definition?.substring(0, 200) + '...')
      }
    }
    
    // Check triggers
    console.log('\n🎯 Checking Triggers...')
    const { data: triggers, error: triggerError } = await adminSupabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            trigger_name,
            event_object_table,
            action_timing,
            event_manipulation
          FROM information_schema.triggers
          WHERE trigger_name = 'on_auth_user_created'
        `
      })
    
    if (triggerError) {
      console.error('❌ Error checking triggers:', triggerError)
    } else {
      console.log('✅ Triggers:', triggers)
    }
    
  } catch (error) {
    console.error('❌ Database debug failed:', error)
  }
}

debugDatabase().then(() => {
  console.log('\n🏁 Database debug complete')
  process.exit(0)
}).catch(console.error) 