import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if required columns exist
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'data')
      .eq('table_schema', 'public')
      .in('column_name', ['is_read', 'is_starred', 'subject', 'preview', 'source', 'type'])

    if (columnsError) {
      return NextResponse.json({ error: 'Failed to check database schema' }, { status: 500 })
    }

    // Get user's endpoints
    const { data: endpoints, error: endpointsError } = await supabase
      .from('endpoints')
      .select('id, name, url_path')
      .eq('user_id', user.id)

    if (endpointsError) {
      return NextResponse.json({ error: 'Failed to fetch endpoints' }, { status: 500 })
    }

    let dataItems: any[] = []
    let dataError: any = null

    if (endpoints && endpoints.length > 0) {
      const endpointIds = endpoints.map(ep => ep.id)

      // Try to get some data items to test
      const { data: items, error: itemsError } = await supabase
        .from('data')
        .select('id, is_read, is_starred, subject, preview, source, type, endpoint_id')
        .in('endpoint_id', endpointIds)
        .limit(5)

      dataItems = items || []
      dataError = itemsError
    }

    // Test if we can perform basic operations
    const canRead = columns.some(col => col.column_name === 'is_read')
    const canStar = columns.some(col => col.column_name === 'is_starred')
    const hasSubject = columns.some(col => col.column_name === 'subject')
    const hasPreview = columns.some(col => col.column_name === 'preview')
    const hasSource = columns.some(col => col.column_name === 'source')
    const hasType = columns.some(col => col.column_name === 'type')

    const setup = {
      database: {
        columns_exist: {
          is_read: canRead,
          is_starred: canStar,
          subject: hasSubject,
          preview: hasPreview,
          source: hasSource,
          type: hasType
        },
        columns_details: columns,
        missing_columns: [] as string[]
      },
      user: {
        id: user.id,
        email: user.email,
        endpoints_count: endpoints?.length || 0,
        endpoints: endpoints || []
      },
      data: {
        sample_items: dataItems,
        data_error: dataError?.message || null,
        can_query_data: !dataError
      }
    }

    // Find missing columns
    const requiredColumns = ['is_read', 'is_starred', 'subject', 'preview', 'source', 'type']
    const existingColumns = columns.map(col => col.column_name)
    setup.database.missing_columns = requiredColumns.filter(col => !existingColumns.includes(col))

    const isSetupComplete = setup.database.missing_columns.length === 0
    const hasData = dataItems.length > 0

    return NextResponse.json({
      setup_complete: isSetupComplete,
      has_test_data: hasData,
      ready_for_testing: isSetupComplete && hasData,
      details: setup,
      recommendations: {
        next_steps: !isSetupComplete 
          ? ['Run the database migration script in Supabase SQL Editor']
          : !hasData 
          ? ['Send some test data to your endpoint to test star/read functionality']
          : ['All set! You can now test star and read functionality']
      }
    })

  } catch (error) {
    console.error('Debug check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 