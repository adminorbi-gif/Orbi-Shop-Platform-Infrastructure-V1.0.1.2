# Dedicated Messaging Architecture Build Plan

## Overview
Build a comprehensive real-time messaging system using WebSockets, allowing communication between Customers, Sellers, and Admins. Admins will have the ability to oversee and monitor all chats.

## Requirements & Features

### 1. Backend & Real-time Server (WebSocket)
- **Technology**: Node.js, Express, `ws` (or `socket.io`), existing Supabase/Cloud SQL or local storage mechanism.
- **WebSocket Integration**: Attach a WebSocket server to the existing Express server (`server.ts`).
- **Authentication**: WebSocket connections must identify the user (ID and Role: `admin`, `seller`, `customer`).
- **Rooms/Channels**: 
  - Messages will belong to a `conversation` (Thread).
  - Users join rooms based on their user ID or conversation ID to receive real-time updates.
- **API Endpoints**: 
  - `GET /api/v1/conversations`: Fetch list of conversations for a user.
  - `GET /api/v1/conversations/:id/messages`: Fetch messages in a conversation.
  - `POST /api/v1/conversations/:id/messages`: Send a message (fallback/HTTP way, though WS will handle real-time).

### 2. Data Models (TypeScript)
- `Conversation`:
  - `id`: string
  - `participants`: Array of `{ id: string, role: 'customer' | 'seller' | 'admin', name: string, avatar?: string }`
  - `lastMessage`: string
  - `updatedAt`: number
- `ChatMessage`:
  - `id`: string
  - `conversationId`: string
  - `senderId`: string
  - `senderRole`: 'customer' | 'seller' | 'admin'
  - `content`: string
  - `timestamp`: number
  - `isRead`: boolean

### 3. Frontend Architecture

#### Shared
- Custom hook `useWebSocket` to manage real-time connection, listen to incoming messages, and emit events.

#### Client UI
- Remove old polling logic.
- **Inbox View**: List of conversations with Sellers or Admin.
- **Chat View**: Real-time message bubbles, typing indicators, read receipts.
- Contact Seller button on product pages to initiate a conversation.

#### Seller UI
- Add a dedicated "Messages" tab.
- **Inbox View**: List of conversations with Customers or Admin.
- **Chat View**: Reply to customers.

#### Admin UI
- **Global Inbox View**: List of all conversations across the platform.
- **Super Admin Preview**: Admins can view *any* conversation between a Customer and a Seller without being a direct participant.
- **Direct Messaging**: Admins can message Sellers or Customers directly.

## Execution Steps

1. **Phase 1: Backend & Data Models**
   - Define new `Conversation` and `ChatMessage` interfaces in `src/types.ts`.
   - Update `server.ts` to initialize a WebSocket server.
   - Create WebSocket event handlers (connection, message, join room, disconnect).
   - Implement temporary/in-memory or database persistence for the new messaging models.

2. **Phase 2: Frontend Shared Hooks**
   - Create `src/hooks/useWebSocket.ts`.
   - Create shared API services for fetching conversations/messages.

3. **Phase 3: Seller UI Implementation**
   - Add 'Messages' tab to SellerApp.
   - Build Inbox & Chat UI.

4. **Phase 4: Client UI Implementation**
   - Replace old contact forms/messages with the new Inbox & Chat UI.
   - Add "Message Seller" on Product details.

5. **Phase 5: Admin UI Implementation**
   - Update Admin Messages tab.
   - Implement global chat overview (Super Admin feature).
   - Clean up old legacy message components.
