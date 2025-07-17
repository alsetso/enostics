'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Mail, 
  Settings, 
  Brain, 
  Copy, 
  Check, 
  QrCode, 
  Globe, 
  Shield, 
  Zap,
  Sparkles,
  Clock,
  Archive,
  Star,
  MoreVertical,
  ChevronDown,
  Filter,
  Search,
  RefreshCw,
  Eye,
  AlertCircle,
  Smartphone,
  Bot,
  Monitor,
  Activity,
  Database,
  Plus,
  Send,
  X,
  Link,
  Inbox,
  Heart,
  Download,
  Trash2
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import QRCodeLib from 'qrcode'
import ComposeMessageModal from '@/components/features/compose-message-modal'
import DataProcessorPanel from '@/components/features/data-processor-panel'
import { CustomCheckbox } from '@/components/ui/custom-checkbox'
import { useInboxData, InboxItem } from '@/hooks/useInboxData'
import { formatRelativeTime, parseSource, getTypeColor } from '@/lib/inbox-utils'
import { toast } from 'sonner'
import { useIntelligenceSelector, useIntelligenceSelectorActions } from '@/hooks/useIntelligenceSelector'
import IntelligenceStatsModal from '@/components/features/intelligence-stats-modal'
import SelectorToolbar from '@/components/features/selector-toolbar'
import { BatchReviewModal } from '@/components/features/batch-review-modal'

export default function DashboardPage() {
  const {
    items,
    loading,
    error,
    unreadCount,
    starredCount,
    fetchData,
    markAsRead,
    toggleStar,
    markMultipleAsRead,
    refreshData
  } = useInboxData()

  // Intelligence selector state
  const { 
    selectorMode, 
    selectedIds, 
    showStatsModal, 
    showBatchReviewModal,
    toggleRecord, 
    openStatsModal, 
    closeStatsModal,
    closeBatchReviewModal,
    processBatch
  } = useIntelligenceSelector()
  
  const { 
    handleAddToQueue, 
    handleExitSelector, 
    handleToggleRecord, 
    selectedCount 
  } = useIntelligenceSelectorActions()

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<InboxItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [showIntelligence, setShowIntelligence] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [inboxUrl, setInboxUrl] = useState('')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [showStarredOnly, setShowStarredOnly] = useState(false)
  const [config, setConfig] = useState({
    isPublic: true,
    requiresApiKey: false,
    rateLimitPerHour: 1000,
    webhookUrl: ''
  })

  const supabase = createClientSupabaseClient()

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesUnread = !showUnreadOnly || !item.isRead
    const matchesStarred = !showStarredOnly || item.isStarred
    
    return matchesSearch && matchesUnread && matchesStarred
  })

  // Show toast notifications for errors
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Setup inbox URL on mount
  useEffect(() => {
    const setupInboxUrl = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          setInboxUrl(`https://api.enostics.com/v1/demo`)
          generateQRCode(`https://api.enostics.com/v1/demo`)
          return
        }

        // Get user's endpoint to build the correct URL
        const { data: endpoints } = await supabase
          .from('enostics_endpoints')
          .select('url_path')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1)

        const userEndpoint = endpoints?.[0]?.url_path || user.email?.split('@')[0] || 'demo'
        setInboxUrl(`https://api.enostics.com/v1/${userEndpoint}`)
        generateQRCode(`https://api.enostics.com/v1/${userEndpoint}`)
      } catch (error) {
        console.error('Error setting up inbox URL:', error)
        setInboxUrl(`https://api.enostics.com/v1/demo`)
        generateQRCode(`https://api.enostics.com/v1/demo`)
      }
    }

    setupInboxUrl()
  }, [supabase])

  const generateQRCode = async (url: string) => {
    try {
      const qrCodeDataURL = await QRCodeLib.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCode(qrCodeDataURL)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inboxUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }



  const getSourceIconElement = (iconType: string) => {
    switch (iconType) {
      case 'activity': return <Activity className="h-4 w-4 text-purple-400" />
      case 'globe': return <Globe className="h-4 w-4 text-blue-400" />
      case 'brain': return <Brain className="h-4 w-4 text-yellow-400" />
      case 'heart': return <Heart className="h-4 w-4 text-green-400" />
      case 'smartphone': return <Smartphone className="h-4 w-4 text-indigo-400" />
      default: return <Database className="h-4 w-4 text-gray-400" />
    }
  }

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map(item => item.id))
    }
  }

  const openEventDetails = (item: InboxItem) => {
    setSelectedEvent(item)
    // Mark as read using the hook function
    if (!item.isRead) {
      markAsRead(item.id)
    }
  }

  const handleToggleStar = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    await toggleStar(id)
  }

  const handleMarkSelectedAsRead = async () => {
    if (selectedItems.length > 0) {
      await markMultipleAsRead(selectedItems)
      setSelectedItems([])
      toast.success(`Marked ${selectedItems.length} items as read`)
    }
  }

  const handleDeleteSelected = async () => {
    // This would require implementing a delete endpoint
    toast.info('Delete functionality coming soon!')
  }

  const handleExportSelected = async () => {
    if (selectedItems.length === 0) return
    
    try {
      const selectedData = items.filter(item => selectedItems.includes(item.id))
      const exportData = selectedData.map(item => ({
        id: item.id,
        sender: item.sender,
        subject: item.subject,
        type: item.type,
        receivedAt: item.receivedAt,
        data: item.data
      }))
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inbox-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(`Exported ${selectedItems.length} items`)
    } catch (error) {
      toast.error('Failed to export items')
    }
  }

  // Update subtitle with record counts
  useEffect(() => {
    const updateSubtitle = () => {
      const subtitle = `${filteredItems.length} records • ${unreadCount} unread`
      const event = new CustomEvent('updateSubtitle', { 
        detail: { subtitle } 
      })
      window.dispatchEvent(event)
    }

    updateSubtitle()
  }, [filteredItems.length, unreadCount])

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--secondary-bg))]">
      {/* Hero Section - Fixed at top */}
      <div className="flex-shrink-0 bg-[hsl(var(--primary-bg))] border-b border-[hsl(var(--border-color))] shadow-sm">
        {/* Status Bar */}
        <div className="h-10 bg-[hsl(var(--hover-bg))] border-b border-[hsl(var(--border-color))] flex items-center justify-between px-6">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[hsl(var(--text-muted))]">LIVE</span>
            </div>
            <div className="text-[hsl(var(--text-muted))]">|</div>
            <div className="text-[hsl(var(--text-muted))]">API: {inboxUrl}</div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-6 px-2 text-xs"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copied ? 'Copied!' : 'Copy endpoint URL'}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-4 text-xs text-[hsl(var(--text-muted))]">
            <span>Records: {filteredItems.length}</span>
            <span>Unread: {unreadCount}</span>
            <span>Starred: {starredCount}</span>
          </div>
        </div>

        {/* Control Bar */}
        <div className="h-12 bg-[hsl(var(--primary-bg))] border-b border-[hsl(var(--border-color))] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => setShowCompose(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Compose
            </Button>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={showUnreadOnly}
                onCheckedChange={setShowUnreadOnly}
                id="unread-only"
              />
              <Label htmlFor="unread-only" className="text-xs">Unread only</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={showStarredOnly}
                onCheckedChange={setShowStarredOnly}
                id="starred-only"
              />
              <Label htmlFor="starred-only" className="text-xs">Starred only</Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-[hsl(var(--text-muted))]" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 w-64 bg-[hsl(var(--hover-bg))] border-[hsl(var(--border-color))] text-sm text-[hsl(var(--text-primary))]"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3 w-3" />
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={refreshData}
                  disabled={loading}
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Refresh data
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 relative"
                  onClick={() => {
                    console.log('Brain icon clicked - opening intelligence stats modal!')
                    openStatsModal()
                  }}
                >
                  <Brain className="h-3 w-3 text-purple-400" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                AI Intelligence
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Records List - Scrollable content area */}
      <div className="flex-1 overflow-hidden">
        {/* Table Header - Fixed */}
        <div className="h-10 bg-[hsl(var(--hover-bg))] border-b border-[hsl(var(--border-color))] flex items-center px-6 text-xs font-medium text-[hsl(var(--text-muted))] sticky top-0 z-10">
          <div className="w-8 flex justify-center">
            <CustomCheckbox
              checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
              onChange={selectAll}
              size="sm"
            />
          </div>
          <div className="w-8"></div>
          <div className="w-32">SOURCE</div>
          <div className="w-24">TYPE</div>
          <div className="flex-1 min-w-0">SUBJECT</div>
          <div className="w-32">RECEIVED</div>
          <div className="w-8"></div>
        </div>

        {/* Records - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-[hsl(var(--primary-bg))] relative">
          {/* Selector Mode Overlay */}
          {selectorMode && (
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-transparent pointer-events-none z-10" />
          )}
          
          {loading && filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[hsl(var(--text-muted))]" />
                <p className="text-sm text-[hsl(var(--text-muted))]">Loading inbox...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Inbox className="h-16 w-16 mx-auto mb-4 text-[hsl(var(--text-muted))] opacity-50" />
                <h3 className="text-lg font-medium text-[hsl(var(--text-primary))] mb-2">No records found</h3>
                <p className="text-sm text-[hsl(var(--text-muted))] mb-4">
                  {searchQuery ? 'Try adjusting your search terms' : 'Send data to your endpoint to see it here'}
                </p>
                {!searchQuery && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCompose(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Send Test Data
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredItems.map((item) => {
              const timeInfo = formatRelativeTime(item.receivedAt)
              const isSelected = selectedIds.includes(item.id)
              
              return (
                <div
                  key={item.id}
                  className={`h-12 flex items-center px-6 transition-all duration-200 group border-b border-[hsl(var(--border-color))] relative z-20 ${
                    selectorMode 
                      ? `cursor-pointer hover:bg-purple-500/20 ${isSelected ? 'bg-purple-500/30 border-l-4 border-l-purple-500' : ''}`
                      : `hover:bg-[hsl(var(--hover-bg))] cursor-pointer ${!item.isRead ? 'bg-[hsl(var(--accent-bg))]' : 'bg-transparent'}`
                  } ${selectedItems.includes(item.id) && !selectorMode ? 'bg-[hsl(var(--accent-bg))] border-l-4 border-l-blue-500' : ''}`}
                  onClick={() => {
                    if (selectorMode) {
                      handleToggleRecord(item.id)
                    } else {
                      openEventDetails(item)
                    }
                  }}
                >
                  <div className="w-8 flex justify-center">
                    <div onClick={(e) => e.stopPropagation()}>
                      {selectorMode ? (
                        <CustomCheckbox
                          checked={isSelected}
                          onChange={() => handleToggleRecord(item.id)}
                          size="sm"
                        />
                      ) : (
                        <CustomCheckbox
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                  <div className="w-8 flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => handleToggleStar(item.id, e)}
                          className="transition-all duration-200 hover:scale-110"
                        >
                          <Star className={`h-3 w-3 transition-colors ${
                            item.isStarred 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-[hsl(var(--text-muted))] hover:text-yellow-400 stroke-1'
                          }`} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {item.isStarred ? 'Unstar' : 'Star'}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="w-32 flex items-center gap-2 min-w-0">
                    {getSourceIconElement(item.sourceIcon)}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-[hsl(var(--text-secondary))] truncate">
                          {item.sender}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {item.sender}
                        {item.userAgent && (
                          <div className="text-xs text-[hsl(var(--text-muted))] mt-1">
                            {item.userAgent}
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="w-24">
                    <Badge variant="outline" className={`text-xs ${getTypeColor(item.type)}`}>
                      {item.type}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={`text-sm truncate max-w-[300px] ${!item.isRead ? 'font-medium text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-secondary))]'}`}>
                            {item.subject}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-sm">
                            <div className="font-medium">{item.subject}</div>
                            <div className="text-xs text-[hsl(var(--text-muted))] mt-1">
                              {item.preview}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      {!item.isRead && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 animate-pulse"></div>
                      )}
                    </div>
                    <div className="text-xs text-[hsl(var(--text-muted))] truncate">
                      {item.preview}
                    </div>
                  </div>
                  <div className="w-32 text-xs text-[hsl(var(--text-muted))] text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="hover:text-[hsl(var(--text-secondary))] transition-colors">
                          {timeInfo.relative}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {timeInfo.full}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="w-8 flex justify-center">
                    <ChevronDown className="h-3 w-3 text-[hsl(var(--text-muted))] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rotate-[-90deg]" />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[hsl(var(--primary-bg))] p-3 shadow-lg rounded-xl border border-[hsl(var(--border-color))] flex items-center gap-2 z-50 animate-in slide-in-from-bottom-4">
          <span className="text-sm text-[hsl(var(--text-muted))] mr-2">
            {selectedItems.length} selected
          </span>
          <Button 
            size="sm" 
            onClick={handleMarkSelectedAsRead}
            className="h-8"
          >
            <Check className="h-3 w-3 mr-1" />
            Mark Read
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportSelected}
            className="h-8"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDeleteSelected}
            className="h-8 text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedItems([])}
            className="h-8"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-[hsl(var(--primary-bg))] border-[hsl(var(--border-color))]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[hsl(var(--text-primary))]">
              <Database className="h-5 w-5" />
              Event Details
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-[hsl(var(--text-muted))] mb-1">Sender</h3>
                    <p className="text-sm text-[hsl(var(--text-primary))]">{selectedEvent.sender}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[hsl(var(--text-muted))] mb-1">Type</h3>
                    <Badge variant="outline" className={`text-xs ${getTypeColor(selectedEvent.type)}`}>
                      {selectedEvent.type}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[hsl(var(--text-muted))] mb-1">Subject</h3>
                  <p className="text-sm text-[hsl(var(--text-primary))]">{selectedEvent.subject}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[hsl(var(--text-muted))] mb-1">Received</h3>
                  <p className="text-sm text-[hsl(var(--text-primary))]">{selectedEvent.timestamp}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-3 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Payload
                  </h3>
                  <div className="bg-[hsl(var(--hover-bg))] p-4 border border-[hsl(var(--border-color))] rounded-lg">
                    <pre className="text-sm text-[hsl(var(--text-secondary))] whitespace-pre-wrap font-mono overflow-x-auto">
                      {JSON.stringify(selectedEvent.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Compose Message Modal */}
      <ComposeMessageModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        onSent={(result) => {
          // Data will be automatically updated via real-time subscription
          console.log('Message sent:', result)
          toast.success('Message sent successfully!')
        }}
      />

      {/* Intelligence Stats Modal */}
      <IntelligenceStatsModal
        isOpen={showStatsModal}
        onClose={closeStatsModal}
      />

      {/* Batch Review Modal */}
      <BatchReviewModal
        open={showBatchReviewModal}
        initialIds={selectedIds}
        onConfirm={async ({ acceptedIds, branchName }) => {
          await processBatch(acceptedIds, branchName)
          toast.success(`Processing ${acceptedIds.length} records in batch "${branchName}"`)
        }}
        onCancel={closeBatchReviewModal}
      />

      {/* Selector Toolbar */}
      <SelectorToolbar
        visible={selectorMode}
        selectedCount={selectedCount}
        onAddToQueue={async (processingPlan: string) => {
          await handleAddToQueue(processingPlan)
        }}
        onExit={handleExitSelector}
      />

      {/* Data Processor Modal */}
      <Dialog open={showIntelligence} onOpenChange={setShowIntelligence}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto bg-[hsl(var(--primary-bg))] border-[hsl(var(--border-color))]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[hsl(var(--text-primary))]">
              <Brain className="h-5 w-5 text-purple-400" />
              Universal Data Processor
              <Badge variant="outline" className="ml-2">
                Live
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <DataProcessorPanel className="py-4" />
        </DialogContent>
      </Dialog>
    </div>
  )
}