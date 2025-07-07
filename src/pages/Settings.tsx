import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { WalletIntegration } from "@/components/WalletIntegration"
import { 
  User, 
  Settings as SettingsIcon, 
  Mail, 
  Phone, 
  Building, 
  Shield,
  Calendar,
  Loader2,
  Save,
  ArrowLeft
} from "lucide-react"
import { useNavigate } from "react-router-dom"

interface ProfileData {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  company_name: string | null
  role: string
  created_at: string
  updated_at: string
}

const Settings = () => {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data as ProfileData
    },
    enabled: !!user
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<ProfileData>) => {
      if (!user) throw new Error('No user found')
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          company_name: updates.company_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
      setIsEditing(false)
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
      })
    }
  })

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    company_name: profile?.company_name || '',
  })

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        company_name: profile.company_name || '',
      })
    }
  }, [profile])

  const handleSave = () => {
    updateProfileMutation.mutate(formData)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "There was an error signing out. Please try again.",
      })
    }
  }

  const getRoleBadge = (role: string) => {
    const roleMap = {
      admin: { label: 'Administrator', variant: 'default' as const, color: 'bg-red-100 text-red-800' },
      carrier: { label: 'Carrier', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      customer: { label: 'Customer', variant: 'outline' as const, color: 'bg-green-100 text-green-800' },
      warehouse: { label: 'Warehouse', variant: 'secondary' as const, color: 'bg-purple-100 text-purple-800' },
    }
    
    const roleInfo = roleMap[role as keyof typeof roleMap] || { label: role, variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <Badge className={roleInfo.color}>
        {roleInfo.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {profile && getRoleBadge(profile.role)}
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {profile?.full_name || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <div className="p-3 bg-gray-50 rounded-md text-gray-600">
                    {profile?.email}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {profile?.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Company Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="company"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Enter your company name"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {profile?.company_name || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain Tab */}
        <TabsContent value="blockchain" className="space-y-6">
          <WalletIntegration />
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                View your account details and manage security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Account ID</Label>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded border">
                      {profile?.id}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Role</Label>
                    <div className="mt-1">
                      {profile && getRoleBadge(profile.role)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Account Created
                    </Label>
                    <p className="text-sm">
                      {profile?.created_at && formatDate(profile.created_at)}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                    <p className="text-sm">
                      {profile?.updated_at && formatDate(profile.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="pt-4">
                <h4 className="font-medium mb-4">Account Actions</h4>
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings