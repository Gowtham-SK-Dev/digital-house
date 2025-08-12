import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle,
  Heart,
  MapPin,
  Clock,
  User,
  MessageCircle,
  Plus,
  Send,
  Filter,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { HelpRequest } from "@shared/schema";

export default function HelpDesk() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    type: "other" as const,
    location: "",
    urgencyLevel: 1
  });

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

  // Fetch help requests
  const { data: helpRequests, isLoading: requestsLoading } = useQuery<HelpRequest[]>({
    queryKey: ["/api/help-requests"],
    retry: false,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Create help request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      await apiRequest("POST", "/api/help-requests", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help-requests"] });
      setIsCreateRequestOpen(false);
      setNewRequest({
        title: "",
        description: "",
        type: "other",
        location: "",
        urgencyLevel: 1
      });
      toast({
        title: "Success",
        description: "Help request created successfully!",
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
        description: "Failed to create help request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Respond to help request mutation
  const respondMutation = useMutation({
    mutationFn: async ({ requestId, message }: { requestId: string; message: string }) => {
      await apiRequest("POST", `/api/help-requests/${requestId}/respond`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help-requests"] });
      setSelectedRequest(null);
      setResponseMessage("");
      toast({
        title: "Success",
        description: "Response sent successfully!",
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
        description: "Failed to send response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateRequest = () => {
    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createRequestMutation.mutate(newRequest);
  };

  const handleRespond = () => {
    if (!responseMessage.trim() || !selectedRequest) return;
    respondMutation.mutate({ requestId: selectedRequest, message: responseMessage });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medical': return 'bg-red-500';
      case 'travel': return 'bg-blue-500';
      case 'safety': return 'bg-orange-500';
      case 'other': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (level: number) => {
    if (level >= 4) return 'bg-red-500';
    if (level >= 3) return 'bg-orange-500';
    if (level >= 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUrgencyText = (level: number) => {
    if (level >= 4) return 'Critical';
    if (level >= 3) return 'High';
    if (level >= 2) return 'Medium';
    return 'Low';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading help desk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
              <Heart className="text-red-500" />
              <span>Community Help Desk</span>
            </h1>
            <p className="text-gray-600">Get help from fellow community members during emergencies</p>
          </div>
          
          <Dialog open={isCreateRequestOpen} onOpenChange={setIsCreateRequestOpen}>
            <DialogTrigger asChild>
              <Button className="btn-emergency" data-testid="button-request-help">
                <AlertTriangle size={16} className="mr-2" />
                Request Help
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <AlertTriangle className="text-red-500" />
                  <span>Request Community Help</span>
                </DialogTitle>
              </DialogHeader>
              
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This help request will be visible to nearby community members who can assist you.
                  For medical emergencies, please call local emergency services first.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Help Request Title *</Label>
                  <Input
                    id="title"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of what you need help with"
                    data-testid="input-help-title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    value={newRequest.description}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide more details about your situation and what kind of help you need..."
                    className="min-h-[120px]"
                    data-testid="textarea-help-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type of Help</Label>
                    <Select
                      value={newRequest.type}
                      onValueChange={(value: any) => setNewRequest(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger data-testid="select-help-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">Medical Emergency</SelectItem>
                        <SelectItem value="travel">Travel Assistance</SelectItem>
                        <SelectItem value="safety">Safety & Security</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select
                      value={newRequest.urgencyLevel.toString()}
                      onValueChange={(value) => setNewRequest(prev => ({ ...prev, urgencyLevel: parseInt(value) }))}
                    >
                      <SelectTrigger data-testid="select-urgency">
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Low - Can wait a few hours</SelectItem>
                        <SelectItem value="2">Medium - Needed today</SelectItem>
                        <SelectItem value="3">High - Needed within hour</SelectItem>
                        <SelectItem value="4">Critical - Immediate assistance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    value={newRequest.location}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Where are you located? (helps volunteers find you)"
                    data-testid="input-help-location"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateRequestOpen(false)} data-testid="button-cancel-help">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateRequest}
                    disabled={createRequestMutation.isPending}
                    className="btn-emergency"
                    data-testid="button-submit-help"
                  >
                    {createRequestMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Requests Alert */}
        {helpRequests && helpRequests.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <Activity className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-800">
              <strong>{helpRequests.length}</strong> active help request{helpRequests.length !== 1 ? 's' : ''} 
              from community members. Your assistance could make a difference!
            </AlertDescription>
          </Alert>
        )}

        {/* Filter Bar */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" data-testid="button-filter-all">
                All Requests
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-filter-medical">
                Medical
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-filter-travel">
                Travel
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-filter-safety">
                Safety
              </Button>
              <div className="flex-1"></div>
              <Button variant="outline" size="sm" data-testid="button-more-filters">
                <Filter size={16} className="mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Requests List */}
        {requestsLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : helpRequests && helpRequests.length > 0 ? (
          <div className="space-y-6">
            {helpRequests.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      {(request as any).requester && (
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={(request as any).requester.profileImageUrl || ""} />
                          <AvatarFallback className="bg-primary-500 text-white">
                            {((request as any).requester.firstName?.[0] || "") + ((request as any).requester.lastName?.[0] || "")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900" data-testid={`text-request-title-${request.id}`}>
                            {request.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs text-white ${getTypeColor(request.type)} capitalize`}>
                              {request.type}
                            </Badge>
                            <Badge className={`text-xs text-white ${getUrgencyColor(request.urgencyLevel)}`}>
                              {getUrgencyText(request.urgencyLevel)}
                            </Badge>
                          </div>
                        </div>
                        
                        {(request as any).requester && (
                          <div className="flex items-center space-x-4 text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <User size={14} />
                              <span className="text-sm" data-testid={`text-requester-${request.id}`}>
                                {(request as any).requester.firstName} {(request as any).requester.lastName}
                              </span>
                            </div>
                            {(request as any).requester.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin size={14} />
                                <span className="text-sm" data-testid={`text-requester-location-${request.id}`}>
                                  {(request as any).requester.location}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span className="text-sm" data-testid={`text-request-time-${request.id}`}>
                                {formatDistanceToNow(new Date(request.createdAt))} ago
                              </span>
                            </div>
                          </div>
                        )}

                        <p className="text-gray-700 mb-4" data-testid={`text-request-description-${request.id}`}>
                          {request.description}
                        </p>

                        {request.location && (
                          <div className="flex items-center space-x-2 text-gray-600 mb-4">
                            <MapPin size={16} />
                            <span className="text-sm" data-testid={`text-request-location-${request.id}`}>
                              <strong>Location:</strong> {request.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Status: <span className="capitalize font-medium">{request.status}</span>
                    </div>
                    <div className="flex space-x-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            className="bg-primary-500 hover:bg-primary-600"
                            onClick={() => setSelectedRequest(request.id)}
                            data-testid={`button-respond-${request.id}`}
                          >
                            <MessageCircle size={14} className="mr-1" />
                            Respond
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Respond to Help Request</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="response">Your Response</Label>
                              <Textarea
                                id="response"
                                value={responseMessage}
                                onChange={(e) => setResponseMessage(e.target.value)}
                                placeholder="Let them know how you can help or provide guidance..."
                                className="min-h-[100px]"
                                data-testid="textarea-response"
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button variant="outline" onClick={() => {
                                setSelectedRequest(null);
                                setResponseMessage("");
                              }}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleRespond}
                                disabled={respondMutation.isPending || !responseMessage.trim()}
                                className="bg-primary-500 hover:bg-primary-600"
                                data-testid="button-send-response"
                              >
                                {respondMutation.isPending ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <>
                                    <Send size={14} className="mr-1" />
                                    Send Response
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active help requests</h3>
              <p className="text-gray-600 mb-6">
                Great news! There are currently no active help requests in the community.
              </p>
              <div className="bg-green-50 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-medium text-green-900 mb-2">How the Help Desk works:</h4>
                <ul className="text-sm text-green-800 space-y-1 text-left">
                  <li>• Community members can request help during emergencies</li>
                  <li>• Requests are visible to nearby volunteers</li>
                  <li>• Volunteers can respond with assistance or guidance</li>
                  <li>• All communications are tracked for safety</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
