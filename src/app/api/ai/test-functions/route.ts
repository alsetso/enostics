import { NextRequest, NextResponse } from 'next/server'
import { functionRegistry } from '../../../../ai/tools/function-calling/function-registry'
import { inboxReviewerAgent } from '../../../../ai/agents/internal/inbox-reviewer'

/**
 * Test endpoint for AI functions and internal agents
 * Demonstrates the capabilities available to OpenAI models and internal automation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { test_type, payload } = body

    const results: any = {
      test_type,
      timestamp: new Date().toISOString(),
      results: {}
    }

    switch (test_type) {
      case 'function_calling':
        // Test all available functions
        console.log('🧪 Testing function calling capabilities...')
        
        // Test payload analysis
        results.results.payload_analysis = await functionRegistry.execute('analyze_payload', {
          payload: payload || {
            heart_rate: 72,
            blood_pressure: "120/80",
            device_id: "health_monitor_001",
            timestamp: new Date().toISOString()
          },
          analysis_type: 'health'
        })

        // Test data classification
        results.results.classification = await functionRegistry.execute('classify_data', {
          data: payload || { temperature: 98.6, patient_id: "12345" },
          confidence_threshold: 0.7
        })

        // Test risk assessment
        results.results.risk_assessment = await functionRegistry.execute('assess_risk', {
          payload: payload || { script: "alert('test')", user_input: "normal data" },
          check_types: ['security', 'privacy']
        })

        // Test web browsing (safe URL)
        results.results.web_browsing = await functionRegistry.execute('browse_web', {
          url: 'https://httpbin.org/json',
          extract_type: 'text'
        })

        // Test external API call
        results.results.external_api = await functionRegistry.execute('call_external_api', {
          api_type: 'weather',
          parameters: { location: 'San Francisco' }
        })

        break

      case 'inbox_reviewer':
        // Test the internal inbox reviewer agent
        console.log('🤖 Testing inbox reviewer agent...')
        
        const testPayload = payload || {
          patient_id: "P12345",
          heart_rate: 85,
          blood_pressure: "130/85",
          temperature: 99.1,
          symptoms: ["headache", "fatigue"],
          device_type: "smart_watch",
          timestamp: new Date().toISOString()
        }

        results.results.inbox_review = await inboxReviewerAgent.reviewPayload(testPayload, {
          source_ip: '192.168.1.100',
          user_agent: 'HealthApp/1.0',
          endpoint: '/api/v1/health-data'
        })

        break

      case 'chat_functions':
        // Test what functions are available to chat
        console.log('💬 Testing chat function availability...')
        
        results.results.available_functions = functionRegistry.getDefinitions().map(func => ({
          name: func.name,
          description: func.description,
          parameters: Object.keys(func.parameters.properties)
        }))

        results.results.function_count = functionRegistry.getDefinitions().length

        break

      case 'comprehensive':
        // Run a comprehensive test of all systems
        console.log('🔬 Running comprehensive AI system test...')
        
        const comprehensivePayload = payload || {
          transaction_id: "TXN789",
          amount: 1500.00,
          currency: "USD",
          merchant: "Online Store",
          card_last_four: "1234",
          timestamp: new Date().toISOString(),
          ip_address: "203.0.113.1"
        }

        // Step 1: Inbox review
        const inboxResult = await inboxReviewerAgent.reviewPayload(comprehensivePayload, {
          source_ip: '203.0.113.1',
          user_agent: 'PaymentApp/2.1'
        })

        // Step 2: Additional function calls
        const additionalAnalysis = await Promise.all([
          functionRegistry.execute('classify_data', { 
            data: comprehensivePayload, 
            confidence_threshold: 0.8 
          }),
          functionRegistry.execute('assess_risk', { 
            payload: comprehensivePayload, 
            check_types: ['security', 'privacy', 'quality'] 
          }),
          functionRegistry.execute('call_external_api', { 
            api_type: 'geolocation', 
            parameters: { ip: '203.0.113.1' } 
          })
        ])

        results.results.comprehensive = {
          inbox_review: inboxResult,
          additional_classification: additionalAnalysis[0],
          additional_risk_assessment: additionalAnalysis[1],
          geolocation_data: additionalAnalysis[2],
          processing_summary: {
            total_insights: inboxResult.analysis.insights.length,
            total_recommendations: inboxResult.analysis.recommendations.length,
            confidence_score: inboxResult.analysis.confidence,
            risk_level: additionalAnalysis[1].overall_risk
          }
        }

        break

      default:
        return NextResponse.json({ 
          error: 'Invalid test_type. Use: function_calling, inbox_reviewer, chat_functions, or comprehensive' 
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      ...results,
      performance: {
        test_completed_at: new Date().toISOString(),
        functions_available: functionRegistry.getDefinitions().length
      }
    })

  } catch (error) {
    console.error('AI test error:', error)
    return NextResponse.json({
      error: 'AI test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

/**
 * Get information about available AI capabilities
 */
export async function GET() {
  try {
    const capabilities = {
      function_calling: {
        available: true,
        functions: functionRegistry.getDefinitions().map(func => ({
          name: func.name,
          description: func.description,
          parameters: Object.keys(func.parameters.properties)
        }))
      },
      internal_agents: {
        inbox_reviewer: {
          available: true,
          status: inboxReviewerAgent.getStatus(),
          capabilities: [
            'Automatic payload classification',
            'Security risk assessment',
            'Business context detection',
            'Data quality analysis',
            'External data enrichment',
            'Automated action execution'
          ]
        }
      },
      chat_integration: {
        openai_models: ['gpt-4o-mini', 'gpt-3.5-turbo'],
        ollama_models: ['tinyllama', 'llama3.2:1b', 'llama3.2:3b', 'qwen2.5:7b'],
        function_calling_support: 'OpenAI models only',
        web_browsing: true,
        external_apis: ['weather', 'geolocation', 'stocks', 'news', 'health']
      },
      test_endpoints: {
        function_calling: 'POST /api/ai/test-functions { "test_type": "function_calling" }',
        inbox_reviewer: 'POST /api/ai/test-functions { "test_type": "inbox_reviewer" }',
        chat_functions: 'POST /api/ai/test-functions { "test_type": "chat_functions" }',
        comprehensive: 'POST /api/ai/test-functions { "test_type": "comprehensive" }'
      }
    }

    return NextResponse.json(capabilities)

  } catch (error) {
    console.error('AI capabilities error:', error)
    return NextResponse.json({
      error: 'Failed to get AI capabilities',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 