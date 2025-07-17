/**
 * Claude Code Agent for Enostics
 * 
 * Integrates Anthropic's Claude Code terminal tool into Enostics endpoints
 * Provides intelligent coding assistance accessible via user API endpoints
 */

import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

export interface ClaudeCodeSession {
  id: string
  userId: string
  process?: ChildProcess
  status: 'idle' | 'active' | 'busy' | 'error'
  workspace: string
  lastActivity: Date
  history: ClaudeCodeInteraction[]
}

export interface ClaudeCodeInteraction {
  id: string
  timestamp: Date
  type: 'command' | 'response' | 'file_edit' | 'git_operation'
  input: string
  output?: string
  files_changed?: string[]
  success: boolean
  metadata?: Record<string, any>
}

export interface ClaudeCodeRequest {
  command: string
  workspace?: string
  context?: {
    files?: string[]
    description?: string
    goal?: string
  }
  options?: {
    auto_approve?: boolean
    timeout?: number
    max_files?: number
  }
}

export interface ClaudeCodeResponse {
  sessionId: string
  success: boolean
  output: string
  files_changed: string[]
  git_operations: string[]
  suggestions: string[]
  next_steps: string[]
  metadata: {
    execution_time: number
    tokens_used?: number
    model_version?: string
  }
}

export class ClaudeCodeAgent {
  private sessions = new Map<string, ClaudeCodeSession>()
  private isEnabled = true
  private maxSessions = 10
  private sessionTimeout = 30 * 60 * 1000 // 30 minutes

  constructor() {
    this.startSessionCleanup()
  }

  /**
   * Execute a Claude Code command
   */
  async executeCommand(userId: string, request: ClaudeCodeRequest): Promise<ClaudeCodeResponse> {
    const sessionId = this.getOrCreateSession(userId, request.workspace)
    const session = this.sessions.get(sessionId)!
    
    const startTime = Date.now()
    
    try {
      console.log(`🤖 Claude Code: Executing command for user ${userId}`)
      
      // Validate workspace
      const workspace = await this.validateWorkspace(request.workspace || `/tmp/enostics-${userId}`)
      
      // Prepare context if provided
      if (request.context) {
        await this.setupContext(workspace, request.context)
      }
      
      // Execute Claude Code command
      const result = await this.runClaudeCode(workspace, request.command, request.options)
      
      // Record interaction
      const interaction: ClaudeCodeInteraction = {
        id: this.generateInteractionId(),
        timestamp: new Date(),
        type: 'command',
        input: request.command,
        output: result.output,
        files_changed: result.files_changed,
        success: result.success,
        metadata: result.metadata
      }
      
      session.history.push(interaction)
      session.lastActivity = new Date()
      session.status = 'idle'
      
      const response: ClaudeCodeResponse = {
        sessionId,
        success: result.success,
        output: result.output,
        files_changed: result.files_changed,
        git_operations: result.git_operations || [],
        suggestions: result.suggestions || [],
        next_steps: result.next_steps || [],
        metadata: {
          execution_time: Date.now() - startTime,
          tokens_used: result.metadata?.tokens_used,
          model_version: result.metadata?.model_version
        }
      }
      
      console.log(`✅ Claude Code: Command executed successfully in ${response.metadata.execution_time}ms`)
      return response
      
    } catch (error) {
      console.error(`❌ Claude Code: Error executing command:`, error)
      session.status = 'error'
      
      throw error
    }
  }

  /**
   * Get or create a coding session for a user
   */
  private getOrCreateSession(userId: string, workspace?: string): string {
    // Look for existing session
    const existingSession = Array.from(this.sessions.values())
      .find(s => s.userId === userId && s.workspace === (workspace || `/tmp/enostics-${userId}`))
    
    if (existingSession) {
      return existingSession.id
    }
    
    // Create new session
    const sessionId = this.generateSessionId()
    const session: ClaudeCodeSession = {
      id: sessionId,
      userId,
      status: 'idle',
      workspace: workspace || `/tmp/enostics-${userId}`,
      lastActivity: new Date(),
      history: []
    }
    
    this.sessions.set(sessionId, session)
    console.log(`🔧 Claude Code: Created new session ${sessionId} for user ${userId}`)
    
    return sessionId
  }

  /**
   * Validate and setup workspace directory
   */
  private async validateWorkspace(workspace: string): Promise<string> {
    try {
      const resolvedPath = path.resolve(workspace)
      
      // Create workspace if it doesn't exist
      await fs.mkdir(resolvedPath, { recursive: true })
      
      // Initialize git if not already a git repo
      try {
        await fs.access(path.join(resolvedPath, '.git'))
      } catch {
        // Initialize git repo
        await this.runCommand('git', ['init'], { cwd: resolvedPath })
      }
      
      return resolvedPath
    } catch (error) {
      console.error('Failed to validate workspace:', error)
      throw new Error(`Invalid workspace: ${workspace}`)
    }
  }

  /**
   * Setup context files and description for Claude
   */
  private async setupContext(workspace: string, context: any): Promise<void> {
    try {
      // Create CLAUDE.md file with context
      const claudeFile = path.join(workspace, 'CLAUDE.md')
      let content = '# Enostics Development Context\n\n'
      
      if (context.description) {
        content += `## Project Description\n${context.description}\n\n`
      }
      
      if (context.goal) {
        content += `## Current Goal\n${context.goal}\n\n`
      }
      
      if (context.files && context.files.length > 0) {
        content += `## Relevant Files\n`
        context.files.forEach((file: string) => {
          content += `- ${file}\n`
        })
        content += '\n'
      }
      
      content += `## Enostics Guidelines\n`
      content += `- Follow the universal endpoint-first architecture\n`
      content += `- Use TypeScript and Next.js patterns\n`
      content += `- Maintain RESTful API design\n`
      content += `- Ensure proper error handling and logging\n`
      
      await fs.writeFile(claudeFile, content)
      
    } catch (error) {
      console.error('Failed to setup context:', error)
    }
  }

  /**
   * Run Claude Code with specific command
   */
  private async runClaudeCode(workspace: string, command: string, options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const args = []
      
      // Add headless mode for API usage
      args.push('-p', command)
      
      // Add auto-approve if requested
      if (options.auto_approve) {
        args.push('--dangerously-skip-permissions')
      }
      
      // Add JSON output
      args.push('--output-format', 'stream-json')
      
      const process = spawn('claude', args, {
        cwd: workspace,
        stdio: ['pipe', 'pipe', 'pipe']
      })
      
      let stdout = ''
      let stderr = ''
      
      process.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      
      process.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      
      const timeout = setTimeout(() => {
        process.kill()
        reject(new Error('Claude Code command timed out'))
      }, options.timeout || 60000)
      
      process.on('close', (code) => {
        clearTimeout(timeout)
        
        try {
          const result = this.parseClaudeOutput(stdout, stderr, code === 0)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      
      process.on('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })
    })
  }

  /**
   * Parse Claude Code output
   */
  private parseClaudeOutput(stdout: string, stderr: string, success: boolean): any {
    try {
      const result = {
        success,
        output: stdout || stderr,
        files_changed: [] as string[],
        git_operations: [] as string[],
        suggestions: [] as string[],
        next_steps: [] as string[],
        metadata: {} as Record<string, any>
      }
      
      // Parse JSON output if available
      const lines = stdout.split('\n').filter(line => line.trim())
      
      for (const line of lines) {
        try {
          const json = JSON.parse(line)
          
          if (json.type === 'file_edit') {
            result.files_changed.push(json.file)
          } else if (json.type === 'git_operation') {
            result.git_operations.push(json.operation)
          } else if (json.type === 'suggestion') {
            result.suggestions.push(json.text)
          }
          
        } catch {
          // Not JSON, continue
        }
      }
      
      return result
    } catch (error) {
      console.error('Error parsing Claude output:', error)
      return {
        success: false,
        output: stderr || 'Failed to parse Claude output',
        files_changed: [],
        git_operations: [],
        suggestions: [],
        next_steps: [],
        metadata: {}
      }
    }
  }

  /**
   * Run a shell command
   */
  private async runCommand(command: string, args: string[], options: any = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, options)
      
      let output = ''
      
      process.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      process.stderr.on('data', (data) => {
        output += data.toString()
      })
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(output)
        } else {
          reject(new Error(`Command failed with code ${code}: ${output}`))
        }
      })
      
      process.on('error', reject)
    })
  }

  /**
   * Get session information
   */
  getSession(sessionId: string): ClaudeCodeSession | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * List all sessions for a user
   */
  getUserSessions(userId: string): ClaudeCodeSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
  }

  /**
   * Cleanup expired sessions
   */
  private startSessionCleanup(): void {
    setInterval(() => {
      const now = Date.now()
      
      for (const [sessionId, session] of Array.from(this.sessions.entries())) {
        if (now - session.lastActivity.getTime() > this.sessionTimeout) {
          this.sessions.delete(sessionId)
          console.log(`🧹 Claude Code: Cleaned up expired session ${sessionId}`)
        }
      }
    }, 5 * 60 * 1000) // Check every 5 minutes
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `claude-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate unique interaction ID
   */
  private generateInteractionId(): string {
    return `int-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
  }

  /**
   * Get agent status
   */
  getStatus(): any {
    return {
      enabled: this.isEnabled,
      active_sessions: this.sessions.size,
      max_sessions: this.maxSessions,
      uptime: process.uptime()
    }
  }

  /**
   * Enable/disable the agent
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    console.log(`🔧 Claude Code Agent ${enabled ? 'enabled' : 'disabled'}`)
  }
} 