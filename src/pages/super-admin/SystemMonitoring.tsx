import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye, Activity, Database, TrendingUp, Users, MessageSquare,
  CheckCircle, AlertTriangle, Zap, Clock
} from "lucide-react";

export default function SystemMonitoring() {
  const { data: systemHealth = [] } = useQuery({
    queryKey: ["system-health-monitoring"],
    queryFn: async () => {
      const { data } = await supabase
        .from("system_health")
        .select("*")
        .order("checked_at", { ascending: false });
      return data || [];
    },
    refetchInterval: 30000,
  });

  const { data: dbStats } = useQuery({
    queryKey: ["database-stats-monitoring"],
    queryFn: async () => {
      const { data: members } = await supabase.from("members").select("id", { count: "exact" });
      const { data: messages } = await supabase.from("messages").select("id", { count: "exact" });
      const { data: contributions } = await supabase.from("contributions").select("id", { count: "exact" });
      const { data: payments } = await supabase.from("payments").select("id", { count: "exact" });
      
      return {
        members: members?.length || 0,
        messages: messages?.length || 0,
        contributions: contributions?.length || 0,
        payments: payments?.length || 0,
      };
    },
  });

  const healthyMetrics = systemHealth.filter(h => h.status === "healthy").length;
  const warningMetrics = systemHealth.filter(h => h.status === "warning").length;
  const criticalMetrics = systemHealth.filter(h => h.status === "critical").length;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Eye className="h-7 w-7 text-foreground" />
            </div>
            System Monitoring
          </h1>
          <p className="text-muted-foreground mt-2">Real-time system performance and health monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-green-100">Healthy</CardTitle>
                  <div className="text-3xl font-bold mt-2">{healthyMetrics}</div>
                </div>
                <CheckCircle className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-yellow-100">Warnings</CardTitle>
                  <div className="text-3xl font-bold mt-2">{warningMetrics}</div>
                </div>
                <Zap className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-red-100">Critical</CardTitle>
                  <div className="text-3xl font-bold mt-2">{criticalMetrics}</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-blue-100">Uptime</CardTitle>
                  <div className="text-2xl font-bold mt-2">99.9%</div>
                </div>
                <Activity className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="performance" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
              <Activity className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
              <CheckCircle className="h-4 w-4 mr-2" />
              Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "API Requests", value: "45ms", status: "good" },
                      { name: "Database Queries", value: "12ms", status: "good" },
                      { name: "Page Load", value: "1.2s", status: "good" },
                    ].map(metric => (
                      <div key={metric.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">{metric.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-semibold">{metric.value}</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Resource Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "CPU Usage", value: "23%", status: "good" },
                      { name: "Memory", value: "45%", status: "good" },
                      { name: "Storage", value: "67%", status: "warning" },
                    ].map(metric => (
                      <div key={metric.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">{metric.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-semibold">{metric.value}</span>
                          {metric.status === "good" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Zap className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Database Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Members", value: dbStats?.members || 0, icon: Users, color: "blue" },
                    { name: "Messages", value: dbStats?.messages || 0, icon: MessageSquare, color: "green" },
                    { name: "Contributions", value: dbStats?.contributions || 0, icon: TrendingUp, color: "orange" },
                    { name: "Payments", value: dbStats?.payments || 0, icon: CheckCircle, color: "purple" },
                  ].map(stat => (
                    <div key={stat.name} className="p-4 bg-muted/50 rounded-lg border border-border text-center">
                      <stat.icon className={`h-8 w-8 mx-auto mb-2 text-${stat.color}-500`} />
                      <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{stat.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">System Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {systemHealth.length === 0 ? (
                    <div className="text-center py-12">
                      <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No health metrics available</p>
                    </div>
                  ) : (
                    systemHealth.map(metric => (
                      <div key={metric.id} className={`p-4 rounded-lg border ${
                        metric.status === "healthy" ? "bg-green-900/30 border-green-700/50" :
                        metric.status === "warning" ? "bg-yellow-500/10 border-yellow-500/20/50" :
                        "bg-destructive/10 border-destructive/20/50"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{metric.metric_name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(metric.checked_at).toLocaleString()}
                            </p>
                          </div>
                          <Badge className={
                            metric.status === "healthy" ? "bg-green-600" :
                            metric.status === "warning" ? "bg-yellow-600" :
                            "bg-red-600"
                          }>
                            {metric.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
