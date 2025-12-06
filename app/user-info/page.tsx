"use client";

import { useState } from "react";
import { useCallTool, useSendMessage, useWidgetState } from "@/app/hooks";
import TaskForm from "@/app/components/tasks/TaskForm";

export default function UserInfoPage() {
  const callTool = useCallTool();
  const sendMessage = useSendMessage();
  const [widgetState, setWidgetState] = useWidgetState<{
    firstName?: string;
    lastName?: string;
    showTaskForm?: boolean;
  }>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Check if we should show task form (from widget state or local state)
  const shouldShowTaskForm = showTaskForm || widgetState?.showTaskForm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter both first name and last name');
      return;
    }

    setIsSubmitting(true);
    try {
      // Store user info in widget state
      await setWidgetState({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        showTaskForm: true,
      });

      // Try to trigger ChatGPT to call the tool by sending a message
      if (sendMessage) {
        await sendMessage(`My name is ${firstName.trim()} ${lastName.trim()}. Please call create_task with firstName="${firstName.trim()}" and lastName="${lastName.trim()}".`);
      }

      // Also show the task form directly in this widget
      setShowTaskForm(true);
    } catch (error) {
      console.error('Error:', error);
      // Even if there's an error, show the form
      setShowTaskForm(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If we should show task form, render it with the user info
  if (shouldShowTaskForm) {
    const userFirstName = firstName.trim() || widgetState?.firstName || "";
    const userLastName = lastName.trim() || widgetState?.lastName || "";
    
    return (
      <div>
        <TaskForm firstName={userFirstName} lastName={userLastName} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Enter Your Information</h1>
      <p className="text-gray-600 mb-6">Please provide your first and last name to create a task.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
          >
            {isSubmitting ? 'Continuing...' : 'Continue to Task Form'}
          </button>
        </div>
      </form>
    </div>
  );
}

