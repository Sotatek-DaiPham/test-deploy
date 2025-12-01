import { TodoList } from "@/components/todo-list"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            My Todo List
          </h1>
          <p className="text-muted-foreground">
            Stay organized and get things done
          </p>
        </div>
        <TodoList />
      </div>
    </main>
  )
}

