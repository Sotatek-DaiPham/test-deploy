"use client"

import { TodoItem, type Todo } from "@/components/todo-item"
import { AddTodo } from "@/components/add-todo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [mounted, setMounted] = useState(false)

  // Load todos from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("todos")
    if (stored) {
      try {
        setTodos(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to parse todos from localStorage", error)
      }
    }
  }, [])

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("todos", JSON.stringify(todos))
    }
  }, [todos, mounted])

  const handleAdd = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    }
    setTodos([...todos, newTodo])
  }

  const handleToggle = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const handleDelete = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <p>Loading your todos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
        <CardDescription>
          {totalCount > 0
            ? `${completedCount} of ${totalCount} tasks completed`
            : "No tasks yet. Add one to get started!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AddTodo onAdd={handleAdd} />
        <div className="space-y-2">
          {todos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Your todo list is empty</p>
              <p className="text-sm mt-2">Add a task above to get started!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

