import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Sparkles, Users, Calendar, Shield, MessageCircle, Camera, Briefcase, Heart, Trophy, Globe } from "lucide-react";

export default function VersionSelector() {
  const [, setLocation] = useLocation();

  const handleVersionSelect = (version: string) => {
    localStorage.setItem('digital-house-version', version);
    setLocation('/');
  };

  const currentVersion = localStorage.getItem('digital-house-version') || 'v1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Digital House Experience
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select the version that best suits your community networking needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Version 1.0 */}
          <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${currentVersion === 'v1' ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Digital House v1.0</CardTitle>
                <Badge variant="secondary">Classic</Badge>
              </div>
              <CardDescription>
                Essential community networking platform with core features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Member Profiles</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span>Social Posts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span>Events System</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-red-500" />
                  <span>Emergency Help</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Perfect for:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Basic community connections</li>
                  <li>• Event organization</li>
                  <li>• Simple social networking</li>
                  <li>• Emergency assistance</li>
                </ul>
              </div>

              <Button 
                onClick={() => handleVersionSelect('v1')}
                className="w-full"
                variant={currentVersion === 'v1' ? "default" : "outline"}
                data-testid="button-select-v1"
              >
                {currentVersion === 'v1' ? 'Currently Selected' : 'Select Classic Version'}
              </Button>
            </CardContent>
          </Card>

          {/* Version 2.0 */}
          <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${currentVersion === 'v2' ? 'ring-2 ring-purple-500' : ''}`}>
            <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-blue-500 text-white px-3 py-1 text-xs font-semibold">
              ENHANCED
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  Digital House v2.0
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </CardTitle>
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  Advanced
                </Badge>
              </div>
              <CardDescription>
                Next-generation platform with AI-powered features and advanced networking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span>Matrimony AI</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  <span>Job Portal</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Camera className="h-4 w-4 text-green-500" />
                  <span>Stories & Media</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>Achievements</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-indigo-500" />
                  <span>Business Hub</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>AI Recommendations</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Perfect for:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Advanced community engagement</li>
                  <li>• Professional networking</li>
                  <li>• Matrimony matching</li>
                  <li>• Business opportunities</li>
                  <li>• AI-powered recommendations</li>
                </ul>
              </div>

              <Button 
                onClick={() => handleVersionSelect('v2')}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                variant={currentVersion === 'v2' ? "default" : "outline"}
                data-testid="button-select-v2"
              >
                {currentVersion === 'v2' ? 'Currently Selected' : 'Select Advanced Version'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Version Comparison</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Version 1.0 Features</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>✓ Basic profiles and connections</li>
                    <li>✓ Simple event management</li>
                    <li>✓ Emergency help desk</li>
                    <li>✓ Social posts and comments</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-purple-600 dark:text-purple-400 mb-2">Version 2.0 Additional Features</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>✓ All v1.0 features plus:</li>
                    <li>✓ AI-powered matrimony matching</li>
                    <li>✓ Job portal and business hub</li>
                    <li>✓ Stories and rich media</li>
                    <li>✓ Achievement system</li>
                    <li>✓ Smart recommendations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}