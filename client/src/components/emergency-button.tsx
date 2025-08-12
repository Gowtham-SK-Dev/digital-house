import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Phone, Zap } from "lucide-react";

export default function EmergencyButton() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [emergencyRequest, setEmergencyRequest] = useState({
    title: "",
    description: "",
    type: "medical" as const,
    location: "",
    urgencyLevel: 4 // Emergency requests default to high urgency
  });

  // Create emergency help request mutation
  const createEmergencyMutation = useMutation({
    mutationFn: async (requestData: any) => {
      await apiRequest("POST", "/api/help-requests", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help-requests"] });
      setIsEmergencyDialogOpen(false);
      setEmergencyRequest({
        title: "",
        description: "",
        type: "medical",
        location: "",
        urgencyLevel: 4
      });
      toast({
        title: "Emergency Request Sent!",
        description: "Community members nearby will be notified immediately.",
        variant: "default",
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
        description: "Failed to send emergency request. Please try calling emergency services.",
        variant: "destructive",
      });
    },
  });

  const handleEmergencyRequest = () => {
    if (!emergencyRequest.title.trim() || !emergencyRequest.description.trim()) {
      toast({
        title: "Error",
        description: "Please provide emergency details.",
        variant: "destructive",
      });
      return;
    }
    createEmergencyMutation.mutate(emergencyRequest);
  };

  const emergencyContacts = [
    { label: "Police", number: "100", icon: "🚓" },
    { label: "Fire", number: "101", icon: "🚒" },
    { label: "Ambulance", number: "102", icon: "🚑" },
    { label: "Emergency", number: "112", icon: "🆘" },
  ];

  return (
    <Dialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          className="btn-emergency relative animate-pulse"
          data-testid="button-emergency"
        >
          <AlertTriangle size={16} className="mr-2" />
          Help Request
          <Zap size={12} className="absolute -top-1 -right-1 text-yellow-300" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle size={20} />
            <span>Emergency Help Request</span>
          </DialogTitle>
        </DialogHeader>
        
        {/* Emergency Contacts Alert */}
        <Alert className="border-red-200 bg-red-50 mb-4">
          <Phone className="h-4 w-4 text-red-500" />
          <AlertDescription>
            <div className="mb-2 font-semibold text-red-800">
              For immediate life-threatening emergencies, call:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {emergencyContacts.map((contact) => (
                <a
                  key={contact.number}
                  href={`tel:${contact.number}`}
                  className="flex items-center space-x-2 p-2 bg-white rounded border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <span>{contact.icon}</span>
                  <span className="font-medium">{contact.label}</span>
                  <span className="text-red-600 font-bold">{contact.number}</span>
                </a>
              ))}
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will send an immediate notification to nearby community volunteers. 
              Use this for non-life-threatening situations where you need community assistance.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="emergencyTitle">What kind of help do you need? *</Label>
            <Input
              id="emergencyTitle"
              value={emergencyRequest.title}
              onChange={(e) => setEmergencyRequest(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Need ride to hospital, Lost wallet, Car breakdown"
              className="border-red-300 focus:border-red-500"
              data-testid="input-emergency-title"
            />
          </div>

          <div>
            <Label htmlFor="emergencyDescription">Describe your situation *</Label>
            <Textarea
              id="emergencyDescription"
              value={emergencyRequest.description}
              onChange={(e) => setEmergencyRequest(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Please provide details about your current situation and what assistance you need..."
              className="min-h-[100px] border-red-300 focus:border-red-500"
              data-testid="textarea-emergency-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyType">Type of Emergency</Label>
              <Select
                value={emergencyRequest.type}
                onValueChange={(value: any) => setEmergencyRequest(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="border-red-300" data-testid="select-emergency-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical Emergency</SelectItem>
                  <SelectItem value="travel">Travel Emergency</SelectItem>
                  <SelectItem value="safety">Safety Concern</SelectItem>
                  <SelectItem value="other">Other Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="emergencyLocation">Your Current Location</Label>
              <Input
                id="emergencyLocation"
                value={emergencyRequest.location}
                onChange={(e) => setEmergencyRequest(prev => ({ ...prev, location: e.target.value }))}
                placeholder={user?.location || "Enter your location"}
                className="border-red-300 focus:border-red-500"
                data-testid="input-emergency-location"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              This will notify volunteers within 10km of your location
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsEmergencyDialogOpen(false)}
                data-testid="button-cancel-emergency"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEmergencyRequest}
                disabled={createEmergencyMutation.isPending}
                className="btn-emergency"
                data-testid="button-send-emergency"
              >
                {createEmergencyMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Zap size={16} className="mr-2" />
                    Send Help Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
