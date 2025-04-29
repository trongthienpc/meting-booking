"use client";

import React, { useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { signIn } from "@/app/actions/user-actions";

export const signInSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const Login = () => {
  const router = useRouter();
  const params = useSearchParams();
  const redirectToParam = params.get("redirectTo") || "/";
  const resolver = useMemo(() => zodResolver(signInSchema), []);
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: resolver,
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    const res = await signIn(values);
    if (res.success) {
      toast.success(`Đang chuyển hướng ...`);
      router.refresh();
      router.push(redirectToParam);
    } else {
      toast.error(res.message);
    }
  };
  return (
    <div className="flex flex-col md:flex-row md:min-w-[720px] min-w-[360px] max-w-4xl mx-auto shadow-xl rounded-lg overflow-hidden z-50">
      <div className="md:w-1/2 h-64 md:h-auto relative z-50">
        <Image
          src="/cute-3d.png"
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          alt="Nurse"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="md:w-1/2 bg-white p-8">
        <div className="hidden md:flex justify-end mb-6">
          <Image
            src="/Logo.png"
            width={256}
            height={128}
            priority
            alt="Logo"
            // className="rounded"
          />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900">Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your username"
                      className="bg-white border-gray-300  text-slate-900"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="******"
                      {...field}
                      className="bg-white border-gray-100 text-slate-900"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="py-6 ">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full bg-slate-900 text-white hover:bg-slate-700"
              >
                Login
                {form.formState.isSubmitting && <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;
//
