'use client'

import { useState, useCallback } from 'react'

export interface TestRequest {
  id: string
  endpointId: string
  endpointName: string
  url: string
  payload: string
  timestamp: Date
  status?: 'pending' | 'success' | 'error'
  response?: {
    status: number
    statusText: string
    data: any
    headers: Record<string, string>
    duration: number
  }
  error?: string
}

export interface TestTemplate {
  id: string
  name: string
  payload: string
  description?: string
}

export function useEndpointTest() {
  const [requests, setRequests] = useState<TestRequest[]>([])
  const [templates, setTemplates] = useState<TestTemplate[]>([
    {
      id: 'default',
      name: 'Basic Test',
      payload: JSON.stringify({
        message: "Hello Enostics!",
        timestamp: new Date().toISOString(),
        data: {
          value: 123,
          type: "test"
        }
      }, null, 2),
      description: 'Basic test payload with message and data'
    },
    {
      id: 'health',
      name: 'Health Data',
      payload: JSON.stringify({
        patient_id: "12345",
        vitals: {
          heart_rate: 72,
          blood_pressure: "120/80",
          temperature: 98.6
        },
        timestamp: new Date().toISOString(),
        source: "health_monitor"
      }, null, 2),
      description: 'Sample health monitoring data'
    },
    {
      id: 'iot',
      name: 'IoT Sensor',
      payload: JSON.stringify({
        device_id: "sensor_001",
        measurements: {
          temperature: 23.5,
          humidity: 65.2,
          pressure: 1013.25
        },
        location: {
          lat: 37.7749,
          lng: -122.4194
        },
        timestamp: new Date().toISOString()
      }, null, 2),
      description: 'IoT sensor data with environmental measurements'
    }
  ])
  const [isLoading, setIsLoading] = useState(false)

  const sendTestRequest = useCallback(async (
    endpointId: string,
    endpointName: string,
    url: string,
    payload: string
  ): Promise<TestRequest> => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()
    
    const request: TestRequest = {
      id: requestId,
      endpointId,
      endpointName,
      url,
      payload,
      timestamp: new Date(),
      status: 'pending'
    }

    // Add request to history immediately
    setRequests(prev => [request, ...prev])
    setIsLoading(true)

    try {
      // Validate JSON payload
      let parsedPayload
      try {
        parsedPayload = JSON.parse(payload)
      } catch (error) {
        throw new Error('Invalid JSON payload')
      }

      // Send the request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedPayload)
      })

      const duration = Date.now() - startTime
      const responseData = await response.json()
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      const updatedRequest: TestRequest = {
        ...request,
        status: response.ok ? 'success' : 'error',
        response: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          headers: responseHeaders,
          duration
        }
      }

      // Update the request in history
      setRequests(prev => 
        prev.map(req => req.id === requestId ? updatedRequest : req)
      )

      return updatedRequest

    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      const updatedRequest: TestRequest = {
        ...request,
        status: 'error',
        error: errorMessage,
        response: {
          status: 0,
          statusText: 'Network Error',
          data: null,
          headers: {},
          duration
        }
      }

      // Update the request in history
      setRequests(prev => 
        prev.map(req => req.id === requestId ? updatedRequest : req)
      )

      return updatedRequest

    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearHistory = useCallback(() => {
    setRequests([])
  }, [])

  const removeRequest = useCallback((requestId: string) => {
    setRequests(prev => prev.filter(req => req.id !== requestId))
  }, [])

  const saveTemplate = useCallback((name: string, payload: string, description?: string) => {
    const template: TestTemplate = {
      id: `template_${Date.now()}`,
      name,
      payload,
      description
    }
    setTemplates(prev => [...prev, template])
    return template
  }, [])

  const removeTemplate = useCallback((templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
  }, [])

  const getRequestsByEndpoint = useCallback((endpointId: string) => {
    return requests.filter(req => req.endpointId === endpointId)
  }, [requests])

  const getSuccessfulRequests = useCallback(() => {
    return requests.filter(req => req.status === 'success')
  }, [requests])

  const getFailedRequests = useCallback(() => {
    return requests.filter(req => req.status === 'error')
  }, [requests])

  return {
    requests,
    templates,
    isLoading,
    sendTestRequest,
    clearHistory,
    removeRequest,
    saveTemplate,
    removeTemplate,
    getRequestsByEndpoint,
    getSuccessfulRequests,
    getFailedRequests
  }
} 