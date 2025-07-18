import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

const teamSchema = z.object({
  department: z.string().min(1, "Please select a team"),
});

type TeamForm = z.infer<typeof teamSchema>;

interface TeamSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTeam?: string;
  onTeamUpdate: (team: string) => void;
}

export default function TeamSelectorDialog({ 
  open, 
  onOpenChange, 
  currentTeam, 
  onTeamUpdate 
}: TeamSelectorDialogProps) {
  const form = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      department: currentTeam || "",
    },
  });

  const onSubmit = (data: TeamForm) => {
    onTeamUpdate(data.department);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-court-blue rounded-full flex items-center justify-center">
              <Users className="text-white h-8 w-8" />
            </div>
          </div>
          <DialogTitle className="text-center">Update Your Team</DialogTitle>
          <DialogDescription className="text-center">
            Which team are you on? This helps us track department participation!
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Team</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your team" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-court-blue hover:bg-blue-700 text-white"
              >
                Update Team
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}