"use client";

import { useState } from "react";
import { useWidgetProps, useCallTool, useWidgetState } from "@/app/hooks";
import { Id } from "@/convex/_generated/dataModel";
import TaskSuccess from "./TaskSuccess";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectValue, SelectContent, SelectItem, SelectTrigger } from "../ui/select";

type TaskStatus = "todo" | "in-progress" | "done";

interface TaskFormProps {
  initialData?: {
    _id: Id<"tasks">;
    title: string;
    description?: string;
    status: TaskStatus;
    dueDate?: number;
  };
  firstName?: string;
  lastName?: string;
  onSuccess?: () => void;
}

export default function TaskForm({ initialData, firstName: propFirstName, lastName: propLastName, onSuccess }: TaskFormProps = {}) {
  const callTool = useCallTool();
  const [widgetState] = useWidgetState<{
    firstName?: string;
    lastName?: string;
  }>();
  const widgetProps = useWidgetProps<{
    firstName?: string;
    lastName?: string;
    title?: string;
    description?: string;
    structuredContent?: {
      firstName?: string;
      lastName?: string;
      title?: string;
      description?: string;
    };
  }>();
  
  const firstName = propFirstName || widgetState?.firstName || widgetProps?.firstName || widgetProps?.structuredContent?.firstName || "";
  const lastName = propLastName || widgetState?.lastName || widgetProps?.lastName || widgetProps?.structuredContent?.lastName || "";
  
  const [title, setTitle] = useState(
    initialData?.title || widgetProps?.title || widgetProps?.structuredContent?.title || ""
  );
  const [description, setDescription] = useState(
    initialData?.description || widgetProps?.description || widgetProps?.structuredContent?.description || ""
  );
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || "todo");
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdTaskTitle, setCreatedTaskTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData && (!firstName.trim() || !lastName.trim())) {
      alert('User information is required. Please ask ChatGPT to identify you first.');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }
    if (!callTool) {
      alert('Unable to submit. Please try again.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (initialData) {
        const result = await callTool("update_task", {
          taskId: initialData._id,
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          dueDate: dueDate || undefined,
        });
        if (result && result.result) {
          alert('Task updated successfully!');
          if (onSuccess) {
            onSuccess();
          }
          window.location.reload();
        } else {
          alert('Task update may have failed. Please check with ChatGPT.');
        }
      } else {
        if (!firstName.trim() || !lastName.trim()) {
          alert('User information is required.');
          return;
        }
        const result = await callTool("create_task", {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          title: title.trim(),
          description: description.trim() || "",
          status,
          dueDate: dueDate || undefined,
        });
        if (result && result.result) {
          setCreatedTaskTitle(title.trim());
          setShowSuccess(true);
          if (onSuccess) {
            onSuccess();
          }
          window.location.reload();
        } else {
          alert('Task creation may have failed. Please check with ChatGPT.');
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialData && (!firstName || !lastName)) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <p className="text-center text-gray-500">
          Please tell ChatGPT your first and last name first, then try creating a task again.
        </p>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <TaskSuccess
        taskTitle={createdTaskTitle}
        firstName={firstName}
        lastName={lastName}
        onCreateAnother={() => {
          setShowSuccess(false);
          setTitle("");
          setDescription("");
          setStatus("todo");
          setDueDate("");
        }}
      />
    );
  }

  return (
  <div className="max-w-2xl mx-auto p-4 relative z-50">
      <h1 className="text-2xl font-bold mb-6">
        {initialData ? 'Edit Task' : 'Create New Task'}{firstName && lastName ? ` - ${firstName} ${lastName}` : ''}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title" className="mb-1">
            Task Title *
          </Label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="mb-1">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Task description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status" className="mb-1">
              Status
            </Label>
            <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate" className="mb-1">
              Due Date
            </Label>
            <Input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting 
              ? (initialData ? 'Updating...' : 'Creating...') 
              : (initialData ? 'Update Task' : 'Create Task')}
          </Button>
        </div>
      </form>
    </div>
  );
}
