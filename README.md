# Todo List

A simple, beautiful todo list application built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- ✅ Add new todos
- ✅ Mark todos as complete/incomplete
- ✅ Delete todos
- ✅ Persistent storage using localStorage
- ✅ Beautiful, modern UI with Tailwind CSS
- ✅ Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **pnpm** - Package manager

## Project Structure

```
├── app/
│   ├── globals.css      # Global styles and Tailwind directives
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── add-todo.tsx     # Add todo form component
│   ├── todo-item.tsx    # Individual todo item component
│   └── todo-list.tsx    # Main todo list component
└── lib/
    └── utils.ts         # Utility functions
```

## Build for Production

```bash
pnpm build
pnpm start
```

