import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dnnwkwlcguvuchyknmrq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubndrd2xjZ3V2dWNoeWtubXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwMzQxMDcsImV4cCI6MjA1MDYxMDEwN30.CXGdNAJQ7ZwFEm2KsV5Lf3iDQf0QKhNT89hM4kE9mfY'

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
  created_at: string
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

// Initialize database tables
export async function initializeTables() {
  // Create social_posts table
  const { error: postsError } = await supabase.rpc('create_posts_table')
  if (postsError && !postsError.message.includes('already exists')) {
    console.error('Error creating posts table:', postsError)
  }

  // Create datasets table
  const { error: datasetsError } = await supabase.rpc('create_datasets_table')
  if (datasetsError && !datasetsError.message.includes('already exists')) {
    console.error('Error creating datasets table:', datasetsError)
  }
}

// Data operations
export async function insertSocialPosts(posts: SocialPost[]) {
  const { data, error } = await supabase
    .from('social_posts')
    .insert(posts)
    .select()
  
  if (error) throw error
  return data
}

export async function getSocialPosts(filters: FilterState[] = []) {
  let query = supabase.from('social_posts').select('*')
  
  // Apply filters
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
  if (error) throw error
  return data
}

export async function saveDataset(dataset: Omit<Dataset, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('datasets')
    .insert(dataset)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getDatasets() {
  const { data, error } = await supabase
    .from('datasets')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}