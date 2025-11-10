/**
 * История проверок в LocalStorage
 */

export interface HistoryItem {
  task_id: string
  originality: number
  created_at: string
  preview: string
}

const HISTORY_KEY = 'antiplagiat_history'
const MAX_HISTORY = 10

export function addToHistory(item: HistoryItem) {
  if (typeof window === 'undefined') return
  
  const history = getHistory()
  const newHistory = [item, ...history.filter(h => h.task_id !== item.task_id)].slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function clearHistory() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(HISTORY_KEY)
}