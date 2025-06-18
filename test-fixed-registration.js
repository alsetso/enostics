const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFixedRegistration() {
  console.log('🔧 Testing Fixed Registration')
  
  const testEmail = `test-fixed-${Date.now()}@example.com`
  const testUsername = `testuser${Date.now()}`
  
  try {
    console.log('\n🔐 Testing registration with fixed trigger...')
    console.log('Test email:', testEmail)
    console.log('Test username:', testUsername)
    
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
      return false
    } else {
      console.log('✅ Registration successful!')
      console.log('User ID:', data.user?.id)
      console.log('Email confirmation required:', !data.session)
      
      if (data.user?.id) {
        // Wait a moment for trigger to complete
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Check if profile was created in 'profiles' table
        const { data: profile, error: profileError } = await adminSupabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('❌ Profile not created in profiles table:', profileError)
        } else {
          console.log('✅ Profile created in profiles table:', {
            id: profile.id,
            full_name: profile.full_name,
            username: profile.username
          })
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
          console.log('✅ Endpoint created:', {
            id: endpoint.id,
            name: endpoint.name,
            url_path: endpoint.url_path,
            user_id: endpoint.user_id
          })
        }
        
        return true
      }
    }
    
  } catch (error) {
    console.error('❌ Registration test failed:', error)
    return false
  }
}

testFixedRegistration().then((success) => {
  if (success) {
    console.log('\n🎉 Registration fix appears to be working!')
    console.log('You can now try registering through the web interface.')
  } else {
    console.log('\n❌ Registration fix needs more work.')
  }
  console.log('\n🏁 Test complete')
  process.exit(0)
}).catch(console.error) 