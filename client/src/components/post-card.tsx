import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  MapPin,
  Clock,
  Trash2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@shared/schema";

interface PostCardProps {
  post: Post & {
    author?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
    };
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsLiked(true);
      toast({
        title: "Success",
        description: "Post liked!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Unlike post mutation
  const unlikeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/posts/${post.id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsLiked(false);
      toast({
        title: "Success",
        description: "Post unliked!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to unlike post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post deleted successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLikeToggle = () => {
    if (isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate();
    }
  };

  const isOwnPost = user?.id === post.authorId;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Author Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={post.author?.profileImageUrl || ""} />
            <AvatarFallback className="bg-primary-500 text-white">
              {(post.author?.firstName?.[0] || "") + (post.author?.lastName?.[0] || "")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900" data-testid={`text-author-${post.id}`}>
                  {post.author?.firstName} {post.author?.lastName}
                </h4>
                {post.postType !== 'text' && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {post.postType}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-gray-500">
                  <Clock size={14} />
                  <span className="text-sm" data-testid={`text-time-${post.id}`}>
                    {formatDistanceToNow(new Date(post.createdAt))} ago
                  </span>
                </div>
                
                {isOwnPost && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid={`button-more-${post.id}`}>
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="text-red-600"
                        data-testid={`menu-delete-${post.id}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed" data-testid={`text-content-${post.id}`}>
                {post.content}
              </p>
              
              {/* Media Content */}
              {post.mediaUrl && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  {post.postType === 'image' ? (
                    <img 
                      src={post.mediaUrl} 
                      alt="Post media" 
                      className="w-full h-auto max-h-96 object-cover"
                      data-testid={`img-media-${post.id}`}
                    />
                  ) : post.postType === 'video' ? (
                    <video 
                      src={post.mediaUrl} 
                      controls 
                      className="w-full h-auto max-h-96"
                      data-testid={`video-media-${post.id}`}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : null}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLikeToggle}
                  disabled={likeMutation.isPending || unlikeMutation.isPending}
                  className={`flex items-center space-x-2 transition-colors ${
                    isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
                  }`}
                  data-testid={`button-like-${post.id}`}
                >
                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                  <span>{post.likesCount || 0}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-500 hover:text-primary-500 transition-colors"
                  data-testid={`button-comment-${post.id}`}
                >
                  <MessageCircle size={16} />
                  <span>{post.commentsCount || 0}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-500 hover:text-primary-500 transition-colors"
                  data-testid={`button-share-${post.id}`}
                >
                  <Share size={16} />
                  <span>Share</span>
                </Button>
              </div>

              {/* Additional post metadata can go here */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
