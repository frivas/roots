import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  Bell, 
  Globe, 
  Mail, 
  Phone, 
  User, 
  Shield, 
  Info, 
  AlertTriangle,
  Upload,
  Save,
  Settings as SettingsIcon
} from 'lucide-react';

// Switch component (since we don't have one in the project yet)
const Switch = ({ checked, onCheckedChange, id }: { 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}) => {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent 
        transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${checked ? 'bg-primary' : 'bg-input'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-background transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};

// Tabs components (simple implementation)
interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Tabs = ({ defaultValue, className, children }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className={className} data-active-tab={activeTab}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const TabsList = ({ children, className, activeTab, setActiveTab }: TabsListProps) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ''}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const TabsTrigger = ({ value, children, className, activeTab, setActiveTab }: TabsTriggerProps) => {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium 
        ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${isActive ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted/50'}
        ${className || ''}
      `}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
}

const TabsContent = ({ value, children, className, activeTab }: TabsContentProps) => {
  if (activeTab !== value) return null;
  return (
    <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ''}`}>
      {children}
    </div>
  );
};

const Settings = () => {
  const [settings, setSettings] = useState({
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    language: 'English',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile logic would go here
    alert('Profile settings saved');
  };
  
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    // Save notification settings logic would go here
    alert('Notification settings saved');
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      className="container max-w-6xl py-8 space-y-8"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { 
            staggerChildren: 0.1,
            delayChildren: 0.1
          }
        }
      }}
    >
      <motion.div 
        className="flex flex-col gap-2"
        variants={fadeIn}
      >
        <h1 className="text-4xl font-bold tracking-tight">Educational Settings</h1>
        <p className="text-muted-foreground text-lg">
          Manage your account settings and learning preferences
        </p>
      </motion.div>
      
      <motion.div variants={fadeIn}>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              variants={fadeIn}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Profile Information</CardTitle>
                  </div>
                  <CardDescription>
                    Update your basic profile information for the educational platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-foreground">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          className="pl-10"
                          value={settings.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your email is used for educational notifications and account recovery
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          name="phone"
                          className="pl-10"
                          value={settings.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used for SMS notifications and emergency communications
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="profilePhoto" className="block text-sm font-medium text-foreground">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Photo
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 400x400px. Max file size: 2MB
                      </p>
                    </div>
                  </form>
                </CardContent>
                <div className="bg-muted/20 px-6 py-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Profile
                  </Button>
                </div>
              </Card>
              
              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Educational Information</CardTitle>
                  </div>
                  <CardDescription>
                    Complete your educational profile with additional details
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="displayName" className="block text-sm font-medium text-foreground">Display Name</label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="How you want to be addressed in class"
                    />
                    <p className="text-xs text-muted-foreground">
                      This name will be visible to instructors and classmates
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-foreground">Bio</label>
                    <textarea
                      id="bio"
                      rows={3}
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Tell us about your educational goals and interests"
                    />
                    <p className="text-xs text-muted-foreground">
                      A brief description that will appear on your student profile
                    </p>
                  </div>
                </CardContent>
                <div className="bg-muted/20 px-6 py-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Information
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              variants={fadeIn}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Notification Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Choose how you want to be notified about educational updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSaveNotifications} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label htmlFor="emailNotifications" className="text-base font-medium">
                            Email Notifications
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Receive course updates, assignment reminders, and announcements via email
                          </p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={settings.emailNotifications}
                          onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label htmlFor="smsNotifications" className="text-base font-medium">
                            SMS Notifications
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Get urgent alerts and deadline reminders via text message
                          </p>
                        </div>
                        <Switch
                          id="smsNotifications"
                          checked={settings.smsNotifications}
                          onCheckedChange={(checked) => handleSwitchChange('smsNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label htmlFor="pushNotifications" className="text-base font-medium">
                            Push Notifications
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Receive real-time notifications in your browser for live classes and events
                          </p>
                        </div>
                        <Switch
                          id="pushNotifications"
                          checked={settings.pushNotifications}
                          onCheckedChange={(checked) => handleSwitchChange('pushNotifications', checked)}
                        />
                      </div>
                    </div>
                  </form>
                </CardContent>
                <div className="bg-muted/20 px-6 py-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Notification Settings
                  </Button>
                </div>
              </Card>
              
              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <SettingsIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Notification Frequency</CardTitle>
                  </div>
                  <CardDescription>
                    Control how often you receive educational notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="frequency" className="block text-sm font-medium text-foreground">Email Digest Frequency</label>
                    <select
                      id="frequency"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="immediately">Immediately</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Digest</option>
                      <option value="never">Never</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Choose how frequently you want to receive course and assignment summaries
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Study Hours (No Notifications)</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="quietStart" className="text-xs text-muted-foreground">From</label>
                        <Input
                          id="quietStart"
                          type="time"
                          defaultValue="22:00"
                        />
                      </div>
                      <div>
                        <label htmlFor="quietEnd" className="text-xs text-muted-foreground">To</label>
                        <Input
                          id="quietEnd"
                          type="time"
                          defaultValue="07:00"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      No non-urgent notifications will be sent during your focused study hours
                    </p>
                  </div>
                </CardContent>
                <div className="bg-muted/20 px-6 py-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Frequency Settings
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-6">
            <motion.div
              variants={fadeIn}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Language & Region</CardTitle>
                  </div>
                  <CardDescription>
                    Set your preferred language and regional settings for the educational platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="language" className="block text-sm font-medium text-foreground">Language</label>
                    <select
                      id="language"
                      name="language"
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Chinese">Chinese</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      This will change the language throughout the educational platform
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="timezone" className="block text-sm font-medium text-foreground">Time Zone</label>
                    <select
                      id="timezone"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="UTC-8">Pacific Time (UTC-8)</option>
                      <option value="UTC-5">Eastern Time (UTC-5)</option>
                      <option value="UTC+0">Greenwich Mean Time (UTC+0)</option>
                      <option value="UTC+1">Central European Time (UTC+1)</option>
                      <option value="UTC+8">China Standard Time (UTC+8)</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      All class times and deadlines will be displayed in your selected time zone
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="dateFormat" className="block text-sm font-medium text-foreground">Date Format</label>
                    <select
                      id="dateFormat"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Choose how assignment dates and schedules are displayed
                    </p>
                  </div>
                </CardContent>
                <div className="bg-muted/20 px-6 py-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Language Settings
                  </Button>
                </div>
              </Card>
              
              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Learning Preferences</CardTitle>
                  </div>
                  <CardDescription>
                    Customize your learning experience and content display
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="compactMode" className="text-base font-medium">
                        Compact Mode
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Display more course content with reduced spacing
                      </p>
                    </div>
                    <Switch id="compactMode" checked={false} onCheckedChange={() => {}} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="reducedMotion" className="text-base font-medium">
                        Reduced Motion
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Minimize animations for better focus and accessibility
                      </p>
                    </div>
                    <Switch id="reducedMotion" checked={false} onCheckedChange={() => {}} />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="fontSize" className="block text-sm font-medium text-foreground">Font Size</label>
                    <select
                      id="fontSize"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Adjust text size for better readability during study sessions
                    </p>
                  </div>
                </CardContent>
                <div className="bg-muted/20 px-6 py-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Learning Preferences
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <motion.div
              variants={fadeIn}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Security Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your account security and privacy preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="twoFactor" className="text-base font-medium">
                        Two-Factor Authentication
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Add an extra layer of security to protect your educational data
                      </p>
                    </div>
                    <Switch id="twoFactor" checked={false} onCheckedChange={() => {}} />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground">Current Password</label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">New Password</label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters with a mix of letters, numbers, and symbols
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">Confirm New Password</label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                </CardContent>
                <div className="bg-muted/20 px-6 py-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Update Password
                  </Button>
                </div>
              </Card>
              
              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-xl">Account Management</CardTitle>
                  </div>
                  <CardDescription>
                    Advanced account actions - use with caution
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2 border-b border-border pb-4">
                    <h4 className="text-sm font-medium">Reset Learning Preferences</h4>
                    <p className="text-xs text-muted-foreground">
                      Reset all your learning preferences to default settings. Your courses and progress will remain intact.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Reset Preferences
                    </Button>
                  </div>
                  
                  <div className="space-y-2 border-b border-border pb-4">
                    <h4 className="text-sm font-medium">Download Your Data</h4>
                    <p className="text-xs text-muted-foreground">
                      Get a copy of all your educational data including courses, grades, and progress.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Request Data Export
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-destructive">Delete Account</h4>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all educational data. This action cannot be reversed.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-destructive text-destructive hover:bg-destructive/10"
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default Settings;