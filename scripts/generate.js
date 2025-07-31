#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// Configuración de colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

// Utilidades
const toPascalCase = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
const toCamelCase = (str) => str.charAt(0).toLowerCase() + str.slice(1);
const toKebabCase = (str) => str.toLowerCase().replace(/\s+/g, '-');

// Función para crear directorio si no existe
async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

// Función para crear archivo vacío
async function createEmptyFile(filePath) {
  try {
    await fs.writeFile(filePath, '', { flag: 'wx' });
    console.log(`${colors.green}✓${colors.reset} Created: ${filePath}`);
  } catch (error) {
    if (error.code === 'EEXIST') {
      console.log(`${colors.yellow}⚠${colors.reset} Already exists: ${filePath}`);
    } else {
      throw error;
    }
  }
}

// Función principal para generar estructura
async function generateHexagonalStructure(entityName) {
  const kebabName = toKebabCase(entityName);
  const pascalName = toPascalCase(entityName);
  const camelName = toCamelCase(entityName);
  
  console.log(`\n${colors.cyan}🏗️  Generating hexagonal structure for: ${pascalName}${colors.reset}\n`);

  // Estructura de directorios y archivos
  const structure = [
    // DOMAIN - En carpeta específica de la entidad
    {
      dir: `src/domain/${camelName}`,
      file: `${camelName}.ts`
    },
    {
      dir: `src/domain/${camelName}`,
      file: `${camelName}Repository.ts`
    },
    
    // APPLICATION - Use Cases en carpeta específica de la entidad
    {
      dir: `src/application/useCases/${camelName}`,
      file: `create${pascalName}.ts`
    },
    {
      dir: `src/application/useCases/${camelName}`,
      file: `get${pascalName}.ts`
    },
    {
      dir: `src/application/useCases/${camelName}`,
      file: `getAll${pascalName}s.ts`
    },
    {
      dir: `src/application/useCases/${camelName}`,
      file: `update${pascalName}.ts`
    },
    {
      dir: `src/application/useCases/${camelName}`,
      file: `delete${pascalName}.ts`
    }
  ];

  // Crear estructura
  for (const item of structure) {
    await ensureDir(item.dir);
    const filePath = path.join(item.dir, item.file);
    await createEmptyFile(filePath);
  }

  console.log(`\n${colors.green}🎉 Successfully generated hexagonal structure for ${pascalName}!${colors.reset}`);
  console.log(`\n${colors.blue}📁 Created structure:${colors.reset}`);
  console.log(`
├── src/domain/${camelName}/
│   ├── ${camelName}.ts
│   └── ${camelName}Repository.ts
└── src/application/useCases/${camelName}/
    ├── create${pascalName}.ts
    ├── get${pascalName}.ts
    ├── getAll${pascalName}s.ts
    ├── update${pascalName}.ts
    └── delete${pascalName}.ts
  `);
}

// Función para obtener input del usuario
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Función principal
async function main() {
  try {
    console.log(`${colors.cyan}🏛️  Hexagonal Architecture Generator${colors.reset}`);
    console.log(`${colors.blue}Generate domain entities and use cases automatically${colors.reset}\n`);

    const entityName = await askQuestion('❓ What entity do you want to create? (e.g., Product, User, Order): ');
    
    if (!entityName || entityName.trim().length === 0) {
      console.log(`${colors.yellow}⚠️  Entity name cannot be empty${colors.reset}`);
      process.exit(1);
    }

    const trimmedName = entityName.trim();
    console.log(`\n${colors.blue}🔄 Generating structure for: ${toPascalCase(trimmedName)}${colors.reset}`);
    
    const confirm = await askQuestion(`${colors.yellow}Continue? (y/N): ${colors.reset}`);
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log(`${colors.yellow}❌ Generation cancelled${colors.reset}`);
      process.exit(0);
    }

    await generateHexagonalStructure(trimmedName);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}