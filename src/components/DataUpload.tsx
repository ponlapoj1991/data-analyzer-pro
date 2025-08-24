import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Upload, FileText, Globe, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useDataStore } from '@/hooks/useDataStore'
import { insertSocialPosts, SocialPost } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface ParsedData {
  data: any[]
  columns: string[]
  preview: any[]
  issues: string[]
}

export const DataUpload = () => {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [googleSheetUrl, setGoogleSheetUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { setPosts, setColumns, setLoading } = useDataStore()
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsProcessing(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        let data: any[] = []
        const result = e.target?.result

        if (file.name.endsWith('.csv')) {
          Papa.parse(result as string, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              data = results.data as any[]
              processData(data)
            },
            error: (error) => {
              toast({
                title: "CSV Parse Error",
                description: error.message,
                variant: "destructive"
              })
              setIsProcessing(false)
            }
          })
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(result, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          data = XLSX.utils.sheet_to_json(worksheet)
          processData(data)
        }
      } catch (error) {
        toast({
          title: "File Processing Error",
          description: "Failed to process the uploaded file",
          variant: "destructive"
        })
        setIsProcessing(false)
      }
    }

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file)
    } else {
      reader.readAsBinaryString(file)
    }
  }, [toast])

  const processData = (data: any[]) => {
    if (data.length === 0) {
      toast({
        title: "Empty File",
        description: "The uploaded file contains no data",
        variant: "destructive"
      })
      setIsProcessing(false)
      return
    }

    const columns = Object.keys(data[0])
    const preview = data.slice(0, 5)
    const issues: string[] = []

    // Check for missing data
    const missingData = data.some(row => 
      Object.values(row).some(val => val === null || val === undefined || val === '')
    )
    if (missingData) issues.push('Contains missing values')

    // Check for duplicates
    const seen = new Set()
    const hasDuplicates = data.some(row => {
      const key = JSON.stringify(row)
      if (seen.has(key)) return true
      seen.add(key)
      return false
    })
    if (hasDuplicates) issues.push('Contains duplicate rows')

    setParsedData({ data, columns, preview, issues })
    setIsProcessing(false)
  }

  const handleGoogleSheetImport = async () => {
    if (!googleSheetUrl) return

    setIsProcessing(true)
    try {
      // Extract sheet ID from URL
      const sheetIdMatch = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
      if (!sheetIdMatch) {
        throw new Error('Invalid Google Sheets URL')
      }

      const sheetId = sheetIdMatch[1]
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`

      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch Google Sheet data')
      }

      const csvText = await response.text()
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data as any[])
        },
        error: (error) => {
          throw error
        }
      })
    } catch (error) {
      toast({
        title: "Google Sheets Import Error",
        description: error instanceof Error ? error.message : "Failed to import from Google Sheets",
        variant: "destructive"
      })
      setIsProcessing(false)
    }
  }

  const handleDataImport = async () => {
    if (!parsedData) return

    setLoading(true)
    try {
      // Map data to SocialPost format
      const posts: SocialPost[] = parsedData.data.map((row, index) => ({
        content: row.content || row.text || row.message || `Post ${index + 1}`,
        platform: row.platform || row.source || 'Unknown',
        sentiment: ['positive', 'negative', 'neutral'].includes(row.sentiment) 
          ? row.sentiment 
          : 'neutral',
        engagement: parseInt(row.engagement || row.likes || row.interactions || '0'),
        author: row.author || row.user || row.username || 'Anonymous',
        url: row.url || row.link,
        hashtags: row.hashtags ? row.hashtags.split(',').map((h: string) => h.trim()) : [],
        created_at: row.created_at || row.date || new Date().toISOString(),
        location: row.location || row.country,
        language: row.language || 'en',
        media_type: row.media_type || 'text',
        reach: parseInt(row.reach || row.impressions || '0')
      }))

      // Save to Supabase
      await insertSocialPosts(posts)
      
      // Update store
      setPosts(posts)
      setColumns(parsedData.columns.map(col => ({
        name: col,
        type: 'text',
        originalName: col,
        visible: true
      })))

      toast({
        title: "Data Imported Successfully",
        description: `Imported ${posts.length} social media posts`,
      })

      setParsedData(null)
    } catch (error) {
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Data Import
        </CardTitle>
        <CardDescription>
          Upload CSV/Excel files or connect to Google Sheets to import social media data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">File Upload</TabsTrigger>
            <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-primary">Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-foreground font-medium mb-2">
                    Drag & drop a file here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports CSV, Excel (.xlsx, .xls) files
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sheets" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-url">Google Sheets URL</Label>
              <Input
                id="sheet-url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Make sure the sheet is publicly accessible or share with view permissions
              </p>
            </div>
            <Button 
              onClick={handleGoogleSheetImport}
              disabled={!googleSheetUrl || isProcessing}
              className="w-full"
            >
              <Globe className="h-4 w-4 mr-2" />
              {isProcessing ? 'Importing...' : 'Import from Google Sheets'}
            </Button>
          </TabsContent>
        </Tabs>

        {parsedData && (
          <div className="mt-6 space-y-4">
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-3">Data Preview</h3>
              
              {/* Data Issues */}
              {parsedData.issues.length > 0 && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Data Issues Found:</strong>
                    <ul className="mt-1 list-disc pl-4">
                      {parsedData.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Data Stats */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">
                  {parsedData.data.length} rows
                </Badge>
                <Badge variant="outline">
                  {parsedData.columns.length} columns
                </Badge>
                <Badge variant={parsedData.issues.length > 0 ? "destructive" : "default"}>
                  {parsedData.issues.length > 0 ? (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  )}
                  {parsedData.issues.length > 0 ? 'Issues Found' : 'Clean Data'}
                </Badge>
              </div>

              {/* Data Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {parsedData.columns.map((col) => (
                          <th key={col} className="p-2 text-left font-medium">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.preview.map((row, index) => (
                        <tr key={index} className="border-t">
                          {parsedData.columns.map((col) => (
                            <td key={col} className="p-2 max-w-[200px] truncate">
                              {row[col]?.toString() || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setParsedData(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDataImport}
                  disabled={isProcessing}
                >
                  Import Data ({parsedData.data.length} rows)
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}