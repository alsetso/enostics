import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      recipient_username,
      subject,
      message_body,
      payload,
      message_type = 'data_share'
    } = body

    if (!recipient_username || !payload) {
      return NextResponse.json({ 
        error: 'Recipient username and payload are required' 
      }, { status: 400 })
    }

    // Use the helper function to send message
    const { data: messageId, error } = await supabase.rpc('send_to_enostics_user', {
      p_recipient_username: recipient_username,
      p_payload: payload,
      p_subject: subject,
      p_message_body: message_body
    })

    if (error) {
      console.error('Error sending message:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to send message' 
      }, { status: 400 })
    }

    // Also actually POST the data to their endpoint
    try {
      const endpointUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://api.enostics.com'}/v1/${recipient_username}`
      
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Enostics-Source': 'user_message',
          'X-Enostics-Sender': user.email || 'unknown'
        },
        body: JSON.stringify({
          ...payload,
          _enostics_meta: {
            message_type,
            subject,
            message_body,
            sender_id: user.id,
            sent_at: new Date().toISOString()
          }
        })
      })

      // Update delivery status
      if (response.ok) {
        await supabase
          .from('enostics_outbound_messages')
          .update({ 
            status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('id', messageId)
      } else {
        await supabase
          .from('enostics_outbound_messages')
          .update({ 
            status: 'failed',
            error_message: `HTTP ${response.status}: ${response.statusText}`
          })
          .eq('id', messageId)
      }

    } catch (deliveryError) {
      console.error('Error delivering message:', deliveryError)
      
      // Update status to failed
      await supabase
        .from('enostics_outbound_messages')
        .update({ 
          status: 'failed',
          error_message: deliveryError instanceof Error ? deliveryError.message : 'Delivery failed'
        })
        .eq('id', messageId)
    }

    return NextResponse.json({ 
      success: true, 
      message_id: messageId,
      message: 'Message sent successfully' 
    })

  } catch (error) {
    console.error('Send message API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 