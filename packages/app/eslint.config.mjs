import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import nextPlugin from "eslint-config-next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...nextPlugin,
  
  {
    plugins: {
      import: await import("eslint-plugin-import").then(m => m.default),
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // Domain no puede importar de infrastructure, application, o presentation
            {
              target: "./src/domain/**/*",
              from: ["./src/infrastructure/**/*", "./src/application/**/*", "./src/presentation/**/*"],
              message: "Domain layer cannot import from infrastructure, application, or presentation layers"
            },
            
            // Application no puede importar de infrastructure o presentation
            {
              target: "./src/application/**/*", 
              from: ["./src/infrastructure/**/*", "./src/presentation/**/*"],
              message: "Application layer cannot import from infrastructure or presentation layers"
            },
            
            // Infrastructure no puede importar de presentation
            {
              target: "./src/infrastructure/**/*",
              from: ["./src/presentation/**/*"],
              message: "Infrastructure layer cannot import from presentation layer"
            }
          ]
        }
      ]
    },
  },
];

export default eslintConfig;
