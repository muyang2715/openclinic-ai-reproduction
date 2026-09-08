"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone } from "lucide-react";

import { useCall } from "@/hooks/useCall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const preCallSchema = z.object({
  name: z.string().min(2, "请输入患者姓名"),
  email: z.string().email("请输入有效的邮箱地址"),
});

type PreCallValues = z.infer<typeof preCallSchema>;

// The pre-call form — collects the caller's name + email before the call
// connects, so the agent can greet them by name and email their confirmation.
export function PreCallDialog() {
  const { formOpen, closeForm, startCall } = useCall();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PreCallValues>({
    resolver: zodResolver(preCallSchema),
    defaultValues: { name: "", email: "" },
  });

  function onSubmit(values: PreCallValues) {
    startCall({ name: values.name.trim(), email: values.email.trim() });
    reset();
  }

  return (
    <Dialog
      open={formOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeForm();
          reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mb-1 flex size-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-soft-md">
            <Phone className="size-5" strokeWidth={2.25} />
          </span>
          <DialogTitle>开始智能接待体验</DialogTitle>
          <DialogDescription>
            请留下基本信息。智能前台会在体验中称呼您的姓名，并用于发送预约确认。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div>
            <Label htmlFor="precall-name" className="mb-2 block">
              患者姓名
            </Label>
            <Input
              id="precall-name"
              placeholder="请输入姓名"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="precall-email" className="mb-2 block">
              联系邮箱
            </Label>
            <Input
              id="precall-email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button type="submit" variant="gradient" className="mt-1 w-full">
            <Phone className="size-4" />
            开始体验
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
