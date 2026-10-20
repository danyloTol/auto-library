import api from './api';
import { ChatMessage, ChatRoom } from '../types/chat';

export const chatService = {
  async getOrCreateRoom(carId: string): Promise<ChatRoom> {
    const response = await api.post<ChatRoom>(`/chat/rooms/${carId}`);
    return response.data;
  },

  async getMyRooms(): Promise<ChatRoom[]> {
    const response = await api.get<ChatRoom[]>('/chat/rooms');
    return response.data;
  },

  async getRoomMessages(roomId: string): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`);
    return response.data;
  },

  async sendMessage(roomId: string, content: string): Promise<ChatMessage> {
    const response = await api.post<ChatMessage>(`/chat/rooms/${roomId}/messages`, { content });
    return response.data;
  },
};
