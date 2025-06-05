import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import lingoCompiler from "lingo.dev/compiler"

export default defineConfig(() =>
  lingoCompiler.vite({
    sourceRoot: "src",
    targetLocales: ["es", "fr", "de"],
    models: {
      "*:*": "groq:mistral-saba-24b",
    },
  })({
    plugins: [react()],
  }),
)