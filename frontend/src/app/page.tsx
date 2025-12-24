'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { useState } from 'react';

export default function Home() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ChatLayout />
    </QueryClientProvider>
  );
}
