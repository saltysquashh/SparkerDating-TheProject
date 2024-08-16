// messageService.js
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utilities/authToken';

const API_URL = process.env.REACT_APP_API_URL;

export const createHubConnection = (setMessages) => {
    const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5001/chatHub')
        .build();

    hubConnection.on('ReceiveMessage', (senderId, senderName, messageContent) => {
        const newMessage = {
            senderId: senderId,
            content: messageContent,
            senderName: senderName
        };


        setMessages(prevMessages => [...prevMessages, newMessage]);
    });

    return hubConnection;
};
  
export const sendMessage_Service = (hubConnection) => async (matchId, senderId, receiverId, message) => {
    if (hubConnection && hubConnection.state === signalR.HubConnectionState.Connected) {
        try {
            await hubConnection.send('SendMessage', matchId, senderId, receiverId, message);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    } else {
        console.error("Cannot send message. Hub connection is not established.");
    }
};

export const fetchChatMessagesForMatch = async (matchId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/Messages/getMatchMessages/${matchId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data.map(msg => ({
            messageId: msg.messageId,
            senderId: msg.senderId,
            senderName: msg.senderName,
            content: msg.content,
            time_Stamp: msg.time_Stamp,
          }));
        } catch (error) {
          console.error('Error fetching chat messages:', error);
          throw error;
        }
};
