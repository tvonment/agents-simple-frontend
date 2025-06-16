# Azure AI Agent Chat Frontend

This project is a Next.js app (TypeScript, Tailwind CSS, App Router) with a simple chat interface that communicates with an Azure AI agent via a custom API route.

## Features

- Modern chat UI built with React and Tailwind CSS
- API route for secure communication with Azure AI agent using `@azure/ai-projects` and `@azure/identity`
- TypeScript and idiomatic Next.js (App Router)

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

- `src/app/page.tsx` — Main chat UI
- `src/app/api/chat/route.ts` — API route for Azure agent communication

## Customization

- Update the Azure connection string and agent/thread IDs in the API route as needed.

---

This project was bootstrapped with `create-next-app`.
