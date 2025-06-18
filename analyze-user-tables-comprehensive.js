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

async function analyzeUserTables() {
  console.log('🔍 COMPREHENSIVE USER TABLE ANALYSIS\n')
  
  // 1. Check all existing tables
  console.log('📋 EXISTING TABLES:')
  try {
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .or('table_schema.eq.public,table_schema.eq.auth')
      .order('table_schema')
      .order('table_name')
    
    if (error) {
      console.log('❌ Error fetching tables:', error)
    } else {
      tables.forEach(table => {
        console.log(`  ${table.table_schema}.${table.table_name}`)
      })
    }
  } catch (err) {
    console.log('❌ Direct query failed, using RPC approach...')
    
    // Alternative: Check specific tables we know about
    const tablesToCheck = [
      'user_profiles',
      'enostics_user_profiles', 
      'enostics_endpoints',
      'enostics_api_keys',
      'enostics_data',
      'enostics_subscription_plans',
      'enostics_user_subscriptions',
      'enostics_usage_tracking',
      'enostics_billing_events'
    ]
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`  ❌ ${tableName} - ${error.message}`)
        } else {
          console.log(`  ✅ ${tableName} - EXISTS`)
        }
      } catch (e) {
        console.log(`  ❌ ${tableName} - NOT ACCESSIBLE`)
      }
    }
  }
  
  // 2. Analyze existing user-related table structures
  console.log('\n🔍 TABLE STRUCTURE ANALYSIS:')
  
  // Check user_profiles if it exists
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
    
    if (!error) {
      console.log('\n✅ user_profiles structure:')
      if (data.length > 0) {
        console.log('   Columns:', Object.keys(data[0]))
      } else {
        console.log('   Table exists but empty')
      }
    }
  } catch (e) {
    console.log('❌ user_profiles not accessible')
  }
  
  // Check enostics_endpoints structure
  try {
    const { data, error } = await supabase
      .from('enostics_endpoints')
      .select('*')
      .limit(1)
    
    if (!error) {
      console.log('\n✅ enostics_endpoints structure:')
      if (data.length > 0) {
        console.log('   Columns:', Object.keys(data[0]))
        console.log('   Sample:', data[0])
      } else {
        console.log('   Table exists but empty')
      }
    }
  } catch (e) {
    console.log('❌ enostics_endpoints not accessible')
  }
  
  // Check auth.users structure (what metadata we have)
  try {
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (!error && data.users.length > 0) {
      console.log('\n✅ auth.users sample metadata:')
      const sampleUser = data.users[0]
      console.log('   Available fields:', Object.keys(sampleUser))
      console.log('   User metadata:', sampleUser.user_metadata)
      console.log('   Raw metadata:', sampleUser.raw_user_meta_data)
    }
  } catch (e) {
    console.log('❌ Cannot access auth.users')
  }
  
  console.log('\n📊 COMPREHENSIVE USER MANAGEMENT PLAN:')
  
  const userManagementPlan = {
    core_identity: {
      table: 'enostics_user_profiles',
      purpose: 'Single source of truth for user identity',
      fields: {
        id: 'UUID PRIMARY KEY',
        user_id: 'UUID REFERENCES auth.users(id) UNIQUE',
        username: 'VARCHAR(50) UNIQUE NOT NULL',
        display_name: 'TEXT',
        bio: 'TEXT',
        avatar_url: 'TEXT',
        website: 'TEXT',
        location: 'TEXT',
        timezone: 'VARCHAR(50)',
        created_at: 'TIMESTAMP WITH TIME ZONE',
        updated_at: 'TIMESTAMP WITH TIME ZONE'
      }
    },
    subscription_management: {
      table: 'enostics_user_subscriptions',
      purpose: 'Track user subscription status and billing',
      fields: {
        id: 'UUID PRIMARY KEY',
        user_id: 'UUID REFERENCES auth.users(id) UNIQUE',
        plan_id: 'VARCHAR(50) REFERENCES enostics_subscription_plans(plan_id)',
        status: 'VARCHAR(50) DEFAULT active',
        billing_cycle: 'VARCHAR(20) DEFAULT monthly',
        stripe_customer_id: 'VARCHAR(255)',
        stripe_subscription_id: 'VARCHAR(255)',
        current_period_start: 'TIMESTAMP WITH TIME ZONE',
        current_period_end: 'TIMESTAMP WITH TIME ZONE',
        trial_end: 'TIMESTAMP WITH TIME ZONE',
        created_at: 'TIMESTAMP WITH TIME ZONE',
        updated_at: 'TIMESTAMP WITH TIME ZONE'
      }
    },
    usage_tracking: {
      table: 'enostics_usage_metrics',
      purpose: 'Track real-time usage against plan limits',
      fields: {
        id: 'UUID PRIMARY KEY',
        user_id: 'UUID REFERENCES auth.users(id)',
        metric_type: 'VARCHAR(50)', // requests, endpoints, storage
        current_count: 'INTEGER DEFAULT 0',
        period_start: 'DATE',
        period_end: 'DATE',
        reset_frequency: 'VARCHAR(20)', // monthly, daily
        created_at: 'TIMESTAMP WITH TIME ZONE',
        updated_at: 'TIMESTAMP WITH TIME ZONE'
      }
    },
    preferences: {
      table: 'enostics_user_preferences',
      purpose: 'User settings and preferences',
      fields: {
        id: 'UUID PRIMARY KEY',
        user_id: 'UUID REFERENCES auth.users(id) UNIQUE',
        email_notifications: 'JSONB DEFAULT {}',
        dashboard_settings: 'JSONB DEFAULT {}',
        api_settings: 'JSONB DEFAULT {}',
        privacy_settings: 'JSONB DEFAULT {}',
        created_at: 'TIMESTAMP WITH TIME ZONE',
        updated_at: 'TIMESTAMP WITH TIME ZONE'
      }
    },
    activity_log: {
      table: 'enostics_user_activity',
      purpose: 'Track user actions and system events',
      fields: {
        id: 'UUID PRIMARY KEY',
        user_id: 'UUID REFERENCES auth.users(id)',
        action_type: 'VARCHAR(100)', // login, api_call, plan_change, etc
        resource_type: 'VARCHAR(50)', // endpoint, api_key, subscription
        resource_id: 'UUID',
        metadata: 'JSONB DEFAULT {}',
        ip_address: 'INET',
        user_agent: 'TEXT',
        created_at: 'TIMESTAMP WITH TIME ZONE'
      }
    }
  }
  
  console.log('\n🎯 RECOMMENDED USER TABLE STRUCTURE:')
  
  Object.entries(userManagementPlan).forEach(([category, config]) => {
    console.log(`\n📋 ${category.toUpperCase()}:`)
    console.log(`   🏷️  Table: ${config.table}`)
    console.log(`   🎯 Purpose: ${config.purpose}`)
    console.log('   📝 Fields:')
    Object.entries(config.fields).forEach(([field, type]) => {
      console.log(`      ${field}: ${type}`)
    })
  })
  
  console.log('\n🔄 MIGRATION STRATEGY:')
  console.log('1. Create enostics_user_profiles as master identity table')
  console.log('2. Migrate existing user_profiles data if exists')
  console.log('3. Create subscription and usage tracking tables')
  console.log('4. Create preferences and activity logging')
  console.log('5. Update triggers to populate all tables on signup')
  console.log('6. Create RLS policies for all tables')
  console.log('7. Create indexes for performance')
  
  console.log('\n🎪 INTEGRATION POINTS:')
  console.log('✅ auth.users (Supabase Auth) - Source of truth for authentication')
  console.log('✅ enostics_endpoints - User API endpoints')
  console.log('✅ enostics_api_keys - User API keys')
  console.log('✅ enostics_data - Incoming data storage')
  console.log('🔄 enostics_subscription_plans - Plan definitions')
  console.log('🔄 Stripe integration - Billing events')
  
  console.log('\n🏁 Analysis complete!')
}

analyzeUserTables() 