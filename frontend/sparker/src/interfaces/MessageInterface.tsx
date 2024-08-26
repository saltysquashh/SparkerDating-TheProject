interface Message {
  messageId?: number;
  senderId: number;
  content: string;
  timeStamp: string;
  senderName: string;
}

export default Message