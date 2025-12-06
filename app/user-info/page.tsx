"use client";

import { useState } from "react";
import { useCallTool, useSendMessage, useWidgetState } from "@/app/hooks";
import TaskForm from "@/components/tasks/TaskForm";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  const shouldShowTaskForm = showTaskForm || widgetState?.showTaskForm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter both first name and last name');
      return;
    }

    setIsSubmitting(true);
    try {
      await setWidgetState({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        showTaskForm: true,
      });

      if (sendMessage) {
        await sendMessage(`My name is ${firstName.trim()} ${lastName.trim()}. Please call create_task with firstName="${firstName.trim()}" and lastName="${lastName.trim()}".`);
      }

      setShowTaskForm(true);
    } catch (error) {
      console.error('Error:', error);
      setShowTaskForm(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Label htmlFor="firstName" className="mb-1">
              First Name *
            </Label>
            <Input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your first name"
              required
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
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Your last name"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            variant={"default"}
            disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
          >
            {isSubmitting ? 'Continuing...' : 'Continue to Task Form'}
          </Button>
        </div>
      </form>
    </div>
  );
}