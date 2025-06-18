export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface EndpointData {
  id: string
  user_id: string
  username: string
  data: any
  source?: string
  created_at: string
}

export interface UserEndpoint {
  id: string
  username: string
  is_active: boolean
  created_at: string
  updated_at: string
} 