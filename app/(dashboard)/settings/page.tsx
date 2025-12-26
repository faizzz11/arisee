"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  BookOpen, 
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Target,
  BarChart3,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [settings, setSettings] = useState({
    // Profile Settings
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@student.edu",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "2000-01-15",
    location: "New York, NY",
    bio: "Computer Science student passionate about AI and machine learning.",
    
    // Academic Settings
    grade: "12th Grade",
    school: "Lincoln High School",
    graduationYear: "2024",
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    assignmentReminders: true,
    gradeUpdates: true,
    courseAnnouncements: true,
    
    // Privacy Settings
    profileVisibility: "friends",
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    
    
    // Learning Preferences
    studyReminders: true,
    difficultyLevel: "intermediate",
    learningStyle: "visual",
    
    // Learning Goals & Roadmap Settings
    weeklyStudyHours: "15",
    targetScore: "85",
    roadmapAdjustments: true,
    detailedAnalytics: true,
    progressTrackingView: "detailed",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.email) {
        setError('You must be logged in to view settings');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await response.json();
        setSettings(data);
        setError(null);
      } catch (err) {
        setError('Failed to load settings. Please try again.');
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [session, status]);

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!session?.user?.email) {
      setError('You must be logged in to save settings');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to save settings`);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings. Please try again.';
      setError(errorMessage);
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#5C5FFF]" />
          <p className="text-slate-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (error && !settings.firstName) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-libre-baskerville">Settings</h1>
          <p className="text-slate-600 mt-1">Manage your account preferences and settings</p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Save className="w-4 h-4" />
              Settings saved successfully!
            </div>
          )}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#5C5FFF] hover:bg-[#4A4DFF] text-white disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Profile Settings */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <User className="w-5 h-5 text-[#5C5FFF]" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#5C5FFF] to-[#7C3AED] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {settings.firstName[0]}{settings.lastName[0]}
            </div>
            <div>
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-sm text-slate-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={settings.firstName}
                onChange={(e) => handleSettingChange("firstName", e.target.value)}
                className="bg-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={settings.lastName}
                onChange={(e) => handleSettingChange("lastName", e.target.value)}
                className="bg-white/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => handleSettingChange("email", e.target.value)}
                className="bg-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => handleSettingChange("phone", e.target.value)}
                className="bg-white/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={settings.dateOfBirth}
                onChange={(e) => handleSettingChange("dateOfBirth", e.target.value)}
                className="bg-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input
                id="location"
                value={settings.location}
                onChange={(e) => handleSettingChange("location", e.target.value)}
                className="bg-white/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={settings.bio}
              onChange={(e) => handleSettingChange("bio", e.target.value)}
              className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md bg-white/50 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Tell us about yourself..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Academic Settings */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <GraduationCap className="w-5 h-5 text-[#5C5FFF]" />
            Academic Information
          </CardTitle>
          <CardDescription>
            Manage your academic details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Current Grade</Label>
              <Select value={settings.grade} onValueChange={(value) => handleSettingChange("grade", value)}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9th Grade">9th Grade</SelectItem>
                  <SelectItem value="10th Grade">10th Grade</SelectItem>
                  <SelectItem value="11th Grade">11th Grade</SelectItem>
                  <SelectItem value="12th Grade">12th Grade</SelectItem>
                  <SelectItem value="BE - 1st Year">BE - 1st Year</SelectItem>
                  <SelectItem value="BE - 2nd Year">BE - 2nd Year</SelectItem>
                  <SelectItem value="BE - 3rd Year">BE - 3rd Year</SelectItem>
                  <SelectItem value="BE - 4th Year">BE - 4th Year</SelectItem>
                  <SelectItem value="BTech - 1st Year">BTech - 1st Year</SelectItem>
                  <SelectItem value="BTech - 2nd Year">BTech - 2nd Year</SelectItem>
                  <SelectItem value="BTech - 3rd Year">BTech - 3rd Year</SelectItem>
                  <SelectItem value="BTech - 4th Year">BTech - 4th Year</SelectItem>
                  <SelectItem value="BSc - 1st Year">BSc - 1st Year</SelectItem>
                  <SelectItem value="BSc - 2nd Year">BSc - 2nd Year</SelectItem>
                  <SelectItem value="BSc - 3rd Year">BSc - 3rd Year</SelectItem>
                  <SelectItem value="BCA - 1st Year">BCA - 1st Year</SelectItem>
                  <SelectItem value="BCA - 2nd Year">BCA - 2nd Year</SelectItem>
                  <SelectItem value="BCA - 3rd Year">BCA - 3rd Year</SelectItem>
                  <SelectItem value="BBA - 1st Year">BBA - 1st Year</SelectItem>
                  <SelectItem value="BBA - 2nd Year">BBA - 2nd Year</SelectItem>
                  <SelectItem value="BBA - 3rd Year">BBA - 3rd Year</SelectItem>
                  <SelectItem value="BCom - 1st Year">BCom - 1st Year</SelectItem>
                  <SelectItem value="BCom - 2nd Year">BCom - 2nd Year</SelectItem>
                  <SelectItem value="BCom - 3rd Year">BCom - 3rd Year</SelectItem>
                  <SelectItem value="BA - 1st Year">BA - 1st Year</SelectItem>
                  <SelectItem value="BA - 2nd Year">BA - 2nd Year</SelectItem>
                  <SelectItem value="BA - 3rd Year">BA - 3rd Year</SelectItem>
                  <SelectItem value="MBA - 1st Year">MBA - 1st Year</SelectItem>
                  <SelectItem value="MBA - 2nd Year">MBA - 2nd Year</SelectItem>
                  <SelectItem value="MTech - 1st Year">MTech - 1st Year</SelectItem>
                  <SelectItem value="MTech - 2nd Year">MTech - 2nd Year</SelectItem>
                  <SelectItem value="MSc - 1st Year">MSc - 1st Year</SelectItem>
                  <SelectItem value="MSc - 2nd Year">MSc - 2nd Year</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School/Institution</Label>
              <Input
                id="school"
                value={settings.school}
                onChange={(e) => handleSettingChange("school", e.target.value)}
                className="bg-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduationYear">Graduation Year</Label>
              <Input
                id="graduationYear"
                value={settings.graduationYear}
                onChange={(e) => handleSettingChange("graduationYear", e.target.value)}
                className="bg-white/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Bell className="w-5 h-5 text-[#5C5FFF]" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-slate-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-slate-500">Receive push notifications on your device</p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Assignment Reminders</Label>
              <p className="text-sm text-slate-500">Get reminded about upcoming assignments</p>
            </div>
            <Switch
              checked={settings.assignmentReminders}
              onCheckedChange={(checked) => handleSettingChange("assignmentReminders", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Grade Updates</Label>
              <p className="text-sm text-slate-500">Notifications when grades are posted</p>
            </div>
            <Switch
              checked={settings.gradeUpdates}
              onCheckedChange={(checked) => handleSettingChange("gradeUpdates", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Course Announcements</Label>
              <p className="text-sm text-slate-500">Important updates from your courses</p>
            </div>
            <Switch
              checked={settings.courseAnnouncements}
              onCheckedChange={(checked) => handleSettingChange("courseAnnouncements", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Shield className="w-5 h-5 text-[#5C5FFF]" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Control your privacy and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select value={settings.profileVisibility} onValueChange={(value) => handleSettingChange("profileVisibility", value)}>
              <SelectTrigger className="bg-white/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Everyone can see</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="private">Private - Only me</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Email Address</Label>
              <p className="text-sm text-slate-500">Allow others to see your email</p>
            </div>
            <Switch
              checked={settings.showEmail}
              onCheckedChange={(checked) => handleSettingChange("showEmail", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Phone Number</Label>
              <p className="text-sm text-slate-500">Allow others to see your phone number</p>
            </div>
            <Switch
              checked={settings.showPhone}
              onCheckedChange={(checked) => handleSettingChange("showPhone", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Messages</Label>
              <p className="text-sm text-slate-500">Let other students send you messages</p>
            </div>
            <Switch
              checked={settings.allowMessages}
              onCheckedChange={(checked) => handleSettingChange("allowMessages", checked)}
            />
          </div>
        </CardContent>
      </Card>


      {/* Learning Preferences */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <BookOpen className="w-5 h-5 text-[#5C5FFF]" />
            Learning Preferences
          </CardTitle>
          <CardDescription>
            Personalize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Study Reminders</Label>
              <p className="text-sm text-slate-500">Get reminded to study regularly</p>
            </div>
            <Switch
              checked={settings.studyReminders}
              onCheckedChange={(checked) => handleSettingChange("studyReminders", checked)}
            />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select value={settings.difficultyLevel} onValueChange={(value) => handleSettingChange("difficultyLevel", value)}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Learning Style</Label>
              <Select value={settings.learningStyle} onValueChange={(value) => handleSettingChange("learningStyle", value)}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="auditory">Auditory</SelectItem>
                  <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                  <SelectItem value="reading">Reading/Writing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Goals & Roadmap Controls */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Target className="w-5 h-5 text-[#5C5FFF]" />
            Learning Goals & Roadmap Controls
          </CardTitle>
          <CardDescription>
            Set your learning objectives and customize your AI-generated roadmaps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weeklyStudyHours">Weekly Study Hours Goal</Label>
              <Select value={settings.weeklyStudyHours} onValueChange={(value) => handleSettingChange("weeklyStudyHours", value)}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Select weekly hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 hours/week</SelectItem>
                  <SelectItem value="10">10 hours/week</SelectItem>
                  <SelectItem value="15">15 hours/week</SelectItem>
                  <SelectItem value="20">20 hours/week</SelectItem>
                  <SelectItem value="25">25 hours/week</SelectItem>
                  <SelectItem value="30">30+ hours/week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetScore">Target Score (%)</Label>
              <Input
                id="targetScore"
                type="number"
                min="0"
                max="100"
                value={settings.targetScore}
                onChange={(e) => handleSettingChange("targetScore", e.target.value)}
                className="bg-white/50"
                placeholder="Enter target score"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Custom Roadmap Adjustments</Label>
                <p className="text-sm text-slate-500">Allow manual tweaking of AI-generated roadmaps</p>
              </div>
              <Switch
                checked={settings.roadmapAdjustments}
                onCheckedChange={(checked) => handleSettingChange("roadmapAdjustments", checked)}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Progress Tracking View
            </Label>
            <Select value={settings.progressTrackingView} onValueChange={(value) => handleSettingChange("progressTrackingView", value)}>
              <SelectTrigger className="bg-white/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detailed">Detailed Analytics - Full insights and metrics</SelectItem>
                <SelectItem value="minimal">Minimal View - Essential progress only</SelectItem>
                <SelectItem value="summary">Summary View - Weekly/monthly overview</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          size="lg" 
          disabled={saving}
          className="bg-[#5C5FFF] hover:bg-[#4A4DFF] text-white disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}