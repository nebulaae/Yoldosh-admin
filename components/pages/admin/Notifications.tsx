"use client"

import {
    useCreateGlobalNotification,
    useGetNotifications
} from "@/hooks/adminHooks";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Assuming you have RadioGroup component

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { globalNotificationSchema } from "@/lib/utils";
import { formatDate, getStatusColor } from "@/lib/utils";

export const Notifications = () => {
    const { mutate: sendNotification, isPending } = useCreateGlobalNotification();
    const { data: notifications, isLoading } = useGetNotifications();

    const form = useForm<z.infer<typeof globalNotificationSchema>>({
        resolver: zodResolver(globalNotificationSchema),
        defaultValues: {
            title: "",
            content: "",
            type: "INFO",
        },
    });

    const onSubmit = (values: z.infer<typeof globalNotificationSchema>) => {
        sendNotification(values, {
            onSuccess: () => {
                form.reset();
            }
        });
    };

    return (
        <div>
            <Toaster richColors />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h1 className="title-text mb-2">Отправить Уведомление</h1>
                    <p className="text-sm text-gray-500 mb-6">Отправьте глобальное уведомление всем пользователям.</p>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg border">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Заголовок</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Важное объявление" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Содержание</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Текст вашего уведомления..." className="min-h-[120px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Тип уведомления</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl><RadioGroupItem value="INFO" /></FormControl>
                                                    <FormLabel className="font-normal">Info</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl><RadioGroupItem value="WARNING" /></FormControl>
                                                    <FormLabel className="font-normal">Warning</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl><RadioGroupItem value="SUCCESS" /></FormControl>
                                                    <FormLabel className="font-normal">Success</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Отправка..." : "Отправить"}
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="md:col-span-2">
                    <h2 className="title-text mb-6">История уведомлений</h2>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Заголовок</TableHead>
                                    <TableHead>Тип</TableHead>
                                    <TableHead>Дата</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : notifications?.length > 0 ? (
                                    notifications.map((notif: any) => (
                                        <TableRow key={notif.id}>
                                            <TableCell className="font-medium">{notif.title}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notif.type)}`}>
                                                    {notif.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>{formatDate(notif.createdAt)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">Уведомлений пока нет.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};