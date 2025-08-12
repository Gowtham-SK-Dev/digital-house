import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Navigation from "@/components/navigation";
import PostCard from "@/components/post-card";
import EmergencyButton from "@/components/emergency-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, Briefcase, Search, Plus, MessageCircle, Heart } from "lucide-react";
import { useState } from "react";
import type { Post } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [newPostContent, setNewPostContent] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  // Fetch posts
  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    retry: false,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/posts", { content, postType: "text" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPostContent("");
      toast({
        title: "Success",
        description: "Post created successfully!",
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
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    createPostMutation.mutate(newPostContent);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading Digital House...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Header */}
            <Card className="bg-gradient-to-r from-primary-500 to-accent-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" data-testid="text-welcome">
                        Welcome back, {user?.firstName || "Member"}!
                      </h3>
                      <p className="text-white text-opacity-80" data-testid="text-location">
                        {user?.location || "Connect with your community"}
                      </p>
                    </div>
                  </div>
                  <EmergencyButton />
                </div>
              </CardContent>
            </Card>

            {/* Create Post */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Share with Community</CardTitle>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() || createPostMutation.isPending}
                    className="bg-primary-500 hover:bg-primary-600"
                    data-testid="button-create-post"
                  >
                    {createPostMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Plus size={16} className="mr-2" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="What's on your mind? Share updates, events, or connect with the community..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                  data-testid="textarea-new-post"
                />
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Community Feed</h2>
                <Button variant="ghost" size="sm">
                  <MessageCircle size={16} className="mr-2" />
                  Latest Posts
                </Button>
              </div>

              {postsLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600 mb-4">
                      Be the first to share something with the community!
                    </p>
                    <Button 
                      onClick={() => setNewPostContent("Hello Digital House community! 👋")}
                      className="bg-primary-500 hover:bg-primary-600"
                      data-testid="button-first-post"
                    >
                      Create First Post
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-find-members"
                >
                  <Search className="mr-3 text-primary-500" size={16} />
                  Find Members
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-browse-events"
                >
                  <Calendar className="mr-3 text-secondary-500" size={16} />
                  Browse Events
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-job-portal"
                >
                  <Briefcase className="mr-3 text-accent-500" size={16} />
                  Job Portal
                </Button>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Members</span>
                  <span className="font-semibold text-primary-600" data-testid="text-total-members">5,000+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Countries</span>
                  <span className="font-semibold text-secondary-600" data-testid="text-countries">20+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Events This Month</span>
                  <span className="font-semibold text-accent-600" data-testid="text-events">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Connections</span>
                  <span className="font-semibold text-green-600" data-testid="text-connections">847</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Connections */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Connections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-8">
                  <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Start connecting with community members to see them here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
