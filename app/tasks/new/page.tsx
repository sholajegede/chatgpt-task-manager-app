"use client";

import dynamic from "next/dynamic";

const TaskForm = dynamic(() => import("@/app/components/tasks/TaskForm"), {
  ssr: false,
});

export default function NewTaskPage() {
  return <TaskForm />;
}
