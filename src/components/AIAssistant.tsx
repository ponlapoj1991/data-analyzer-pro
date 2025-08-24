import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Bot, Send, User, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react'
import { useDataStore } from '@/hooks/useDataStore'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  insights?: Insight[]
}

interface Insight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'summary'
  title: string
  description: string
  value?: string
  confidence?: number
}

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Social Listening Assistant. I can help you analyze your data, find insights, and provide recommendations. What would you like to know about your social media data?',
      timestamp: new Date(),
      insights: [
        {
          type: 'summary',
          title: 'Quick Tips',
          description: 'Ask me about trends, sentiment analysis, top performers, or anomalies in your data.'
        }
      ]
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { getFilteredPosts, getMetrics } = useDataStore()

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const generateAIResponse = async (userQuery: string): Promise<{ content: string; insights: Insight[] }> => {
    const posts = getFilteredPosts()
    const metrics = getMetrics()
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const query = userQuery.toLowerCase()
    
    if (query.includes('summary') || query.includes('overview')) {
      return {
        content: `Based on your current data filter, here's what I found: You have ${metrics.total} posts from ${metrics.uniqueAuthors} unique authors. The total engagement is ${metrics.totalEngagement} with a reach of ${metrics.totalReach}. The sentiment distribution shows interesting patterns worth exploring.`,
        insights: [
          {
            type: 'summary',
            title: 'Data Overview',
            description: `${metrics.total} posts analyzed`,
            value: `${metrics.uniqueAuthors} authors`
          },
          {
            type: 'trend',
            title: 'Engagement Trend',
            description: 'Total engagement across all platforms',
            value: metrics.totalEngagement.toLocaleString()
          }
        ]
      }
    }
    
    if (query.includes('sentiment')) {
      const sentimentData = metrics.sentimentBreakdown
      const dominant = Object.entries(sentimentData).sort(([,a], [,b]) => b - a)[0]
      return {
        content: `Your sentiment analysis shows that ${dominant[0]} sentiment dominates with ${dominant[1]} posts (${Math.round((dominant[1] as number)/(metrics.total)*100)}%). This indicates ${dominant[0] === 'positive' ? 'good brand perception' : dominant[0] === 'negative' ? 'areas needing attention' : 'neutral public opinion'}.`,
        insights: Object.entries(sentimentData).map(([sentiment, count]) => ({
          type: 'summary',
          title: `${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Sentiment`,
          description: `${count} posts (${Math.round((count as number)/metrics.total*100)}%)`,
          value: (count as number).toString()
        }))
      }
    }
    
    if (query.includes('trend') || query.includes('pattern')) {
      return {
        content: 'I\'ve identified several interesting trends in your data. The platform distribution shows varying engagement patterns, and there are notable peaks in activity during certain periods. Let me break down the key patterns I found.',
        insights: [
          {
            type: 'trend',
            title: 'Platform Performance',
            description: 'Facebook and Instagram show highest engagement',
            confidence: 85
          },
          {
            type: 'trend',
            title: 'Posting Frequency',
            description: 'Peak activity observed on weekdays',
            confidence: 92
          }
        ]
      }
    }
    
    if (query.includes('recommendation') || query.includes('advice')) {
      return {
        content: 'Based on your data analysis, I recommend focusing on positive sentiment amplification and addressing any negative feedback promptly. Consider increasing engagement on platforms with higher reach potential.',
        insights: [
          {
            type: 'recommendation',
            title: 'Engagement Strategy',
            description: 'Focus on platforms with highest positive sentiment'
          },
          {
            type: 'recommendation',
            title: 'Content Optimization',
            description: 'Analyze top-performing content patterns'
          }
        ]
      }
    }
    
    if (query.includes('anomaly') || query.includes('unusual')) {
      return {
        content: 'I\'ve detected a few anomalies in your dataset. There are some posts with unusually high engagement that might indicate viral content or sponsored promotion. There\'s also a spike in negative sentiment on specific dates worth investigating.',
        insights: [
          {
            type: 'anomaly',
            title: 'Engagement Spike',
            description: 'Unusual high engagement detected on 3 posts',
            confidence: 78
          },
          {
            type: 'anomaly',
            title: 'Sentiment Drop',
            description: 'Negative sentiment increase on Dec 20-22',
            confidence: 84
          }
        ]
      }
    }
    
    // Default response
    return {
      content: 'I understand you want to analyze your social media data. I can help with sentiment analysis, trend identification, performance metrics, anomaly detection, and strategic recommendations. Could you be more specific about what aspect you\'d like me to focus on?',
      insights: [
        {
          type: 'summary',
          title: 'Available Analysis',
          description: 'I can analyze sentiment, trends, performance, and anomalies'
        }
      ]
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      const { content, insights } = await generateAIResponse(input)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content,
        timestamp: new Date(),
        insights
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickPrompts = [
    'Summarize my data',
    'Analyze sentiment trends',
    'Find anomalies',
    'Give me recommendations',
    'Platform performance',
    'Top influencers'
  ]

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Social Listening Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about your data and get AI-powered insights
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              onClick={() => setInput(prompt)}
              className="text-xs"
            >
              {prompt}
            </Button>
          ))}
        </div>
        
        <Separator />
        
        {/* Messages */}
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[80%] space-y-2",
                  message.type === 'user' ? 'text-right' : 'text-left'
                )}>
                  <div className={cn(
                    "inline-block p-3 rounded-lg",
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  )}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {/* Insights */}
                  {message.insights && message.insights.length > 0 && (
                    <div className="space-y-2">
                      {message.insights.map((insight, index) => (
                        <div key={index} className="bg-card border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            {insight.type === 'trend' && <TrendingUp className="h-4 w-4 text-success" />}
                            {insight.type === 'anomaly' && <AlertTriangle className="h-4 w-4 text-warning" />}
                            {insight.type === 'recommendation' && <Lightbulb className="h-4 w-4 text-primary" />}
                            {insight.type === 'summary' && <Bot className="h-4 w-4 text-muted-foreground" />}
                            <span className="font-medium text-sm">{insight.title}</span>
                            {insight.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {insight.confidence}% confidence
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{insight.description}</p>
                          {insight.value && (
                            <p className="text-sm font-medium mt-1">{insight.value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask me about your social media data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}