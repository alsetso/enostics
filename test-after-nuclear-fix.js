const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAfterNuclearFix() {
  console.log('🚀 Testing After Nuclear Fix')
  console.log('============================')
  
  const testEmail = `nuclear-test-${Date.now()}@example.com`
  
  try {
    // Test 1: Admin user creation
    console.log('\n🔧 Test 1: Admin user creation')
    const { data: adminData, error: adminError } = await adminSupabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true
    })
    
    if (adminError) {
      console.error('❌ Admin creation failed:', adminError.message)
    } else {
      console.log('✅ Admin creation works! User ID:', adminData.user?.id)
      
      // Clean up admin user
      if (adminData.user?.id) {
        await adminSupabase.auth.admin.deleteUser(adminData.user.id)
        console.log('🧹 Cleaned up admin test user')
      }
    }
    
    // Test 2: Regular signup
    console.log('\n👤 Test 2: Regular signup')
    const testEmail2 = `nuclear-signup-${Date.now()}@example.com`
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail2,
      password: 'TestPassword123!',
      options: {
        emailRedirectTo: 'http://localhost:3001/auth/callback',
        data: {
          username: 'testuser',
          full_name: 'Test User'
        }
      }
    })
    
    if (signupError) {
      console.error('❌ Signup failed:', signupError.message)
      console.error('   Status:', signupError.status)
      console.error('   Code:', signupError.code)
    } else {
      console.log('✅ Signup works! User ID:', signupData.user?.id)
      console.log('   Email confirmation needed:', !signupData.session)
      
      // Test 3: Manual profile creation
      if (signupData.user?.id) {
        console.log('\n📝 Test 3: Manual profile creation')
        const { data: profile, error: profileError } = await adminSupabase
          .from('profiles')
          .insert({
            id: signupData.user.id,
            full_name: 'Test User',
            username: 'testuser'
          })
          .select()
        
        if (profileError) {
          console.error('❌ Profile creation failed:', profileError.message)
        } else {
          console.log('✅ Profile creation works:', profile[0])
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAfterNuclearFix().then(() => {
  console.log('\n🏁 Nuclear fix test complete')
  console.log('\nIf signup works now, we can add back the triggers properly!')
  process.exit(0)
}).catch(console.error) 