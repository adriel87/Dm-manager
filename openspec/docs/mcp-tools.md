# MCP Tools Available

This document lists the Model Context Protocol (MCP) integrations available in this project.

## Context7 MCP

**Purpose**: Fresh library/API documentation lookup

### Tools:
- `context7_resolve-library-id` - Resolves package/library names to Context7 IDs
- `context7_query-docs` - Queries documentation and code examples for libraries

**Use case**: When you ask about specific libraries, frameworks, or APIs, I use Context7 to fetch fresh documentation rather than relying on potentially outdated training data.

---

## Engram MCP

**Purpose**: Persistent memory across sessions

### Tools:
- `engram_mem_save` - Save important observations/decisions
- `engram_mem_search` - Search past sessions
- `engram_mem_context` - Get recent session context
- `engram_mem_session_start` - Mark session start
- `engram_mem_session_end` - Mark session end
- `engram_mem_session_summary` - Save end-of-session summary
- `engram_mem_get_observation` - Get full observation by ID
- `engram_mem_update` - Update existing observation
- `engram_mem_delete` - Delete observation
- `engram_mem_timeline` - Show chronological context
- `engram_mem_suggest_topic_key` - Suggest stable topic keys
- `engram_mem_capture_passive` - Extract learnings from text
- `engram_mem_stats` - Show memory system statistics

**Use case**: Remembers architectural decisions, bug fixes, patterns, and context from previous sessions so you don't have to re-explain things.

---

## Usage Notes

- Engram is the primary persistent memory - survives across sessions and compactions
- Openspec (`openspec/`) stores SDD artifacts as file backup
- Both are used together as redundancy (see session 2026-03-11)
