// ProjectChat.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

// You will need a service to handle WebSocket connections
// and a new back-end endpoint for the chat
import { chatService } from '../../services/Chatservice.js'; 

export default function ProjectChat({ projectId }) {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    // Connect to WebSocket on component mount
    const onMessageReceived = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    chatService.connect(projectId, userProfile.id, onMessageReceived);

    // Load message history from a REST endpoint
    // You will need to implement this endpoint in Spring Boot
    chatService.getMessageHistory(projectId)
      .then(history => {
        setMessages(history);
      })
      .catch(error => {
        console.error('Failed to load chat history:', error);
      });

    return () => {
      // Disconnect from WebSocket on component unmount
      chatService.disconnect();
    };
  }, [projectId, userProfile]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const chatMessage = {
        senderId: userProfile.id,
        content: messageInput.trim(),
        projectId: projectId
      };
      
      // Send message via WebSocket
      chatService.sendMessage(chatMessage);
      
      setMessageInput('');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.senderId === userProfile.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-xs ${msg.senderId === userProfile.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <p className="font-semibold text-sm">
                {msg.senderName}
              </p>
              <p>{msg.content}</p>
              <p className="text-xs text-right mt-1 opacity-75">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
      <div className="p-4 border-t flex items-center space-x-2">
        <Input
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <Button onClick={handleSendMessage}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}