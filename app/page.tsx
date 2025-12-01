import { TodoList } from "@/components/todo-list"
import { ThemeToggle } from "@/components/theme-toggle"
import { dAppConfig, contracts, network, validateConfig } from "@/config/contracts"

export default function Home() {
  // Using the centralized config instead of direct process.env access
  const { appName, appVersion } = dAppConfig;
  
  // Validate configuration on load (optional)
  const configValidation = validateConfig();
  
  return (
    <main className="min-h-screen bg-linear-to-br from-background to-muted/20 p-4 md:p-8">
      <div className="container mx-auto py-8">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {appName}
          </h1>
          <p className="text-muted-foreground">
            Stay organized and get things done
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            v{appVersion} • {network.chainName}
          </p>
        </div>
        
        {/* Example: Display contract addresses (for demonstration) */}
        <div className="mb-8 p-4 bg-muted/50 rounded-lg">
          <h2 className="text-sm font-semibold mb-2">dApp Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Network:</span>{" "}
              {network.chainName} (ID: {network.networkId})
            </div>
            <div>
              <span className="text-muted-foreground">Token Contract:</span>{" "}
              <code className="text-xs bg-background px-1 py-0.5 rounded">
                {contracts.token || 'Not configured'}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">NFT Contract:</span>{" "}
              <code className="text-xs bg-background px-1 py-0.5 rounded">
                {contracts.nft || 'Not configured'}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">Staking Contract:</span>{" "}
              <code className="text-xs bg-background px-1 py-0.5 rounded">
                {contracts.staking || 'Not configured'}
              </code>
            </div>
          </div>
          {!configValidation.isValid && (
            <div className="mt-2 text-xs text-red-500">
              ⚠️ Configuration errors: {configValidation.errors.join(', ')}
            </div>
          )}
        </div>
        
        <TodoList />
      </div>
    </main>
  )
}

