import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Send, MessageCircle, ArrowLeft, Trash2 } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  email: string | null;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  updated_at: string;
  other_user: Profile;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatProps {
  initialUserId?: string;
}

export function Chat({ initialUserId }: ChatProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (initialUserId && user) {
      findOrCreateConversation(initialUserId);
    }
  }, [initialUserId, user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      subscribeToMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      const conversationsWithUsers = await Promise.all(
        data.map(async (conv: Conversation) => {
          const otherUserId = conv.user1_id === user!.id ? conv.user2_id : conv.user1_id;
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, full_name, email')
            .eq('id', otherUserId)
            .single();

          return {
            ...conv,
            other_user: profile!,
          };
        })
      );
      setConversations(conversationsWithUsers);
    }
    setLoading(false);
  };

  const findOrCreateConversation = async (otherUserId: string) => {
    const user1 = user!.id < otherUserId ? user!.id : otherUserId;
    const user2 = user!.id < otherUserId ? otherUserId : user!.id;

    let { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('user1_id', user1)
      .eq('user2_id', user2)
      .maybeSingle();

    if (!existing) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ user1_id: user1, user2_id: user2 })
        .select()
        .single();

      existing = newConv;
      fetchConversations();
    }

    if (existing) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, full_name, email')
        .eq('id', otherUserId)
        .single();

      setSelectedConversation({
        ...existing,
        other_user: profile!,
      });
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
      markMessagesAsRead(conversationId);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user!.id)
      .eq('is_read', false);
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: { new: Message }) => {
          const newMessage = payload.new as Message;
          
          // Solo agregar si es de otro usuario (mis mensajes ya están agregados optimísticamente)
          if (newMessage.sender_id !== user!.id) {
            setMessages((current) => {
              // Evitar duplicados
              if (current.some((m) => m.id === newMessage.id)) {
                return current;
              }
              return [...current, newMessage];
            });
            markMessagesAsRead(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const sendMessage = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    console.log('🚀 sendMessage called - START', { hasEvent: !!e, messageLength: newMessage.length });
    
    // FORZAR prevención de recarga - MÁXIMA PRIORIDAD
    if (e) {
      console.log('⚠️ Preventing default behavior');
      e.preventDefault();
      e.stopPropagation();
      if ('nativeEvent' in e && e.nativeEvent) {
        e.nativeEvent.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
      }
    }
    
    if (!newMessage.trim() || !selectedConversation) {
      console.log('❌ sendMessage aborted - empty message or no conversation');
      return false;
    }

    const messageContent = newMessage.trim();
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: user!.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      is_read: true,
    };

    // Agregar mensaje inmediatamente (actualización optimista)
    console.log('✅ Adding optimistic message to UI');
    setMessages((current) => [...current, optimisticMessage]);
    setNewMessage('');

    try {
      console.log('📡 Sending message to database...');
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user!.id,
          content: messageContent,
        })
        .select()
        .single();

      if (error) {
        // Si hay error, remover el mensaje optimista
        setMessages((current) => current.filter((m) => m.id !== optimisticMessage.id));
        console.error('Error sending message:', error);
        return false;
      }

      if (data) {
        console.log('✅ Message sent successfully, replacing optimistic message');
        // Reemplazar el mensaje temporal con el real
        setMessages((current) =>
          current.map((m) => (m.id === optimisticMessage.id ? data : m))
        );

        // Actualizar timestamp de la conversación en segundo plano (sin forzar re-render)
        // NO llamar a fetchConversations() aquí para evitar recarga
        supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', selectedConversation.id);
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setMessages((current) => current.filter((m) => m.id !== optimisticMessage.id));
    }
    
    console.log('🏁 sendMessage completed - END');
    return false;
  };

  const deleteConversation = async (conversationId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.')) {
      return;
    }

    console.log('🗑️ Deleting conversation:', conversationId);

    try {
      // Primero eliminar todos los mensajes de la conversación
      console.log('🗑️ Deleting messages...');
      const { data: deletedMessages, error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)
        .select();

      if (messagesError) {
        console.error('❌ Error deleting messages:', messagesError);
        alert(`Error al eliminar mensajes: ${messagesError.message}`);
        return;
      }

      console.log('✅ Messages deleted:', deletedMessages?.length || 0);

      // Luego eliminar la conversación
      console.log('🗑️ Deleting conversation...');
      const { data: deletedConv, error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .select();

      if (conversationError) {
        console.error('❌ Error deleting conversation:', conversationError);
        alert(`Error al eliminar conversación: ${conversationError.message}`);
        return;
      }

      console.log('✅ Conversation deleted:', deletedConv);

      // Actualizar la UI
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      
      fetchConversations();
      console.log('✅ Conversation deleted successfully!');
    } catch (err: any) {
      console.error('❌ Error deleting conversation:', err);
      alert(`Error inesperado: ${err?.message || 'No se pudo eliminar la conversación'}`);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row chat-container">
      {/* Lista de conversaciones: oculta en móvil cuando hay conversación seleccionada */}
      {/* Lista de conversaciones: oculta en móvil cuando hay conversación seleccionada */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 flex-col`}>
        <div className="p-3 md:p-4 border-b border-gray-200">
          <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
            Messages
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-3 md:p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-semibold text-gray-900 text-sm md:text-base truncate">
                  {conv.other_user.email || conv.other_user.username}
                </div>
                {(conv.other_user.full_name || conv.other_user.username) && (
                  <div className="text-xs md:text-sm text-gray-500 truncate italic">
                    {conv.other_user.full_name || conv.other_user.username}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Panel de chat: se muestra a pantalla completa en móvil cuando hay conversación seleccionada */}
      <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
        {selectedConversation ? (
          <>
            <div className="p-3 md:p-4 border-b border-gray-200 flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
                title="Go back to conversations"
                aria-label="Go back to conversations"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                  {selectedConversation.other_user.email || selectedConversation.other_user.username}
                </h4>
                {(selectedConversation.other_user.full_name || selectedConversation.other_user.username) && (
                  <p className="text-xs md:text-sm text-gray-500 truncate italic">
                    {selectedConversation.other_user.full_name || selectedConversation.other_user.username}
                  </p>
                )}
              </div>
              <button
                onClick={() => deleteConversation(selectedConversation.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                title="Eliminar conversación"
                aria-label="Eliminar conversación"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender_id === user!.id;
                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-2xl ${
                        isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="break-words text-sm md:text-base">{message.content}</p>
                      <p
                        className={`text-[10px] md:text-xs mt-1 ${
                          isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent?.preventDefault();
                      e.nativeEvent?.stopImmediatePropagation();
                      sendMessage(e);
                      return false;
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent?.preventDefault();
                    e.nativeEvent?.stopImmediatePropagation();
                    sendMessage(e);
                    return false;
                  }}
                  disabled={!newMessage.trim()}
                  className="px-3 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm md:text-base">Send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-sm md:text-base">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
