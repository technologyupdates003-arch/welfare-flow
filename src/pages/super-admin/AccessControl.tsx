import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Users, Shield, Search, Loader2, User, CheckCircle } from "lucide-react";

export default function AccessControl() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members-access-control"],
    queryFn: async () => {
      const { data } = await supabase
        .from("members")
        .select("*")
        .order("name", { ascending: true});
      return data || [];
    },
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ["user-roles-access"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("*");
      return data || [];
    },
  });

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleStats = {
    superAdmin: userRoles.filter(r => r.role === "super_admin").length,
    admin: userRoles.filter(r => r.role === "admin").length,
    officeBearers: userRoles.filter(r => ["chairperson", "secretary", "vice_chairperson", "vice_secretary", "patron"].includes(r.role)).length,
    members: members.length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Lock className="h-7 w-7 text-foreground" />
              </div>
              Access Control
            </h1>
            <p className="text-muted-foreground mt-2">Configure user permissions and role-based access</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-red-100">Super Admins</CardTitle>
                  <div className="text-3xl font-bold mt-2">{roleStats.superAdmin}</div>
                </div>
                <Shield className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-blue-100">Admins</CardTitle>
                  <div className="text-3xl font-bold mt-2">{roleStats.admin}</div>
                </div>
                <Users className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-green-100">Office Bearers</CardTitle>
                  <div className="text-3xl font-bold mt-2">{roleStats.officeBearers}</div>
                </div>
                <CheckCircle className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-purple-100">Total Members</CardTitle>
                  <div className="text-3xl font-bold mt-2">{roleStats.members}</div>
                </div>
                <User className="h-8 w-8 text-foreground/70" />
              </div>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="roles" className="data-[state=active]:bg-orange-600 data-[state=active]:text-foreground">
              <Shield className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="data-[state=active]:bg-orange-600 data-[state=active]:text-foreground">
              <Lock className="h-4 w-4 mr-2" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-orange-600 data-[state=active]:text-foreground">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">System Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Super Admin", count: roleStats.superAdmin, color: "red", description: "Full system access" },
                  { name: "Admin", count: roleStats.admin, color: "blue", description: "Member and contribution management" },
                  { name: "Chairperson", count: userRoles.filter(r => r.role === "chairperson").length, color: "green", description: "Meeting approval and signatures" },
                  { name: "Secretary", count: userRoles.filter(r => r.role === "secretary").length, color: "purple", description: "Minutes and documentation" },
                  { name: "Member", count: roleStats.members, color: "slate", description: "View own data" },
                ].map(role => (
                  <div key={role.name} className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{role.name}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <Badge className={`bg-${role.color}-600`}>{role.count} users</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Permission Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-foreground">Permission</th>
                        <th className="text-center p-3 text-foreground">Super Admin</th>
                        <th className="text-center p-3 text-foreground">Admin</th>
                        <th className="text-center p-3 text-foreground">Office Bearer</th>
                        <th className="text-center p-3 text-foreground">Member</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {[
                        { name: "View Members", sa: true, admin: true, ob: false, member: false },
                        { name: "Edit Members", sa: true, admin: true, ob: false, member: false },
                        { name: "Manage Contributions", sa: true, admin: true, ob: false, member: false },
                        { name: "View Minutes", sa: true, admin: true, ob: true, member: true },
                        { name: "Create Minutes", sa: true, admin: false, ob: true, member: false },
                        { name: "System Settings", sa: true, admin: false, ob: false, member: false },
                      ].map((perm, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="p-3">{perm.name}</td>
                          <td className="text-center p-3">{perm.sa ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : "—"}</td>
                          <td className="text-center p-3">{perm.admin ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : "—"}</td>
                          <td className="text-center p-3">{perm.ob ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : "—"}</td>
                          <td className="text-center p-3">{perm.member ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">User Access</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10 bg-muted border-border text-foreground"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredMembers.slice(0, 20).map(member => {
                      const memberRole = userRoles.find(r => r.user_id === member.user_id);
                      return (
                        <div key={member.id} className="p-3 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.phone}</p>
                          </div>
                          <Badge variant={memberRole ? "default" : "secondary"}>
                            {memberRole?.role || "member"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
