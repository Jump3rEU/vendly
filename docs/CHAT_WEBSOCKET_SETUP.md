# Real-Time Chat System - WebSocket Setup Guide

## Overview
Vendly chat systém podporuje real-time messaging přes WebSocket. Pro plnou funkcionalitu je potřeba nastavit Socket.IO server.

## Aktuální Stav
✅ **Implementováno:**
- REST API endpointy pro zprávy a konverzace
- Persistence zpráv v PostgreSQL
- Chat UI s podporou nabídek cen
- Read receipts (označení přečtení)
- Report system pro zneužívání

⚠️ **Vyžaduje setup:**
- WebSocket server pro real-time delivery
- Socket.IO integrace

## Quick Start (Development)

### 1. Vytvořte WebSocket Server
Vytvořte soubor `server.js` v root projektu:

```javascript
const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)
  
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join conversation room
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`)
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`)
    })

    // Leave conversation room
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`)
    })

    // Handle new message (emit to conversation room)
    socket.on('send-message', (data) => {
      const { conversationId, message } = data
      io.to(`conversation:${conversationId}`).emit('new-message', message)
    })

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { conversationId, userId } = data
      socket.to(`conversation:${conversationId}`).emit('user-typing', { userId })
    })

    socket.on('stop-typing', (data) => {
      const { conversationId, userId } = data
      socket.to(`conversation:${conversationId}`).emit('user-stopped-typing', { userId })
    })

    // Handle read receipts
    socket.on('mark-read', (data) => {
      const { conversationId, messageIds } = data
      io.to(`conversation:${conversationId}`).emit('messages-read', { messageIds })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

### 2. Aktualizujte package.json
```json
{
  "scripts": {
    "dev": "node server.js",
    "dev:next": "next dev",
    "build": "next build",
    "start": "NODE_ENV=production node server.js"
  }
}
```

### 3. Vytvořte Socket.IO Context Provider

**lib/socket.tsx:**
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) return

    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      auth: {
        userId: session.user.id,
      },
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [session?.user?.id])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
```

### 4. Obalte Aplikaci v SocketProvider

**app/layout.tsx:**
```typescript
import { SocketProvider } from '@/lib/socket'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 5. Použijte Socket v Chat Komponentě

**app/zpravy/[id]/page.tsx:**
```typescript
import { useSocket } from '@/lib/socket'

export default function ChatPage({ params }) {
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!socket) return

    // Join conversation room
    socket.emit('join-conversation', params.id)

    // Listen for new messages
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message])
    })

    // Listen for read receipts
    socket.on('messages-read', ({ messageIds }) => {
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) ? { ...msg, read: true } : msg
      ))
    })

    return () => {
      socket.emit('leave-conversation', params.id)
      socket.off('new-message')
      socket.off('messages-read')
    }
  }, [socket, params.id])

  const sendMessage = async (content: string) => {
    // Send via API
    const response = await fetch(`/api/conversations/${params.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    const data = await response.json()

    // Emit to Socket.IO for real-time delivery
    if (socket) {
      socket.emit('send-message', {
        conversationId: params.id,
        message: data.data,
      })
    }
  }

  // ...rest of component
}
```

## Production Deployment

### Option 1: Separate WebSocket Server
Deploy Socket.IO server separately on platformě jako Railway nebo Render.

**Proč:**
- Better scalability
- Nezávislé škálování WebSocket connections
- Vercel nepodporuje WebSockets

**Setup:**
1. Deploy `server.js` na Railway/Render
2. Nastav `NEXT_PUBLIC_SOCKET_URL` env var
3. Next.js app na Vercel, Socket.IO server jinde

### Option 2: Pusher/Ably
Použít managed service pro WebSocket.

**Pusher setup:**
```bash
npm install pusher pusher-js
```

```typescript
// lib/pusher.ts
import Pusher from 'pusher'

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})
```

### Option 3: Polling Fallback
Pro jednoduchost použít polling místo WebSocket.

```typescript
// Poll for new messages every 3 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/conversations/${params.id}`)
    const data = await response.json()
    setMessages(data.data.messages)
  }, 3000)

  return () => clearInterval(interval)
}, [params.id])
```

## Funkce

### ✅ Plně Funkční (bez WebSocket)
- Posílání a příjem zpráv
- Message persistence
- Read receipts (při načtení konverzace)
- Nabídky cen
- Report system

### ⚡ Vylepšené s WebSocket
- Instant message delivery
- Real-time read receipts
- Typing indicators
- Online status
- Push notifications

## Environment Variables

```env
# WebSocket (Optional)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Pusher (Alternative)
PUSHER_APP_ID=
NEXT_PUBLIC_PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=

# Notifications (Future)
ONESIGNAL_APP_ID=
ONESIGNAL_API_KEY=
```

## API Endpoints

### Conversations
- `GET /api/conversations` - Seznam konverzací
- `POST /api/conversations` - Vytvořit/najít konverzaci
- `GET /api/conversations/[id]` - Detail s messages
- `POST /api/conversations/[id]/messages` - Poslat zprávu

### Offers
- `POST /api/offers` - Vytvořit nabídku
- `GET /api/offers` - Seznam nabídek
- `GET /api/offers/[id]` - Detail nabídky
- `PATCH /api/offers/[id]` - Přijmout/odmítnout

### Reports
- `POST /api/messages/[id]/report` - Nahlásit zprávu

## Testing

```bash
# Start dev server with WebSocket
npm run dev

# Test Socket.IO connection
curl http://localhost:3000/socket.io/?EIO=4&transport=polling
```

## Troubleshooting

**Socket.IO nepřipojí:**
- Zkontroluj CORS nastavení
- Verify port je volný
- Check firewall rules

**Messages nedorazí real-time:**
- Fallback na polling funguje vždy
- Check Socket.IO server logs
- Verify room joining

**Production issues:**
- Vercel nepodporuje WebSocket - použij separate server
- Nasaď Socket.IO na Railway/Render
- Nebo použij Pusher/Ably
