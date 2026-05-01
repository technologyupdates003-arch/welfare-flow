import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AttendanceRecord {
  userId: string;
  memberName: string;
  status: "present" | "absent" | "apology";
}

export function ExecutiveMinutesForm({ meetingId }: { meetingId: string }) {
  const queryClient = useQueryClient();
  const [selectedAttendees, setSelectedAttendees] = useState<AttendanceRecord[]>([]);
  const [content, setContent] = useState("");

  // Fetch ONLY members with assigned roles
  const { data: roleMembers = [] } = useQuery({
    queryKey: ["role-members"],
    queryFn: async () => {
      const { data: members } = await supabase
        .from("members")
        .select("id, name, user_id")
        .order("name");

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const roleUserIds = new Set(roles?.map(r => r.user_id) || []);

      return (members || [])
        .filter(m => m.user_id && roleUserIds.has(m.user_id))
        .map(m => ({
          id: m.id,
          name: m.name,
          userId: m.user_id,
        }));
    },
  });

  const toggleAttendee = (userId: string, memberName: string) => {
    const exists = selectedAttendees.find(a => a.userId === userId);
    if (exists) {
      setSelectedAttendees(selectedAttendees.filter(a => a.userId !== userId));
    } else {
      setSelectedAttendees([
        ...selectedAttendees,
        { userId, memberName, status: "present" },
      ]);
    }
  };

  const updateAttendanceStatus = (userId: string, status: "present" | "absent" | "apology") => {
    setSelectedAttendees(
      selectedAttendees.map(a =>
        a.userId === userId ? { ...a, status } : a
      )
    );
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (selectedAttendees.length === 0) {
        throw new Error("At least one attendee must be selected");
      }

      // Save attendance records
      const attendanceData = selectedAttendees.map(a => ({
        meeting_id: meetingId,
        user_id: a.userId,
        status: a.status,
      }));

      const { error } = await supabase
        .from("meeting_attendance")
        .insert(attendanceData);

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-attendance"] });
      toast.success("Executive minutes attendance saved");
      setSelectedAttendees([]);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Executive Meeting Attendance
          <Badge variant="destructive">Role Members Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {roleMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No members with assigned roles available
          </div>
        ) : (
          <>
            <div>
              <Label className="text-base font-semibold mb-4 block">
                Select Attendees ({selectedAttendees.length} selected)
              </Label>
              <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                {roleMembers.map(member => (
                  <div key={member.userId} className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedAttendees.some(a => a.userId === member.userId)}
                      onCheckedChange={() => toggleAttendee(member.userId, member.name)}
                    />
                    <span className="flex-1">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedAttendees.length > 0 && (
              <div>
                <Label className="text-base font-semibold mb-4 block">
                  Mark Attendance Status
                </Label>
                <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {selectedAttendees.map(attendee => (
                    <div key={attendee.userId} className="flex items-center gap-3">
                      <span className="flex-1 font-medium">{attendee.memberName}</span>
                      <Select
                        value={attendee.status}
                        onValueChange={(value: any) =>
                          updateAttendanceStatus(attendee.userId, value)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">✅ Present</SelectItem>
                          <SelectItem value="absent">❌ Absent</SelectItem>
                          <SelectItem value="apology">⚠️ Absent with Apology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || selectedAttendees.length === 0}
              className="w-full"
            >
              {saveMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                "Save Attendance"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
