import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Search, MapPin, Clock, DollarSign, Building, Users, Star, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  salaryRange: string;
  skills: string[];
  benefits: string[];
  postedById: string;
  postedBy: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  applicationsCount: number;
  isUrgent: boolean;
  isRemote: boolean;
  createdAt: string;
}

export default function Jobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs", searchTerm, selectedLocation, selectedType, selectedLevel],
  });

  const { data: myApplications = [] } = useQuery<any[]>({
    queryKey: ["/api/jobs/my-applications"],
    enabled: !!user,
  });

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await apiRequest(`/api/jobs/${jobId}/apply`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your job application has been submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/my-applications"] });
    },
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !selectedLocation || job.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesType = !selectedType || job.type === selectedType;
    const matchesLevel = !selectedLevel || job.experienceLevel === selectedLevel;
    
    return matchesSearch && matchesLocation && matchesType && matchesLevel;
  });

  const hasApplied = (jobId: string) => {
    return myApplications.some(app => app.jobId === jobId);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Job Portal
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Discover career opportunities within our trusted community network
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{jobs.filter(j => j.isRemote).length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Remote Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{jobs.filter(j => j.isUrgent).length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Urgent Hiring</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{myApplications.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">My Applications</div>
          </CardContent>
        </Card>
      </div>

      {/* Post Job Button */}
      {user && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Hiring for your company?</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Post job openings and find talented community members
                  </p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-post-job">
                Post a Job
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
            Search Jobs
          </CardTitle>
          <CardDescription>
            Find opportunities that match your skills and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Job title, company, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
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
              <Label htmlFor="type">Job Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger data-testid="select-type">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Experience Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger data-testid="select-level">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  {/* Company Logo */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={job.companyLogo} />
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      {job.company[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Job Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg" data-testid={`text-title-${job.id}`}>
                            {job.title}
                          </h3>
                          {job.isUrgent && (
                            <Badge className="bg-red-500 text-white">Urgent</Badge>
                          )}
                          {job.isRemote && (
                            <Badge variant="secondary">Remote</Badge>
                          )}
                        </div>
                        <p className="text-blue-600 font-medium">{job.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salaryRange}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {job.applicationsCount} applicants
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                      {job.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills.length - 5} more
                        </Badge>
                      )}
                    </div>

                    {/* Posted By */}
                    <div className="flex items-center gap-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={job.postedBy.profileImageUrl} />
                        <AvatarFallback className="text-xs">
                          {job.postedBy.firstName[0]}{job.postedBy.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-600 dark:text-gray-400">
                        Posted by {job.postedBy.firstName} {job.postedBy.lastName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    onClick={() => applyMutation.mutate(job.id)}
                    disabled={applyMutation.isPending || hasApplied(job.id)}
                    className={hasApplied(job.id) ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"}
                    data-testid={`button-apply-${job.id}`}
                  >
                    {hasApplied(job.id) ? "Applied" : applyMutation.isPending ? "Applying..." : "Apply Now"}
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-view-${job.id}`}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Jobs Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria to find more opportunities
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}