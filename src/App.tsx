import { LingoProviderWrapper, loadDictionary } from "lingo.dev/react/client"

function App() {
  return (
    <LingoProviderWrapper loadDictionary={(locale) => loadDictionary(locale)}>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to Roots</h1>
          <p className="mt-4 text-lg text-gray-600">
            This is a multilingual application powered by Lingo.dev
          </p>
        </div>
      </div>
    </LingoProviderWrapper>
  )
}

export default App