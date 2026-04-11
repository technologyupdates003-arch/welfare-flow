import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface SettingsForm {
  name: string;
  monthly_contribution_amount: number;
  contribution_due_day: number;
  penalty_amount: number;
  penalty_grace_days: number;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<SettingsForm>();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["welfare-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("welfare_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        name: settings.name,
        monthly_contribution_amount: settings.monthly_contribution_amount,
        contribution_due_day: settings.contribution_due_day,
        penalty_amount: settings.penalty_amount,
        penalty_grace_days: settings.penalty_grace_days,
      });
    }
  }, [settings, reset]);

  const updateSettings = useMutation({
    mutationFn: async (values: SettingsForm) => {
      if (settings?.id) {
        const { error } = await supabase.from("welfare_settings").update(values).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("welfare_settings").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["welfare-settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={handleSubmit((v) => updateSettings.mutate(v))} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welfare Group</CardTitle>
            <CardDescription>Configure your welfare group settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Welfare Name</Label>
              <Input id="name" {...register("name", { required: true })} placeholder="e.g. Harambee Welfare Group" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contribution Settings</CardTitle>
            <CardDescription>Set the monthly contribution amount and due date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Monthly Contribution (KES)</Label>
              <Input id="amount" type="number" {...register("monthly_contribution_amount", { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="due_day">Due Day of Month (1-28)</Label>
              <Input id="due_day" type="number" min={1} max={28} {...register("contribution_due_day", { required: true, valueAsNumber: true, min: 1, max: 28 })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penalty Settings</CardTitle>
            <CardDescription>Configure penalty for late payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="penalty">Penalty Amount (KES)</Label>
              <Input id="penalty" type="number" {...register("penalty_amount", { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="grace">Grace Period (days after due date)</Label>
              <Input id="grace" type="number" min={0} {...register("penalty_grace_days", { required: true, valueAsNumber: true, min: 0 })} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
