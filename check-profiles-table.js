const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProfilesTable() {
  console.log('🔧 Checking Profiles Table Structure')
  
  try {
    // Check if profiles table exists
    console.log('\n📋 Checking profiles table...')
    const { data: profiles, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profileError) {
      console.error('❌ profiles table error:', profileError)
    } else {
      console.log('✅ profiles table accessible, sample count:', profiles?.length || 0)
      if (profiles && profiles.length > 0) {
        console.log('Sample profile structure:', Object.keys(profiles[0]))
      }
    }
    
    // Test insert into profiles table
    console.log('\n🧪 Testing profiles table insertion...')
    const testUserId = '00000000-0000-0000-0000-000000000000'
    
    const { data: insertData, error: insertError } = await adminSupabase
      .from('profiles')
      .insert({
        id: testUserId,
        full_name: 'Test User',
        username: 'testuser'
      })
      .select()
    
    if (insertError) {
      console.error('❌ Profiles insert test failed:', insertError)
    } else {
      console.log('✅ Profiles insert test successful:', insertData)
      
      // Clean up test data
      await adminSupabase
        .from('profiles')
        .delete()
        .eq('id', testUserId)
    }
    
  } catch (error) {
    console.error('❌ Profiles check failed:', error)
  }
}

checkProfilesTable().then(() => {
  console.log('\n🏁 Profiles check complete')
  process.exit(0)
}).catch(console.error) 