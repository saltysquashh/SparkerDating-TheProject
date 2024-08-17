import React, { useState, useEffect, useContext, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import Message from '../interfaces/MessageInterface';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { createHubConnection, fetchChatMessagesForMatch, sendMessage_Service } from '../services/messageService';
import '../styles/MatchChatPage.css'; 

const MatchChatPage = () => {
    const { user } = useContext(AuthContext);
    const userId = user?.id;
    const { matchUserId } = useParams();
    const { matchId } = useParams();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const loadMessages = async () => {
            const fetchedMessages = await fetchChatMessagesForMatch(Number(matchId));
            setMessages(fetchedMessages);
        };

        const hubConnect = createHubConnection(setMessages);

        const startConnection = async () => {
            try {
                await hubConnect.start();
                console.log('Connection successful!');
                setHubConnection(hubConnect);
                loadMessages();
            } catch (err) {
                console.error('Error establishing connection:', err);
            }
        };

        startConnection();

        return () => {
            hubConnect?.stop();
        };
    }, [setMessages]);

    // scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [messages]);

    const sendMessage = sendMessage_Service(hubConnection);

    const handleSendMessage = async () => {
        const thisMatchId = Number(matchId);
        const senderId = Number(userId);
        const receiverId = Number(matchUserId);

        if (message === '') {
            return;
        }
    
            await sendMessage(thisMatchId, senderId, receiverId, message);
    
        setMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div className="message-list">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
                    >
                        {msg.content}
                    </div>
                ))}
                {/* this is the reference div that scrolls into view */}
                <div ref={messagesEndRef} />
            </div>
            <div className="message-input-container">
                <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="message-input"
                    placeholder="Type a message..."
                />
                <button onClick={handleSendMessage} className="send-button">Send</button>
            </div>
        </div>  
    );
};

export default MatchChatPage;
