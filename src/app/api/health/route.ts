import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Test database connection and table existence
    const checks = {
      database_connection: false,
      user_profiles_table: false,
      enostics_endpoints_table: false,
      enostics_data_table: false,
      enostics_api_keys_table: false,
      trigger_function: false
    }

    // Test basic connection
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
      if (!error) {
        checks.database_connection = true
        checks.user_profiles_table = true
      }
    } catch (err) {
      console.error('Database connection test failed:', err)
    }

    // Test endpoints table
    try {
      const { data, error } = await supabase.from('enostics_endpoints').select('count').limit(1)
      if (!error) {
        checks.enostics_endpoints_table = true
      }
    } catch (err) {
      console.error('Endpoints table test failed:', err)
    }

    // Test data table
    try {
      const { data, error } = await supabase.from('enostics_data').select('count').limit(1)
      if (!error) {
        checks.enostics_data_table = true
      }
    } catch (err) {
      console.error('Data table test failed:', err)
    }

    // Test API keys table
    try {
      const { data, error } = await supabase.from('enostics_api_keys').select('count').limit(1)
      if (!error) {
        checks.enostics_api_keys_table = true
      }
    } catch (err) {
      console.error('API keys table test failed:', err)
    }

    // Test trigger function exists
    try {
      const { data, error } = await supabase.rpc('handle_new_user')
      // If function exists but fails due to no NEW record, that's expected
      if (error && !error.message.includes('NEW')) {
        checks.trigger_function = false
      } else {
        checks.trigger_function = true
      }
    } catch (err) {
      console.error('Trigger function test failed:', err)
    }

    const allHealthy = Object.values(checks).every(check => check === true)

    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      message: allHealthy 
        ? 'All database components are working correctly'
        : 'Some database components need setup. Please run the database setup SQL.'
    }, {
      status: allHealthy ? 200 : 503
    })

  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Failed to perform health check',
      message: 'Please check your Supabase configuration and environment variables'
    }, {
      status: 500
    })
  }
} 