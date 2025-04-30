# Generic Module Development Plan (Architectural Pattern)

This document outlines a structured approach for developing new application modules, promoting consistency, maintainability, and separation of concerns.

## 1. Data Contracts & Types (`src/lib/schemas/`)

- **Purpose:** Define the structure and validation rules for data used within the module.
- **Tasks:**
  - Define data validation schemas (e.g., using Zod) for inputs (API requests, forms).
  - Define TypeScript types for core data models, form states, API payloads, and relevant statuses.
- **Outcome:** Clear, reusable, and type-safe definitions for all module-related data.

## 2. Server-Side Business Logic (`src/app/actions/`)

- **Purpose:** Encapsulate all core business logic, data manipulation, and security checks executed on the server.
- **Tasks:**
  - Implement functions for CRUD operations, specific business rules, calculations, and validations.
  - Interact with the database (e.g., using Prisma or another ORM).
  - Handle authorization and permission checks.
  - Trigger necessary side effects (e.g., cache invalidation, initiating background tasks).
- **Outcome:** Secure, centralized, and testable server-side logic exposed as callable actions.

## 3. Asynchronous Background Processing (Optional) (`src/configuration/queue/`, `src/configuration/workers/`)

- **Purpose:** Handle tasks that should not block the main request-response cycle (e.g., sending notifications, processing large data).
- **Pattern:** Utilize a message queue system (e.g., BullMQ).
  - **Queue Service:** Defines how jobs are added to a specific queue, including payload structure. Leverages a base service for common setup.
  - **Worker:** Processes jobs from the queue, executing the required logic (e.g., calling external APIs, performing complex calculations). Leverages a factory for common worker setup.
- **Outcome:** Improved application responsiveness and reliability for long-running or non-critical tasks.

## 4. Reusable Infrastructure: Queues & Workers (`src/configuration/queue/base-queue.ts`, `src/configuration/queue/worker-factory.ts`)

- **Purpose:** Provide foundational, reusable components for implementing the background processing pattern.
- **Components:**
  - **Base Queue Service:** Generic class providing common queue setup and methods (e.g., adding jobs).
  - **Worker Factory:** Function simplifying the creation and configuration of queue workers, including basic event handling.
- **Outcome:** Reduced boilerplate and enforced consistency when adding new background task types.

## 5. Client-Side State Management & Data Fetching (`src/providers/`)

- **Purpose:** Manage UI state, interact with server actions, and provide data to components efficiently.
- **Pattern:** Use a Context Provider combined with a data fetching library (e.g., SWR or React Query).
  - **Context Provider:** Holds module-specific state, fetched data, loading/error states, and functions to trigger server actions.
  - **Data Fetching:** Manages fetching, caching, and revalidation of data from server actions.
  - **Optimistic Updates:** (Optional but recommended) Update the UI immediately before the server confirms the action, improving perceived performance. Rollback on error.
- **Outcome:** Decoupled UI components from direct data fetching logic, centralized client-state, and optimized user experience.

## 6. UI Components (`src/components/` or feature folders)

- **Purpose:** Render the user interface based on data provided by the state management layer and capture user interactions.
- **Tasks:**
  - Consume data and action handlers from the relevant Context Provider.
  - Display data (forms, tables, lists, etc.).
  - Trigger actions based on user input (button clicks, form submissions).
- **Outcome:** Interactive and data-driven user interfaces.

---

## General Module Structure Example

_(Note: `base-queue.ts` and `worker-factory.ts` are typically defined once.)_

---

## Development Checklist for New Modules

- [ ] Define data schemas and types.
- [ ] Implement server actions for business logic.
- [ ] (Optional) Set up queue and worker if async processing is needed.
- [ ] Create client-side provider for state management and data fetching.
- [ ] Develop UI components, consuming data and actions from the provider.
- [ ] Ensure proper error handling and user feedback (e.g., toasts, loading states).
- [ ] Implement necessary authorization checks.
- [ ] Add function-level comments when generating code.

---

## Key Architectural Principles

- **Separation of Concerns:** Clearly divide responsibilities between data definition, server logic, client state, and UI rendering.
- **Data Validation:** Validate data at boundaries (API/Action inputs).
- **Type Safety:** Leverage TypeScript for improved code quality and maintainability.
- **Optimistic UI:** Enhance user experience for common actions where applicable.
- **Consistency:** Follow established patterns and naming conventions across modules.
- **Reusability:** Build common infrastructure components (like base queue/worker) to avoid repetition.
- **Reusability:** Build common infrastructure components (like base queue/worker) to avoid repetition.
- Small & Focused Units: Break code into the smallest meaningful units — each function, component, or module should do one thing and do it well.

- Readable Structure: Prioritize code clarity with consistent formatting, naming, and inline documentation where needed.

---
