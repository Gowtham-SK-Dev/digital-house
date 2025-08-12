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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Plus, 
  User,
  CheckCircle,
  XCircle,
  DollarSign,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@shared/schema";

export default function Events() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    maxAttendees: "",
    ticketPrice: "",
    isPublic: true
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

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    retry: false,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      await apiRequest("POST", "/api/events", {
        ...eventData,
        startDate: new Date(eventData.startDate).toISOString(),
        endDate: eventData.endDate ? new Date(eventData.endDate).toISOString() : null,
        maxAttendees: eventData.maxAttendees ? parseInt(eventData.maxAttendees) : null,
        ticketPrice: eventData.ticketPrice ? Math.round(parseFloat(eventData.ticketPrice) * 100) : 0, // Convert to cents
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsCreateEventOpen(false);
      setNewEvent({
        title: "",
        description: "",
        location: "",
        startDate: "",
        endDate: "",
        maxAttendees: "",
        ticketPrice: "",
        isPublic: true
      });
      toast({
        title: "Success",
        description: "Event created successfully!",
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
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      await apiRequest("POST", `/api/events/${eventId}/rsvp`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "RSVP updated successfully!",
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
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.startDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createEventMutation.mutate(newEvent);
  };

  const handleRSVP = (eventId: string, status: string) => {
    rsvpMutation.mutate({ eventId, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-green-500';
      case 'ongoing': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Events</h1>
            <p className="text-gray-600">Discover and join cultural events, festivals, and gatherings</p>
          </div>
          
          <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-500 hover:bg-primary-600" data-testid="button-create-event">
                <Plus size={16} className="mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                    data-testid="input-event-title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your event..."
                    className="min-h-[100px]"
                    data-testid="textarea-event-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Event location"
                      data-testid="input-event-location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAttendees">Max Attendees</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      value={newEvent.maxAttendees}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, maxAttendees: e.target.value }))}
                      placeholder="Optional"
                      data-testid="input-max-attendees"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date & Time *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                      data-testid="input-start-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date & Time</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                      data-testid="input-end-date"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ticketPrice">Ticket Price (₹)</Label>
                  <Input
                    id="ticketPrice"
                    type="number"
                    step="0.01"
                    value={newEvent.ticketPrice}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, ticketPrice: e.target.value }))}
                    placeholder="0.00 (Free event)"
                    data-testid="input-ticket-price"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateEventOpen(false)} data-testid="button-cancel-event">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateEvent}
                    disabled={createEventMutation.isPending}
                    className="bg-primary-500 hover:bg-primary-600"
                    data-testid="button-save-event"
                  >
                    {createEventMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      "Create Event"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Bar */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" data-testid="button-filter-upcoming">
                All Events
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-filter-my-events">
                My Events
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-filter-attending">
                Attending
              </Button>
              <div className="flex-1"></div>
              <Button variant="outline" size="sm" data-testid="button-filters">
                <Filter size={16} className="mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        {eventsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2" data-testid={`text-event-title-${event.id}`}>
                        {event.title}
                      </h3>
                      <Badge className={`text-xs text-white ${getStatusColor(event.status)} capitalize`}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    {event.description && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4" data-testid={`text-event-description-${event.id}`}>
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar size={16} />
                      <span className="text-sm" data-testid={`text-event-date-${event.id}`}>
                        {format(new Date(event.startDate), "MMM dd, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin size={16} />
                        <span className="text-sm truncate" data-testid={`text-event-location-${event.id}`}>
                          {event.location}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users size={16} />
                      <span className="text-sm" data-testid={`text-event-attendees-${event.id}`}>
                        {event.currentAttendees || 0} attending
                        {event.maxAttendees && ` / ${event.maxAttendees} max`}
                      </span>
                    </div>

                    {event.ticketPrice && event.ticketPrice > 0 && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <DollarSign size={16} />
                        <span className="text-sm" data-testid={`text-event-price-${event.id}`}>
                          ₹{(event.ticketPrice / 100).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {(event as any).organizer && (
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-gray-400" />
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={(event as any).organizer.profileImageUrl || ""} />
                            <AvatarFallback className="text-xs bg-primary-500 text-white">
                              {((event as any).organizer.firstName?.[0] || "") + ((event as any).organizer.lastName?.[0] || "")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600" data-testid={`text-organizer-${event.id}`}>
                            {(event as any).organizer.firstName} {(event as any).organizer.lastName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {event.status === 'upcoming' && (
                    <div className="flex space-x-2 pt-4 border-t border-gray-100">
                      <Button 
                        size="sm"
                        onClick={() => handleRSVP(event.id, 'attending')}
                        disabled={rsvpMutation.isPending}
                        className="flex-1 bg-primary-500 hover:bg-primary-600"
                        data-testid={`button-attend-${event.id}`}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Attend
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleRSVP(event.id, 'not_attending')}
                        disabled={rsvpMutation.isPending}
                        className="flex-1"
                        data-testid={`button-decline-${event.id}`}
                      >
                        <XCircle size={14} className="mr-1" />
                        Pass
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                Be the first to create an event for the community!
              </p>
              <Button 
                onClick={() => setIsCreateEventOpen(true)}
                className="bg-primary-500 hover:bg-primary-600"
                data-testid="button-create-first-event"
              >
                <Plus size={16} className="mr-2" />
                Create First Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
