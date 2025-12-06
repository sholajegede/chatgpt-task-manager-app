"use client";

import { notFound } from 'next/navigation';
import { useQuery } from "convex/react";
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import dynamic from 'next/dynamic';

const TaskForm = dynamic(() => import('@/app/components/tasks/TaskForm'), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-slate-500">Loading task form...</div>
});

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = useQuery(api.tasks.getById, { taskId: params.id as Id<"tasks"> });
  
  if (task === null) {
    notFound();
  }

  if (!task) {
    return <div className="p-4 text-center text-slate-500">Task not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <TaskForm initialData={task} />
    </div>
  );
}