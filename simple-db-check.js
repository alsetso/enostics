const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

async function simpleCheck() {
  console.log('🔧 Simple Database Check')
  
  try {
    // Try to query user_profiles table
    console.log('\n📋 Checking user_profiles table...')
    const { data: profiles, error: profileError } = await adminSupabase
      .from('user_profiles')
      .select('*')
      .limit(1)
    
    if (profileError) {
      console.error('❌ user_profiles error:', profileError)
    } else {
      console.log('✅ user_profiles accessible, sample count:', profiles?.length || 0)
    }
    
    // Try to query enostics_endpoints table
    console.log('\n📊 Checking enostics_endpoints table...')
    const { data: endpoints, error: endpointError } = await adminSupabase
      .from('enostics_endpoints')
      .select('*')
      .limit(1)
    
    if (endpointError) {
      console.error('❌ enostics_endpoints error:', endpointError)
    } else {
      console.log('✅ enostics_endpoints accessible, sample count:', endpoints?.length || 0)
    }
    
    // Try to insert a test profile to see what fails
    console.log('\n🧪 Testing profile insertion...')
    const testUserId = '00000000-0000-0000-0000-000000000000'
    
    const { data: insertData, error: insertError } = await adminSupabase
      .from('user_profiles')
      .insert({
        user_id: testUserId,
        full_name: 'Test User',
        role: 'consumer'
      })
      .select()
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError)
    } else {
      console.log('✅ Insert test successful:', insertData)
      
      // Clean up test data
      await adminSupabase
        .from('user_profiles')
        .delete()
        .eq('user_id', testUserId)
    }
    
    // Test endpoint insertion
    console.log('\n🎯 Testing endpoint insertion...')
    const { data: endpointInsert, error: endpointInsertError } = await adminSupabase
      .from('enostics_endpoints')
      .insert({
        user_id: testUserId,
        name: 'Test Endpoint',
        url_path: 'test-' + Date.now(),
        description: 'Test endpoint'
      })
      .select()
    
    if (endpointInsertError) {
      console.error('❌ Endpoint insert test failed:', endpointInsertError)
    } else {
      console.log('✅ Endpoint insert test successful:', endpointInsert)
      
      // Clean up test data
      if (endpointInsert?.[0]?.id) {
        await adminSupabase
          .from('enostics_endpoints')
          .delete()
          .eq('id', endpointInsert[0].id)
      }
    }
    
  } catch (error) {
    console.error('❌ Simple check failed:', error)
  }
}

simpleCheck().then(() => {
  console.log('\n🏁 Simple check complete')
  process.exit(0)
}).catch(console.error) 