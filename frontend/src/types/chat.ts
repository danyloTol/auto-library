export interface ChatUser {
  id: string;
  fullName: string;
  email: string;
}

export interface ChatRoom {
  id: string;
  carId: string;
  carTitle: string;
  carImageUrl?: string;
  buyer: ChatUser;
  seller: ChatUser;
  lastMessage?: string;
  lastMessageDate?: string;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
