'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface CreateEndpointModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateEndpointModal({ isOpen, onClose, onSuccess }: CreateEndpointModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url_path: '',
    auth_type: 'none'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const generateUrlPath = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      url_path: generateUrlPath(name)
    }))
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }))
    }
  }

  const handleUrlPathChange = (url_path: string) => {
    // Clean the URL path input
    const cleanPath = url_path
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
    
    setFormData(prev => ({ ...prev, url_path: cleanPath }))
    if (errors.url_path) {
      setErrors(prev => ({ ...prev, url_path: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Endpoint name is required'
    }
    
    if (!formData.url_path.trim()) {
      newErrors.url_path = 'URL path is required'
    } else if (formData.url_path.length < 2) {
      newErrors.url_path = 'URL path must be at least 2 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ url_path: 'This URL path is already taken' })
        } else {
          setErrors({ submit: result.error || 'Failed to create endpoint' })
        }
        return
      }
      
      // Success
      setFormData({ name: '', description: '', url_path: '', auth_type: 'none' })
      setErrors({})
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating endpoint:', error)
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', description: '', url_path: '', auth_type: 'none' })
      setErrors({})
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Endpoint</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Endpoint Name</Label>
            <Input
              id="name"
              placeholder="e.g., Health Data, Fitness Tracker"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url_path">URL Path</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-enostics-gray-400">api.enostics.com/v1/your-username/</span>
              <Input
                id="url_path"
                placeholder="health-data"
                value={formData.url_path}
                onChange={(e) => handleUrlPathChange(e.target.value)}
                className={`flex-1 ${errors.url_path ? 'border-red-500' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.url_path && (
              <p className="text-sm text-red-500">{errors.url_path}</p>
            )}
            <p className="text-xs text-enostics-gray-500">
              Only letters, numbers, and hyphens allowed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What kind of data will this endpoint receive?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth_type">Authentication</Label>
            <Select
              value={formData.auth_type}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, auth_type: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Public)</SelectItem>
                <SelectItem value="api_key">API Key Required</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Endpoint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 