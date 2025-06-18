const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

async function findAllTriggers() {
  console.log('🔍 FINDING ALL TRIGGERS AND CONSTRAINTS')
  console.log('=======================================')
  
  try {
    // Method 1: Try to access auth schema directly (might not work)
    console.log('\n📋 Method 1: Direct auth schema access')
    try {
      const { data, error } = await adminSupabase
        .schema('auth')
        .from('users')
        .select('id')
        .limit(1)
      
      if (error) {
        console.log('❌ Cannot access auth.users directly:', error.message)
      } else {
        console.log('✅ Can access auth.users directly')
      }
    } catch (e) {
      console.log('❌ Direct auth access failed:', e.message)
    }
    
    // Method 2: Use raw SQL to find triggers
    console.log('\n⚡ Method 2: Find all triggers using raw SQL')
    try {
      // This is a workaround - create a function to check triggers
      const triggerCheckSQL = `
        CREATE OR REPLACE FUNCTION check_all_triggers()
        RETURNS TABLE(trigger_name text, table_name text, function_name text) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            t.trigger_name::text,
            t.event_object_table::text,
            t.action_statement::text
          FROM information_schema.triggers t
          WHERE t.event_object_table = 'users'
          AND t.trigger_schema = 'auth';
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
      
      // First create the function
      const { error: createError } = await adminSupabase.rpc('exec', { 
        sql: triggerCheckSQL 
      })
      
      if (createError) {
        console.log('❌ Cannot create trigger check function:', createError.message)
      } else {
        // Then call it
        const { data: triggers, error: triggerError } = await adminSupabase.rpc('check_all_triggers')
        
        if (triggerError) {
          console.log('❌ Cannot check triggers:', triggerError.message)
        } else {
          console.log('✅ Triggers found:', triggers)
        }
      }
    } catch (e) {
      console.log('❌ Trigger check method failed:', e.message)
    }
    
    // Method 3: Check if there are any functions that might be triggers
    console.log('\n🔧 Method 3: Check all functions in public schema')
    try {
      const functionsSQL = `
        SELECT routine_name, routine_type
        FROM information_schema.routines
        WHERE routine_schema = 'public'
        AND routine_name LIKE '%user%'
        OR routine_name LIKE '%auth%'
        OR routine_name LIKE '%trigger%'
      `
      
      // We can't run raw SQL easily, so let's try a different approach
      console.log('Checking for functions that might be related to user creation...')
      
    } catch (e) {
      console.log('❌ Function check failed:', e.message)
    }
    
    // Method 4: Test with a completely fake signup to see the exact error
    console.log('\n🧪 Method 4: Test with minimal data to see exact error')
    try {
      const { data, error } = await adminSupabase.auth.admin.createUser({
        email: `minimal-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        email_confirm: true
      })
      
      if (error) {
        console.log('❌ Admin user creation failed:', error.message)
        console.log('   Error code:', error.status)
        console.log('   Full error:', JSON.stringify(error, null, 2))
      } else {
        console.log('✅ Admin user creation works:', data.user?.id)
        
        // Clean up
        if (data.user?.id) {
          await adminSupabase.auth.admin.deleteUser(data.user.id)
        }
      }
    } catch (e) {
      console.log('❌ Admin test failed:', e.message)
    }
    
  } catch (error) {
    console.error('Overall check failed:', error.message)
  }
}

findAllTriggers().then(() => {
  console.log('\n🏁 Trigger investigation complete')
  process.exit(0)
}).catch(console.error) 