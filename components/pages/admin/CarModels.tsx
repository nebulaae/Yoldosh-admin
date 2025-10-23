"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useIntersectionObserver } from "usehooks-ts";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCreateCarModel, useDeleteCarModel, useGetCarModels, useUpdateCarModel } from "@/hooks/adminHooks";
import { carModelSchema } from "@/lib/schemas";

type CarModel = {
  id: number;
  make: string;
  model: string;
  seats_std: number;
};

export const CarModels = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);

  const { mutate: createCarModel, isPending: isCreating } = useCreateCarModel();
  const { mutate: updateCarModel, isPending: isUpdating } = useUpdateCarModel();
  const { mutate: deleteCarModel, isPending: isDeleting } = useDeleteCarModel();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetCarModels({});

  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });

  const form = useForm<z.infer<typeof carModelSchema>>({
    resolver: zodResolver(carModelSchema),
    defaultValues: { make: "", model: "", seats_std: 0 },
  });

  const onSubmit = (values: z.infer<typeof carModelSchema>) => {
    if (selectedModel) {
      // Update
      updateCarModel(
        { ...values, id: selectedModel.id },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setSelectedModel(null);
          },
        }
      );
    } else {
      // Create
      createCarModel(values, {
        onSuccess: () => {
          form.reset();
          setIsCreateDialogOpen(false);
        },
      });
    }
  };

  const handleEditClick = (model: CarModel) => {
    setSelectedModel(model);
    form.reset({
      make: model.make,
      model: model.model,
      seats_std: model.seats_std,
    });
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedModel(null);
    form.reset();
  };

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="make"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Производитель</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chevrolet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Модель</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Cobalt" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isCreating || isUpdating} className="btn-primary shadow-glow">
          {isCreating ? "Добавление..." : isUpdating ? "Сохранение..." : selectedModel ? "Сохранить" : "Добавить"}
        </Button>
      </form>
    </Form>
  );

  return (
    <div>
      <Toaster richColors />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="title-text">Модели Машин</h1>
          <p className="subtitle-text">Справочник доступных моделей автомобилей</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary shadow-glow">Добавить модель</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новую модель машины</DialogTitle>
            </DialogHeader>
            {renderForm}
          </DialogContent>
        </Dialog>
      </div>

      <div className="component border border-neutral-50 dark:border-neutral-50 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Производитель</TableHead>
              <TableHead>Модель</TableHead>
              <TableHead>Места</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="border-neutral-950">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : (data?.pages?.flatMap((page) => page.cars ?? []).length ?? 0) > 0 ? (
              data!.pages.flatMap((page) =>
                page.cars.map((model: CarModel) => (
                  <TableRow key={model.id}>
                    <TableCell>{model.make}</TableCell>
                    <TableCell>{model.model}</TableCell>
                    <TableCell>{model.seats_std}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(model)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isDeleting}
                        onClick={() => deleteCarModel(model.id.toString())}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Модели машин не найдены.
                </TableCell>
              </TableRow>
            )}
            {hasNextPage && (
              <TableRow>
                <TableCell colSpan={4} ref={ref}>
                  {isFetchingNextPage && (
                    <div className="flex justify-center p-4">
                      <p>Загрузка...</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать модель машины</DialogTitle>
          </DialogHeader>
          {renderForm}
        </DialogContent>
      </Dialog>
    </div>
  );
};
