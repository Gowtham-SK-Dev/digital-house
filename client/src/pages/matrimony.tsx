import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Search, Filter, Star, MapPin, Briefcase, Calendar, Users, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MatrimonyProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  age: number;
  occupation: string;
  location: string;
  nativePlace: string;
  kulam: string;
  natchathiram: string;
  education: string;
  height: string;
  interests: string[];
  lookingFor: string;
  isActive: boolean;
  matchScore?: number;
  createdAt: string;
}

export default function Matrimony() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [ageRange, setAgeRange] = useState({ min: 18, max: 50 });
  const [selectedKulam, setSelectedKulam] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const { data: profiles = [], isLoading } = useQuery<MatrimonyProfile[]>({
    queryKey: ["/api/matrimony/profiles", searchTerm, ageRange, selectedKulam, selectedLocation],
  });

  const { data: userProfile } = useQuery<MatrimonyProfile>({
    queryKey: ["/api/matrimony/my-profile"],
    enabled: !!user,
  });

  const interestMutation = useMutation({
    mutationFn: async (profileId: string) => {
      await apiRequest(`/api/matrimony/profiles/${profileId}/interest`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Interest Sent",
        description: "Your interest has been sent successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/matrimony/profiles"] });
    },
  });

  const kulamOptions = [
    "Brahmin", "Kshatriya", "Vaishya", "Shudra", "Reddy", "Kamma", "Kapu", "Velama",
    "Naidu", "Chettiar", "Mudaliar", "Pillai", "Nair", "Menon", "Other"
  ];

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm || 
      `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAge = profile.age >= ageRange.min && profile.age <= ageRange.max;
    const matchesKulam = !selectedKulam || selectedKulam === 'all' || profile.kulam === selectedKulam;
    const matchesLocation = !selectedLocation || profile.location.includes(selectedLocation);
    
    return matchesSearch && matchesAge && matchesKulam && matchesLocation;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 text-pink-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
            Matrimony Portal
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Find your perfect life partner within our trusted community
        </p>
      </div>

      {/* User Profile Status */}
      {user && (
        <Card className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-pink-600" />
                <div>
                  <p className="font-medium">Your Matrimony Profile</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userProfile ? "Profile active and visible" : "Create your profile to get started"}
                  </p>
                </div>
              </div>
              <Button 
                variant={userProfile ? "outline" : "default"}
                className={userProfile ? "" : "bg-pink-600 hover:bg-pink-700"}
                data-testid="button-manage-profile"
              >
                {userProfile ? "Edit Profile" : "Create Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          <CardDescription>
            Find compatible matches based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Name, occupation, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            
            <div>
              <Label htmlFor="kulam">Kulam</Label>
              <Select value={selectedKulam} onValueChange={setSelectedKulam}>
                <SelectTrigger data-testid="select-kulam">
                  <SelectValue placeholder="Select Kulam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Kulam</SelectItem>
                  {kulamOptions.map(kulam => (
                    <SelectItem key={kulam} value={kulam}>{kulam}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State, Country"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                data-testid="input-location"
              />
            </div>

            <div>
              <Label>Age Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={ageRange.min}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, min: parseInt(e.target.value) || 18 }))}
                  className="w-20"
                  data-testid="input-age-min"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={ageRange.max}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, max: parseInt(e.target.value) || 50 }))}
                  className="w-20"
                  data-testid="input-age-max"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* Profile Image and Header */}
              <div className="relative bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 p-6">
                {profile.matchScore && (
                  <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    {profile.matchScore}% Match
                  </div>
                )}
                
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-3">
                    <AvatarImage src={profile.profileImageUrl} />
                    <AvatarFallback className="text-lg bg-pink-200 text-pink-800">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-lg" data-testid={`text-name-${profile.id}`}>
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profile.age} years old
                  </p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{profile.occupation}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span>{profile.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Kulam:</span> {profile.kulam}
                  </div>
                  <div>
                    <span className="font-medium">Native:</span> {profile.nativePlace}
                  </div>
                  <div>
                    <span className="font-medium">Star:</span> {profile.natchathiram}
                  </div>
                  <div>
                    <span className="font-medium">Height:</span> {profile.height}
                  </div>
                </div>

                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {profile.interests.slice(0, 3).map((interest, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => interestMutation.mutate(profile.id)}
                    disabled={interestMutation.isPending}
                    className="flex-1 bg-pink-600 hover:bg-pink-700"
                    size="sm"
                    data-testid={`button-interest-${profile.id}`}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {interestMutation.isPending ? "Sending..." : "Express Interest"}
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-view-${profile.id}`}>
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Profiles Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria to find more matches
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}