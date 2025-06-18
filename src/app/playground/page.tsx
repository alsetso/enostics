'use client'

import { useState, useEffect } from 'react'
import { BackgroundMedia } from '@/components/ui/background-media'
import { FloatingPlaygroundNavbar } from '@/components/layout/floating-playground-navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Code, 
  Activity, 
  Heart, 
  Thermometer, 
  Smartphone,
  Copy,
  Check,
  ArrowRight,
  Zap,
  Database,
  Clock,
  User,
  AlertCircle,
  Send,
  BarChart3,
  Layers,
  Settings,
  RefreshCw,
  Eye,
  Terminal,
  Cpu,
  Globe,
  Lock,
  TrendingUp,
  Target,
  Workflow
} from 'lucide-react'
import { homepageConfig } from '@/config/homepage'

interface Scenario {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  sampleData: any
  endpoint: string
  color: string
  category: 'health' | 'iot' | 'business' | 'ai'
  complexity: 'basic' | 'intermediate' | 'advanced'
}

const scenarios: Scenario[] = [
  {
    id: 'health-realtime',
    name: 'Health Monitoring',
    icon: <Heart className="h-5 w-5" />,
    description: 'Real-time biometric data streaming',
    category: 'health',
    complexity: 'basic',
    endpoint: '/v1/demo/health/stream',
    color: 'text-red-400',
    sampleData: {
      userId: 'user_demo_001',
      deviceId: 'fitbit_charge5',
      metrics: {
        heartRate: { value: 72, unit: 'bpm', timestamp: new Date().toISOString() },
        steps: { value: 8543, unit: 'count', timestamp: new Date().toISOString() },
        calories: { value: 245, unit: 'kcal', timestamp: new Date().toISOString() }
      },
      location: { lat: 37.7749, lng: -122.4194 },
      metadata: { source: 'wearable', quality: 'high' }
    }
  },
  {
    id: 'iot-smart-home',
    name: 'Smart Home Hub',
    icon: <Thermometer className="h-5 w-5" />,
    description: 'Multi-sensor environmental monitoring',
    category: 'iot',
    complexity: 'intermediate',
    endpoint: '/v1/demo/iot/environment',
    color: 'text-blue-400',
    sampleData: {
      homeId: 'home_sf_001',
      sensors: [
        { id: 'temp_01', type: 'temperature', value: 22.5, unit: '°C', room: 'living_room' },
        { id: 'hum_01', type: 'humidity', value: 45, unit: '%', room: 'living_room' },
        { id: 'air_01', type: 'air_quality', value: 85, unit: 'AQI', room: 'bedroom' }
      ],
      automation: { enabled: true, rules: ['comfort_mode', 'energy_save'] },
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'business-analytics',
    name: 'Business Intelligence',
    icon: <BarChart3 className="h-5 w-5" />,
    description: 'Customer journey and conversion analytics',
    category: 'business',
    complexity: 'advanced',
    endpoint: '/v1/demo/analytics/events',
    color: 'text-green-400',
    sampleData: {
      sessionId: 'sess_abc123',
      userId: 'user_premium_456',
      events: [
        { type: 'page_view', page: '/pricing', timestamp: new Date().toISOString() },
        { type: 'feature_used', feature: 'endpoint_create', timestamp: new Date().toISOString() },
        { type: 'conversion', plan: 'pro', value: 99.99, timestamp: new Date().toISOString() }
      ],
      cohort: 'Q1_2024',
      attribution: { source: 'google', medium: 'cpc', campaign: 'api_launch' }
    }
  },
  {
    id: 'ai-insights',
    name: 'AI Processing',
    icon: <Cpu className="h-5 w-5" />,
    description: 'Intelligent data processing and insights',
    category: 'ai',
    complexity: 'advanced',
    endpoint: '/v1/demo/ai/analyze',
    color: 'text-purple-400',
    sampleData: {
      dataType: 'mixed',
      payload: {
        text: "User reported feeling stressed after work meeting",
        metrics: { stress_level: 7.2, sleep_quality: 6.1, activity_level: 3.8 },
        context: { time_of_day: '15:30', day_of_week: 'tuesday', weather: 'rainy' }
      },
      analysis: {
        sentiment: 'negative',
        recommendations: ['meditation', 'light_exercise', 'schedule_break'],
        confidence: 0.87
      }
    }
  }
]

const codeLanguages = [
  { id: 'curl', name: 'cURL', icon: <Terminal className="h-4 w-4" /> },
  { id: 'javascript', name: 'JavaScript', icon: <Code className="h-4 w-4" /> },
  { id: 'python', name: 'Python', icon: <Code className="h-4 w-4" /> },
  { id: 'nodejs', name: 'Node.js', icon: <Code className="h-4 w-4" /> }
]

export default function PlaygroundPage() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0])
  const [requestCount, setRequestCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState('curl')
  const [isLive, setIsLive] = useState(false)
  const [liveData, setLiveData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'scenario' | 'code' | 'response'>('scenario')

  const maxRequests = 10

  // Simulate live data streaming with realistic variations
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      let newData: any = {
        timestamp: new Date().toISOString(),
        id: `live_${Date.now()}`,
      }

      // Generate scenario-specific realistic data
      switch (selectedScenario.id) {
        case 'health-realtime':
          newData = {
            ...newData,
            userId: 'user_demo_001',
            deviceId: 'fitbit_charge5',
            metrics: {
              heartRate: { 
                value: Math.round(68 + Math.random() * 20), // 68-88 bpm
                unit: 'bpm', 
                timestamp: new Date().toISOString() 
              },
              steps: { 
                value: Math.round(8000 + Math.random() * 2000), // 8000-10000 steps
                unit: 'count', 
                timestamp: new Date().toISOString() 
              },
              calories: { 
                value: Math.round(200 + Math.random() * 100), // 200-300 kcal
                unit: 'kcal', 
                timestamp: new Date().toISOString() 
              }
            },
            location: { 
              lat: 37.7749 + (Math.random() - 0.5) * 0.01, 
              lng: -122.4194 + (Math.random() - 0.5) * 0.01 
            },
            metadata: { source: 'wearable', quality: Math.random() > 0.8 ? 'medium' : 'high' }
          }
          break

        case 'iot-smart-home':
          newData = {
            ...newData,
            homeId: 'home_sf_001',
            sensors: [
              { 
                id: 'temp_01', 
                type: 'temperature', 
                value: Math.round((20 + Math.random() * 8) * 10) / 10, // 20-28°C
                unit: '°C', 
                room: 'living_room' 
              },
              { 
                id: 'hum_01', 
                type: 'humidity', 
                value: Math.round(40 + Math.random() * 20), // 40-60%
                unit: '%', 
                room: 'living_room' 
              },
              { 
                id: 'air_01', 
                type: 'air_quality', 
                value: Math.round(70 + Math.random() * 30), // 70-100 AQI
                unit: 'AQI', 
                room: 'bedroom' 
              }
            ],
            automation: { 
              enabled: true, 
              rules: ['comfort_mode', Math.random() > 0.5 ? 'energy_save' : 'performance_mode'] 
            }
          }
          break

        case 'business-analytics':
          const events = ['page_view', 'feature_used', 'conversion', 'sign_up', 'api_call']
          const pages = ['/pricing', '/docs', '/playground', '/dashboard', '/api']
          const features = ['endpoint_create', 'data_stream', 'analytics_view', 'settings_update']
          
          newData = {
            ...newData,
            sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
            userId: `user_${Math.random() > 0.7 ? 'premium' : 'free'}_${Math.floor(Math.random() * 1000)}`,
            events: [
              { 
                type: events[Math.floor(Math.random() * events.length)], 
                page: pages[Math.floor(Math.random() * pages.length)], 
                timestamp: new Date().toISOString() 
              }
            ],
            cohort: 'Q1_2024',
            attribution: { 
              source: ['google', 'twitter', 'direct'][Math.floor(Math.random() * 3)], 
              medium: ['cpc', 'organic', 'social'][Math.floor(Math.random() * 3)], 
              campaign: 'api_launch' 
            },
            value: Math.round(Math.random() * 200 * 100) / 100 // $0-200
          }
          break

        case 'ai-insights':
          const sentiments = ['positive', 'negative', 'neutral']
          const recommendations = [
            ['meditation', 'light_exercise'], 
            ['deep_work', 'break_time'], 
            ['social_interaction', 'outdoor_activity']
          ]
          
          newData = {
            ...newData,
            dataType: 'mixed',
            payload: {
              text: [
                "User reported feeling energized after morning workout",
                "Stress levels elevated during afternoon meetings", 
                "Good sleep quality noted overnight",
                "High productivity during focused work session"
              ][Math.floor(Math.random() * 4)],
              metrics: { 
                stress_level: Math.round(Math.random() * 10 * 10) / 10, // 0-10
                sleep_quality: Math.round((6 + Math.random() * 4) * 10) / 10, // 6-10
                activity_level: Math.round(Math.random() * 10 * 10) / 10 // 0-10
              },
              context: { 
                time_of_day: new Date().toLocaleTimeString('en-US', { 
                  hour12: false, 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                day_of_week: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
                weather: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
              }
            },
            analysis: {
              sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
              recommendations: recommendations[Math.floor(Math.random() * recommendations.length)],
              confidence: Math.round((0.7 + Math.random() * 0.3) * 100) / 100 // 0.7-1.0
            }
          }
          break

        default:
          newData = { ...selectedScenario.sampleData, ...newData }
      }
      
      setLiveData(prev => [...prev.slice(-4), newData])
    }, 2500) // Slightly slower for better readability

    return () => clearInterval(interval)
  }, [isLive, selectedScenario])

  const generateCode = () => {
    const data = JSON.stringify(selectedScenario.sampleData, null, 2)
    const endpoint = `https://api.enostics.com${selectedScenario.endpoint}`
    
    switch (codeLanguage) {
      case 'curl':
        return `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer demo_key_12345" \\
  -d '${data}'`
      
      case 'javascript':
        return `const response = await fetch('${endpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo_key_12345'
  },
  body: JSON.stringify(${data})
});

const result = await response.json();
console.log('Endpoint processed:', result);`
      
      case 'python':
        return `import requests
import json

url = "${endpoint}"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer demo_key_12345"
}
data = ${data}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(f"Processed: {result}")`

      case 'nodejs':
        return `const axios = require('axios');

const config = {
  method: 'post',
  url: '${endpoint}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo_key_12345'
  },
  data: ${data}
};

axios(config)
  .then(response => {
    console.log('Success:', response.data);
  })
  .catch(error => {
    console.log('Error:', error);
  });`
      
      default:
        return ''
    }
  }

  const handleSendRequest = async () => {
    if (requestCount >= maxRequests) return
    
    setIsLoading(true)
    
    // Simulate API call with realistic processing
    setTimeout(() => {
      const processingTime = Math.random() * 300 + 100
      setResponse({
        status: 200,
        message: 'Data processed successfully',
        requestId: `req_${Date.now()}`,
        endpoint: selectedScenario.endpoint,
        processingTime: `${processingTime.toFixed(0)}ms`,
        dataPoints: Object.keys(selectedScenario.sampleData).length,
        insights: selectedScenario.category === 'ai' ? ['pattern_detected', 'anomaly_check_passed'] : null,
        timestamp: new Date().toISOString(),
        nextSteps: ['data_stored', 'webhooks_triggered', 'analysis_queued']
      })
      setRequestCount(prev => prev + 1)
      setIsLoading(false)
    }, 1200)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleLiveMode = () => {
    setIsLive(!isLive)
    if (!isLive) {
      setLiveData([])
    }
  }

  return (
    <main className="relative w-screen min-h-screen">
      {/* Background */}
      <BackgroundMedia 
        type={homepageConfig.background.type}
        path={homepageConfig.background.path}
        mobilePath={homepageConfig.background.mobilePath}
        opacity={0.2}
        className="absolute inset-0 w-full h-full object-cover"
        videoOptions={homepageConfig.background.video}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-enostics-gray-950/85" />

      {/* Floating UI Elements */}
      <div className="relative z-10 min-h-screen">
        {/* Floating Navigation */}
        <FloatingPlaygroundNavbar 
          requestCount={requestCount}
          maxRequests={maxRequests}
          isLive={isLive}
        />

        {/* Main Content */}
        <div className="pt-20 px-6 py-8">
          {/* Compact Hero */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-enostics-gray-900 border border-enostics-gray-700 rounded-xl">
                  <Play className="h-8 w-8 text-enostics-blue" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  API Playground
                </h1>
              </div>
              <p className="text-lg text-enostics-gray-300 mb-6 max-w-3xl mx-auto">
                Experience the power of personal endpoints. Send real data, see intelligent processing, and understand how Enostics transforms information into actionable insights.
              </p>
              
              <div className="flex items-center justify-center gap-8 text-sm text-enostics-gray-400">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-enostics-blue" />
                  <span>No signup required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-enostics-green" />
                  <span>Real-time processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-enostics-purple" />
                  <span>Secure sandbox</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progressive Flow Design */}
          <div className="max-w-6xl mx-auto">
                        {/* Universal Step Navigation */}
            <div className="mb-6">
              <div className="flex bg-enostics-gray-900 rounded-lg p-1 border border-enostics-gray-700">
                {[
                  { id: 'scenario', name: 'Choose Scenario', icon: <Target className="h-4 w-4" />, step: 1 },
                  { id: 'code', name: 'Configure Code', icon: <Code className="h-4 w-4" />, step: 2 },
                  { id: 'response', name: 'View Results', icon: <Activity className="h-4 w-4" />, step: 3 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'scenario' | 'code' | 'response')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-enostics-blue text-white shadow-lg'
                        : 'text-enostics-gray-400 hover:text-white hover:bg-enostics-gray-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeTab === tab.id ? 'bg-white text-enostics-blue' : 'bg-enostics-gray-700 text-enostics-gray-400'
                    }`}>
                      {tab.step}
                    </div>
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden">{tab.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between max-w-md mx-auto">
                {[
                  { step: 1, active: activeTab === 'scenario' },
                  { step: 2, active: activeTab === 'code' },
                  { step: 3, active: activeTab === 'response' }
                ].map((item, index) => (
                  <div key={item.step} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      item.active 
                        ? 'bg-enostics-blue shadow-lg scale-125' 
                        : 'bg-enostics-gray-600'
                    }`} />
                    {index < 2 && (
                      <div className={`w-16 h-px mx-2 transition-all duration-300 ${
                        item.active ? 'bg-enostics-blue' : 'bg-enostics-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Single Step Content Layout */}
            <div className="max-w-4xl mx-auto">
              {/* Step 1: Scenario Selection */}
              {activeTab === 'scenario' && (
                <div className="space-y-6">
                  {/* Scenario Cards - Improved Mobile Layout */}
                  <Card className="bg-enostics-gray-900 border-enostics-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-enostics-blue/20 rounded-lg flex items-center justify-center">
                          <Target className="h-4 w-4 text-enostics-blue" />
                        </div>
                        <div>
                          <div className="text-lg">Choose Data Scenario</div>
                          <div className="text-sm text-enostics-gray-400 font-normal">Step 1 of 3</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {scenarios.map((scenario) => (
                        <button
                          key={scenario.id}
                          onClick={() => {
                            setSelectedScenario(scenario)
                            if (window.innerWidth < 1024) setActiveTab('code') // Auto-advance on mobile
                          }}
                          className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                            selectedScenario.id === scenario.id
                              ? 'bg-gradient-to-r from-enostics-blue/30 to-enostics-blue/10 border-enostics-blue text-white shadow-lg'
                              : 'bg-enostics-gray-800 border-enostics-gray-600 text-enostics-gray-300 hover:bg-enostics-gray-700 hover:border-enostics-gray-500 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-3 rounded-xl ${selectedScenario.id === scenario.id ? 'bg-enostics-blue/40' : 'bg-enostics-gray-700'}`}>
                              {scenario.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold truncate">{scenario.name}</h3>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs shrink-0 ${
                                    scenario.complexity === 'basic' ? 'border-enostics-green/30 text-enostics-green bg-enostics-green/10' :
                                    scenario.complexity === 'intermediate' ? 'border-enostics-blue/30 text-enostics-blue bg-enostics-blue/10' :
                                    'border-enostics-purple/30 text-enostics-purple bg-enostics-purple/10'
                                  }`}
                                >
                                  {scenario.complexity}
                                </Badge>
                              </div>
                              <p className="text-sm text-enostics-gray-400 leading-relaxed">{scenario.description}</p>
                            </div>
                            {selectedScenario.id === scenario.id && (
                              <div className="shrink-0">
                                <Check className="h-5 w-5 text-enostics-blue" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Live Mode Toggle - Enhanced */}
                  <Card className="bg-enostics-gray-900 border-enostics-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-enostics-purple/20 rounded-lg">
                          <Workflow className="h-5 w-5 text-enostics-purple" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">Live Streaming Mode</h3>
                          <p className="text-sm text-enostics-gray-400 mb-4">Enable real-time data simulation for dynamic testing</p>
                          <button
                            onClick={toggleLiveMode}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-enostics-blue focus:ring-offset-2 focus:ring-offset-enostics-gray-900 ${
                              isLive ? 'bg-enostics-blue shadow-lg' : 'bg-enostics-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                                isLive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          {isLive && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-enostics-green">
                              <div className="w-2 h-2 bg-enostics-green rounded-full animate-pulse"></div>
                              <span>Live streaming active</span>
                            </div>
                          )}
                        </div>
                      </div>
                                         </CardContent>
                   </Card>

                   {/* Next Step Button */}
                   <div className="flex justify-end">
                     <button
                       onClick={() => setActiveTab('code')}
                       disabled={!selectedScenario}
                       className="flex items-center gap-2 px-6 py-3 bg-enostics-blue hover:bg-enostics-blue-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       Configure Code
                       <ArrowRight className="h-4 w-4" />
                     </button>
                   </div>
                 </div>
               )}

               {/* Step 2: Code Editor */}
               {activeTab === 'code' && (
                <div className="space-y-6">
                  {/* Language Selector - Improved Mobile */}
                  <div className="flex flex-wrap gap-2">
                    {codeLanguages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setCodeLanguage(lang.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          codeLanguage === lang.id
                            ? 'bg-enostics-blue text-white shadow-lg'
                            : 'bg-enostics-gray-800 text-enostics-gray-400 hover:bg-enostics-gray-700 hover:text-white border border-enostics-gray-600'
                        }`}
                      >
                        {lang.icon}
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Code Editor - Enhanced */}
                  <Card className="bg-enostics-gray-900 border-enostics-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <div className="w-8 h-8 bg-enostics-green/20 rounded-lg flex items-center justify-center">
                            <Code className="h-4 w-4 text-enostics-green" />
                          </div>
                          <div>
                            <div className="text-lg">API Request</div>
                            <div className="text-sm text-enostics-gray-400 font-normal">Step 2 of 3</div>
                          </div>
                        </CardTitle>
                        <button
                          onClick={copyCode}
                          className="flex items-center gap-2 px-3 py-2 bg-enostics-gray-800 hover:bg-enostics-gray-700 text-enostics-gray-400 hover:text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-enostics-black border border-enostics-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        <pre className="text-enostics-gray-300 whitespace-pre-wrap">
                          {generateCode()}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Send Request Button - Enhanced */}
                  <button
                    onClick={() => {
                      handleSendRequest()
                      if (window.innerWidth < 1024) setActiveTab('response') // Auto-advance on mobile
                    }}
                    disabled={requestCount >= maxRequests || isLoading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-enostics-blue to-enostics-blue-dark text-white font-semibold rounded-xl hover:from-enostics-blue-dark hover:to-enostics-blue transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Processing Request...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send to Endpoint
                        <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
                          {maxRequests - requestCount} left
                        </Badge>
                      </>
                                         )}
                   </button>

                   {/* Navigation Buttons */}
                   <div className="flex justify-between">
                     <button
                       onClick={() => setActiveTab('scenario')}
                       className="flex items-center gap-2 px-6 py-3 bg-enostics-gray-800 hover:bg-enostics-gray-700 text-white font-medium rounded-lg transition-colors"
                     >
                       <Target className="h-4 w-4" />
                       Back to Scenario
                     </button>
                     <button
                       onClick={() => {
                         handleSendRequest()
                         setActiveTab('response')
                       }}
                       disabled={requestCount >= maxRequests || isLoading}
                       className="flex items-center gap-2 px-6 py-3 bg-enostics-green hover:bg-enostics-green/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {isLoading ? (
                         <>
                           <RefreshCw className="h-4 w-4 animate-spin" />
                           Processing...
                         </>
                       ) : (
                         <>
                           Send & View Results
                           <ArrowRight className="h-4 w-4" />
                         </>
                       )}
                     </button>
                   </div>
                 </div>
               )}

               {/* Step 3: Response & Live Data */}
               {activeTab === 'response' && (
                <div className="sticky top-24 space-y-6">
                  {/* API Response - Enhanced */}
                  <Card className="bg-enostics-gray-900 border-enostics-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-enostics-purple/20 rounded-lg flex items-center justify-center">
                          <Activity className="h-4 w-4 text-enostics-purple" />
                        </div>
                        <div>
                          <div className="text-lg">Live Results</div>
                          <div className="text-sm text-enostics-gray-400 font-normal">Step 3 of 3</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {response ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 p-3 bg-enostics-green/10 border border-enostics-green/30 rounded-lg">
                            <div className="w-2 h-2 bg-enostics-green rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-enostics-green">Success: {response.status}</span>
                          </div>
                          <div className="bg-enostics-black border border-enostics-gray-800 rounded-lg p-4">
                            <pre className="text-sm text-enostics-gray-300 whitespace-pre-wrap overflow-x-auto max-h-64">
                              {JSON.stringify(response, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-enostics-gray-400">
                          <Database className="h-12 w-12 mx-auto mb-3 text-enostics-gray-600" />
                          <p className="text-sm">Send a request to see the live response</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Live Data Stream - Enhanced */}
                  {isLive && (
                    <Card className="bg-enostics-gray-900 border-enostics-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Workflow className="h-5 w-5 text-enostics-blue animate-pulse" />
                          Live Data Stream
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                                                 {liveData.length > 0 ? (
                           <div className="space-y-2 max-h-64 overflow-y-auto">
                             {liveData.map((data, index) => (
                               <div key={data.id} className="p-3 bg-enostics-gray-800 rounded-lg border-l-2 border-enostics-blue">
                                 <div className="flex items-center justify-between mb-2">
                                   <span className="text-xs text-enostics-gray-400">#{liveData.length - index}</span>
                                   <span className="text-xs text-enostics-gray-500">
                                     {new Date(data.timestamp).toLocaleTimeString()}
                                   </span>
                                 </div>
                                 <div className="text-sm text-enostics-gray-300 space-y-1">
                                   {selectedScenario.id === 'health-realtime' && data.metrics && (
                                     <div className="space-y-1">
                                       <div className="flex items-center gap-2">
                                         <span>❤️</span>
                                         <span className="font-medium text-red-400">{data.metrics.heartRate.value} bpm</span>
                                       </div>
                                       <div className="flex items-center gap-2">
                                         <span>👟</span>
                                         <span className="font-medium text-blue-400">{data.metrics.steps.value.toLocaleString()} steps</span>
                                       </div>
                                       <div className="flex items-center gap-2">
                                         <span>🔥</span>
                                         <span className="font-medium text-orange-400">{data.metrics.calories.value} kcal</span>
                                       </div>
                                     </div>
                                   )}
                                   {selectedScenario.id === 'iot-smart-home' && data.sensors && (
                                     <div className="space-y-1">
                                       {data.sensors.map((sensor: any, idx: number) => (
                                         <div key={idx} className="flex items-center gap-2">
                                           <span>
                                             {sensor.type === 'temperature' ? '🌡️' : 
                                              sensor.type === 'humidity' ? '💧' : '🌬️'}
                                           </span>
                                           <span className="font-medium text-blue-400">
                                             {sensor.value}{sensor.unit}
                                           </span>
                                           <span className="text-xs text-enostics-gray-500">
                                             {sensor.room.replace('_', ' ')}
                                           </span>
                                         </div>
                                       ))}
                                     </div>
                                   )}
                                   {selectedScenario.id === 'business-analytics' && data.events && (
                                     <div className="space-y-1">
                                       <div className="flex items-center gap-2">
                                         <span>📊</span>
                                         <span className="font-medium text-green-400">{data.events[0].type}</span>
                                         <span className="text-xs text-enostics-gray-500">{data.events[0].page}</span>
                                       </div>
                                       {data.value && (
                                         <div className="flex items-center gap-2">
                                           <span>💰</span>
                                           <span className="font-medium text-yellow-400">${data.value}</span>
                                         </div>
                                       )}
                                       <div className="flex items-center gap-2">
                                         <span>👤</span>
                                         <span className="text-xs text-enostics-gray-400">{data.userId.split('_')[1]}</span>
                                       </div>
                                     </div>
                                   )}
                                   {selectedScenario.id === 'ai-insights' && data.analysis && (
                                     <div className="space-y-1">
                                       <div className="flex items-center gap-2">
                                         <span>🧠</span>
                                         <span className={`font-medium ${
                                           data.analysis.sentiment === 'positive' ? 'text-green-400' :
                                           data.analysis.sentiment === 'negative' ? 'text-red-400' : 'text-blue-400'
                                         }`}>
                                           {data.analysis.sentiment}
                                         </span>
                                         <span className="text-xs text-enostics-gray-500">
                                           {Math.round(data.analysis.confidence * 100)}%
                                         </span>
                                       </div>
                                       <div className="flex items-center gap-2">
                                         <span>📈</span>
                                         <span className="font-medium text-purple-400">
                                           Stress: {data.payload.metrics.stress_level}/10
                                         </span>
                                       </div>
                                       <div className="text-xs text-enostics-gray-400 truncate">
                                         💡 {data.analysis.recommendations.join(', ')}
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             ))}
                           </div>
                        ) : (
                          <div className="text-center py-6 text-enostics-gray-400">
                            <div className="w-2 h-2 bg-enostics-blue rounded-full animate-pulse mx-auto mb-2"></div>
                            <p className="text-sm">Waiting for live data...</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* System Insights - Enhanced */}
                  <Card className="bg-enostics-gray-900 border-enostics-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-enostics-purple" />
                        System Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between p-2 bg-enostics-gray-800 rounded-lg">
                          <span className="text-enostics-gray-400">Processing Power</span>
                          <span className="text-enostics-green font-medium">High</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-enostics-gray-800 rounded-lg">
                          <span className="text-enostics-gray-400">Endpoint Health</span>
                          <span className="text-enostics-green font-medium">100%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-enostics-gray-800 rounded-lg">
                          <span className="text-enostics-gray-400">Avg Response Time</span>
                          <span className="text-enostics-blue font-medium">127ms</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-enostics-gray-800 rounded-lg">
                          <span className="text-enostics-gray-400">Data Processed</span>
                          <span className="text-enostics-purple font-medium">{requestCount + liveData.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => setActiveTab('code')}
                      className="flex items-center gap-2 px-6 py-3 bg-enostics-gray-800 hover:bg-enostics-gray-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <Code className="h-4 w-4" />
                      Back to Code
                    </button>
                    <button
                      onClick={() => setActiveTab('scenario')}
                      className="flex items-center gap-2 px-6 py-3 bg-enostics-blue hover:bg-enostics-blue-dark text-white font-medium rounded-lg transition-colors"
                    >
                      Start Over
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 