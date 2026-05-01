import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminMeetingMinutes() {
  const { data: allMinutes = [], isLoading } = useQuery({
    queryKey: ["admin-all-minutes"],
    queryFn: async () => {
      console.log("Fetching all minutes for admin...");
      const { data, error } = await supabase
        .from("meeting_minutes")
        .select("*")
        .order("meeting_date", { ascending: false });

      if (error) {
        console.error("Error fetching minutes:", error);
        throw error;
      }

      console.log("Minutes fetched:", data?.length || 0);
      return data || [];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMeetingTypeColor = (type: string) => {
    return type === "executive" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800";
  };

  const downloadMinutes = (minute: any) => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${minute.title}</title>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; font-size: 14px; }
            .section { margin-bottom: 20px; }
            .section h3 { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
            .section p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background: #f0f0f0; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KIRINYAGA HEALTHCARE WORKERS' WELFARE</h1>
            <h2>${minute.title}</h2>
            <p><strong>Date:</strong> ${format(new Date(minute.meeting_date), "dd MMMM yyyy")}</p>
            <p><strong>Type:</strong> ${minute.meeting_type === "executive" ? "Executive Meeting" : "General Meeting"}</p>
            <p><strong>Status:</strong> ${minute.status}</p>
          </div>

          <div class="section">
            <h3>Meeting Details</h3>
            <p><strong>Chairperson:</strong> ${minute.chairperson_name || "N/A"}</p>
            <p><strong>Secretary:</strong> ${minute.secretary_name || "N/A"}</p>
            <p><strong>Venue:</strong> ${minute.venue || "N/A"}</p>
            <p><strong>Start Time:</strong> ${minute.start_time || "N/A"}</p>
            <p><strong>End Time:</strong> ${minute.end_time || "N/A"}</p>
          </div>

          ${minute.content ? `
            <div class="section">
              <h3>Minutes Content</h3>
              <p>${minute.content.replace(/\n/g, "<br>")}</p>
            </div>
          ` : ""}

          ${minute.attendees && minute.attendees.length > 0 ? `
            <div class="section">
              <h3>Attendees</h3>
              <p>${minute.attendees.join(", ")}</p>
            </div>
          ` : ""}

          ${minute.absent_with_apology && minute.absent_with_apology.length > 0 ? `
            <div class="section">
              <h3>Absent with Apology</h3>
              <p>${minute.absent_with_apology.join(", ")}</p>
            </div>
          ` : ""}

          ${minute.absent_without_apology && minute.absent_without_apology.length > 0 ? `
            <div class="section">
              <h3>Absent without Apology</h3>
              <p>${minute.absent_without_apology.join(", ")}</p>
            </div>
          ` : ""}

          <div class="footer">
            <p>Generated from KIRINYAGA HCWW System</p>
            <p>Generated on: ${format(new Date(), "dd MMMM yyyy HH:mm")}</p>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([html], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `minutes-${minute.title?.replace(/\s+/g, "-") || "document"}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Minutes downloaded!");
    } catch (error) {
      toast.error("Failed to download minutes");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Meeting Minutes</h1>
        <p className="text-muted-foreground mt-2">View and manage all meeting minutes (General & Executive)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Meeting Minutes</span>
            <Badge variant="outline">{allMinutes.length} minutes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading minutes...</div>
          ) : allMinutes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No meeting minutes found.</div>
          ) : (
            <div className="space-y-3">
              {allMinutes.map((minute: any) => (
                <div
                  key={minute.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">{minute.title}</h3>
                      <Badge className={getMeetingTypeColor(minute.meeting_type)}>
                        {minute.meeting_type === "executive" ? "Executive" : "General"}
                      </Badge>
                      <Badge className={getStatusColor(minute.status)}>
                        {minute.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Date:</span> {format(new Date(minute.meeting_date), "dd MMM yyyy")}
                      </div>
                      <div>
                        <span className="font-medium">Chairperson:</span> {minute.chairperson_name || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Secretary:</span> {minute.secretary_name || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{minute.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Date:</span>
                              <p>{format(new Date(minute.meeting_date), "dd MMMM yyyy")}</p>
                            </div>
                            <div>
                              <span className="font-medium">Type:</span>
                              <p>{minute.meeting_type === "executive" ? "Executive Meeting" : "General Meeting"}</p>
                            </div>
                            <div>
                              <span className="font-medium">Chairperson:</span>
                              <p>{minute.chairperson_name || "N/A"}</p>
                            </div>
                            <div>
                              <span className="font-medium">Secretary:</span>
                              <p>{minute.secretary_name || "N/A"}</p>
                            </div>
                            <div>
                              <span className="font-medium">Venue:</span>
                              <p>{minute.venue || "N/A"}</p>
                            </div>
                            <div>
                              <span className="font-medium">Status:</span>
                              <p>{minute.status}</p>
                            </div>
                          </div>

                          {minute.content && (
                            <div>
                              <h4 className="font-medium mb-2">Content</h4>
                              <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                                {minute.content}
                              </p>
                            </div>
                          )}

                          {minute.attendees && minute.attendees.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Attendees</h4>
                              <p className="text-sm">{minute.attendees.join(", ")}</p>
                            </div>
                          )}

                          {minute.absent_with_apology && minute.absent_with_apology.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Absent with Apology</h4>
                              <p className="text-sm">{minute.absent_with_apology.join(", ")}</p>
                            </div>
                          )}

                          {minute.absent_without_apology && minute.absent_without_apology.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Absent without Apology</h4>
                              <p className="text-sm">{minute.absent_without_apology.join(", ")}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadMinutes(minute)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
