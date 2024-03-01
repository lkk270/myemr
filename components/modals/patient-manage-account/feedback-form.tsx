"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useTransition } from "react";

const formSchema = z.object({
  feedback: z.string().min(2, {
    message: "feedback must be at least 2 characters.",
  }),
});

export const FeedbackForm = () => {
  const [isPending, startTransition] = useTransition();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedback: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const feedbackText = values.feedback;
  };
  return (
    <div className="flex flex-col items-center h-full p-4">
      {/* <div className="mb-4 text-sm text-center text-primary/50">
        <h1 className="text-4xl font-bold">Feedback</h1>
        <div className="max-w-lg mt-4 text-left">
          <p>If you&apos;d like to suggest features and/or improvements you can do so here anonymously.</p>
        </div>
      </div> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <FormField
            control={form.control}
            name="feedback"
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel>Feedback</FormLabel> */}
                <FormControl>
                  <Textarea className="h-[250px]" placeholder="Don't hold back, we can take it." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isPending} type="submit">
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
