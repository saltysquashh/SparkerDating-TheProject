import React, { useState, useEffect, useContext } from 'react';
import * as signalR from '@microsoft/signalr';
import Message from '../interfaces/MessageInterface';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { createHubConnection, fetchChatMessagesForMatch, sendMessage_Service } from '../services/messageService';


const MatchChatPage = () => {
    const { user } = useContext(AuthContext);
    const userId = user?.id;
    const { matchUserId } = useParams();
    const { matchId } = useParams();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);

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


    const sendMessage = sendMessage_Service(hubConnection);

    const handleSendMessage = async () => {
 
        const thisMatchId = Number(matchId);
        const senderId = Number(userId);
        const receiverId = Number(matchUserId);
    
        const newMessage = {
            senderId: senderId,
            content: message,
            isLocal: true,
        };
    
        setMessages(prevMessages => [...prevMessages, newMessage]);

        await sendMessage(thisMatchId, senderId, receiverId, message);
        setMessage('');
    };


    return (
        <div>
            <input 
                type="text" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
            {messages.map((msg, index) => (
                <div key={index}>{msg.senderId}: {msg.content}</div>
            ))}
        </div>
    );
};

export default MatchChatPage;
