import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { createChatHubConnection } from '../services/signalrService';
import { ChatMessage, ChatRoom } from '../types/chat';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Car as CarIcon, Check, CheckCheck } from 'lucide-react';
import { resolveImageUrl } from '../utils/imageUrl';
import { HubConnection } from '@microsoft/signalr';

export const ChatPage: React.FC = () => {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const initialRoomId = searchParams.get('room');

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(initialRoomId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const hubConnectionRef = useRef<HubConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize SignalR
  useEffect(() => {
    if (!token) return;

    const connection = createChatHubConnection(token);
    hubConnectionRef.current = connection;

    connection
      .start()
      .then(() => {
        console.log('SignalR ChatHub Connected');
        if (activeRoomId) {
          connection.invoke('JoinRoom', activeRoomId);
        }
      })
      .catch((err) => console.error('SignalR Connection Error: ', err));

    connection.on('ReceiveMessage', (newMessage: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      // Update last message in rooms list
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.id === newMessage.chatRoomId
            ? { ...r, lastMessage: newMessage.content, lastMessageDate: newMessage.createdAt }
            : r
        )
      );
    });

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [token]);

  // Load rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const data = await chatService.getMyRooms();
        setRooms(data);
        if (!activeRoomId && data.length > 0) {
          setActiveRoomId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  // When active room changes, load messages & join room group
  useEffect(() => {
    if (!activeRoomId) return;

    if (hubConnectionRef.current?.state === 'Connected') {
      hubConnectionRef.current.invoke('JoinRoom', activeRoomId);
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const data = await chatService.getRoomMessages(activeRoomId);
        setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeRoomId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoomId || !inputText.trim()) return;

    const content = inputText.trim();
    setInputText('');

    try {
      if (hubConnectionRef.current?.state === 'Connected') {
        // Send via SignalR
        await hubConnectionRef.current.invoke('SendMessage', activeRoomId, content);
      } else {
        // Fallback REST API
        const msg = await chatService.sendMessage(activeRoomId, content);
        setMessages((prev) => [...prev, msg]);
      }
    } catch (err) {
      console.error('Failed to send message: ', err);
    }
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const interlocutor = activeRoom
    ? user?.id === activeRoom.buyer.id
      ? activeRoom.seller
      : activeRoom.buyer
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-140px)] min-h-[550px] flex flex-col">
      <div className="flex-1 bg-white dark:bg-darkbg-800 rounded-3xl border border-slate-200/80 dark:border-darkbg-700 shadow-sm flex overflow-hidden">
        {/* Left pane: Rooms list */}
        <div className="w-full sm:w-80 md:w-96 border-r border-slate-200 dark:border-darkbg-700 flex flex-col bg-slate-50/50 dark:bg-darkbg-900/50">
          <div className="p-4 border-b border-slate-200 dark:border-darkbg-700 flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sage-600 dark:text-sage-400" />
              Діалоги
            </h2>
            <span className="text-xs bg-sage-100 dark:bg-darkbg-700 text-sage-700 dark:text-sage-300 px-2 py-0.5 rounded-full font-semibold">
              {rooms.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-darkbg-700/50">
            {loadingRooms ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 rounded-2xl bg-slate-200 dark:bg-darkbg-800 animate-pulse" />
                ))}
              </div>
            ) : rooms.length > 0 ? (
              rooms.map((room) => {
                const partner = user?.id === room.buyer.id ? room.seller : room.buyer;
                const isSelected = room.id === activeRoomId;

                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={`w-full p-4 text-left flex items-center gap-3 transition-colors ${
                      isSelected
                        ? 'bg-sage-100/70 dark:bg-darkbg-700'
                        : 'hover:bg-slate-100/60 dark:hover:bg-darkbg-800'
                    }`}
                  >
                    {/* Car thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-darkbg-700 flex-shrink-0">
                      {room.carImageUrl ? (
                        <img src={resolveImageUrl(room.carImageUrl)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sage-600">
                          <CarIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate text-slate-900 dark:text-white">
                          {partner.fullName}
                        </span>
                        {room.lastMessageDate && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(room.lastMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-semibold text-sage-600 dark:text-sage-400 truncate">
                        {room.carTitle}
                      </div>

                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {room.lastMessage || 'Немає повідомлень'}
                      </div>
                    </div>

                    {room.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-sage-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {room.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p>У вас ще немає активних переписок.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Active chat */}
        {activeRoom && interlocutor ? (
          <div className="flex-1 flex flex-col bg-white dark:bg-darkbg-800">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-darkbg-700 flex items-center justify-between bg-slate-50/50 dark:bg-darkbg-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage-200 dark:bg-darkbg-700 flex items-center justify-center font-bold text-sage-800 dark:text-sage-200">
                  {interlocutor.fullName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {interlocutor.fullName}
                  </h3>
                  <span className="text-xs text-slate-400 block truncate max-w-xs">
                    Автомобіль: <strong className="text-sage-600 dark:text-sage-400">{activeRoom.carTitle}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {loadingMessages ? (
                <div className="flex justify-center p-8">
                  <div className="w-6 h-6 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((m) => {
                  const isMine = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMine
                            ? 'bg-sage-600 text-white rounded-br-none'
                            : 'bg-slate-100 dark:bg-darkbg-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                        }`}
                      >
                        {m.content}
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && (
                          m.isRead ? <CheckCheck className="w-3 h-3 text-sage-500" /> : <Check className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-xs text-slate-400">
                  Почніть діалог! Напишіть перше повідомлення щодо цього авто.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-darkbg-700 flex items-center gap-2">
              <input
                type="text"
                placeholder="Введіть повідомлення..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white disabled:opacity-40 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 hidden sm:flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-darkbg-600 mb-2" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-base">Виберіть діалог</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Оберіть переписку зі списку зліва, або напишіть продавцю зі сторінки автомобіля.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
