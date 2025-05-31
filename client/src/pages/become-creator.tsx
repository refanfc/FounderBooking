import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Star, DollarSign, Clock, Users } from "lucide-react";

const categories = [
  { value: "founders", label: "Founders" },
  { value: "developers", label: "Developers" },
  { value: "designers", label: "Designers" },
  { value: "investors", label: "Investors" },
  { value: "marketers", label: "Marketers" },
  { value: "writers", label: "Writers" },
];

const durations = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
  { value: 90, label: "90 minutes" },
];

export default function BecomeCreator() {
  const [formData, setFormData] = useState({
    title: "",
    rate: "",
    duration: "",
    category: "",
    timezone: "America/New_York",
  });

  const { isAuthenticated, user } = useDynamicContext();
  const { toast } = useToast();

  const createCreatorMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/creators", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Creator Profile Created",
        description: "Your creator profile has been successfully created!",
      });
      // Reset form
      setFormData({
        title: "",
        rate: "",
        duration: "",
        category: "",
        timezone: "America/New_York",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Please Connect Wallet",
        description: "You need to connect your wallet to create a creator profile.",
        variant: "destructive",
      });
      return;
    }

    createCreatorMutation.mutate({
      userId: 1, // This should come from authenticated user
      title: formData.title,
      rate: parseFloat(formData.rate),
      duration: parseInt(formData.duration),
      category: formData.category,
      timezone: formData.timezone,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Become a Creator</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your expertise with the Farcaster community and earn by offering consultations, 
            mentorship, and advice sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Your Creator Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Professional Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g., Founder & CEO at TechCorp"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rate">Hourly Rate ($)</Label>
                      <Input
                        id="rate"
                        type="number"
                        value={formData.rate}
                        onChange={(e) => handleInputChange("rate", e.target.value)}
                        placeholder="150"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Session Duration</Label>
                      <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value.toString()}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your expertise area" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-farcaster-500 hover:bg-farcaster-600"
                    disabled={createCreatorMutation.isPending}
                  >
                    {createCreatorMutation.isPending ? "Creating Profile..." : "Create Creator Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Creator Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Earn from Your Expertise</h4>
                    <p className="text-sm text-gray-600">Set your own rates and get paid for sharing knowledge</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Flexible Scheduling</h4>
                    <p className="text-sm text-gray-600">Control your availability and schedule</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Build Your Network</h4>
                    <p className="text-sm text-gray-600">Connect with ambitious builders in crypto</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2">Platform Fee</h4>
                <p className="text-sm text-gray-600 mb-4">
                  FarBook takes a 10% platform fee from each booking to maintain and improve the service.
                </p>
                <div className="text-xs text-gray-500">
                  Example: For a $150 session, you'll receive $135 after the platform fee.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
