const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function debugSupabaseConfig() {
  console.log('🔧 SUPABASE CONFIGURATION DEBUG')
  console.log('================================')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('\n📋 Environment Check:')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Anon Key exists:', !!supabaseAnonKey)
  console.log('Service Key exists:', !!supabaseServiceKey)
  console.log('Anon Key length:', supabaseAnonKey?.length || 0)
  console.log('Service Key length:', supabaseServiceKey?.length || 0)
  
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables!')
    return
  }
  
  // Test different client configurations
  console.log('\n🔧 Testing Client Configurations:')
  
  // Test 1: Basic anon client
  try {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: anonTest, error: anonError } = await anonClient
      .from('profiles')
      .select('count')
      .single()
    
    if (anonError) {
      console.log('❌ Anon client test:', anonError.message)
    } else {
      console.log('✅ Anon client works')
    }
  } catch (e) {
    console.log('❌ Anon client failed:', e.message)
  }
  
  // Test 2: Service role client
  try {
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
    const { data: serviceTest, error: serviceError } = await serviceClient
      .from('profiles')
      .select('count')
      .single()
    
    if (serviceError) {
      console.log('❌ Service client test:', serviceError.message)
    } else {
      console.log('✅ Service client works')
    }
  } catch (e) {
    console.log('❌ Service client failed:', e.message)
  }
  
  // Test 3: Auth configuration
  console.log('\n🔐 Testing Auth Configuration:')
  try {
    const authClient = createClient(supabaseUrl, supabaseServiceKey)
    
    // Check auth settings
    const { data: authSettings, error: authError } = await authClient.auth.getSession()
    
    if (authError) {
      console.log('❌ Auth session check:', authError.message)
    } else {
      console.log('✅ Auth client initialized')
    }
    
    // Try to list users (admin function)
    const { data: users, error: usersError } = await authClient.auth.admin.listUsers()
    
    if (usersError) {
      console.log('❌ Cannot list users:', usersError.message)
      console.log('   Status:', usersError.status)
      console.log('   This might indicate the service key is wrong or auth is misconfigured')
    } else {
      console.log('✅ Can list users, found:', users.users?.length || 0, 'users')
    }
    
  } catch (e) {
    console.log('❌ Auth test failed:', e.message)
  }
  
  // Test 4: Check project settings
  console.log('\n⚙️  Project Settings Check:')
  
  // Extract project ref from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  if (projectRef) {
    console.log('Project Ref:', projectRef)
    console.log('Project URL format looks correct')
  } else {
    console.log('❌ Invalid Supabase URL format')
  }
  
  // Test 5: Simple signup test with detailed logging
  console.log('\n🧪 Detailed Signup Test:')
  try {
    const testClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        debug: true,
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const testEmail = `debug-test-${Date.now()}@example.com`
    console.log('Attempting signup with email:', testEmail)
    
    const { data, error } = await testClient.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!'
    })
    
    if (error) {
      console.log('❌ Detailed signup error:')
      console.log('   Message:', error.message)
      console.log('   Status:', error.status)
      console.log('   Code:', error.code)
      console.log('   Full error:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Signup successful:', data.user?.id)
    }
    
  } catch (e) {
    console.log('❌ Signup test exception:', e.message)
    console.log('   Stack:', e.stack)
  }
}

debugSupabaseConfig().then(() => {
  console.log('\n🏁 Configuration debug complete')
  process.exit(0)
}).catch(error => {
  console.error('Debug failed:', error)
  process.exit(1)
}) 