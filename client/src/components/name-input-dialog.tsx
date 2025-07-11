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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Volleyball } from "lucide-react";

const nameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
});

type NameForm = z.infer<typeof nameSchema>;

interface NameInputDialogProps {
  open: boolean;
  onNameSubmit: (name: string) => void;
}

export default function NameInputDialog({ open, onNameSubmit }: NameInputDialogProps) {
  const form = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: NameForm) => {
    onNameSubmit(data.name);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-court-blue rounded-full flex items-center justify-center">
              <Volleyball className="text-white h-8 w-8" />
            </div>
          </div>
          <DialogTitle className="text-center">Welcome to CourtCall!</DialogTitle>
          <DialogDescription className="text-center">
            What's your name? We'll use this to show who's joining matches.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your first name" 
                      {...field}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full bg-court-blue hover:bg-blue-700 text-white"
            >
              Get Started
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}