"use client";

import { useCallTool, useSendMessage } from "@/app/hooks";
import { CheckCircle, ListChecks, PlusCircle } from "lucide-react";

interface TaskSuccessProps {
  taskTitle: string;
  firstName: string;
  lastName: string;
  onViewTasks?: () => void;
  onCreateAnother?: () => void;
}

export default function TaskSuccess({ 
  taskTitle, 
  firstName, 
  lastName,
  onViewTasks,
  onCreateAnother 
}: TaskSuccessProps) {
  const callTool = useCallTool();
  const sendMessage = useSendMessage();

  const handleViewTasks = async () => {
    if (onViewTasks) {
      onViewTasks();
      return;
    }

    if (callTool) {
      try {
        await callTool("list_tasks", {
          firstName,
          lastName,
        });
      } catch (error) {
        console.error("Error calling list_tasks:", error);
      }
    } else if (sendMessage) {
      await sendMessage(`Please show me all tasks for ${firstName} ${lastName}`);
    }
  };

  const handleCreateAnother = () => {
    if (onCreateAnother) {
      onCreateAnother();
      return;
    }

    if (sendMessage) {
      sendMessage(`Please call create_task with firstName="${firstName}" and lastName="${lastName}" to show the task creation form.`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Created Successfully!</h2>
        <p className="text-lg text-gray-600 mb-1">
          <span className="font-semibold">"{taskTitle}"</span> has been added to your task list.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {firstName} {lastName}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={handleViewTasks}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <ListChecks className="w-5 h-5" />
            View All Tasks
          </button>
          <button
            onClick={handleCreateAnother}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Create Another Task
          </button>
        </div>
      </div>
    </div>
  );
}

