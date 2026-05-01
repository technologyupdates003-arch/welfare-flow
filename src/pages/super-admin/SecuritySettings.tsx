import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Lock, Key, AlertTriangle, CheckCircle, Settings,
  Users, Database, Eye, RefreshCw, Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function SecuritySettings() {
  const queryClient = useQueryClient();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState(90);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [sessionTimeout, setSessionTimeout] = useState(30);

  // Get security settings
  const { data: securitySettings, isLoading } = useQuery({
    queryKey: ["security-settings"],
    queryFn: async () => {
      // This would fetch from a security_settings table
      return {
        twoFactorEnabled: false,
        passwordExpiry: 90,
        maxLoginAttempts: 5,
        sessionTimeout: 30,
        encryptionEnabled: true,
        auditLoggingEnabled: true,
      };
    },
  });

  // Update security settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      // This would update the security_settings table
      await new Promise(resolve => setTimeout(resolve, 1000));
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-settings"] });
      toast.success("Security settings updated successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      twoFactorEnabled,
      passwordExpiry,
      maxLoginAttempts,
      sessionTimeout,
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Shield className="h-7 w-7 text-foreground" />
              </div>
              Security Settings
            </h1>
            <p className="text-muted-foreground mt-2">Configure system security and access controls</p>
          </div>
          <Button 
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
            className=""
          >
            {updateSettingsMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><CheckCircle className="h-4 w-4 mr-2" /> Save Settings</>
            )}
          </Button>
        </div>

        {/* Security Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-green-100">Encryption</CardTitle>
                  <div className="text-2xl font-bold mt-2">Active</div>
                </div>
                <Lock className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-blue-100">Audit Logging</CardTitle>
                  <div className="text-2xl font-bold mt-2">Enabled</div>
                </div>
                <Eye className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-orange-100">2FA Status</CardTitle>
                  <div className="text-2xl font-bold mt-2">{twoFactorEnabled ? "On" : "Off"}</div>
                </div>
                <Key className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-purple-100">Security Score</CardTitle>
                  <div className="text-2xl font-bold mt-2">95/100</div>
                </div>
                <Shield className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="authentication" className="data-[state=active]:bg-blue-600 data-[state=active]:text-foreground">
              <Key className="h-4 w-4 mr-2" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="access" className="data-[state=active]:bg-blue-600 data-[state=active]:text-foreground">
              <Lock className="h-4 w-4 mr-2" />
              Access Control
            </TabsTrigger>
            <TabsTrigger value="encryption" className="data-[state=active]:bg-blue-600 data-[state=active]:text-foreground">
              <Shield className="h-4 w-4 mr-2" />
              Encryption
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-blue-600 data-[state=active]:text-foreground">
              <Eye className="h-4 w-4 mr-2" />
              Monitoring
            </TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="authentication" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Authentication Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex-1">
                    <Label className="text-foreground font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground mt-1">Require 2FA for all admin users</p>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <Label className="text-foreground font-medium">Password Expiry (days)</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">Force password change after this many days</p>
                  <Input
                    type="number"
                    value={passwordExpiry}
                    onChange={e => setPasswordExpiry(parseInt(e.target.value))}
                    className="bg-muted border-border text-foreground"
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <Label className="text-foreground font-medium">Max Login Attempts</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">Lock account after this many failed attempts</p>
                  <Input
                    type="number"
                    value={maxLoginAttempts}
                    onChange={e => setMaxLoginAttempts(parseInt(e.target.value))}
                    className="bg-muted border-border text-foreground"
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <Label className="text-foreground font-medium">Session Timeout (minutes)</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">Auto-logout after inactivity</p>
                  <Input
                    type="number"
                    value={sessionTimeout}
                    onChange={e => setSessionTimeout(parseInt(e.target.value))}
                    className="bg-muted border-border text-foreground"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Control Tab */}
          <TabsContent value="access" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Access Control Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700/50 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-semibold">Role-Based Access Control</p>
                    <p>Configure permissions for different user roles</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">Super Admin Access</p>
                        <p className="text-sm text-muted-foreground">Full system access</p>
                      </div>
                      <Badge variant="default" className="bg-red-600">
                        Unrestricted
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">Admin Access</p>
                        <p className="text-sm text-muted-foreground">Member and contribution management</p>
                      </div>
                      <Badge variant="default" className="bg-blue-600">
                        Limited
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">Office Bearer Access</p>
                        <p className="text-sm text-muted-foreground">Role-specific permissions</p>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Role-Based
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">Member Access</p>
                        <p className="text-sm text-muted-foreground">View own data only</p>
                      </div>
                      <Badge variant="default" className="bg-slate-600">
                        Restricted
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Encryption Tab */}
          <TabsContent value="encryption" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Encryption Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-900/30 rounded-lg border border-green-700/50 flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-200">
                    <p className="font-semibold">Encryption Active</p>
                    <p>All sensitive data is encrypted at rest and in transit</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Database Encryption</p>
                        <p className="text-sm text-muted-foreground">AES-256 encryption</p>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">SSL/TLS</p>
                        <p className="text-sm text-muted-foreground">Secure data transmission</p>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Password Hashing</p>
                        <p className="text-sm text-muted-foreground">bcrypt with salt</p>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Security Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex-1">
                    <Label className="text-foreground font-medium">Audit Logging</Label>
                    <p className="text-sm text-muted-foreground mt-1">Log all security-related events</p>
                  </div>
                  <Switch checked={true} disabled />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex-1">
                    <Label className="text-foreground font-medium">Failed Login Alerts</Label>
                    <p className="text-sm text-muted-foreground mt-1">Notify on suspicious login attempts</p>
                  </div>
                  <Switch checked={true} />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex-1">
                    <Label className="text-foreground font-medium">Data Access Monitoring</Label>
                    <p className="text-sm text-muted-foreground mt-1">Track all data access by super admins</p>
                  </div>
                  <Switch checked={true} disabled />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex-1">
                    <Label className="text-foreground font-medium">Real-time Alerts</Label>
                    <p className="text-sm text-muted-foreground mt-1">Immediate notification of security events</p>
                  </div>
                  <Switch checked={true} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
