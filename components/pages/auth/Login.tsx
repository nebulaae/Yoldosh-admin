"use client";

import { z } from "zod";
import { Toaster } from 'sonner';
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAdminLogin } from "@/hooks/adminHooks";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

export const Login = () => {
    const router = useRouter();
    const { mutate: login, isPending, isSuccess, data: loginData } = useAdminLogin();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        if (isSuccess && loginData) {
            localStorage.setItem("admin-token", loginData.data.accessToken);
            if (loginData.data.admin.role === "SuperAdmin") {
                router.push("/super-admin");
            } else {
                router.push("/admin");
            }
        }
    }, [isSuccess, loginData, router]);

    const onSubmit = (values: z.infer<typeof loginSchema>) => {
        login(values);
    };

    return (
        <>
            <Toaster richColors />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col space-y-4 w-96 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-50 rounded-xl shadow-2xl p-6 mx-2"
                >
                    <div className="text-center">
                        <h1 className="font-semibold text-2xl">Yoldosh Admin</h1>
                    </div>

                    <Separator orientation="horizontal" />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Почта</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="admin@yoldosh.uz"
                                        {...field}
                                        disabled={isPending}
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
                                <FormLabel>Пароль</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Введите пароль"
                                        {...field}
                                        disabled={isPending}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full text-white btn-primary shadow-glow"
                        disabled={isPending}
                    >
                        {isPending ? "Вход..." : "Войти"}
                    </Button>

                    <div className="text-center text-xs text-gray-500 pt-2">
                        Доступ разрешен только авторизованным пользователям.
                    </div>
                </form>
            </Form>
        </>
    );
};

