import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SuperAdminPlaceholderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function SuperAdminPlaceholder({ title, description, icon }: SuperAdminPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-slate-300 mt-2">{description}</p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
          Super Admin
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {icon}
              <span>{title} Dashboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              This is the {title.toLowerCase()} management dashboard for super administrators.
              You can access all system features from here.
            </p>
            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <h3 className="text-white font-medium mb-2">Available Features:</h3>
              <ul className="text-slate-300 space-y-1">
                <li>• Complete system monitoring</li>
                <li>• Advanced security controls</li>
                <li>• Full audit trail access</li>
                <li>• Member data management</li>
                <li>• System troubleshooting</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
                <h4 className="text-white font-medium">View System Logs</h4>
                <p className="text-slate-300 text-sm mt-1">Access complete system audit logs</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-600/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                <h4 className="text-white font-medium">Manage Security</h4>
                <p className="text-slate-300 text-sm mt-1">Configure security settings and access controls</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-600/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                <h4 className="text-white font-medium">Troubleshoot Issues</h4>
                <p className="text-slate-300 text-sm mt-1">Diagnose and fix system problems</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}