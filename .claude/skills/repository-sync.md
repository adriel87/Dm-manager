# repository-sync

TRIGGER when: a new entity is added, a new repository implementation is created, or the user asks to update/sync the repositories config.

## Job

Keep `src/infrastructure/config/repositories.ts` in sync with all existing repository implementations.

## Steps

### 1. Discover all repository implementations
Use Glob to find every implementation:
```
src/infrastructure/adapters/repositories/mongo/*.repository.ts
src/infrastructure/adapters/repositories/memory/*.repository.ts
```

### 2. Discover all domain repository interfaces
Use Glob to find every interface:
```
src/domain/**/*Repository.ts
```

### 3. Read the current repositories.ts
Read `src/infrastructure/config/repositories.ts` to understand what is already registered.

### 4. Detect what is missing
Cross-reference the discovered implementations against what is already in `repositories.ts`. An entity is missing if:
- It has a mongo implementation but is not in the `repositories` export object
- It has a memory implementation but is not in the `repositories` export object
- It exists in the domain but has no memory implementation yet (flag this to the user)

### 5. Update repositories.ts
For each missing entity:
- Add the mongo import from `@/infrastructure/adapters/repositories/mongo/<entity>.repository`
- Add the memory import from `@/infrastructure/adapters/repositories/memory/<entity>.repository`
- Add the entry to the `repositories` object: `<entity>: useMemory ? <entity>MemoryRepository : <entity>Repository`

If a memory implementation does not exist yet for a new entity, only add the mongo side and warn the user that the memory implementation is missing.

### 6. Update API routes (if needed)
If any route file still imports directly from `mongo/` or `memory/` instead of using `repositories.<entity>`, update those imports to use `repositories` from `@/infrastructure/config/repositories`.

Use Grep to detect direct repository imports in routes:
```
pattern: from "@/infrastructure/adapters/repositories/(mongo|memory)"
path: src/app/api/
```

## Rules

- Never remove existing entries from `repositories.ts` unless the implementation file no longer exists
- Always use the `useMemory` ternary pattern — do not change the switching mechanism
- Do not modify the `const useMemory = process.env.REPOSITORY_TYPE === "memory"` line
- Named exports from repository files follow the pattern: `<entity>Repository` (mongo) and `<entity>MemoryRepository` (memory)
