import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import InstallBanner from "@/components/InstallBanner";
import Login from "@/pages/Login";
import AdminLayout from "@/components/layout/AdminLayout";
import MemberLayout from "@/components/layout/MemberLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import Members from "@/pages/admin/Members";
import Contributions from "@/pages/admin/Contributions";
import ExcelImport from "@/pages/admin/ExcelImport";
import Payments from "@/pages/admin/Payments";
import UnmatchedPayments from "@/pages/admin/UnmatchedPayments";
import BulkSms from "@/pages/admin/BulkSms";
import AdminEvents from "@/pages/admin/Events";
import AdminDocuments from "@/pages/admin/Documents";
import AdminNews from "@/pages/admin/News";
import AdminChat from "@/pages/admin/Chat";
import AdminNotifications from "@/pages/admin/Notifications";
import AdminSettings from "@/pages/admin/Settings";
import MemberDashboard from "@/pages/member/MemberDashboard";
import MemberNews from "@/pages/member/MemberNews";
import MemberEvents from "@/pages/member/MemberEvents";
import MemberDocuments from "@/pages/member/MemberDocuments";
import MemberChat from "@/pages/admin/Chat";
import MemberNotifications from "@/pages/member/MemberNotifications";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Login />;

  if (role === "admin") {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/members" element={<AdminLayout><Members /></AdminLayout>} />
        <Route path="/admin/contributions" element={<AdminLayout><Contributions /></AdminLayout>} />
        <Route path="/admin/import" element={<AdminLayout><ExcelImport /></AdminLayout>} />
        <Route path="/admin/payments" element={<AdminLayout><Payments /></AdminLayout>} />
        <Route path="/admin/unmatched" element={<AdminLayout><UnmatchedPayments /></AdminLayout>} />
        <Route path="/admin/sms" element={<AdminLayout><BulkSms /></AdminLayout>} />
        <Route path="/admin/events" element={<AdminLayout><AdminEvents /></AdminLayout>} />
        <Route path="/admin/documents" element={<AdminLayout><AdminDocuments /></AdminLayout>} />
        <Route path="/admin/news" element={<AdminLayout><AdminNews /></AdminLayout>} />
        <Route path="/admin/chat" element={<AdminLayout><AdminChat /></AdminLayout>} />
        <Route path="/admin/notifications" element={<AdminLayout><AdminNotifications /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/member" element={<MemberLayout><MemberDashboard /></MemberLayout>} />
      <Route path="/member/events" element={<MemberLayout><MemberEvents /></MemberLayout>} />
      <Route path="/member/documents" element={<MemberLayout><MemberDocuments /></MemberLayout>} />
      <Route path="/member/news" element={<MemberLayout><MemberNews /></MemberLayout>} />
      <Route path="/member/chat" element={<MemberLayout><MemberChat /></MemberLayout>} />
      <Route path="/member/notifications" element={<MemberLayout><MemberNotifications /></MemberLayout>} />
      <Route path="*" element={<Navigate to="/member" replace />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <InstallBanner />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
