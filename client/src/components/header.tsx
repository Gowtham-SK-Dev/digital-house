import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  Menu,
  User,
  Settings,
  LogOut,
  Bell
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const currentVersion = localStorage.getItem('digital-house-version') || 'v1';
  
  const baseNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/members", label: "Members" },
    { href: "/events", label: "Events" },
    { href: "/help-desk", label: "Help Desk" },
  ];

  const v2NavItems = [
    { href: "/matrimony", label: "Matrimony" },
    { href: "/jobs", label: "Jobs" },
    { href: "/business", label: "Business Hub" },
  ];

  const navItems = currentVersion === 'v2' ? [...baseNavItems, ...v2NavItems] : baseNavItems;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Home className="text-white" size={16} />
            </div>
            <span className="text-xl font-bold text-gray-900">Digital House</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                    isActive ? 'text-primary-600' : 'text-gray-600'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                2
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} alt={`${user?.firstName} ${user?.lastName}`} />
                    <AvatarFallback className="bg-primary-500 text-white text-sm">
                      {(user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm" data-testid="text-user-name">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="w-[200px] truncate text-xs text-muted-foreground" data-testid="text-user-email">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer" data-testid="menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/version-selector" className="cursor-pointer" data-testid="menu-version">
                    <span className="mr-2 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-1 py-0.5 rounded">v{currentVersion.slice(1)}</span>
                    Switch Version
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-2 pb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                      <Home className="text-white" size={16} />
                    </div>
                    <span className="text-xl font-bold text-gray-900">Digital House</span>
                  </div>
                  
                  <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                      const isActive = location === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                              ? 'bg-primary-50 text-primary-600 border border-primary-200' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                        >
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="border-t pt-6 mt-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profileImageUrl || ""} />
                        <AvatarFallback className="bg-primary-500 text-white">
                          {(user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Link 
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                        data-testid="mobile-menu-profile"
                      >
                        <User size={18} />
                        <span>Profile</span>
                      </Link>
                      <Button 
                        variant="ghost" 
                        onClick={handleLogout}
                        className="w-full justify-start space-x-3 px-3 py-2 text-sm text-gray-600"
                        data-testid="mobile-menu-logout"
                      >
                        <LogOut size={18} />
                        <span>Log out</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
