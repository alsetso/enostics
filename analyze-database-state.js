const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function analyzeDatabase() {
  console.log('🔍 COMPREHENSIVE DATABASE ANALYSIS')
  console.log('=====================================')
  
  // 1. Check what tables actually exist
  console.log('\n📋 STEP 1: Check existing tables')
  try {
    const tables = ['profiles', 'user_profiles', 'enostics_endpoints', 'enostics_data']
    
    for (const tableName of tables) {
      try {
        const { data, error } = await adminSupabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`)
        } else {
          console.log(`✅ ${tableName}: EXISTS (${data?.length || 0} sample records)`)
          if (data && data.length > 0) {
            console.log(`   Fields: ${Object.keys(data[0]).join(', ')}`)
          }
        }
      } catch (e) {
        console.log(`❌ ${tableName}: ${e.message}`)
      }
    }
  } catch (error) {
    console.error('Error checking tables:', error.message)
  }

  // 2. Check current triggers
  console.log('\n⚡ STEP 2: Check existing triggers')
  try {
    // Try to get trigger info using a simple approach
    const { data: authUsers, error: authError } = await adminSupabase
      .from('auth.users')
      .select('id')
      .limit(1)
    
    if (authError) {
      console.log('❌ Cannot access auth.users:', authError.message)
    } else {
      console.log('✅ Can access auth.users table')
    }
  } catch (error) {
    console.error('Error checking auth access:', error.message)
  }

  // 3. Test basic insertions to understand constraints
  console.log('\n🧪 STEP 3: Test table insertions')
  
  const testUserId = 'test-' + Date.now()
  
  // Test profiles table
  try {
    const { data: profileInsert, error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: testUserId,
        full_name: 'Test User',
        username: 'testuser'
      })
      .select()
    
    if (profileError) {
      console.log('❌ Profiles insert failed:', profileError.message)
      console.log('   Error code:', profileError.code)
      console.log('   Error details:', profileError.details)
    } else {
      console.log('✅ Profiles insert works')
      
      // Clean up
      await adminSupabase.from('profiles').delete().eq('id', testUserId)
    }
  } catch (error) {
    console.error('Profiles test error:', error.message)
  }

  // 4. Check RLS policies
  console.log('\n🔒 STEP 4: Check RLS status')
  try {
    // Try to insert without auth context
    const { error: rlsError } = await adminSupabase
      .from('profiles')
      .insert({
        id: 'rls-test-' + Date.now(),
        full_name: 'RLS Test'
      })
    
    if (rlsError && rlsError.code === '42501') {
      console.log('✅ RLS is enabled and working')
    } else if (rlsError) {
      console.log('❓ RLS check inconclusive:', rlsError.message)
    } else {
      console.log('⚠️  RLS might not be properly configured')
    }
  } catch (error) {
    console.log('❓ RLS check error:', error.message)
  }

  // 5. Check foreign key constraints
  console.log('\n🔗 STEP 5: Check foreign key constraints')
  try {
    const { error: fkError } = await adminSupabase
      .from('enostics_endpoints')
      .insert({
        user_id: 'fake-user-id',
        name: 'Test Endpoint',
        url_path: 'test-' + Date.now(),
        description: 'Test'
      })
    
    if (fkError && fkError.code === '23503') {
      console.log('✅ Foreign key constraints are working')
      console.log('   enostics_endpoints.user_id references auth.users(id)')
    } else if (fkError) {
      console.log('❓ FK check inconclusive:', fkError.message)
    } else {
      console.log('⚠️  Foreign key constraints might be missing')
    }
  } catch (error) {
    console.log('❓ FK check error:', error.message)
  }

  console.log('\n🎯 STEP 6: Proposed Solution')
  console.log('=====================================')
  
  // Based on findings, propose a solution
  console.log('Based on the analysis above, here\'s what we need to do:')
  console.log('1. Ensure profiles table exists and is accessible')
  console.log('2. Create a minimal trigger that only creates profiles')
  console.log('3. Skip endpoint creation in trigger (do it manually)')
  console.log('4. Test registration step by step')
}

analyzeDatabase().then(() => {
  console.log('\n🏁 Analysis complete')
  process.exit(0)
}).catch(error => {
  console.error('Analysis failed:', error)
  process.exit(1)
}) 