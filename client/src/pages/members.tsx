import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Briefcase, UserPlus, Users, Filter } from "lucide-react";
import type { User } from "@shared/schema";

export default function Members() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch members
  const { data: members, isLoading: membersLoading } = useQuery<User[]>({
    queryKey: ["/api/users/search", { q: debouncedQuery, limit: "20" }],
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    retry: false,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Members</h1>
          <p className="text-gray-600">Connect with fellow community members worldwide</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search by name, location, profession, or native place..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Button variant="outline" data-testid="button-filter">
                <Filter size={16} className="mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchQuery.length >= 2 ? (
          <div>
            {membersLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : members && members.length > 0 ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Search Results ({members.length})
                  </h2>
                  <p className="text-gray-600">Found {members.length} members matching "{debouncedQuery}"</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member) => (
                    <Card key={member.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 mb-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={member.profileImageUrl || ""} alt={`${member.firstName} ${member.lastName}`} />
                            <AvatarFallback className="bg-primary-500 text-white">
                              {(member.firstName?.[0] || "") + (member.lastName?.[0] || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate" data-testid={`text-name-${member.id}`}>
                              {member.firstName} {member.lastName}
                            </h3>
                            {member.location && (
                              <div className="flex items-center space-x-1 text-gray-600 mb-1">
                                <MapPin size={14} />
                                <span className="text-sm truncate" data-testid={`text-location-${member.id}`}>
                                  {member.location}
                                </span>
                              </div>
                            )}
                            {member.occupation && (
                              <div className="flex items-center space-x-1 text-gray-600 mb-2">
                                <Briefcase size={14} />
                                <span className="text-sm truncate" data-testid={`text-occupation-${member.id}`}>
                                  {member.occupation}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {member.role}
                              </Badge>
                              {member.isVerified && (
                                <Badge variant="default" className="text-xs bg-green-500">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {member.nativePlace && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              <strong>Native Place:</strong> {member.nativePlace}
                            </p>
                          </div>
                        )}

                        {member.aboutMe && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {member.aboutMe}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <Button 
                            size="sm" 
                            className="bg-primary-500 hover:bg-primary-600"
                            data-testid={`button-connect-${member.id}`}
                          >
                            <UserPlus size={14} className="mr-1" />
                            Connect
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-view-${member.id}`}>
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                  <p className="text-gray-600 mb-4">
                    No members match your search for "{debouncedQuery}". Try different keywords.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    data-testid="button-clear-search"
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Default State */
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6">
              <Users className="h-12 w-12 text-primary-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Discover Community Members
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Start searching to find and connect with fellow community members. You can search by name, location, profession, native place, and more.
            </p>
            <div className="bg-white rounded-xl p-8 max-w-md mx-auto border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Search Tips:</h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>• Search by name (first or last name)</li>
                <li>• Find members by current location</li>
                <li>• Discover people in your profession</li>
                <li>• Connect with those from your native place</li>
                <li>• Look for specific skills or interests</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
