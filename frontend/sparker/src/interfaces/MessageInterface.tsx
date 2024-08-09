interface Message {
  messageId?: number;
  senderId: number;
  content: string;
  time_Stamp?: string;
  isLocal?: boolean;
}

export default Message