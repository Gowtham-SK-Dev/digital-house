import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Users, 
  Calendar,
  Heart,
  MessageCircle,
  Briefcase,
  User,
  Search
} from "lucide-react";

export default function Navigation() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      description: "Your community dashboard"
    },
    {
      href: "/members",
      label: "Members",
      icon: Users,
      description: "Find and connect with community members"
    },
    {
      href: "/events",
      label: "Events",
      icon: Calendar,
      description: "Discover and attend community events"
    },
    {
      href: "/help-desk",
      label: "Help Desk",
      icon: Heart,
      description: "Emergency assistance and community support",
      badge: "2" // Active help requests
    }
  ];

  const quickActions = [
    {
      href: "/messages",
      label: "Messages",
      icon: MessageCircle,
      description: "Chat with community members"
    },
    {
      href: "/jobs",
      label: "Jobs",
      icon: Briefcase,
      description: "Job opportunities and networking"
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      description: "Manage your profile and settings"
    }
  ];

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {/* Main Navigation */}
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Card className={`cursor-pointer transition-all hover:shadow-md ${
                  isActive ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-white'
                }`}>
                  <CardContent className="p-4 text-center">
                    <div className="relative mb-2">
                      <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <item.icon size={18} />
                      </div>
                      {item.badge && (
                        <Badge 
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 text-white"
                          data-testid={`badge-${item.label.toLowerCase()}`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className={`font-medium text-sm ${
                      isActive ? 'text-primary-700' : 'text-gray-900'
                    }`} data-testid={`nav-title-${item.label.toLowerCase()}`}>
                      {item.label}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Quick Actions */}
          {quickActions.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Card className={`cursor-pointer transition-all hover:shadow-md lg:block hidden ${
                  isActive ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-white'
                }`}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <item.icon size={18} />
                    </div>
                    <h3 className={`font-medium text-sm ${
                      isActive ? 'text-primary-700' : 'text-gray-900'
                    }`} data-testid={`quick-nav-${item.label.toLowerCase()}`}>
                      {item.label}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Search Bar for Mobile */}
        <div className="mt-4 md:hidden">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-3 text-gray-500">
                <Search size={18} />
                <span className="text-sm">Search members, events, posts...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
