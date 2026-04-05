/**
 * Vitest setup — mocks better-sqlite3 with a pure-JS Map-backed implementation.
 *
 * better-sqlite3 is a native module that requires pre-built binaries.
 * In test environments the binary may not be available, so we replace it
 * with a structurally-equivalent in-memory implementation that honours
 * the same UPSERT semantics used by BotDatabase.
 */
import { vi } from 'vitest'

// ----------------------------------------------------------------
// Minimal better-sqlite3 mock
// ----------------------------------------------------------------

type Row = Record<string, unknown>

interface MockStatement {
  get(...params: unknown[]): Row | undefined
  run(...params: unknown[]): void
  all(...params: unknown[]): Row[]
}

function makeMockDb() {
  // Each table is stored as Map<primaryKey, Row>
  const tables = new Map<string, Map<string, Row>>()

  function getTable(name: string): Map<string, Row> {
    if (!tables.has(name)) tables.set(name, new Map())
    return tables.get(name)!
  }

  function parseCreateTable(sql: string): void {
    // Extract table name from "CREATE TABLE IF NOT EXISTS <name> (...)"
    const match = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i)
    if (match) getTable(match[1])
  }

  function prepare(sql: string): MockStatement {
    const trimmed = sql.trim().replace(/\s+/g, ' ')

    // SELECT
    if (/^SELECT/i.test(trimmed)) {
      const tableMatch = trimmed.match(/FROM\s+(\w+)/i)
      const tableName = tableMatch?.[1] ?? ''
      const colMatch = trimmed.match(/SELECT\s+(.+?)\s+FROM/i)
      const cols = colMatch?.[1]?.split(',').map(c => c.trim()) ?? []
      const whereMatch = trimmed.match(/WHERE\s+(\w+)\s*=\s*\?/i)
      const whereCol = whereMatch?.[1] ?? ''

      return {
        get(...params: unknown[]): Row | undefined {
          const table = getTable(tableName)
          const key = String(params[0])
          const row = table.get(key)
          if (!row) return undefined
          if (cols.length === 1 && cols[0] === '*') return row
          const result: Row = {}
          for (const col of cols) result[col] = row[col]
          return result
        },
        run() {},
        all(...params: unknown[]): Row[] {
          const table = getTable(tableName)
          if (whereCol) {
            const key = String(params[0])
            const row = table.get(key)
            return row ? [row] : []
          }
          return Array.from(table.values())
        },
      }
    }

    // INSERT ... ON CONFLICT ... DO UPDATE (UPSERT)
    if (/^INSERT/i.test(trimmed) && /ON\s+CONFLICT/i.test(trimmed)) {
      const tableMatch = trimmed.match(/INTO\s+(\w+)/i)
      const tableName = tableMatch?.[1] ?? ''
      const colsMatch = trimmed.match(/\(([^)]+)\)\s+VALUES/i)
      const cols = colsMatch?.[1]?.split(',').map(c => c.trim()) ?? []
      const pkCol = cols[0] ?? ''

      return {
        get: () => undefined,
        run(...params: unknown[]): void {
          const table = getTable(tableName)
          const row: Row = {}
          cols.forEach((col, i) => { row[col] = params[i] })
          table.set(String(params[0]), row)
        },
        all: () => [],
      }
    }

    // DELETE
    if (/^DELETE/i.test(trimmed)) {
      const tableMatch = trimmed.match(/FROM\s+(\w+)/i)
      const tableName = tableMatch?.[1] ?? ''

      return {
        get: () => undefined,
        run(...params: unknown[]): void {
          const table = getTable(tableName)
          table.delete(String(params[0]))
        },
        all: () => [],
      }
    }

    // Fallback no-op
    return { get: () => undefined, run() {}, all: () => [] }
  }

  function exec(sql: string): void {
    // Parse CREATE TABLE statements
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean)
    for (const stmt of statements) {
      if (/^CREATE\s+TABLE/i.test(stmt)) parseCreateTable(stmt)
    }
  }

  function close(): void {
    tables.clear()
  }

  return { prepare, exec, close }
}

vi.mock('better-sqlite3', () => {
  const MockDatabase = vi.fn().mockImplementation((_path: string) => makeMockDb())
  return { default: MockDatabase }
})
