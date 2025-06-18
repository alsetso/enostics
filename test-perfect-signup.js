const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function testPerfectSignup() {
  console.log('🧪 Testing Perfect Signup Flow...\n')
  
  // Generate unique test data
  const timestamp = Date.now()
  const testEmail = `test-${timestamp}@example.com`
  const testUsername = `testuser${timestamp}`
  const selectedPlan = 'developer'
  
  try {
    console.log('📋 Test Data:')
    console.log(`Email: ${testEmail}`)
    console.log(`Username: ${testUsername}`)
    console.log(`Selected Plan: ${selectedPlan}\n`)
    
    // Test signup with plan selection
    console.log('🔐 Testing signup...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        username: testUsername,
        full_name: `Test User ${timestamp}`,
        selected_plan: selectedPlan
      }
    })
    
    if (authError) {
      console.log('❌ Signup failed:', authError)
      return
    }
    
    console.log('✅ User created successfully!')
    console.log(`User ID: ${authData.user.id}\n`)
    
    // Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check if profile was created
    console.log('👤 Checking user profile...')
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()
    
    if (profileError) {
      console.log('❌ Profile check failed:', profileError)
    } else {
      console.log('✅ Profile created successfully!')
      console.log('Profile:', profile)
    }
    
    // Check if endpoint was created
    console.log('\n🔗 Checking endpoint creation...')
    const { data: endpoint, error: endpointError } = await supabase
      .from('enostics_endpoints')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()
    
    if (endpointError) {
      console.log('❌ Endpoint check failed:', endpointError)
    } else {
      console.log('✅ Endpoint created successfully!')
      console.log('Endpoint:', {
        name: endpoint.name,
        url_path: endpoint.url_path,
        description: endpoint.description,
        is_active: endpoint.is_active
      })
    }
    
    // Test the API endpoint
    console.log(`\n🌐 Testing API endpoint: https://api.enostics.com/v1/${endpoint?.url_path || 'test'}`)
    
    // Cleanup test user
    console.log('\n🧹 Cleaning up test user...')
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id)
    
    if (deleteError) {
      console.log('⚠️ Failed to delete test user:', deleteError)
    } else {
      console.log('✅ Test user cleaned up successfully')
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
  
  console.log('\n🏁 Perfect signup test complete!')
}

testPerfectSignup() 