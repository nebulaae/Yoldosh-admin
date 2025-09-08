"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginSchema } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { useAdminLogin } from "@/hooks/useAdminAuth";

export const Login = () => {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string>("");

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        try {
            const auth = useAdminLogin();
        } catch (err) {
            console.error(err)
        }
    };

    return (
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col space-y-4 w-80 bg-white border border-neutral-200 rounded-xl shadow-xl p-6"
                >
                    <div className="text-center">
                        <h1 className="font-semibold text-2xl text-gray-900">Yoldosh Admin</h1>
                    </div>

                    <Separator orientation="horizontal" />

                    {/* Error Alert */}
                    {errorMessage && (
                        <Alert variant="destructive">
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Email */}
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
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password */}
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
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full"
                    >
                        Зайти
                    </Button>

                    <div className="text-center text-xs text-gray-500">
                        Только авторизованные могут получить доступ к данному ресурсу
                    </div>
                </form>
            </Form>
    );
};