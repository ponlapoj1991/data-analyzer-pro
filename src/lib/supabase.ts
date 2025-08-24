import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dnnwkwlcguvuchyknmrq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubndrd2xjZ3V2dWNoeWtubXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDMyNDMsImV4cCI6MjA3MTYxOTI0M30.e7J_ID8cdClPifRe76bR9ZWmBAxCMYAB3K_UeVqs_G0'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
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

export interface Dataset {
  id: string
  name: string
  columns: ColumnSchema[]
  created_at: string
  updated_at: string
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

// Initialize database tables (removed RPC calls)
export async function initializeTables() {
  console.log('Initialize tables function called (RPC disabled)')
  // RPC functions removed to avoid 404 errors
  return Promise.resolve()
}

// Data operations
export async function insertSocialPosts(posts: SocialPost[]) {
  console.log('Inserting posts to Supabase:', posts.length)
  
  try {
    const { data, error } = await supabase
      .from('social_posts')
      .insert(posts)
      .select()
    
    if (error) {
      console.error('Insert error:', error)
      throw error
    }
    
    console.log('Posts inserted successfully:', data?.length)
    return data
  } catch (error) {
    console.error('Error inserting posts:', error)
    throw error
  }
}

export async function getSocialPosts(filters: FilterState[] = []) {
  console.log('Getting social posts from Supabase...')
  
  try {
    // Simple query first - just get all data
    let query = supabase
      .from('social_posts')
      .select('*')
      .order('id', { ascending: true })
    
    // Apply filters if provided
    filters.forEach(filter => {
      switch (filter.operator) {
        case 'equals':
          query = query.eq(filter.column, filter.value)
          break
        case 'contains':
          query = query.ilike(filter.column, `%${filter.value}%`)
          break
        case 'greater':
          query = query.gt(filter.column, filter.value)
          break
        case 'less':
          query = query.lt(filter.column, filter.value)
          break
        default:
          break
      }
    })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Query error:', error)
      throw error
    }
    
    console.log('Posts retrieved successfully:', data?.length || 0)
    return data || []
    
  } catch (error) {
    console.error('Error getting posts:', error)
    throw error
  }
}

export async function saveDataset(dataset: Omit<Dataset, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('datasets')
      .insert(dataset)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving dataset:', error)
    throw error
  }
}

export async function getDatasets() {
  try {
    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting datasets:', error)
    throw error
  }
}

// Test connection function
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase
      .from('social_posts')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Connection test failed:', error)
      return false
    }
    
    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.error('Connection test error:', error)
    return false
  }
}
