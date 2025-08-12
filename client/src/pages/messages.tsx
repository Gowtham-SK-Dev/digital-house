import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Send, Plus, Users, Search, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  receiver: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessageForm, setNewMessageForm] = useState({
    receiverId: "",
    content: "",
  });

  // Fetch user's messages and conversations
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const { data: usersResponse } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    enabled: searchQuery.length > 2,
  });
  
  const users = (usersResponse as any)?.data || [];

  // Group messages into conversations
  const conversations: Conversation[] = messages.reduce((acc, message) => {
    const partnerId = message.senderId === user?.id ? message.receiverId : message.senderId;
    const partner = message.senderId === user?.id ? message.receiver : message.sender;
    
    const existing = acc.find(conv => conv.partnerId === partnerId);
    if (existing) {
      if (new Date(message.createdAt) > new Date(existing.lastMessageTime)) {
        existing.lastMessage = message.content;
        existing.lastMessageTime = message.createdAt;
      }
      if (!message.isRead && message.receiverId === user?.id) {
        existing.unreadCount++;
      }
    } else {
      acc.push({
        partnerId,
        partnerName: `${partner.firstName} ${partner.lastName}`,
        partnerImage: partner.profileImageUrl,
        lastMessage: message.content,
        lastMessageTime: message.createdAt,
        unreadCount: !message.isRead && message.receiverId === user?.id ? 1 : 0,
      });
    }
    return acc;
  }, [] as Conversation[]);

  // Get messages for selected conversation
  const conversationMessages = selectedConversation 
    ? messages.filter(m => 
        (m.senderId === selectedConversation && m.receiverId === user?.id) ||
        (m.receiverId === selectedConversation && m.senderId === user?.id)
      ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          receiverId: selectedConversation,
          content: newMessage,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const sendNewMessageMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/messages", {
        method: "POST",
        body: JSON.stringify(newMessageForm),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      setNewMessageForm({ receiverId: "", content: "" });
      setIsNewMessageDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  if (messagesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Messages
          </h1>
        </div>

        <Dialog open={isNewMessageDialogOpen} onOpenChange={setIsNewMessageDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-new-message">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
              <DialogDescription>
                Start a conversation with a community member.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-users">Search Users</Label>
                <Input
                  id="search-users"
                  placeholder="Type name to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-users"
                />
                
                {users.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto border rounded-md">
                    {users.map((searchUser: any) => (
                      <div
                        key={searchUser.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          setNewMessageForm({ ...newMessageForm, receiverId: searchUser.id });
                          setSearchQuery(`${searchUser.firstName} ${searchUser.lastName}`);
                        }}
                        data-testid={`user-option-${searchUser.id}`}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={searchUser.profileImageUrl} />
                          <AvatarFallback className="text-xs">
                            {searchUser.firstName[0]}{searchUser.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {searchUser.firstName} {searchUser.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="message-content">Message</Label>
                <Textarea
                  id="message-content"
                  placeholder="Type your message here..."
                  rows={4}
                  value={newMessageForm.content}
                  onChange={(e) => setNewMessageForm({ ...newMessageForm, content: e.target.value })}
                  data-testid="textarea-message-content"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsNewMessageDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => sendNewMessageMutation.mutate()}
                  disabled={sendNewMessageMutation.isPending || !newMessageForm.receiverId || !newMessageForm.content}
                  data-testid="button-send-new-message"
                >
                  {sendNewMessageMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start connecting with community members by sending your first message.
                  </p>
                  <Button
                    onClick={() => setIsNewMessageDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-start-conversation"
                  >
                    Start Conversation
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.partnerId}
                      className={`p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                        selectedConversation === conversation.partnerId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.partnerId)}
                      data-testid={`conversation-${conversation.partnerId}`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.partnerImage} />
                          <AvatarFallback>
                            {conversation.partnerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {conversation.partnerName}
                            </h4>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-blue-600 text-white text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                          
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(conversation.lastMessageTime))} ago
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">
                    {conversations.find(c => c.partnerId === selectedConversation)?.partnerName}
                  </CardTitle>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {conversationMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                          data-testid={`message-${message.id}`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatDistanceToNow(new Date(message.createdAt))} ago
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessageMutation.mutate();
                        }
                      }}
                      data-testid="input-message"
                    />
                    <Button
                      onClick={() => sendMessageMutation.mutate()}
                      disabled={sendMessageMutation.isPending || !newMessage.trim()}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a conversation from the list to start messaging.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}