"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, PlusCircle, ListChecks } from "lucide-react";
import { useWidgetProps } from "./hooks";

export default function Home() {
  const router = useRouter();
  const toolOutput = useWidgetProps<{
    name?: string;
    result?: { structuredContent?: { name?: string } };
  }>();

  const name = toolOutput?.result?.structuredContent?.name || toolOutput?.name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to Task Manager
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            {name ? `Hi ${name}, manage your tasks efficiently` : 'Efficiently manage your tasks'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
                <PlusCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Create Tasks</CardTitle>
              <CardDescription>Add new tasks with titles, descriptions, and due dates</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                <ListChecks className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>Update task status as you work on them</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Stay Organized</CardTitle>
              <CardDescription>Keep all your tasks in one place and never miss a deadline</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
            Ready to get started?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Start managing your tasks efficiently. Create your first task now!
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/tasks">
              <Button size="lg" className="gap-2">
                <ListChecks className="w-5 h-5" />
                View All Tasks
              </Button>
            </Link>
            <Link href="/tasks/new">
              <Button size="lg" variant="outline" className="gap-2">
                <PlusCircle className="w-5 h-5" />
                New Task
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="mt-16 py-6 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400">
          <p>Task Manager - Keep your work organized and on track</p>
        </div>
      </footer>
    </div>
  );
}
