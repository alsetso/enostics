const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRegistrationNoTriggers() {
  console.log('🔧 Testing Registration WITHOUT Triggers')
  
  const testEmail = `test-no-triggers-${Date.now()}@example.com`
  const testUsername = `testuser${Date.now()}`
  
  console.log('Test email:', testEmail)
  console.log('Test username:', testUsername)
  
  try {
    // Step 1: Try registration
    console.log('\n🔐 Step 1: Testing basic registration...')
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
      console.error('❌ Registration failed:', error.message)
      return false
    }
    
    console.log('✅ Registration successful!')
    console.log('User ID:', data.user?.id)
    
    if (data.user?.id) {
      // Step 2: Manually create profile
      console.log('\n👤 Step 2: Manually creating profile...')
      const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: testUsername,
          username: testUsername
        })
        .select()
      
      if (profileError) {
        console.error('❌ Profile creation failed:', profileError.message)
      } else {
        console.log('✅ Profile created successfully:', profile[0])
      }
      
      // Step 3: Manually create endpoint
      console.log('\n🔗 Step 3: Manually creating endpoint...')
      const { data: endpoint, error: endpointError } = await adminSupabase
        .from('enostics_endpoints')
        .insert({
          user_id: data.user.id,
          name: 'Default Endpoint',
          url_path: testUsername.toLowerCase(),
          description: 'Your personal data endpoint'
        })
        .select()
      
      if (endpointError) {
        console.error('❌ Endpoint creation failed:', endpointError.message)
      } else {
        console.log('✅ Endpoint created successfully:', endpoint[0])
      }
      
      return true
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

testRegistrationNoTriggers().then((success) => {
  if (success) {
    console.log('\n🎉 SUCCESS! Registration works without triggers!')
    console.log('Next: We can create a simple trigger to automate profile creation')
  } else {
    console.log('\n❌ Registration still failing - need to investigate further')
  }
  console.log('\n🏁 Test complete')
  process.exit(0)
}).catch(console.error) 