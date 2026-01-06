"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { z, ZodType } from "zod";
import { Zap, Mail, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ROUTES from "@/constants/routes";
import { ActionResponse } from "@/types/global";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ActionResponse>;
  formType: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
  schema,
  defaultValues,
  formType,
  onSubmit,
}: AuthFormProps<T>) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = (await onSubmit(data)) as ActionResponse;

    if (result?.success) {
      toast.success(
        formType === "SIGN_IN"
          ? "Signed in successfully"
          : "Signed up successfully"
      );

      router.push(ROUTES.DASHBOARD);
    } else {
      toast.error(`Error ${result?.status}`, {
        description: result?.error?.message,
      });
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signIn("google", {
        callbackUrl: ROUTES.DASHBOARD,
      });
    } catch (error) {
      console.error(error);

      toast.error("Sign-in Failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during sign-in",
      });
    }
  };

  const buttonText = formType === "SIGN_IN" ? "Sign In" : "Sign Up";

  const getIconForField = (fieldName: string) => {
    switch (fieldName) {
      case "email":
        return Mail;
      case "password":
      case "confirmPassword":
        return Lock;
      case "name":
        return User;
      default:
        return User;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1920)",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-slate-900/90 via-blue-900/85 to-slate-900/90"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center space-x-2 mb-4">
              <Zap className="w-10 h-10 text-blue-400" />
              <span className="text-3xl font-bold text-white">Mocknetic</span>
            </div>
            <p className="text-blue-200 text-lg">
              Master your next technical interview
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              {formType === "SIGN_IN" ? "Sign In" : "Create Account"}
            </h2>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                {Object.keys(defaultValues).map((field) => {
                  const Icon = getIconForField(field);
                  return (
                    <FormField
                      key={field}
                      control={form.control}
                      name={field as Path<T>}
                      render={({ field: formField }) => (
                        <FormItem className="flex w-full flex-col">
                          <FormLabel className="text-sm font-semibold text-slate-700 mb-2">
                            {field === "email"
                              ? "Email Address"
                              : field === "confirmPassword"
                                ? "Confirm Password"
                                : field === "name"
                                  ? "Full Name"
                                  : field.charAt(0).toUpperCase() +
                                    field.slice(1)}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <Input
                                type={
                                  field === "password" ||
                                  field === "confirmPassword"
                                    ? "password"
                                    : field === "email"
                                      ? "email"
                                      : "text"
                                }
                                placeholder={
                                  field === "email"
                                    ? "you@example.com"
                                    : field === "password"
                                      ? formType === "SIGN_IN"
                                        ? "Enter your password"
                                        : "Create a strong password"
                                      : field === "confirmPassword"
                                        ? "Confirm your password"
                                        : field === "name"
                                          ? "John Doe"
                                          : ""
                                }
                                {...formField}
                                className="w-full pl-11 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-sm text-red-600 mt-1" />
                        </FormItem>
                      )}
                    />
                  );
                })}

                {formType === "SIGN_IN" && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-600">Remember me</span>
                    </label>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Forgot password?
                    </a>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {form.formState.isSubmitting
                    ? buttonText === "Sign In"
                      ? "Signing In..."
                      : "Signing Up..."
                    : buttonText}
                </Button>
              </form>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleAuth}
              className="w-full bg-white border-2 border-slate-300 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all font-semibold flex items-center justify-center space-x-3 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="text-center text-sm text-slate-600 mt-6">
              {formType === "SIGN_IN" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href={ROUTES.SIGN_UP}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    href={ROUTES.SIGN_IN}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </div>

          <p className="text-center text-sm text-blue-200 mt-6">
            By signing {formType === "SIGN_IN" ? "in" : "up"}, you agree to our
            Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
