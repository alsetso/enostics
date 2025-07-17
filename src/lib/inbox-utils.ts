/**
 * Utility functions for inbox data processing and formatting
 */

/**
 * Format a date to show relative time (e.g., "2 hours ago") 
 * with full timestamp on hover
 */
export const formatRelativeTime = (date: string | Date): { relative: string; full: string } => {
  const now = new Date()
  const targetDate = new Date(date)
  const diffMs = now.getTime() - targetDate.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  let relative: string

  if (diffMinutes < 1) {
    relative = 'Just now'
  } else if (diffMinutes < 60) {
    relative = `${diffMinutes}m ago`
  } else if (diffHours < 24) {
    relative = `${diffHours}h ago`
  } else if (diffDays < 7) {
    relative = `${diffDays}d ago`
  } else {
    // For older dates, show the actual date
    relative = targetDate.toLocaleDateString()
  }

  const full = targetDate.toLocaleString()
  return { relative, full }
}

/**
 * Parse source information to get a clean label and icon
 */
export const parseSource = (source: string | undefined, userAgent?: string): { label: string; icon: string } => {
  if (!source) {
    return { label: 'Unknown', icon: 'database' }
  }

  const sourceLower = source.toLowerCase()
  const userAgentLower = userAgent?.toLowerCase() || ''

  // Check for common services
  if (sourceLower.includes('curl') || userAgentLower.includes('curl')) {
    return { label: 'cURL', icon: 'activity' }
  }
  
  if (sourceLower.includes('n8n') || userAgentLower.includes('n8n')) {
    return { label: 'n8n', icon: 'globe' }
  }
  
  if (sourceLower.includes('stripe') || userAgentLower.includes('stripe')) {
    return { label: 'Stripe', icon: 'activity' }
  }
  
  if (sourceLower.includes('postman') || userAgentLower.includes('postman')) {
    return { label: 'Postman', icon: 'globe' }
  }
  
  if (sourceLower.includes('insomnia') || userAgentLower.includes('insomnia')) {
    return { label: 'Insomnia', icon: 'globe' }
  }
  
  if (sourceLower.includes('remedy') || userAgentLower.includes('remedy')) {
    return { label: 'Remedy', icon: 'heart' }
  }
  
  if (sourceLower.includes('mobile') || userAgentLower.includes('mobile')) {
    return { label: 'Mobile', icon: 'smartphone' }
  }
  
  if (sourceLower.includes('webhook') || userAgentLower.includes('webhook')) {
    return { label: 'Webhook', icon: 'activity' }
  }
  
  if (sourceLower.includes('api') || userAgentLower.includes('api')) {
    return { label: 'API Client', icon: 'globe' }
  }
  
  if (sourceLower.includes('bot') || userAgentLower.includes('bot')) {
    return { label: 'Bot', icon: 'brain' }
  }

  // If no specific match, try to extract a clean name
  const cleanSource = source.replace(/[^a-zA-Z0-9\s]/g, '').trim()
  if (cleanSource && cleanSource !== 'Unknown Client') {
    return { label: cleanSource, icon: 'globe' }
  }

  return { label: 'Unknown', icon: 'database' }
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Get type color classes for different data types
 */
export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'health_data': return 'text-red-400'
    case 'financial_data': return 'text-green-400'
    case 'sensor_data': return 'text-blue-400'
    case 'message': return 'text-purple-400'
    case 'event': return 'text-yellow-400'
    default: return 'text-gray-400'
  }
}

/**
 * Get source icon element based on icon type
 */
export const getSourceIcon = (iconType: string): string => {
  switch (iconType) {
    case 'activity': return 'activity'
    case 'globe': return 'globe'
    case 'brain': return 'brain'
    case 'heart': return 'heart'
    case 'smartphone': return 'smartphone'
    case 'database': return 'database'
    default: return 'database'
  }
} 