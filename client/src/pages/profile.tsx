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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Briefcase, Phone, Mail, Edit3, Save, X } from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserType>>({});

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

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        location: user.location || "",
        nativePlace: user.nativePlace || "",
        kulam: user.kulam || "",
        natchathiram: user.natchathiram || "",
        occupation: user.occupation || "",
        aboutMe: user.aboutMe || "",
        role: user.role || "individual",
        profileVisibility: user.profileVisibility || "public",
      });
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserType>) => {
      await apiRequest("PUT", "/api/users/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        location: user.location || "",
        nativePlace: user.nativePlace || "",
        kulam: user.kulam || "",
        natchathiram: user.natchathiram || "",
        occupation: user.occupation || "",
        aboutMe: user.aboutMe || "",
        role: user.role || "individual",
        profileVisibility: user.profileVisibility || "public",
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profileImageUrl || ""} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="text-xl bg-primary-500 text-white">
                    {(user.firstName?.[0] || "") + (user.lastName?.[0] || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-name">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    {user.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin size={16} />
                        <span data-testid="text-location">{user.location}</span>
                      </div>
                    )}
                    {user.occupation && (
                      <div className="flex items-center space-x-1">
                        <Briefcase size={16} />
                        <span data-testid="text-occupation">{user.occupation}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                    <Badge 
                      variant={user.isVerified ? "default" : "secondary"}
                      className={user.isVerified ? "bg-green-500" : ""}
                    >
                      {user.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                variant={isEditing ? "outline" : "default"}
                className={isEditing ? "" : "bg-primary-500 hover:bg-primary-600"}
                data-testid={isEditing ? "button-cancel" : "button-edit"}
              >
                {isEditing ? (
                  <>
                    <X size={16} className="mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 size={16} className="mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>

            {user.aboutMe && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">About Me</h3>
                <p className="text-gray-700" data-testid="text-about">{user.aboutMe}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User size={20} />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ""}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    disabled={!isEditing}
                    data-testid="input-firstName"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName || ""}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    disabled={!isEditing}
                    data-testid="input-lastName"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center space-x-2">
                  <Mail size={16} className="text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex items-center space-x-2">
                  <Phone size={16} className="text-gray-400" />
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    disabled={!isEditing}
                    placeholder="+91 XXXXXXXXXX"
                    data-testid="input-phone"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Current Location</Label>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-gray-400" />
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    disabled={!isEditing}
                    placeholder="City, State/Country"
                    data-testid="input-location"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <div className="flex items-center space-x-2">
                  <Briefcase size={16} className="text-gray-400" />
                  <Input
                    id="occupation"
                    value={formData.occupation || ""}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your profession"
                    data-testid="input-occupation"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="aboutMe">About Me</Label>
                <Textarea
                  id="aboutMe"
                  value={formData.aboutMe || ""}
                  onChange={(e) => handleInputChange("aboutMe", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                  data-testid="textarea-about"
                />
              </div>
            </CardContent>
          </Card>

          {/* Community Information */}
          <Card>
            <CardHeader>
              <CardTitle>Community Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nativePlace">Native Place</Label>
                <Input
                  id="nativePlace"
                  value={formData.nativePlace || ""}
                  onChange={(e) => handleInputChange("nativePlace", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Your ancestral place"
                  data-testid="input-nativePlace"
                />
              </div>

              <div>
                <Label htmlFor="kulam">Kulam</Label>
                <Input
                  id="kulam"
                  value={formData.kulam || ""}
                  onChange={(e) => handleInputChange("kulam", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Your kulam"
                  data-testid="input-kulam"
                />
              </div>

              <div>
                <Label htmlFor="natchathiram">Natchathiram</Label>
                <Input
                  id="natchathiram"
                  value={formData.natchathiram || ""}
                  onChange={(e) => handleInputChange("natchathiram", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Your natchathiram"
                  data-testid="input-natchathiram"
                />
              </div>

              <div>
                <Label htmlFor="role">Account Type</Label>
                <Select
                  value={formData.role || "individual"}
                  onValueChange={(value) => handleInputChange("role", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger data-testid="select-role">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <Select
                  value={formData.profileVisibility || "public"}
                  onValueChange={(value) => handleInputChange("profileVisibility", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger data-testid="select-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isEditing && (
                <div className="pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="w-full bg-primary-500 hover:bg-primary-600"
                    data-testid="button-save"
                  >
                    {updateProfileMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
