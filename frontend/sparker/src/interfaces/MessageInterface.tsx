interface Message {
  messageId?: number;
  senderId: number;
  senderName?: string;
  content: string;
  time_Stamp?: string;
  isLocal?: boolean;
}

export default Message