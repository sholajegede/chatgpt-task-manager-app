"use client";

import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { useWidgetProps, useSendMessage, useCallTool, useWidgetState } from "@/app/hooks";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import DeleteConfirm from "./DeleteConfirm";
import TaskForm from "./TaskForm";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

function TaskList() {
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "in-progress" | "done">("all");
  const sendMessage = useSendMessage();
  const callTool = useCallTool();
  const widgetProps = useWidgetProps<{
    firstName?: string;
    lastName?: string;
    structuredContent?: {
      firstName?: string;
      lastName?: string;
    };
  }>();
  const [taskToDelete, setTaskToDelete] = useState<{ id: Id<"tasks">; title: string } | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<any | null>(null);

  const [widgetState, setWidgetState] = useWidgetState<{ firstName?: string; lastName?: string }>(() => ({
    firstName: widgetProps?.firstName || widgetProps?.structuredContent?.firstName || "",
    lastName: widgetProps?.lastName || widgetProps?.structuredContent?.lastName || "",
  }));
  const firstName = widgetState?.firstName || "";
  const lastName = widgetState?.lastName || "";

  const user = useQuery(
    api.users.getByName,
    firstName && lastName ? { firstName, lastName } : "skip"
  );

  const tasks = useQuery(
    api.tasks.getByUser,
    user?._id ? { userId: user._id } : "skip"
  ) || [];
  const filteredTasks = tasks.filter(task => 
    statusFilter === "all" || task.status === statusFilter
  );

  function handleEdit(task: any) {
    setTaskToEdit(task);
  }

  if (!firstName || !lastName) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">View Your Tasks</h1>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="mb-1">
                First Name *
              </Label>
              <Input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setWidgetState((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="Your first name"
                required
                autoComplete="given-name"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="mb-1">
                Last Name *
              </Label>
              <Input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setWidgetState((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Your last name"
                required
                autoComplete="family-name"
              />
            </div>
          </div>
          <Button
            onClick={async () => {
              if (!firstName.trim() || !lastName.trim()) {
                alert('Please enter your first name and last name');
                return;
              }
              setWidgetState((prev) => ({
                ...prev,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
              }));
              if (callTool) {
                await callTool("list_tasks", {
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                });
              }
            }}
            variant={"default"}
          >
            Load My Tasks
          </Button>
        </div>
      </div>
    );
  }

  if (taskToEdit) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4">
          <Button
            onClick={() => setTaskToEdit(null)}
            variant={"link"}
          >
            ← Back to Tasks
          </Button>
        </div>
        <TaskForm
          initialData={taskToEdit}
          firstName={firstName}
          lastName={lastName}
          onSuccess={() => setTaskToEdit(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {taskToDelete && (
        <DeleteConfirm
          taskTitle={taskToDelete.title}
          taskId={taskToDelete.id}
          onDeleted={() => setTaskToDelete(null)}
          onCancel={() => setTaskToDelete(null)}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tasks - {firstName} {lastName}</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setTaskToEdit(null)}
            variant={"default"}
          >
            Add Task
          </Button>
        </div>
      </div>

      <div className="mb-6 flex space-x-2">
        {['all', 'todo', 'in-progress', 'done'].map((status) => (
          <Button
            key={status}
            onClick={() => setStatusFilter(status as any)}
            variant={statusFilter === status ? "default" : "outline"}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <p className="text-center text-gray-500">
            {statusFilter === 'all' 
              ? 'No tasks yet. Create your first task!' 
              : `No ${statusFilter} tasks.`}
          </p>
        ) : (
          filteredTasks.map((task) => (
            <div 
              key={task._id} 
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-600 mt-1">{task.description}</p>
                  )}
                  {task.dueDate && (
                    <p className="text-sm text-gray-500 mt-2">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.status === 'done' 
                      ? 'bg-green-100 text-green-800' 
                      : task.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status.replace('-', ' ')}
                  </span>
                  <Button
                    onClick={() => handleEdit(task)}
                    variant={"default"}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => setTaskToDelete({ id: task._id, title: task.title })}
                    variant={"destructive"}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TaskList;