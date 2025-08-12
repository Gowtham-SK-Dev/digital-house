import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Megaphone, Pin, Calendar, User, Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Announcement {
  id: string;
  authorId: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  isPinned: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    userType: string;
  };
}

export default function Announcements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "medium" as const,
    isPinned: false,
    expiresAt: "",
  });

  // Check if user can manage announcements
  const canManageAnnouncements = user?.userType === 'admin' || user?.userType === 'moderator';

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: canManageAnnouncements ? ["/api/announcements/all"] : ["/api/announcements"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/announcements", {
        method: "POST",
        body: JSON.stringify(newAnnouncement),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to create announcement');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Announcement Created",
        description: "Your announcement has been posted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements/all"] });
      setIsCreateDialogOpen(false);
      setNewAnnouncement({
        title: "",
        content: "",
        priority: "medium",
        isPinned: false,
        expiresAt: "",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (announcement: Announcement) => {
      const response = await fetch(`/api/announcements/${announcement.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          isPinned: announcement.isPinned,
          isActive: announcement.isActive,
          expiresAt: announcement.expiresAt,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to update announcement');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Announcement Updated",
        description: "The announcement has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements/all"] });
      setEditingAnnouncement(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error('Failed to delete announcement');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Announcement Deleted",
        description: "The announcement has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements/all"] });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4" />;
      default: return <Megaphone className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const pinnedAnnouncements = (announcements || []).filter(a => a.isPinned);
  const regularAnnouncements = (announcements || []).filter(a => !a.isPinned);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center space-y-2">
          <div className="flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Community Announcements
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with important community news and updates
          </p>
        </div>

        {canManageAnnouncements && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-announcement">
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Post an important announcement for the community to see.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Announcement title..."
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    data-testid="input-announcement-title"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your announcement content here..."
                    rows={4}
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    data-testid="textarea-announcement-content"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={newAnnouncement.priority} 
                      onValueChange={(value: any) => setNewAnnouncement({ ...newAnnouncement, priority: value })}
                    >
                      <SelectTrigger data-testid="select-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="expires">Expires At (Optional)</Label>
                    <Input
                      id="expires"
                      type="datetime-local"
                      value={newAnnouncement.expiresAt}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiresAt: e.target.value })}
                      data-testid="input-expires-at"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={newAnnouncement.isPinned}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })}
                    data-testid="checkbox-pinned"
                  />
                  <Label htmlFor="pinned">Pin to top</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending || !newAnnouncement.title || !newAnnouncement.content}
                    data-testid="button-submit-announcement"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Announcement"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{announcements?.length || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Announcements</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{pinnedAnnouncements.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pinned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {(announcements || []).filter(a => a.priority === 'urgent').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Urgent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(announcements || []).filter(a => a.isActive).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Pin className="h-5 w-5 text-yellow-500" />
            Pinned Announcements
          </h2>
          <div className="space-y-4">
            {pinnedAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg" data-testid={`text-title-${announcement.id}`}>
                          {announcement.title}
                        </h3>
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {getPriorityIcon(announcement.priority)}
                          <span className="ml-1 capitalize">{announcement.priority}</span>
                        </Badge>
                        {announcement.isPinned && (
                          <Badge className="bg-yellow-500 text-white">
                            <Pin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={announcement.author.profileImageUrl} />
                            <AvatarFallback className="text-xs">
                              {announcement.author.firstName[0]}{announcement.author.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {announcement.author.firstName} {announcement.author.lastName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {announcement.author.userType}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(announcement.createdAt))} ago
                        </div>
                        
                        {announcement.expiresAt && (
                          <div className="text-orange-600">
                            Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {canManageAnnouncements && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAnnouncement(announcement)}
                          data-testid={`button-edit-${announcement.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(announcement.id)}
                          data-testid={`button-delete-${announcement.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Announcements</h2>
        {regularAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No announcements yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {canManageAnnouncements 
                  ? "Create your first announcement to keep the community informed." 
                  : "Check back later for community updates and announcements."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {regularAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg" data-testid={`text-title-${announcement.id}`}>
                          {announcement.title}
                        </h3>
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {getPriorityIcon(announcement.priority)}
                          <span className="ml-1 capitalize">{announcement.priority}</span>
                        </Badge>
                        {!announcement.isActive && (
                          <Badge variant="outline" className="text-gray-500">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={announcement.author.profileImageUrl} />
                            <AvatarFallback className="text-xs">
                              {announcement.author.firstName[0]}{announcement.author.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {announcement.author.firstName} {announcement.author.lastName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {announcement.author.userType}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(announcement.createdAt))} ago
                        </div>
                        
                        {announcement.expiresAt && (
                          <div className="text-orange-600">
                            Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {canManageAnnouncements && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAnnouncement(announcement)}
                          data-testid={`button-edit-${announcement.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(announcement.id)}
                          data-testid={`button-delete-${announcement.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingAnnouncement && (
        <Dialog open={!!editingAnnouncement} onOpenChange={() => setEditingAnnouncement(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
              <DialogDescription>
                Update the announcement details.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingAnnouncement.title}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                  data-testid="input-edit-title"
                />
              </div>

              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  rows={4}
                  value={editingAnnouncement.content}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                  data-testid="textarea-edit-content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select 
                    value={editingAnnouncement.priority} 
                    onValueChange={(value: any) => setEditingAnnouncement({ ...editingAnnouncement, priority: value })}
                  >
                    <SelectTrigger data-testid="select-edit-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-expires">Expires At</Label>
                  <Input
                    id="edit-expires"
                    type="datetime-local"
                    value={editingAnnouncement.expiresAt ? new Date(editingAnnouncement.expiresAt).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, expiresAt: e.target.value })}
                    data-testid="input-edit-expires"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-pinned"
                    checked={editingAnnouncement.isPinned}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, isPinned: e.target.checked })}
                    data-testid="checkbox-edit-pinned"
                  />
                  <Label htmlFor="edit-pinned">Pin to top</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={editingAnnouncement.isActive}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, isActive: e.target.checked })}
                    data-testid="checkbox-edit-active"
                  />
                  <Label htmlFor="edit-active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingAnnouncement(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateMutation.mutate(editingAnnouncement)}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-announcement"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}