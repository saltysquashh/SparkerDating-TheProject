import React, { useState, useEffect, useContext, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import Message from "../interfaces/MessageInterface";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
	createHubConnection,
	fetchChatMessagesForMatch,
	sendMessage_Service,
} from "../services/messageService";
import "../styles/MatchChatPage.css";
import { useToastNotification } from "./globalComponents/toastProvider";
import { useErrorHandling } from "../hooks/useErrorHandling";

const MatchChatPage = () => {
	const { authUser } = useContext(AuthContext);
	const authUserId = authUser?.id;
	const { matchUserId } = useParams();
	const { matchId } = useParams();
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [hubConnection, setHubConnection] =
		useState<signalR.HubConnection | null>(null);

	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const { handleError, clearError } = useErrorHandling();
	const showToast = useToastNotification();

	useEffect(() => {
		const loadMessages = async () => {
			const fetchedMessages = await fetchChatMessagesForMatch(
				Number(matchId)
			);
			setMessages(fetchedMessages);
		};

		const hubConnect = createHubConnection(setMessages);

		const startConnection = async () => {
			try {
				await hubConnect.start();
				console.log("Connection successful!");
				setHubConnection(hubConnect);
				loadMessages();
			} catch (err) {
				console.error("Error establishing connection:", err);
			}
		};

		startConnection();

		return () => {
			hubConnect?.stop();
		};
	}, [setMessages]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
	}, [messages]);

	const sendMessage = sendMessage_Service(hubConnection);

	const handleSendMessage = async () => {
		const thisMatchId = Number(matchId);
		const senderId = Number(authUserId);
		const receiverId = Number(matchUserId);

		if (message === "") {
			return;
		}

		// send message to the server
		try {
			await sendMessage(thisMatchId, senderId, receiverId, message);
			setMessage("");
		} catch (error) {
			const errorMessage = handleError(error);
			showToast({
				title: "Error",
				description: `${errorMessage}`,
				status: "error",
			});
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSendMessage();
		}
	};

	const formatTimestamp = (timestamp?: string) => {
		if (!timestamp || isNaN(new Date(timestamp).getTime())) {
			return "Sent just now.";
		}

		const date = new Date(timestamp);
		return date.toLocaleString();
	};

	return (
		<div className="chat-page-background">
			<div className="chat-container">
				<div className="message-list">
					{messages.map((msg, index) => (
						<div
							key={index}
							className={`message ${
								msg.senderId === authUserId
									? "sent"
									: "received"
							}`}
						>
							{msg.content}
							<div className="timestamp">
								{formatTimestamp(msg.timeStamp)}
							</div>
						</div>
					))}
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
					<button onClick={handleSendMessage} className="send-button">
						Send
					</button>
				</div>
			</div>
		</div>
	);
};

export default MatchChatPage;
