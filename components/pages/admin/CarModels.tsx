"use client"

import {
    useGetCarModels,
    useCreateCarModel,
    useDeleteCarModel
} from "@/hooks/adminHooks";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { z } from "zod";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { carModelSchema } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";

export const CarModels = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data: carModels, isLoading } = useGetCarModels();
    const { mutate: createCarModel, isPending: isCreating } = useCreateCarModel();
    const { mutate: deleteCarModel, isPending: isDeleting } = useDeleteCarModel();


    const form = useForm<z.infer<typeof carModelSchema>>({
        resolver: zodResolver(carModelSchema),
        defaultValues: {
            name: "",
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

    const handleDelete = (id: string) => {
        if (window.confirm("Вы уверены, что хотите удалить эту модель?")) {
            deleteCarModel(id);
        }
    }


    return (
        <div>
            <Toaster richColors />
            <div className="flex justify-between items-center mb-6">
                <h1 className="title-text">Модели Машин</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Добавить модель</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Добавить новую модель машины</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Название модели</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Chevrolet Cobalt" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                            <TableHead>Название</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : carModels?.length > 0 ? (
                            carModels.map((model: any, index: number) => (
                                <TableRow key={model.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{model.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(model.id)} disabled={isDeleting}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">Модели машин не найдены.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
