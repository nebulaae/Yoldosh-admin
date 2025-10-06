"use client"

import { z } from "zod";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useDebounceValue } from "usehooks-ts";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useGetRestrictedWords,
    useCreateRestrictedWord,
    useDeleteRestrictedWord
} from "@/hooks/adminHooks";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

const wordSchema = z.object({ word: z.string().min(2, "Слово должно содержать минимум 2 символа.") });

export const Moderation = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch] = useDebounceValue(searchTerm, 500);

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetRestrictedWords({ search: debouncedSearch });
    const { mutate: createWord, isPending: isCreating } = useCreateRestrictedWord();
    const { mutate: deleteWord, isPending: isDeleting } = useDeleteRestrictedWord();

    const form = useForm<z.infer<typeof wordSchema>>({
        resolver: zodResolver(wordSchema),
        defaultValues: { word: "" },
    });

    const onSubmit = (values: z.infer<typeof wordSchema>) => {
        createWord(values, {
            onSuccess: () => {
                form.reset();
                setIsDialogOpen(false);
            },
        });
    };

    const allWords = data?.pages.flatMap(page => page.rows) ?? [];

    return (
        <div>
            <Toaster />
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="title-text">Модерация чата</h1>
                    <p className="text-muted-foreground">Управление списком запрещенных слов</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary shadow-glow">
                            <Plus />
                            Добавить слово
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Добавить запрещенное слово
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="word" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Слово</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Например, казино"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
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
            <div className="flex flex-col p-6 rounded-2xl w-full component">
                <div className="relative flex w-full mb-4">
                    <Search
                        className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                        placeholder="Поиск слов..."
                        className="pl-8 component-dark w-full border-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-muted-foreground">Слово</TableHead>
                                <TableHead className="text-muted-foreground">Дата добавления</TableHead>
                                <TableHead className="text-right text-muted-foreground">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={3}>
                                            <Skeleton className="h-8 w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : allWords.length > 0 ? (
                                allWords.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.word}</TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteWord(item.id)} disabled={isDeleting}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        Запрещенные слова не найдены.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {hasNextPage && (
                    <div className="mt-4 text-center">
                        <Button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                        >
                            {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};