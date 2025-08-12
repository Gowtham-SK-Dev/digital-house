import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Search, MapPin, Star, Users, TrendingUp, Award, ExternalLink, Phone, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Business {
  id: string;
  ownerId: string;
  owner: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  businessName: string;
  businessLogo?: string;
  category: string;
  description: string;
  location: string;
  website?: string;
  phone?: string;
  email?: string;
  services: string[];
  yearEstablished?: number;
  employeeCount?: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  socialMedia: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  createdAt: string;
}

export default function BusinessHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const { data: businesses = [], isLoading } = useQuery<Business[]>({
    queryKey: ["/api/businesses", searchTerm, selectedCategory, selectedLocation],
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/businesses/categories"],
  });

  const contactMutation = useMutation({
    mutationFn: async (businessId: string) => {
      await apiRequest(`/api/businesses/${businessId}/contact`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Contact Request Sent",
        description: "Your contact request has been sent to the business owner.",
      });
    },
  });

  const businessCategories = [
    "Technology", "Healthcare", "Finance", "Education", "Retail", "Restaurant", 
    "Real Estate", "Legal", "Consulting", "Manufacturing", "Construction", "Other"
  ];

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = !searchTerm || 
      business.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || business.category === selectedCategory;
    const matchesLocation = !selectedLocation || business.location.toLowerCase().includes(selectedLocation.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Building className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Business Hub
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and connect with community businesses and entrepreneurs
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{businesses.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Businesses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{businesses.filter(b => b.isVerified).length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Verified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{businesses.filter(b => b.isFeatured).length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Featured</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{categories.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Business Button */}
      {user && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Promote your business</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showcase your services to the community and grow your network
                  </p>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-add-business">
                Add Your Business
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
            Find Businesses
          </CardTitle>
          <CardDescription>
            Search for businesses and services within our community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Business name, services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {businessCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Featured Businesses */}
      {businesses.some(b => b.isFeatured) && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Featured Businesses
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {businesses.filter(b => b.isFeatured).slice(0, 3).map((business) => (
              <Card key={business.id} className="overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={business.businessLogo} />
                      <AvatarFallback className="bg-yellow-200 text-yellow-800 text-lg">
                        {business.businessName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold" data-testid={`text-name-${business.id}`}>
                          {business.businessName}
                        </h3>
                        {business.isVerified && (
                          <Badge className="bg-blue-500 text-white text-xs">Verified</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {business.category}
                      </p>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{business.rating}</span>
                        <span className="text-sm text-gray-500">({business.reviewsCount})</span>
                      </div>
                      
                      <p className="text-sm line-clamp-2 mb-3">
                        {business.description}
                      </p>
                      
                      <Button size="sm" className="w-full" data-testid={`button-view-${business.id}`}>
                        View Business
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Businesses */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Businesses</h2>
        {filteredBusinesses.map((business) => (
          <Card key={business.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Business Logo */}
                <Avatar className="h-16 w-16">
                  <AvatarImage src={business.businessLogo} />
                  <AvatarFallback className="bg-purple-100 text-purple-800 text-lg">
                    {business.businessName[0]}
                  </AvatarFallback>
                </Avatar>

                {/* Business Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg" data-testid={`text-business-${business.id}`}>
                          {business.businessName}
                        </h3>
                        {business.isVerified && (
                          <Badge className="bg-blue-500 text-white">Verified</Badge>
                        )}
                        {business.isFeatured && (
                          <Badge className="bg-yellow-500 text-white">Featured</Badge>
                        )}
                      </div>
                      <p className="text-purple-600 font-medium">{business.category}</p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{business.rating}</span>
                      <span className="text-gray-500">({business.reviewsCount} reviews)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {business.location}
                    </div>
                    {business.yearEstablished && (
                      <div>Est. {business.yearEstablished}</div>
                    )}
                    {business.employeeCount && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {business.employeeCount} employees
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                    {business.description}
                  </p>

                  {/* Services */}
                  <div className="flex flex-wrap gap-1">
                    {business.services.slice(0, 4).map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {business.services.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{business.services.length - 4} more
                      </Badge>
                    )}
                  </div>

                  {/* Owner Info */}
                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={business.owner.profileImageUrl} />
                      <AvatarFallback className="text-xs">
                        {business.owner.firstName[0]}{business.owner.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-600 dark:text-gray-400">
                      Owned by {business.owner.firstName} {business.owner.lastName}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => contactMutation.mutate(business.id)}
                    disabled={contactMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid={`button-contact-${business.id}`}
                  >
                    {contactMutation.isPending ? "Contacting..." : "Contact"}
                  </Button>
                  
                  <div className="flex gap-1">
                    {business.phone && (
                      <Button variant="outline" size="sm" data-testid={`button-phone-${business.id}`}>
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                    {business.email && (
                      <Button variant="outline" size="sm" data-testid={`button-email-${business.id}`}>
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    {business.website && (
                      <Button variant="outline" size="sm" data-testid={`button-website-${business.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBusinesses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Businesses Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria to find more businesses
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}