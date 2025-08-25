import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Remove Supabase imports - use local types
export interface SocialPost {
  id?: string
  content: string
  platform: string
  sentiment: 'positive' | 'negative' | 'neutral'
  engagement: number
  author: string
  url?: string
  hashtags?: string[]
  created_at?: string
  published_at?: string
  location?: string
  language?: string
  media_type?: string
  reach?: number
}

export interface ColumnSchema {
  name: string
  type: 'text' | 'number' | 'date' | 'url' | 'sentiment' | 'array'
  originalName: string
  visible: boolean
  format?: string
}

export interface FilterState {
  column: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in'
  value: any
  condition: 'AND' | 'OR'
}

interface DataStore {
  // Data
  posts: SocialPost[]
  datasets: any[]
  currentDataset: string | null
  
  // Schema
  columns: ColumnSchema[]
  
  // Filters
  filters: FilterState[]
  dateRange: { start: Date | null; end: Date | null }
  
  // UI State
  isLoading: boolean
  selectedPlatforms: string[]
  selectedSentiments: string[]
  
  // Actions
  setPosts: (posts: SocialPost[]) => void
  addPost: (post: SocialPost) => void
  addPosts: (posts: SocialPost[]) => void
  setColumns: (columns: ColumnSchema[]) => void
  addFilter: (filter: FilterState) => void
  removeFilter: (index: number) => void
  clearFilters: () => void
  setDateRange: (range: { start: Date | null; end: Date | null }) => void
  setSelectedPlatforms: (platforms: string[]) => void
  setSelectedSentiments: (sentiments: string[]) => void
  setLoading: (loading: boolean) => void
  setCurrentDataset: (id: string | null) => void
  
  // Local storage functions
  loadPostsFromStorage: () => void
  savePostsToStorage: (posts: SocialPost[]) => void
  clearAllData: () => void
  
  // Computed
  getFilteredPosts: () => SocialPost[]
  getMetrics: () => {
    total: number
    uniqueAuthors: number
    totalEngagement: number
    totalReach: number
    sentimentBreakdown: Record<string, number>
    platformBreakdown: Record<string, number>
  }
}

const STORAGE_KEY = 'real-studio-posts'

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      // Initial state
      posts: [],
      datasets: [],
      currentDataset: null,
      columns: [],
      filters: [],
      dateRange: { start: null, end: null },
      isLoading: false,
      selectedPlatforms: [],
      selectedSentiments: [],
      
      // Actions
      setPosts: (posts) => {
        set({ posts })
        get().savePostsToStorage(posts)
      },
      
      addPost: (post) => {
        const newPost = { ...post, id: Date.now().toString() }
        const newPosts = [...get().posts, newPost]
        set({ posts: newPosts })
        get().savePostsToStorage(newPosts)
      },
      
      addPosts: (posts) => {
        const existingPosts = get().posts
        const newPosts = posts.map((post, index) => ({
          ...post,
          id: post.id || `${Date.now()}-${index}`
        }))
        const allPosts = [...existingPosts, ...newPosts]
        set({ posts: allPosts })
        get().savePostsToStorage(allPosts)
      },
      
      setColumns: (columns) => set({ columns }),
      addFilter: (filter) => set((state) => ({ filters: [...state.filters, filter] })),
      removeFilter: (index) => set((state) => ({
        filters: state.filters.filter((_, i) => i !== index)
      })),
      clearFilters: () => set({ filters: [], selectedPlatforms: [], selectedSentiments: [] }),
      setDateRange: (dateRange) => set({ dateRange }),
      setSelectedPlatforms: (selectedPlatforms) => set({ selectedPlatforms }),
      setSelectedSentiments: (selectedSentiments) => set({ selectedSentiments }),
      setLoading: (isLoading) => set({ isLoading }),
      setCurrentDataset: (currentDataset) => set({ currentDataset }),
      
      // Local storage functions
      loadPostsFromStorage: () => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            const posts = JSON.parse(stored)
            console.log('Loaded posts from localStorage:', posts.length)
            set({ posts })
            
            // Auto-generate columns if we have data
            if (posts.length > 0) {
              const samplePost = posts[0]
              const generatedColumns: ColumnSchema[] = Object.keys(samplePost).map(key => ({
                name: key,
                type: typeof samplePost[key] === 'number' ? 'number' : 'text',
                originalName: key,
                visible: true
              }))
              set({ columns: generatedColumns })
            }
          } else {
            console.log('No posts found in localStorage')
          }
        } catch (error) {
          console.error('Error loading from localStorage:', error)
        }
      },
      
      savePostsToStorage: (posts) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
          console.log('Saved posts to localStorage:', posts.length)
        } catch (error) {
          console.error('Error saving to localStorage:', error)
        }
      },
      
      clearAllData: () => {
        localStorage.removeItem(STORAGE_KEY)
        set({ 
          posts: [], 
          columns: [], 
          filters: [], 
          selectedPlatforms: [], 
          selectedSentiments: [] 
        })
        console.log('Cleared all data')
      },
      
      // Computed functions
      getFilteredPosts: () => {
        const state = get()
        let filtered = state.posts
        
        // Apply platform filter
        if (state.selectedPlatforms.length > 0) {
          filtered = filtered.filter(post => state.selectedPlatforms.includes(post.platform))
        }
        
        // Apply sentiment filter
        if (state.selectedSentiments.length > 0) {
          filtered = filtered.filter(post => state.selectedSentiments.includes(post.sentiment))
        }
        
        // Apply date range filter
        if (state.dateRange.start && state.dateRange.end) {
          filtered = filtered.filter(post => {
            const postDate = new Date(post.created_at || post.published_at || new Date())
            return postDate >= state.dateRange.start! && postDate <= state.dateRange.end!
          })
        }
        
        // Apply custom filters
        state.filters.forEach(filter => {
          filtered = filtered.filter(post => {
            const value = (post as any)[filter.column]
            switch (filter.operator) {
              case 'equals':
                return value === filter.value
              case 'contains':
                return value?.toString().toLowerCase().includes(filter.value.toLowerCase())
              case 'greater':
                return Number(value) > Number(filter.value)
              case 'less':
                return Number(value) < Number(filter.value)
              default:
                return true
            }
          })
        })
        
        return filtered
      },
      
      getMetrics: () => {
        const filtered = get().getFilteredPosts()
        const uniqueAuthors = new Set(filtered.map(p => p.author)).size
        const totalEngagement = filtered.reduce((sum, p) => sum + (p.engagement || 0), 0)
        const totalReach = filtered.reduce((sum, p) => sum + (p.reach || 0), 0)
        
        const sentimentBreakdown = filtered.reduce((acc, post) => {
          acc[post.sentiment] = (acc[post.sentiment] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        const platformBreakdown = filtered.reduce((acc, post) => {
          acc[post.platform] = (acc[post.platform] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        return {
          total: filtered.length,
          uniqueAuthors,
          totalEngagement,
          totalReach,
          sentimentBreakdown,
          platformBreakdown
        }
      }
    }),
    {
      name: 'real-studio-data-store',
      partialize: (state) => ({
        currentDataset: state.currentDataset,
        selectedPlatforms: state.selectedPlatforms,
        selectedSentiments: state.selectedSentiments,
        dateRange: state.dateRange,
        filters: state.filters
      })
    }
  )
)
