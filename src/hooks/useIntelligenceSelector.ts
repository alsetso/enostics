import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface IntelligenceSelectorState {
  // Core state
  selectorMode: boolean
  selectedIds: string[]
  showStatsModal: boolean
  showDetailModal: boolean
  showBatchReviewModal: boolean
  
  // Batch processing state
  currentBatchId: string | null
  batchProcessing: boolean
  batchError: string | null
  
  // Actions
  enterSelectorMode: () => void
  exitSelectorMode: () => void
  toggleRecord: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  
  // Modal actions
  openStatsModal: () => void
  closeStatsModal: () => void
  openDetailModal: (batchId: string) => void
  closeDetailModal: () => void
  openBatchReviewModal: () => void
  closeBatchReviewModal: () => void
  
  // Batch processing actions
  setBatchProcessing: (processing: boolean) => void
  setBatchError: (error: string | null) => void
  setCurrentBatchId: (batchId: string | null) => void
  
  // Batch operations
  addToQueue: (recordIds: string[], processingPlan?: string) => Promise<string | null>
  processBatch: (acceptedIds: string[], branchName: string, processingPlan?: string) => Promise<string | null>
  
  // Reset function
  reset: () => void
}

export const useIntelligenceSelector = create<IntelligenceSelectorState>()(
  devtools(
    (set: any, get: any) => ({
      // Initial state
      selectorMode: false,
      selectedIds: [],
      showStatsModal: false,
      showDetailModal: false,
      showBatchReviewModal: false,
      currentBatchId: null,
      batchProcessing: false,
      batchError: null,
      
      // Selector mode actions
      enterSelectorMode: () => {
        set({ selectorMode: true, selectedIds: [] })
      },
      
      exitSelectorMode: () => {
        set({ selectorMode: false, selectedIds: [], batchError: null })
      },
      
      toggleRecord: (id: string) => {
        set((state: IntelligenceSelectorState) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((recordId: string) => recordId !== id)
            : [...state.selectedIds, id]
        }))
      },
      
      selectAll: (ids: string[]) => {
        set({ selectedIds: ids })
      },
      
      clearSelection: () => {
        set({ selectedIds: [] })
      },
      
      // Modal actions
      openStatsModal: () => {
        set({ showStatsModal: true })
      },
      
      closeStatsModal: () => {
        set({ showStatsModal: false })
      },
      
      openDetailModal: (batchId: string) => {
        set({ showDetailModal: true, currentBatchId: batchId })
      },
      
      closeDetailModal: () => {
        set({ showDetailModal: false, currentBatchId: null })
      },
      
      openBatchReviewModal: () => {
        set({ showBatchReviewModal: true })
      },
      
      closeBatchReviewModal: () => {
        set({ showBatchReviewModal: false })
      },
      
      // Batch processing actions
      setBatchProcessing: (processing: boolean) => {
        set({ batchProcessing: processing })
      },
      
      setBatchError: (error: string | null) => {
        set({ batchError: error })
      },
      
      setCurrentBatchId: (batchId: string | null) => {
        set({ currentBatchId: batchId })
      },
      
      // Add to queue operation (now just opens batch review modal)
      addToQueue: async (recordIds: string[], processingPlan: string = 'auto_basic') => {
        // Instead of immediately processing, open the batch review modal
        set({ showBatchReviewModal: true })
        return null // Return null since we're not processing yet
      },
      
      // Process batch after review
      processBatch: async (acceptedIds: string[], branchName: string, processingPlan: string = 'auto_basic') => {
        try {
          set({ batchProcessing: true, batchError: null })
          
          const response = await fetch('/api/data-processor/queue', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              record_ids: acceptedIds,
              processing_plan: processingPlan,
              branch_name: branchName
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to process batch')
          }
          
          const result = await response.json()
          const batchId = result.batch_id
          
          // Update state
          set({ 
            currentBatchId: batchId,
            batchProcessing: false,
            selectorMode: false,
            selectedIds: [],
            showBatchReviewModal: false,
            showStatsModal: true // Open stats modal to show batch progress
          })
          
          return batchId
        } catch (error) {
          console.error('Error processing batch:', error)
          set({ 
            batchError: error instanceof Error ? error.message : 'Unknown error',
            batchProcessing: false
          })
          return null
        }
      },
      
      // Reset all state
      reset: () => {
        set({
          selectorMode: false,
          selectedIds: [],
          showStatsModal: false,
          showDetailModal: false,
          showBatchReviewModal: false,
          currentBatchId: null,
          batchProcessing: false,
          batchError: null
        })
      }
    }),
    {
      name: 'intelligence-selector-storage',
      partialize: (state: IntelligenceSelectorState) => ({
        // Only persist some state across page reloads
        currentBatchId: state.currentBatchId,
        showStatsModal: state.showStatsModal,
        showDetailModal: state.showDetailModal
      })
    }
  )
)

// Convenience hook for common operations
export const useIntelligenceSelectorActions = () => {
  const store = useIntelligenceSelector()
  
  const handleAddToQueue = async (processingPlan: string = 'auto_basic') => {
    const { selectedIds, addToQueue } = store
    
    if (selectedIds.length === 0) {
      throw new Error('No records selected')
    }
    
    return await addToQueue(selectedIds, processingPlan)
  }
  
  const handleExitSelector = () => {
    store.exitSelectorMode()
  }
  
  const handleToggleRecord = (id: string) => {
    store.toggleRecord(id)
  }
  
  return {
    handleAddToQueue,
    handleExitSelector,
    handleToggleRecord,
    selectedCount: store.selectedIds.length,
    selectorMode: store.selectorMode,
    batchProcessing: store.batchProcessing,
    batchError: store.batchError
  }
} 