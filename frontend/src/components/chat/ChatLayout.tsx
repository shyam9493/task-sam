'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { usePDFStore } from '@/store/pdfStore';
import { sendMessage } from '@/lib/api';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { MessageList } from './MessageList';
import { InputBox } from './InputBox';
import { PDFViewer } from '../pdf/PDFViewer';

export function ChatLayout() {
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const addMessage = useChatStore((state) => state.addMessage);
    const conversationId = useChatStore((state) => state.conversationId);
    const setConversationId = useChatStore((state) => state.setConversationId);
    const isPDFOpen = usePDFStore((state) => state.isOpen);

    // Initialize streaming hook
    useStreamingChat(currentJobId);

    const handleSendMessage = async (content: string) => {
        // Add user message to chat
        addMessage({
            id: `msg-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date(),
        });

        try {
            // Send message to backend
            const response = await sendMessage(content, conversationId || undefined);

            // Store conversation ID
            if (response.conversationId) {
                setConversationId(response.conversationId);
            }

            // Start streaming with job ID
            setCurrentJobId(response.jobId);
        } catch (error) {
            console.error('Failed to send message:', error);
            // TODO: Show error message to user
        }
    };

    return (
        <div className="flex h-screen bg-zinc-50">
            {/* Chat container */}
            <motion.div
                className="flex flex-col flex-1"
                animate={{
                    width: isPDFOpen ? '60%' : '100%',
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                <MessageList />
                <InputBox onSendMessage={handleSendMessage} />
            </motion.div>

            {/* PDF Viewer */}
            <AnimatePresence>
                {isPDFOpen && <PDFViewer />}
            </AnimatePresence>
        </div>
    );
}
