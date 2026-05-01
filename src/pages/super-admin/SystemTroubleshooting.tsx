import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, CheckCircle, Wrench, Download, RefreshCw, Loader2,
  Zap, Database, Shield, Clock, TrendingUp, Eye, MessageSquare,
  Key, Lock
} from "lucide-react";
import { toast } from "sonner";

import { useLocation } from "react-router-dom";

export default function SystemTroubleshooting() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [selectedError, setSelectedError] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);

  // Determine which view to show based on the route
  const getViewType = () => {
    if (location.pathname.includes("/audit")) return "audit";
    if (location.pathname.includes("/security")) return "security";
    if (location.pathname.includes("/passwords")) return "passwords";
    if (location.pathname.includes("/access")) return "access";
    if (location.pathname.includes("/monitoring")) return "monitoring";
    return "troubleshooting";
  };

  const viewType = getViewType();

  // Get all system logs
  const { data: systemLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: ["all-system-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Get system health
  const { data: systemHealth = [] } = useQuery({
    queryKey: ["all-system-health"],
    queryFn: async () => {
      const { data } = await supabase
        .from("system_health")
        .select("*")
        .order("checked_at", { ascending: false });
      return data || [];
    },
    refetchInterval: 60000,
  });

  // Get database stats
  const { data: dbStats } = useQuery({
    queryKey: ["database-stats"],
    queryFn: async () => {
      const { data: members } = await supabase.from("members").select("id", { count: "exact" });
      const { data: messages } = await supabase.from("messages").select("id", { count: "exact" });
      const { data: conversations } = await supabase.from("conversations").select("id", { count: "exact" });
      
      return {
        members: members?.length || 0,
        messages: messages?.length || 0,
        conversations: conversations?.length || 0,
      };
    },
  });

  // Resolve error mutation
  const resolveErrorMutation = useMutation({
    mutationFn: async () => {
      if (!selectedError) throw new Error("No error selected");

      const { error } = await supabase
        .from("system_logs")
        .update({
          resolved: true,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", selectedError.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-system-logs"] });
      setResolveDialogOpen(false);
      setSelectedError(null);
      setResolutionNotes("");
      toast.success("Error marked as resolved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Refresh system health
  const refreshHealthMutation = useMutation({
    mutationFn: async () => {
      // This would typically call a backend function to check system health
      // For now, we'll just refetch the data
      await refetchLogs();
      queryClient.invalidateQueries({ queryKey: ["all-system-health"] });
    },
    onSuccess: () => {
      toast.success("System health check completed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const errorCount = systemLogs.filter(l => l.log_level === "ERROR").length;
  const warningCount = systemLogs.filter(l => l.log_level === "WARNING").length;
  const unresolvedCount = systemLogs.filter(l => !l.resolved).length;
  const criticalMetrics = systemHealth.filter(h => h.status === "critical").length;

  const recentErrors = systemLogs.filter(l => l.log_level === "ERROR").slice(0, 10);
  const recentWarnings = systemLogs.filter(l => l.log_level === "WARNING").slice(0, 10);

  // Get title and icon based on view type
  const getViewConfig = () => {
    switch (viewType) {
      case "audit":
        return {
          title: "Audit Logs",
          description: "View complete system audit trail and activity logs",
          icon: <Database className="h-7 w-7 text-foreground" />,
          gradient: "from-purple-500 to-pink-600",
        };
      case "security":
        return {
          title: "Security Settings",
          description: "Configure system security and access controls",
          icon: <Shield className="h-7 w-7 text-foreground" />,
          gradient: "from-blue-500 to-cyan-600",
        };
      case "passwords":
        return {
          title: "Password Management",
          description: "Manage user passwords and reset credentials",
          icon: <Key className="h-7 w-7 text-foreground" />,
          gradient: "from-green-500 to-emerald-600",
        };
      case "access":
        return {
          title: "Access Control",
          description: "Configure user permissions and role-based access",
          icon: <Lock className="h-7 w-7 text-foreground" />,
          gradient: "from-orange-500 to-red-600",
        };
      case "monitoring":
        return {
          title: "System Monitoring",
          description: "Real-time system performance and health monitoring",
          icon: <Eye className="h-7 w-7 text-foreground" />,
          gradient: "from-indigo-500 to-purple-600",
        };
      default:
        return {
          title: "System Troubleshooting",
          description: "Monitor system health and resolve issues",
          icon: <Wrench className="h-7 w-7 text-foreground" />,
          gradient: "from-red-500 to-orange-600",
        };
    }
  };

  const viewConfig = getViewConfig();

  // Render troubleshooting view
  const troubleshootingView = (
    <div className="space-y-6 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${viewConfig.gradient} rounded-xl flex items-center justify-center`}>
                {viewConfig.icon}
              </div>
              {viewConfig.title}
            </h1>
            <p className="text-muted-foreground mt-2">{viewConfig.description}</p>
          </div>
          {viewType === "troubleshooting" && (
            <Button 
              onClick={() => refreshHealthMutation.mutate()} 
              disabled={refreshHealthMutation.isPending}
              className=""
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshHealthMutation.isPending ? "animate-spin" : ""}`} />
              Refresh System
            </Button>
          )}
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-red-100">System Errors</CardTitle>
                  <div className="text-3xl font-bold mt-2">{errorCount}</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-red-100">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{unresolvedCount} unresolved</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-yellow-100">Warnings</CardTitle>
                  <div className="text-3xl font-bold mt-2">{warningCount}</div>
                </div>
                <Zap className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-yellow-100">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Last 24h</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-purple-100">Critical Issues</CardTitle>
                  <div className="text-3xl font-bold mt-2">{criticalMetrics}</div>
                </div>
                <Shield className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-purple-100">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Needs attention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-blue-100">Database</CardTitle>
                  <div className="text-3xl font-bold mt-2">{dbStats?.members || 0}</div>
                </div>
                <Database className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-blue-100">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Members</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-green-100">Messages</CardTitle>
                  <div className="text-3xl font-bold mt-2">{dbStats?.messages || 0}</div>
                </div>
                <MessageSquare className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-green-100">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Total</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="errors" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="errors" className="data-[state=active]:bg-red-600 data-[state=active]:text-foreground">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Errors
            </TabsTrigger>
            <TabsTrigger value="warnings" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-foreground">
              <Zap className="h-4 w-4 mr-2" />
              Warnings
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-green-600 data-[state=active]:text-foreground">
              <Database className="h-4 w-4 mr-2" />
              Health
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-foreground">
              <Shield className="h-4 w-4 mr-2" />
              Diagnostics
            </TabsTrigger>
          </TabsList>

          {/* Errors Tab */}
          <TabsContent value="errors" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  System Errors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentErrors.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No errors detected</p>
                    <p className="text-muted-foreground">System is running smoothly</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentErrors.map(error => (
                      <Card key={error.id} className="bg-red-900/20 border-red-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="destructive" className="bg-red-600">
                                  {error.log_level}
                                </Badge>
                                <span className="font-medium text-foreground">{error.component}</span>
                              </div>
                              <p className="text-muted-foreground mb-2">{error.message}</p>
                              {error.error_details && (
                                <div className="bg-muted/30 p-3 rounded-lg mb-2">
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {JSON.stringify(error.error_details).substring(0, 200)}...
                                  </p>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {new Date(error.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {!error.resolved ? (
                                <Dialog open={resolveDialogOpen && selectedError?.id === error.id} onOpenChange={setResolveDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => setSelectedError(error)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Resolve
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-slate-800 border-border">
                                    <DialogHeader>
                                      <DialogTitle className="text-foreground">Resolve Error</DialogTitle>
                                      <DialogDescription className="text-muted-foreground">
                                        Mark this error as resolved and add resolution notes
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm font-medium text-foreground mb-1">Error Details</p>
                                        <p className="text-sm text-muted-foreground">{selectedError?.message}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-foreground mb-2 block">Resolution Notes</label>
                                        <Textarea
                                          value={resolutionNotes}
                                          onChange={e => setResolutionNotes(e.target.value)}
                                          placeholder="Describe how you resolved this issue..."
                                          rows={3}
                                          className="bg-muted border-border text-foreground"
                                        />
                                      </div>
                                      <Button
                                        onClick={() => resolveErrorMutation.mutate()}
                                        disabled={resolveErrorMutation.isPending}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                      >
                                        {resolveErrorMutation.isPending ? (
                                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resolving...</>
                                        ) : (
                                          <><CheckCircle className="h-4 w-4 mr-2" /> Mark as Resolved</>
                                        )}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Warnings Tab */}
          <TabsContent value="warnings" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  System Warnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {recentWarnings.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No warnings</p>
                    <p className="text-muted-foreground">System is operating normally</p>
                  </div>
                ) : (
                  recentWarnings.map(warning => (
                    <Card key={warning.id} className="bg-yellow-900/20 border-yellow-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="bg-yellow-600">
                                {warning.log_level}
                              </Badge>
                              <span className="font-medium text-foreground">{warning.component}</span>
                            </div>
                            <p className="text-muted-foreground mb-2">{warning.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(warning.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  System Health Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 text-foreground">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm text-green-100">Healthy</p>
                      <p className="text-2xl font-bold">
                        {systemHealth.filter(h => h.status === "healthy").length}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-0 text-foreground">
                    <CardContent className="p-4 text-center">
                      <Zap className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm text-yellow-100">Warning</p>
                      <p className="text-2xl font-bold">
                        {systemHealth.filter(h => h.status === "warning").length}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0 text-foreground">
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm text-red-100">Critical</p>
                      <p className="text-2xl font-bold">
                        {systemHealth.filter(h => h.status === "critical").length}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {systemHealth.length === 0 ? (
                    <div className="text-center py-12">
                      <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No health metrics available</p>
                    </div>
                  ) : (
                    systemHealth.map(metric => (
                      <Card key={metric.id} className={`border-0 ${
                        metric.status === "healthy" ? "bg-green-900/30" :
                        metric.status === "warning" ? "bg-yellow-900/30" :
                        "bg-red-900/30"
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{metric.metric_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Value: {metric.metric_value} • {new Date(metric.checked_at).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant={
                              metric.status === "healthy" ? "default" :
                              metric.status === "warning" ? "secondary" :
                              "destructive"
                            } className={
                              metric.status === "healthy" ? "bg-green-600" :
                              metric.status === "warning" ? "bg-yellow-600" :
                              "bg-red-600"
                            }>
                              {metric.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diagnostics Tab */}
          <TabsContent value="diagnostics" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  System Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">Database Connection</p>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Supabase PostgreSQL</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">Authentication Service</p>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Supabase Auth</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">Storage Service</p>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Supabase Storage</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">Real-time Subscriptions</p>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">WebSocket Active</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700/50">
                  <CardHeader>
                    <CardTitle className="text-foreground">Database Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Database className="h-8 w-8 text-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm">Members</p>
                        <p className="font-bold text-2xl text-foreground">{dbStats?.members || 0}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <MessageSquare className="h-8 w-8 text-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm">Messages</p>
                        <p className="font-bold text-2xl text-foreground">{dbStats?.messages || 0}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <MessageSquare className="h-8 w-8 text-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm">Conversations</p>
                        <p className="font-bold text-2xl text-foreground">{dbStats?.conversations || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // Render different content based on view type
  if (viewType !== "troubleshooting") {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${viewConfig.gradient} rounded-xl flex items-center justify-center`}>
                  {viewConfig.icon}
                </div>
                {viewConfig.title}
              </h1>
              <p className="text-muted-foreground mt-2">{viewConfig.description}</p>
            </div>
          </div>

          {/* Placeholder content for other super admin pages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  {viewConfig.icon}
                  <span>{viewConfig.title} Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This is the {viewConfig.title.toLowerCase()} management dashboard for super administrators.
                  You can access all system features from here.
                </p>
                <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <h3 className="text-foreground font-medium mb-2">Available Features:</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Complete system monitoring</li>
                    <li>• Advanced security controls</li>
                    <li>• Full audit trail access</li>
                    <li>• Member data management</li>
                    <li>• System troubleshooting</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
                    <h4 className="text-foreground font-medium">View System Logs</h4>
                    <p className="text-muted-foreground text-sm mt-1">Access complete system audit logs</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-600/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                    <h4 className="text-foreground font-medium">Manage Security</h4>
                    <p className="text-muted-foreground text-sm mt-1">Configure security settings and access controls</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-purple-600/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                    <h4 className="text-foreground font-medium">Troubleshoot Issues</h4>
                    <p className="text-muted-foreground text-sm mt-1">Diagnose and fix system problems</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return troubleshootingView;
}
