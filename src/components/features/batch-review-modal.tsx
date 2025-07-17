'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, ArrowLeftRight } from 'lucide-react'

interface BatchReviewModalProps {
  open: boolean
  initialIds: string[]
  onConfirm: (data: { acceptedIds: string[]; branchName: string }) => void
  onCancel: () => void
}

interface RecordColumnProps {
  title: string
  ids: string[]
  records: Record<string, any>[]
  onToggle: (id: string) => void
  estimatedCost: number
  isAccepted?: boolean
}

// Record column component for accepted/rejected lists
function RecordColumn({ title, ids, records, onToggle, estimatedCost, isAccepted = false }: RecordColumnProps) {
  const filteredRecords = records.filter(record => ids.includes(record.id))
  
  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {isAccepted ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          {title}
          <Badge variant={isAccepted ? "default" : "secondary"}>
            {ids.length}
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Est. cost: ${estimatedCost.toFixed(4)}
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-2">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              onClick={() => onToggle(record.id)}
              className={`
                p-3 rounded-lg border cursor-pointer transition-all
                hover:shadow-md hover:border-primary/50
                ${isAccepted 
                  ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                  : 'bg-red-50 border-red-200 hover:bg-red-100'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {record.source || 'Unknown Source'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {record.data_type || 'Unknown Type'} • {new Date(record.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ArrowLeftRight className="h-4 w-4 text-muted-foreground ml-2" />
              </div>
            </div>
          ))}
          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No records in this list</p>
              <p className="text-xs">Click records from the other side to move them here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for batch cost estimation
function useBatchCostEstimate(recordIds: string[]) {
  const [cost, setCost] = useState(0)
  
  useEffect(() => {
    if (recordIds.length === 0) {
      setCost(0)
      return
    }
    
    // Calculate cost based on record count and processing plan
    // This is a simplified calculation - in production, this would
    // call the same endpoint used by the intelligence stats modal
    const baseCostPerRecord = 0.0025 // $0.0025 per record for Auto Basic
    setCost(recordIds.length * baseCostPerRecord)
  }, [recordIds])
  
  return cost
}

export function BatchReviewModal({ open, initialIds, onConfirm, onCancel }: BatchReviewModalProps) {
  const [accepted, setAccepted] = useState<string[]>(initialIds)
  const [rejected, setRejected] = useState<string[]>([])
  const [branchName, setBranchName] = useState('')
  const [records, setRecords] = useState<Record<string, any>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Cost estimation for each list
  const acceptedCost = useBatchCostEstimate(accepted)
  const rejectedCost = useBatchCostEstimate(rejected)
  
  // Fetch record details when modal opens
  useEffect(() => {
    if (open && initialIds.length > 0) {
      fetchRecordDetails()
    }
  }, [open, initialIds])
  
  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setAccepted(initialIds)
      setRejected([])
      setBranchName('')
    }
  }, [open, initialIds])
  
  const fetchRecordDetails = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/data-processor/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: initialIds })
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecords(data.records || [])
      }
    } catch (error) {
      console.error('Failed to fetch record details:', error)
      // Use fallback mock data
      setRecords(initialIds.map(id => ({
        id,
        source: 'Mock Source',
        data_type: 'Mock Type',
        created_at: new Date().toISOString()
      })))
    } finally {
      setIsLoading(false)
    }
  }
  
  const toggleRecord = (id: string) => {
    if (accepted.includes(id)) {
      // Move from accepted to rejected
      setAccepted(prev => prev.filter(x => x !== id))
      setRejected(prev => [...prev, id])
    } else {
      // Move from rejected to accepted
      setRejected(prev => prev.filter(x => x !== id))
      setAccepted(prev => [...prev, id])
    }
  }
  
  const handleConfirm = () => {
    if (accepted.length > 0 && branchName.trim()) {
      onConfirm({
        acceptedIds: accepted,
        branchName: branchName.trim()
      })
    }
  }
  
  const generateSuggestedBranchName = () => {
    const now = new Date()
    const month = now.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()
    const day = now.getDate()
    return `batch-${month}-${day}`
  }
  
  if (!open) return null
  
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-6xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review Batch Processing</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Review and organize your selected records before processing. Click records to move them between accepted and rejected lists.
          </p>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <RecordColumn
                title="Accepted"
                ids={accepted}
                records={records}
                onToggle={toggleRecord}
                estimatedCost={acceptedCost}
                isAccepted={true}
              />
              <RecordColumn
                title="Rejected"
                ids={rejected}
                records={records}
                onToggle={toggleRecord}
                estimatedCost={rejectedCost}
                isAccepted={false}
              />
            </div>
            
            <div className="mt-6 space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Processing {accepted.length} records
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total estimated cost: ${acceptedCost.toFixed(4)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBranchName(generateSuggestedBranchName())}
                >
                  Generate Name
                </Button>
              </div>
              
              <Input
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Branch name (e.g. glucose-labs-july)"
                className="w-full"
              />
              
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  disabled={!accepted.length || !branchName.trim()}
                  onClick={handleConfirm}
                >
                  Process Batch ({accepted.length} records)
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 