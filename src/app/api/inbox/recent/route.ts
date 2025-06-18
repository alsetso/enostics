import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Seeded data for bremercole@gmail.com - will be replaced with real Supabase data
const seededInboxData = [
  {
    id: '1',
    user_id: 'bremercole',
    sender: 'Apple Health',
    source: 'iot_device',
    type: 'health_data',
    subject: 'Daily Step Count Update',
    preview: 'Steps: 8,432 | Distance: 4.2 miles | Calories: 412',
    timestamp: '2024-01-15T14:30:22Z',
    is_read: false,
    is_starred: true,
    source_ip: '192.168.1.104',
    user_agent: 'HealthKit/1.0 (iPhone; iOS 17.2.1)',
    payload: { 
      steps: 8432, 
      distance: 4.2, 
      calories: 412,
      activeMinutes: 67,
      heartRateAvg: 78,
      sleepHours: 7.5,
      deviceId: 'iPhone-A2D43F21',
      timestamp: '2024-01-15T14:30:22Z'
    },
    created_at: '2024-01-15T14:30:22Z'
  },
  {
    id: '2',
    user_id: 'bremercole',
    sender: 'Stripe Webhook',
    source: 'webhook',
    type: 'financial_data',
    subject: 'Payment Received',
    preview: 'Amount: $1,299.00 | Customer: healthcare_provider_001',
    timestamp: '2024-01-15T11:15:33Z',
    is_read: true,
    is_starred: false,
    source_ip: '54.187.174.169',
    user_agent: 'Stripe-Webhook/1.0',
    payload: { 
      amount: 1299.00,
      currency: 'USD',
      customer: 'healthcare_provider_001',
      paymentMethod: 'card_1234',
      description: 'Health API Subscription - Premium Plan',
      stripeId: 'pi_3OkLjKA4Z9vF8ePa1mEt2QxY',
      metadata: {
        planType: 'premium',
        billingCycle: 'annual'
      }
    },
    created_at: '2024-01-15T11:15:33Z'
  },
  {
    id: '3',
    user_id: 'bremercole',
    sender: 'GPT-4 Assistant',
    source: 'gpt_agent',
    type: 'message',
    subject: 'Health Insight Analysis Complete',
    preview: 'Analyzed your recent health trends and found 3 key insights...',
    timestamp: '2024-01-14T16:22:11Z',
    is_read: true,
    is_starred: false,
    source_ip: '140.82.112.3',
    user_agent: 'OpenAI-GPT/4.0',
    payload: { 
      insights: [
        'Your sleep quality improved 23% this week',
        'Step count trending upward (+12% vs last month)',
        'Heart rate variability suggests good recovery'
      ],
      analysisType: 'health_trends',
      confidence: 0.94,
      dataPoints: 847,
      model: 'gpt-4-turbo',
      processingTime: '2.3s'
    },
    created_at: '2024-01-14T16:22:11Z'
  },
  {
    id: '4',
    user_id: 'bremercole',
    sender: 'Tesla API',
    source: 'api_client',
    type: 'sensor_data',
    subject: 'Vehicle Status Update',
    preview: 'Battery: 87% | Range: 289 miles | Location: Home',
    timestamp: '2024-01-14T20:45:17Z',
    is_read: false,
    is_starred: true,
    source_ip: '209.133.79.61',
    user_agent: 'Tesla-API/2.1',
    payload: { 
      battery: 87,
      range: 289,
      location: 'Home',
      odometer: 23847,
      isCharging: true,
      temperature: 72,
      coordinates: {
        lat: 37.7749,
        lng: -122.4194
      },
      vin: '5YJ3E1EA4KF123456'
    },
    created_at: '2024-01-14T20:45:17Z'
  },
  {
    id: '5',
    user_id: 'bremercole',
    sender: 'Notion Webhook',
    source: 'webhook',
    type: 'event',
    subject: 'Database Updated', 
    preview: 'New entry added to Health Tracking database',
    timestamp: '2024-01-13T09:30:44Z',
    is_read: true,
    is_starred: false,
    source_ip: '104.16.132.229',
    user_agent: 'Notion-Webhook/1.0',
    payload: { 
      database: 'Health Tracking',
      action: 'entry_added',
      pageId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      properties: {
        'Date': '2024-01-13',
        'Weight': '175 lbs',
        'Energy Level': 'High',
        'Notes': 'Feeling great after morning workout'
      },
      userId: 'notion_user_123'
    },
    created_at: '2024-01-13T09:30:44Z'
  }
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''

    // Try to get real data from Supabase first
    const { data: realData, error: dbError } = await supabase
      .from('enostics_public_inbox')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    let responseData = []
    let isSeeded = false

    if (dbError || !realData || realData.length === 0) {
      // Fallback to seeded data for demo purposes
      console.log('Using seeded data:', dbError?.message || 'No real data found')
      
      let filteredData = seededInboxData.filter(item => 
        item.user_id === 'bremercole' && // Demo user
        (item.sender.toLowerCase().includes(search.toLowerCase()) ||
         item.subject.toLowerCase().includes(search.toLowerCase()) ||
         item.preview.toLowerCase().includes(search.toLowerCase()))
      )

      filteredData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      responseData = filteredData.slice(offset, offset + limit)
      isSeeded = true
    } else {
      // Use real data and apply search filter
      responseData = realData.filter(item => {
        const searchStr = search.toLowerCase()
        const payloadStr = JSON.stringify(item.payload || {}).toLowerCase()
        return payloadStr.includes(searchStr) ||
               (item.payload_source || '').toLowerCase().includes(searchStr) ||
               (item.payload_type || '').toLowerCase().includes(searchStr)
      })
    }

    // Get counts for real data or seeded data
    let totalCount = responseData.length
    let unreadCount = 0
    let starredCount = 0

    if (isSeeded) {
      totalCount = seededInboxData.length
      unreadCount = seededInboxData.filter(item => !item.is_read).length
      starredCount = seededInboxData.filter(item => item.is_starred).length
    } else {
      // Get counts from database
      const { count } = await supabase
        .from('enostics_public_inbox')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      totalCount = count || 0
      unreadCount = 0 // TODO: Add is_read field to table
      starredCount = 0 // TODO: Add is_starred field to table
    }

    return NextResponse.json({
      data: responseData,
      total: totalCount,
      unread_count: unreadCount,
      starred_count: starredCount,
      meta: {
        limit,
        offset,
        search,
        user: user.id,
        is_seeded: isSeeded,
        data_source: isSeeded ? 'seeded_demo' : 'supabase_real'
      }
    })
    
  } catch (error) {
    console.error('Error fetching inbox data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch inbox data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST endpoint to mark items as read/starred
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, item_ids, user } = body

    // For now, just return success since we're using seeded data
    // In the future, this will update the actual Supabase records

    return NextResponse.json({
      success: true,
      action,
      updated_count: item_ids?.length || 0,
      message: `Successfully ${action} ${item_ids?.length || 0} items`,
      is_seeded: true
    })

  } catch (error) {
    console.error('Error updating inbox items:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update inbox items',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 