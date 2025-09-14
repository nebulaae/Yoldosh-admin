"use client"

import { z } from "zod";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { carModelSchema } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useCreateCarModel,
    useGetCarModels
} from "@/hooks/adminHooks";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

export const CarModels = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // For now, pagination/search is not implemented in this component, but the hook is ready.
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetCarModels({});
    const { mutate: createCarModel, isPending: isCreating } = useCreateCarModel();

    const form = useForm<z.infer<typeof carModelSchema>>({
        resolver: zodResolver(carModelSchema),
        defaultValues: {
            make: "",
            model: "",
            seats_std: 4,
        },
    });

    const onSubmit = (values: z.infer<typeof carModelSchema>) => {
        createCarModel(values, {
            onSuccess: () => {
                form.reset();
                setIsDialogOpen(false);
            },
        });
    };

    return (
        <div>
            <Toaster richColors />
            <div className="flex justify-between items-center mb-6">
                <h1 className="title-text">Модели Машин</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild><Button>Добавить модель</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Добавить новую модель машины</DialogTitle></DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="make" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Производитель</FormLabel>
                                        <FormControl><Input placeholder="e.g., Chevrolet" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="model" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Модель</FormLabel>
                                        <FormControl><Input placeholder="e.g., Cobalt" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="seats_std" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Количество мест</FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g., 4" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? "Добавление..." : "Добавить"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Производитель</TableHead>
                            <TableHead>Модель</TableHead>
                            <TableHead>Места</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : data!.pages.flatMap(page => page.cars).length > 0 ? (
                            data!.pages.flatMap((page, pageIndex) => page.cars.map((model: any, modelIndex: number) => (
                                <TableRow key={model.id}>
                                    <TableCell>{pageIndex * 10 + modelIndex + 1}</TableCell>
                                    <TableCell>{model.make}</TableCell>
                                    <TableCell>{model.model}</TableCell>
                                    <TableCell>{model.seats_std}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" disabled>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">Модели машин не найдены.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {hasNextPage && (
                <div className="mt-4 text-center">
                    <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
                    </Button>
                </div>
            )}
        </div>
    );
};