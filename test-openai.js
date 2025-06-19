const testOpenAIModels = async () => {
  const baseUrl = 'http://localhost:3000/api/ai/chat-simple'
  
  const testCases = [
    {
      model: 'gpt-4o-mini',
      message: 'Hello! Can you help me analyze this JSON payload: {"user": "john", "action": "login", "timestamp": "2024-01-15T10:30:00Z"}? Please extract the key information.'
    },
    {
      model: 'gpt-3.5-turbo',
      message: 'Please summarize and tag this data: {"orders": [{"id": 1, "amount": 99.99, "status": "completed"}, {"id": 2, "amount": 149.50, "status": "pending"}]}'
    }
  ]

  console.log('🧪 Testing OpenAI Models Integration...\n')

  for (const testCase of testCases) {
    console.log(`🤖 Testing ${testCase.model}...`)
    console.log(`📝 Message: ${testCase.message.substring(0, 60)}...`)
    
    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testCase.message,
          model: testCase.model
        })
      })

      const data = await response.json()

      if (response.ok) {
        console.log(`✅ ${testCase.model} - SUCCESS`)
        console.log(`📊 Response: ${data.response.substring(0, 100)}...`)
        console.log(`🏷️  Model: ${data.model}`)
        console.log(`💰 Cost: ${data.metadata?.cost || 'N/A'}`)
        console.log(`🔢 Tokens: ${data.metadata?.tokensUsed || 'N/A'}`)
        console.log(`🌐 Provider: ${data.metadata?.provider || 'N/A'}`)
      } else {
        console.log(`❌ ${testCase.model} - FAILED`)
        console.log(`🚨 Error: ${data.error}`)
        console.log(`📋 Details: ${data.details}`)
      }
    } catch (error) {
      console.log(`❌ ${testCase.model} - CONNECTION ERROR`)
      console.log(`🚨 Error: ${error.message}`)
    }
    
    console.log('─'.repeat(60))
  }

  // Test fallback to local model
  console.log(`🤖 Testing local model fallback (TinyLlama)...`)
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello from TinyLlama!',
        model: 'tinyllama'
      })
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`✅ TinyLlama - SUCCESS`)
      console.log(`📊 Response: ${data.response.substring(0, 100)}...`)
      console.log(`🏷️  Model: ${data.model}`)
      console.log(`🌐 Provider: ${data.metadata?.provider || 'N/A'}`)
    } else {
      console.log(`❌ TinyLlama - FAILED`)
      console.log(`🚨 Error: ${data.error}`)
    }
  } catch (error) {
    console.log(`❌ TinyLlama - CONNECTION ERROR`)
    console.log(`🚨 Error: ${error.message}`)
  }

  console.log('\n🏁 Test completed!')
}

testOpenAIModels().catch(console.error) 