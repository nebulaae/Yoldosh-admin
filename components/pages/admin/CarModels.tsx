"use client"

import { z } from "zod";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { carModelSchema } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIntersectionObserver } from "usehooks-ts";
import {
    useCreateCarModel,
    useDeleteCarModel,
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
    const { mutate: createCarModel, isPending: isCreating } = useCreateCarModel();
    const { mutate: deleteCarModel, isPending: isDeleting } = useDeleteCarModel();
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetCarModels({});

    const { ref, isIntersecting } = useIntersectionObserver({
        threshold: 0.5,
    });

    const form = useForm<z.infer<typeof carModelSchema>>({
        resolver: zodResolver(carModelSchema),
        defaultValues: {
            make: "",
            model: "",
            seats_std: 0,
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

    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div>
            <Toaster richColors />
            <div className="flex justify-between items-center mb-6">
                <h1 className="title-text">Модели Машин</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary shadow-glow">Добавить модель</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Добавить новую модель машины
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="make" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Производитель</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Chevrolet"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="model" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Модель</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Cobalt"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField
                                    control={form.control}
                                    name="seats_std"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Количество мест</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 4"
                                                    value={field.value === 0 ? "" : field.value}
                                                    min={1}
                                                    onChange={e => {
                                                        const value = e.target.value.replace(/^0+/, "");
                                                        field.onChange(value === "" ? 0 : Number(value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="btn-primary shadow-glow"
                                >
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
                            <TableHead className="text-muted-foreground">Производитель</TableHead>
                            <TableHead className="text-muted-foreground">Модель</TableHead>
                            <TableHead className="text-muted-foreground">Места</TableHead>
                            <TableHead className="text-right text-muted-foreground">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : data!.pages.flatMap(page => page.cars).length > 0 ? (
                            data!.pages.flatMap((page) => page.cars.map((model: any) => (
                                <TableRow key={model.id}>
                                    <TableCell>{model.make}</TableCell>
                                    <TableCell>{model.model}</TableCell>
                                    <TableCell>{model.seats_std}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={isDeleting}
                                            onClick={() => deleteCarModel(model.id)}
                                        >
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
                        {hasNextPage && (
                            <TableRow>
                                <TableCell colSpan={4} ref={ref}>
                                    {isFetchingNextPage && (
                                        <div className='flex justify-center items-center p-4'>
                                            <p>Загрузка...</p>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};