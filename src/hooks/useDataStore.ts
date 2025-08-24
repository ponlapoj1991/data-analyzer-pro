import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SocialPost, FilterState, ColumnSchema, getSocialPosts } from '@/lib/supabase'

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
  setColumns: (columns: ColumnSchema[]) => void
  addFilter: (filter: FilterState) => void
  removeFilter: (index: number) => void
  clearFilters: () => void
  setDateRange: (range: { start: Date | null; end: Date | null }) => void
  setSelectedPlatforms: (platforms: string[]) => void
  setSelectedSentiments: (sentiments: string[]) => void
  setLoading: (loading: boolean) => void
  setCurrentDataset: (id: string | null) => void
  
  // New action to load data from Supabase
  loadPostsFromSupabase: () => Promise<void>
  
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
      setPosts: (posts) => set({ posts }),
      addPost: (post) => set((state) => ({ posts: [...state.posts, post] })),
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
      
      // New function to load data from Supabase
      loadPostsFromSupabase: async () => {
        try {
          set({ isLoading: true })
          console.log('Loading posts from Supabase...')
          const posts = await getSocialPosts()
          console.log('Loaded posts:', posts)
          
          if (posts && posts.length > 0) {
            set({ posts })
            
            // Auto-generate columns based on data
            const samplePost = posts[0]
            const generatedColumns: ColumnSchema[] = Object.keys(samplePost).map(key => ({
              name: key,
              type: typeof samplePost[key as keyof SocialPost] === 'number' ? 'number' : 'text',
              originalName: key,
              visible: true
            }))
            set({ columns: generatedColumns })
            
            console.log('Data loaded successfully:', posts.length, 'posts')
          } else {
            console.log('No posts found in database')
            set({ posts: [] })
          }
        } catch (error) {
          console.error('Error loading posts from Supabase:', error)
          set({ posts: [] })
        } finally {
          set({ isLoading: false })
        }
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
        dateRange: state.dateRange
      })
    }
  )
)
