"use client";

import { useState } from "react";
import { useWidgetProps, useCallTool, useWidgetState } from "@/app/hooks";
import { Id } from "@/convex/_generated/dataModel";
import TaskSuccess from "./TaskSuccess";

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
  
  // Get user info from props, widget state, or widget props (priority order)
  const firstName = propFirstName || widgetState?.firstName || widgetProps?.firstName || widgetProps?.structuredContent?.firstName || "";
  const lastName = propLastName || widgetState?.lastName || widgetProps?.lastName || widgetProps?.structuredContent?.lastName || "";
  
  // Get initial task values from widget props or initialData
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
    
    // Validate required fields
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
      // If editing, use update_task tool
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
        } else {
          alert('Task update may have failed. Please check with ChatGPT.');
        }
      } else {
        // Creating new task - require firstName/lastName
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
          // Show success screen
          setCreatedTaskTitle(title.trim());
          setShowSuccess(true);
          if (onSuccess) {
            onSuccess();
          }
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

  // Only require firstName/lastName for creating new tasks, not editing
  if (!initialData && (!firstName || !lastName)) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <p className="text-center text-gray-500">
          Please tell ChatGPT your first and last name first, then try creating a task again.
        </p>
      </div>
    );
  }

  // Show success screen after task creation
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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {initialData ? 'Edit Task' : 'Create New Task'}{firstName && lastName ? ` - ${firstName} ${lastName}` : ''}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Task title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Task description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting 
              ? (initialData ? 'Updating...' : 'Creating...') 
              : (initialData ? 'Update Task' : 'Create Task')}
          </button>
        </div>
      </form>
    </div>
  );
}
