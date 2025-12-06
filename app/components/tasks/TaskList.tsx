"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { useWidgetProps, useCallTool, useSendMessage } from "@/app/hooks";
import DeleteConfirm from "./DeleteConfirm";
import TaskForm from "./TaskForm";

export default function TaskList() {
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "in-progress" | "done">("all");
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const callTool = useCallTool();
  const sendMessage = useSendMessage();
  const widgetProps = useWidgetProps<{
    firstName?: string;
    lastName?: string;
    structuredContent?: {
      firstName?: string;
      lastName?: string;
      tasks?: any[];
    };
  }>();
  const createUser = useMutation(api.users.createOrUpdate);
  const deleteTask = useMutation(api.tasks.remove);
  
  const [firstName, setFirstName] = useState(
    widgetProps?.firstName || widgetProps?.structuredContent?.firstName || ""
  );
  const [lastName, setLastName] = useState(
    widgetProps?.lastName || widgetProps?.structuredContent?.lastName || ""
  );
  const [showNameForm, setShowNameForm] = useState(!firstName || !lastName);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get or create user based on widget props
  const existingUser = useQuery(
    api.users.getByName,
    firstName && lastName ? { firstName, lastName } : "skip"
  );

  useEffect(() => {
    if (!firstName || !lastName) {
      return;
    }

    // If we have an existing user, use it
    if (existingUser?._id) {
      setUserId(existingUser._id as Id<"users">);
      return;
    }

    // If query is still loading, wait
    if (existingUser === undefined) {
      return;
    }

    // User doesn't exist, create one
    const createNewUser = async () => {
      try {
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@taskmanager.com`;
        const newUserId = await createUser({
          email,
          firstName,
          lastName,
        });
        setUserId(newUserId as Id<"users">);
      } catch (error) {
        console.error("Error creating user:", error);
      }
    };

    createNewUser();
  }, [firstName, lastName, existingUser, createUser]);

  const handleLoadTasks = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter your first name and last name');
      return;
    }

    setShowNameForm(false);
    
    // Try using the tool to load tasks
    if (callTool) {
      try {
        await callTool("list_tasks", {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
      } catch (error) {
        console.error("Error calling list_tasks tool:", error);
      }
    }
  };

  const tasks = useQuery(
    api.tasks.getByUser,
    userId ? { userId } : "skip"
  ) || [];

  const filteredTasks = tasks.filter(task => 
    statusFilter === "all" || task.status === statusFilter
  );

  const handleDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      // Use direct Convex mutation for immediate UI update
      if (deleteTask) {
        await deleteTask({ taskId: taskToDelete.id as Id<"tasks"> });
        setTaskToDelete(null);
        // Convex query will automatically update
        alert(`Task "${taskToDelete.title}" has been deleted successfully.`);
      } else if (callTool) {
        const result = await callTool("delete_task", {
          taskId: taskToDelete.id,
        });
        if (result && result.result) {
          setTaskToDelete(null);
          alert(`Task "${taskToDelete.title}" has been deleted successfully.`);
        }
      } else {
        alert('Unable to delete task. Please try again.');
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert('Error deleting task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (task: any) => {
    setTaskToEdit(task);
  };

  if (showNameForm) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">View Your Tasks</h1>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your first name"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your last name"
                required
              />
            </div>
          </div>
          <button
            onClick={handleLoadTasks}
            className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load My Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  // Show edit form if task is being edited
  if (taskToEdit) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4">
          <button
            onClick={() => setTaskToEdit(null)}
            className="text-blue-500 hover:text-blue-700 mb-4"
          >
            ← Back to Tasks
          </button>
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
          onConfirm={handleDelete}
          onCancel={() => setTaskToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tasks - {firstName} {lastName}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNameForm(true)}
            className="text-sm text-blue-500 hover:text-blue-700 px-2"
          >
            Change User
          </button>
          {sendMessage && (
            <button
              onClick={() => sendMessage(`Please call create_task with firstName="${firstName}" and lastName="${lastName}" to show the task creation form.`)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Task
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex space-x-2">
        {['all', 'todo', 'in-progress', 'done'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as any)}
            className={`px-3 py-1 rounded ${
              statusFilter === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </button>
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
                  <button
                    onClick={() => handleEdit(task)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setTaskToDelete({ id: task._id, title: task.title })}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
