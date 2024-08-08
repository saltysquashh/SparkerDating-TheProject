interface Message {
  messageId?: number; // Make messageId optional
  senderId: number;
  content: string;
  time_Stamp?: string;
  isLocal?: boolean;
}

export default Message