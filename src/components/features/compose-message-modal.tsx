'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { 
  Send, 
  X, 
  Search, 
  Star, 
  Heart, 
  Briefcase, 
  Users, 
  Shield,
  Plus,
  Loader2,
  User
} from 'lucide-react'

interface Contact {
  id: string
  contact_username: string
  contact_display_name: string
  contact_avatar_url?: string
  relationship_type: string
  is_favorite: boolean
  can_send_health_data: boolean
  can_send_financial_data: boolean
  can_send_location_data: boolean
  allowed_data_types: string[]
  last_sent_at?: string
  total_messages_sent: number
}

interface ComposeMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onSend?: (message: any) => void
  userTier?: 'free' | 'developer' | 'business'
  currentUser?: any
}

const relationshipIcons = {
  contact: Users,
  family: Heart,
  colleague: Briefcase,
  patient: Shield,
  doctor: Shield,
  team_member: Users,
  organization: Briefcase,
  self: User
}

const relationshipColors = {
  contact: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  family: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  colleague: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  patient: 'bg-green-500/10 text-green-400 border-green-500/20',
  doctor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  team_member: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  organization: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  self: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
}

export function ComposeMessageModal({ isOpen, onClose, onSend, userTier = 'free', currentUser }: ComposeMessageModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)

  // Form state
  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [dataType, setDataType] = useState('message')
  const [jsonPayload, setJsonPayload] = useState('{\n  "type": "message",\n  "content": ""\n}')

  // Load contacts
  useEffect(() => {
    if (isOpen) {
      loadContacts()
    }
  }, [isOpen])

  // Get allowed contacts based on user tier
  const getAllowedContacts = () => {
    if (userTier === 'free') {
      // Free users can only message themselves
      return currentUser ? [{
        id: 'self',
        contact_username: currentUser.email?.split('@')[0] || 'me',
        contact_display_name: 'Myself',
        contact_avatar_url: '',
        relationship_type: 'self',
        is_favorite: true,
        can_send_health_data: true,
        can_send_financial_data: true,
        can_send_location_data: true,
        allowed_data_types: ['all'],
        total_messages_sent: 0
      }] : []
    }
    // Developer and Business users can message all contacts
    return filteredContacts
  }

  // Filter contacts based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredContacts(contacts)
    } else {
      const filtered = contacts.filter(contact => 
        contact.contact_display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.contact_username.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredContacts(filtered)
    }
  }, [contacts, searchTerm])

  const loadContacts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
      }
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact)
    setRecipient(contact.contact_username)
    setSearchTerm('')
  }

  const handleSend = async () => {
    if (!recipient || !jsonPayload) return

    setSending(true)
    try {
      let payload
      try {
        payload = JSON.parse(jsonPayload)
      } catch (e) {
        alert('Invalid JSON payload')
        return
      }

      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_username: recipient,
          subject,
          message_body: messageBody,
          payload,
          message_type: dataType
        })
      })

      if (response.ok) {
        onSend?.(payload)
        onClose()
        // Reset form
        setRecipient('')
        setSubject('')
        setMessageBody('')
        setJsonPayload('{\n  "type": "message",\n  "content": ""\n}')
        setSelectedContact(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const addNewContact = async () => {
    if (!recipient) return

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_username: recipient,
          display_name: recipient,
          relationship_type: 'contact'
        })
      })

      if (response.ok) {
        await loadContacts()
        setShowAddContact(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add contact')
      }
    } catch (error) {
      console.error('Error adding contact:', error)
      alert('Failed to add contact')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] bg-enostics-dark border-enostics-gray-800 text-enostics-light">
        <DialogHeader className="border-b border-enostics-gray-800 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-enostics-light flex items-center gap-2">
              <Send className="w-5 h-5 text-enostics-blue" />
              Compose Message to Enostics User
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${
                userTier === 'free' ? 'border-gray-500 text-gray-400' :
                userTier === 'developer' ? 'border-blue-500 text-blue-400' :
                'border-purple-500 text-purple-400'
              }`}>
                {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
              </Badge>
              <button
                onClick={onClose}
                className="text-enostics-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-full gap-6">
          {/* Contacts Sidebar */}
          <div className="w-80 flex flex-col border-r border-enostics-gray-800 pr-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-enostics-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-enostics-gray-900 border-enostics-gray-700 text-enostics-light"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-enostics-blue" />
                </div>
              ) : getAllowedContacts().length === 0 ? (
                <div className="text-center py-8 text-enostics-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  {userTier === 'free' ? (
                    <div>
                      <p className="mb-2">Free Plan: Message Yourself</p>
                      <p className="text-xs text-enostics-gray-500 mb-4">
                        Upgrade to Developer or Business plan to message other users
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2">No contacts found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddContact(true)}
                        className="border-enostics-gray-700 text-enostics-light hover:bg-enostics-gray-800"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contact
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                getAllowedContacts().map((contact) => {
                  const RelationshipIcon = relationshipIcons[contact.relationship_type as keyof typeof relationshipIcons] || Users
                  const relationshipColor = relationshipColors[contact.relationship_type as keyof typeof relationshipColors] || relationshipColors.contact
                  
                  return (
                    <div
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id
                          ? 'bg-enostics-blue/20 border border-enostics-blue/30'
                          : 'bg-enostics-gray-900 hover:bg-enostics-gray-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          {contact.contact_avatar_url ? (
                            <img src={contact.contact_avatar_url} alt={contact.contact_display_name} />
                          ) : (
                            <div className="w-full h-full bg-enostics-blue/20 flex items-center justify-center text-enostics-blue font-semibold">
                              {contact.contact_display_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-enostics-light truncate">
                              {contact.contact_display_name}
                            </h4>
                            {contact.is_favorite && (
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            )}
                          </div>
                          <p className="text-sm text-enostics-gray-400 truncate">
                            @{contact.contact_username}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${relationshipColor}`}>
                              <RelationshipIcon className="w-3 h-3 mr-1" />
                              {contact.relationship_type}
                            </Badge>
                            {contact.total_messages_sent > 0 && (
                              <span className="text-xs text-enostics-gray-500">
                                {contact.total_messages_sent} sent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Compose Form */}
          <div className="flex-1 flex flex-col">
            <div className="space-y-4 mb-6">
              {/* Recipient */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-enostics-gray-300 w-16">To:</label>
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    placeholder="Enter Enostics username..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="bg-enostics-gray-900 border-enostics-gray-700 text-enostics-light"
                  />
                  {recipient && !selectedContact && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addNewContact}
                      className="border-enostics-gray-700 text-enostics-light hover:bg-enostics-gray-800"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-enostics-gray-300 w-16">Subject:</label>
                <Input
                  placeholder="Optional subject line..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 bg-enostics-gray-900 border-enostics-gray-700 text-enostics-light"
                />
              </div>

              {/* Data Type */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-enostics-gray-300 w-16">Type:</label>
                <select
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value)}
                  className="px-3 py-2 bg-enostics-gray-900 border border-enostics-gray-700 rounded-md text-enostics-light"
                >
                  <option value="message">Message</option>
                  <option value="data_share">Data Share</option>
                  <option value="notification">Notification</option>
                  <option value="request">Request</option>
                </select>
              </div>
            </div>

            {/* Message Body */}
            <div className="mb-4">
              <label className="text-sm font-medium text-enostics-gray-300 mb-2 block">Message:</label>
              <Textarea
                placeholder="Optional message body..."
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={3}
                className="bg-enostics-gray-900 border-enostics-gray-700 text-enostics-light"
              />
            </div>

            {/* JSON Payload */}
            <div className="flex-1 flex flex-col">
              <label className="text-sm font-medium text-enostics-gray-300 mb-2 block">JSON Payload:</label>
              <Textarea
                value={jsonPayload}
                onChange={(e) => setJsonPayload(e.target.value)}
                className="flex-1 font-mono text-sm bg-enostics-gray-900 border-enostics-gray-700 text-enostics-light"
                placeholder="Enter JSON data to send..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-enostics-gray-800">
              <div className="text-sm text-enostics-gray-400">
                {selectedContact && (
                  <span>
                    Sending to {selectedContact.contact_display_name} 
                    ({selectedContact.contact_username})
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-enostics-gray-700 text-enostics-light hover:bg-enostics-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!recipient || !jsonPayload || sending}
                  className="bg-enostics-blue hover:bg-enostics-blue/80 text-white"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 