interface Message {
  messageId?: number;
  senderId: number;
  content: string;
  time_Stamp: string;
  senderName: string;
}

export default Message