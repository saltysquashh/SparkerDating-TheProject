// messageService.js
import axios from 'axios';
import * as signalR from '@microsoft/signalr';

const API_URL = process.env.REACT_APP_API_URL;


export const createHubConnection = (setMessages) => {
    const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5001/chatHub')
        .build();

    hubConnection.on('ReceiveMessage', (senderId, messageContent) => {
        const newMessage = {
            senderId: senderId,
            content: messageContent
        };

        setMessages(previousMessages => {
            const filteredMessages = previousMessages.filter(msg => 
                !(msg.isLocal && msg.senderId === senderId && msg.content === messageContent)
            );

            return [...filteredMessages, newMessage];
        });
    });

    return hubConnection;
};
  
export const fetchChatMessagesForMatch = async (matchId) => {
    try {
        const response = await axios.get(`${API_URL}/Messages/getMatchMessages/${matchId}`);
        return response.data.map(msg => ({
            messageId: msg.messageId,
            senderId: msg.senderId,
            content: msg.content,
            time_Stamp: msg.time_Stamp
          }));
        } catch (error) {
          console.error('Error fetching chat messages:', error);
          throw error;
        }
};

export const sendMessage_Service = (hubConnection) => async (matchId, senderId, receiverId, message) => {
    if (hubConnection && hubConnection.state === signalR.HubConnectionState.Connected) {
        try {
            console.log(`Sending message in match ${matchId} FROM ${senderId} TO ${receiverId}: ${message}`);
            await hubConnection.send('SendMessage', matchId, senderId, receiverId, message);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    } else {
        console.error("Cannot send message. Hub connection is not established.");
    }
};



