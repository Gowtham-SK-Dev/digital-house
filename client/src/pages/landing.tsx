import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  Users, 
  MessageCircle, 
  Heart,
  Calendar,
  Briefcase,
  HandHeart,
  Globe,
  Shield,
  Lock,
  ChevronRight,
  Play
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleSignup = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: Users,
      title: "Smart Connections",
      description: "Find community members by location, interests, profession, and cultural background. Build meaningful relationships that last.",
      color: "text-primary-500"
    },
    {
      icon: MessageCircle,
      title: "Community Feed",
      description: "Share updates, photos, and important announcements. Stay informed about community news and celebrations.",
      color: "text-secondary-500"
    },
    {
      icon: HandHeart,
      title: "Emergency Help",
      description: "Get instant assistance during emergencies. Our real-time help system connects you with nearby volunteers.",
      color: "text-emergency-500"
    },
    {
      icon: Calendar,
      title: "Events & Gatherings",
      description: "Organize and attend cultural events, festivals, and community gatherings. RSVP and stay updated.",
      color: "text-accent-500"
    },
    {
      icon: Briefcase,
      title: "Business Network",
      description: "Promote your business, find job opportunities, and collaborate with fellow entrepreneurs in the community.",
      color: "text-green-500"
    },
    {
      icon: Heart,
      title: "Matrimony",
      description: "Find life partners within the community with cultural compatibility and family involvement features.",
      color: "text-pink-500"
    }
  ];

  const stats = [
    { value: "5,000+", label: "Active Members" },
    { value: "20+", label: "Countries" },
    { value: "500+", label: "Events Organized" },
    { value: "1,200+", label: "Connections Made" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <Home className="text-white" size={16} />
                </div>
                <span className="text-xl font-bold text-gray-900">Digital House</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#community" className="text-gray-600 hover:text-primary-600 transition-colors">Community</a>
              <a href="#about" className="text-gray-600 hover:text-primary-600 transition-colors">About</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost"
                onClick={handleLogin}
                data-testid="button-signin"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleSignup}
                className="bg-primary-500 hover:bg-primary-600"
                data-testid="button-join"
              >
                Join Community
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Reconnect with Your
                <span className="text-gradient">
                  {" "}Community
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Digital House brings together members of our community from across India and abroad. Connect, collaborate, and preserve our rich cultural heritage together.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg"
                  onClick={handleSignup}
                  className="bg-primary-500 hover:bg-primary-600 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  data-testid="button-get-started"
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 border-2"
                  data-testid="button-learn-more"
                >
                  <Play className="mr-2" size={16} />
                  Learn More
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Users className="text-primary-500" size={16} />
                  <span>5000+ Members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="text-secondary-500" size={16} />
                  <span>20+ Countries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="text-accent-500" size={16} />
                  <span>Secure & Private</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Community members connecting" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              
              {/* Floating cards */}
              <Card className="absolute -bottom-6 -left-6 border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emergency-500 rounded-lg flex items-center justify-center">
                      <HandHeart className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Real-Time Help</p>
                      <p className="text-sm text-gray-500">Emergency assistance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute -top-6 -right-6 border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary-500 rounded-lg flex items-center justify-center">
                      <Briefcase className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Business Network</p>
                      <p className="text-sm text-gray-500">Grow together</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Connected
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From personal networking to business opportunities, Digital House provides all the tools your community needs to thrive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 bg-gray-50 group">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 bg-current rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                    <feature.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section id="community" className="py-20 bg-gradient-to-r from-primary-500 to-accent-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Growing Together Worldwide
            </h2>
            <p className="text-xl text-white text-opacity-90 max-w-3xl mx-auto">
              Our community spans across continents, bringing together thousands of members in a secure, private environment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <p className="text-white text-opacity-80 text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to Join Digital House?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Be part of our growing community. Connect with fellow members, attend events, and preserve our cultural heritage together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg"
              onClick={handleSignup}
              className="bg-primary-500 hover:bg-primary-600 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              data-testid="button-join-now"
            >
              Join Now - It's Free
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
              data-testid="button-contact"
            >
              Contact Us
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Lock className="text-primary-500" size={16} />
              <span>100% Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="text-accent-500" size={16} />
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="text-secondary-500" size={16} />
              <span>Community Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <Home className="text-white" size={16} />
                </div>
                <span className="text-xl font-bold">Digital House</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Connecting our community members worldwide through technology, culture, and shared values.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Features</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Community Feed</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Member Directory</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Network</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Emergency Help</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Community</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Connect</h4>
              <p className="text-gray-400 text-sm">
                Stay updated with community news and announcements.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Digital House. All rights reserved. Built with ❤️ for our community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
