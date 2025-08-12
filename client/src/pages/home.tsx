import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Briefcase, Search, Plus, MessageCircle, Heart, Bell, MapPin, Star, ChevronRight, HelpCircle, Home as HomeIcon, Building, Clock, TrendingUp, Award } from "lucide-react";
import { Link } from "wouter";
import type { Post, Event, HelpRequest, Job, Business } from "@shared/schema";

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

  // Fetch data for home page
  const { data: postsData, isLoading: postsLoading } = useQuery<{data: Post[]}>({
    queryKey: ["/api/posts"],
    retry: false,
  });
  const posts = postsData?.data || [];

  const { data: eventsData } = useQuery<{data: Event[]}>({
    queryKey: ["/api/events"],
    retry: false,
  });
  const events = eventsData?.data || [];

  const { data: helpRequestsData } = useQuery<{data: HelpRequest[]}>({
    queryKey: ["/api/help-requests"],
    retry: false,
  });
  const helpRequests = helpRequestsData?.data || [];

  const { data: jobsData } = useQuery<{data: Job[]}>({
    queryKey: ["/api/jobs"],
    retry: false,
  });
  const jobs = jobsData?.data || [];

  const { data: businessesData } = useQuery<{data: Business[]}>({
    queryKey: ["/api/businesses"],
    retry: false,
  });
  const businesses = businessesData?.data || [];

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
            {/* Hero Community Section */}
            <Card className="bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 text-white border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <HomeIcon className="text-white" size={28} />
                    </div>
                    <div>
                      <h1 className="font-bold text-2xl" data-testid="text-welcome">
                        Vanakkam {user?.firstName || "Member"}! 🎉
                      </h1>
                      <p className="text-white text-opacity-90 text-lg" data-testid="text-location">
                        Your Digital House is buzzing today
                      </p>
                    </div>
                  </div>
                  <EmergencyButton />
                </div>

                {/* Live Community Pulse */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white bg-opacity-15 rounded-lg p-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold">{posts.length}</div>
                    <div className="text-sm opacity-90">Posts Today</div>
                  </div>
                  <div className="bg-white bg-opacity-15 rounded-lg p-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold">{helpRequests.filter(req => req.status === 'active').length}</div>
                    <div className="text-sm opacity-90">Help Requests</div>
                  </div>
                  <div className="bg-white bg-opacity-15 rounded-lg p-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold">{events.length}</div>
                    <div className="text-sm opacity-90">Upcoming Events</div>
                  </div>
                  <div className="bg-white bg-opacity-15 rounded-lg p-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold">247</div>
                    <div className="text-sm opacity-90">Online Now</div>
                  </div>
                </div>

                {/* Call-to-Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant="secondary" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-12"
                    data-testid="button-share-update"
                  >
                    <Plus size={16} className="mr-2" />
                    Share Update
                  </Button>
                  <Link href="/help-desk">
                    <Button 
                      variant="secondary" 
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-12 w-full"
                      data-testid="button-ask-help"
                    >
                      <HelpCircle size={16} className="mr-2" />
                      Ask for Help
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button 
                      variant="secondary" 
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-12 w-full"
                      data-testid="button-post-job"
                    >
                      <Briefcase size={16} className="mr-2" />
                      Post a Job
                    </Button>
                  </Link>
                  <Link href="/business">
                    <Button 
                      variant="secondary" 
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-12 w-full"
                      data-testid="button-business-rooms"
                    >
                      <Building size={16} className="mr-2" />
                      Business Rooms
                    </Button>
                  </Link>
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

            {/* Central Activity Feed */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Community Activity Feed</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    <Bell size={12} className="mr-1" />
                    2 Urgent
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <TrendingUp size={16} className="mr-2" />
                    Live Feed
                  </Button>
                </div>
              </div>

              {/* Priority Pinned Items */}
              {helpRequests.filter(req => req.urgencyLevel && req.urgencyLevel >= 4).length > 0 && (
                <Card className="mb-4 border-red-200 bg-red-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Urgent</Badge>
                      <CardTitle className="text-red-800">Priority Help Requests</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {helpRequests.filter(req => req.urgencyLevel && req.urgencyLevel >= 4).slice(0, 2).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg mb-2 last:mb-0">
                        <div className="flex-1">
                          <h4 className="font-medium text-red-900">{request.title}</h4>
                          <p className="text-sm text-red-700">{request.location}</p>
                        </div>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          I Can Help
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

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
              ) : posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation!</h3>
                    <p className="text-gray-600 mb-4">
                      Be the first to share something with the community today
                    </p>
                    <Button 
                      onClick={() => setNewPostContent("Hello Digital House community! 👋 Excited to connect with everyone here!")}
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

          {/* Community Power Panels */}
          <div className="space-y-6">
            {/* Real-Time Help Board */}
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <HelpCircle size={18} />
                    Help Board
                  </CardTitle>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {helpRequests.filter(req => req.status === 'active').length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {helpRequests.filter(req => req.status === 'active').slice(0, 3).map((request) => (
                  <div key={request.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-orange-900 text-sm line-clamp-1">{request.title}</h4>
                      <Badge variant={request.urgencyLevel >= 4 ? "destructive" : "secondary"} className="text-xs">
                        {request.urgencyLevel >= 4 ? "Urgent" : "Normal"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-orange-700">
                        <MapPin size={12} className="mr-1" />
                        {request.location}
                      </div>
                      <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-orange-300 text-orange-700 hover:bg-orange-100">
                        I Can Help
                      </Button>
                    </div>
                  </div>
                ))}
                <Link href="/help-desk">
                  <Button variant="outline" className="w-full text-orange-700 border-orange-300 hover:bg-orange-50">
                    View All Requests
                    <ChevronRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Business Rooms Spotlight */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <Building size={18} />
                    Business Spotlight
                  </CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {businesses.length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {businesses.slice(0, 3).map((business) => (
                  <div key={business.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                        <Building size={14} className="text-blue-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-blue-900 text-sm line-clamp-1">{business.businessName}</h4>
                        <p className="text-xs text-blue-700 line-clamp-1">{business.category}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-blue-600">
                            <Star size={10} className="mr-1 fill-current" />
                            {business.rating}/5
                          </div>
                          <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-blue-300 text-blue-700 hover:bg-blue-100">
                            Connect
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/business">
                  <Button variant="outline" className="w-full text-blue-700 border-blue-300 hover:bg-blue-50">
                    View All Businesses
                    <ChevronRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Jobs Highlights */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <Briefcase size={18} />
                    Latest Jobs
                  </CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {jobs.length} Open
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {jobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-green-900 text-sm line-clamp-1">{job.title}</h4>
                      {job.isUrgent && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-xs text-green-700 mb-2">{job.company}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-green-600">
                        <MapPin size={10} className="mr-1" />
                        {job.isRemote ? "Remote" : job.location}
                      </div>
                      <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-green-300 text-green-700 hover:bg-green-100">
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
                <Link href="/jobs">
                  <Button variant="outline" className="w-full text-green-700 border-green-300 hover:bg-green-50">
                    View All Jobs
                    <ChevronRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Matrimony Matches */}
            <Card className="border-pink-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-pink-800 flex items-center gap-2">
                    <Heart size={18} />
                    Matrimony
                  </CardTitle>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                    2 New
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <h4 className="font-medium text-pink-900 text-sm mb-1">New profiles added</h4>
                  <p className="text-xs text-pink-700 mb-2">Based on your preferences</p>
                  <Button size="sm" variant="outline" className="w-full text-pink-700 border-pink-300 hover:bg-pink-100">
                    View Matches
                  </Button>
                </div>
                <Link href="/matrimony">
                  <Button variant="outline" className="w-full text-pink-700 border-pink-300 hover:bg-pink-50">
                    View All Profiles
                    <ChevronRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Community Recognition */}
            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <Award size={18} />
                  Community Heroes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                    <span className="text-sm text-purple-900">Helping Hand</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">Priya K.</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                    <span className="text-sm text-purple-900">Business Builder</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">Ravi S.</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
