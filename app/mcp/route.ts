import { baseURL } from "@/baseUrl";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Initialize Convex HTTP client for server-side calls
function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  }
  return new ConvexHttpClient(convexUrl);
}

// Helper function to call Convex queries from server-side
async function callConvexQuery(
  functionReference: any,
  args: Record<string, unknown>
): Promise<unknown> {
  const client = getConvexClient();
  return await client.query(functionReference, args);
}

// Helper function to call Convex mutations from server-side
async function callConvexMutation(
  functionReference: any,
  args: Record<string, unknown>
): Promise<unknown> {
  const client = getConvexClient();
  return await client.mutation(functionReference, args);
}

// Helper to get or create a user by firstName and lastName
async function getOrCreateUser(firstName: string, lastName: string) {
  try {
    // Try to get user by firstName and lastName
    const user = await callConvexQuery(api.users.getByName, {
      firstName,
      lastName,
    });
    if (user) {
      return user;
    }
  } catch (error) {
    // User doesn't exist, create one
  }

  // Create new user with a unique email based on name
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@taskmanager.com`;
  const userId = await callConvexMutation(api.users.createOrUpdate, {
    email,
    firstName,
    lastName,
  });
  return { _id: userId };
}

// Helper to get HTML for a page
const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const handler = createMcpHandler(async (server) => {
  // Register widget resources for task management UI
  const taskListHtml = await getAppsSdkCompatibleHtml(baseURL, "/tasks");
  const taskFormHtml = await getAppsSdkCompatibleHtml(baseURL, "/tasks/new");
  const userInfoHtml = await getAppsSdkCompatibleHtml(baseURL, "/user-info");
  const homeHtml = await getAppsSdkCompatibleHtml(baseURL, "/");

  const taskListWidget: ContentWidget = {
    id: "task_list_widget",
    title: "Task List",
    templateUri: "ui://widget/task-list.html",
    invoking: "Loading your tasks...",
    invoked: "Tasks loaded",
    html: taskListHtml,
    description: "Displays all tasks for the user",
    widgetDomain: baseURL,
  };

  const taskFormWidget: ContentWidget = {
    id: "task_form_widget",
    title: "Create Task",
    templateUri: "ui://widget/task-form.html",
    invoking: "Opening task form...",
    invoked: "Task form ready",
    html: taskFormHtml,
    description: "Form to create a new task with input fields",
    widgetDomain: baseURL,
  };

  const userInfoWidget: ContentWidget = {
    id: "user_info_widget",
    title: "User Information",
    templateUri: "ui://widget/user-info.html",
    invoking: "Loading user info form...",
    invoked: "User info form ready",
    html: userInfoHtml,
    description: "Form to collect user's first and last name",
    widgetDomain: baseURL,
  };

  const homeWidget: ContentWidget = {
    id: "task_manager_home",
    title: "Task Manager",
    templateUri: "ui://widget/task-manager-home.html",
    invoking: "Loading task manager...",
    invoked: "Task manager ready",
    html: homeHtml,
    description: "Task manager homepage with navigation",
    widgetDomain: baseURL,
  };

  // Register home widget resource
  server.registerResource(
    "task-manager-home",
    homeWidget.templateUri,
    {
      title: homeWidget.title,
      description: homeWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": homeWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${homeWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": homeWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": homeWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // Register task list resource
  server.registerResource(
    "task-list-widget",
    taskListWidget.templateUri,
    {
      title: taskListWidget.title,
      description: taskListWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": taskListWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${taskListWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": taskListWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": taskListWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // Register task form resource
  server.registerResource(
    "task-form-widget",
    taskFormWidget.templateUri,
    {
      title: taskFormWidget.title,
      description: taskFormWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": taskFormWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${taskFormWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": taskFormWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": taskFormWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // Register user info widget resource
  server.registerResource(
    "user-info-widget",
    userInfoWidget.templateUri,
    {
      title: userInfoWidget.title,
      description: userInfoWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": userInfoWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${userInfoWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": userInfoWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": userInfoWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // Register tool: Show task manager home (always shows widget)
  server.registerTool(
    "show_task_manager",
    {
      title: "Show Task Manager",
      description: "Display the task manager interface with options to create tasks, view tasks, and manage your task list.",
      inputSchema: {},
      _meta: widgetMeta(homeWidget),
    },
    async () => {
      return {
        content: [
          {
            type: "text",
            text: "Task Manager is ready! Use the interface to manage your tasks.",
          },
        ],
        structuredContent: {
          message: "Task Manager loaded",
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(homeWidget),
      };
    }
  );

  // Register tool: Create a new task (always shows widget)
  server.registerTool(
    "create_task",
    {
      title: "Create Task",
      description:
        "Create a new task. When the user says 'create a task' or wants to create a task, IMMEDIATELY call this tool WITHOUT any parameters (or with empty firstName/lastName) to display the user information collection widget. NEVER ask the user for information in text format - ALWAYS show the widget UI immediately. The widget will guide the user through entering their name and task details.",
      inputSchema: {
        firstName: z
          .string()
          .optional()
          .describe("The user's first name (optional - if not provided, show user info widget first)"),
        lastName: z
          .string()
          .optional()
          .describe("The user's last name (optional - if not provided, show user info widget first)"),
        title: z
          .string()
          .optional()
          .describe("The title of the task (optional - can be filled in the form)"),
        description: z
          .string()
          .optional()
          .describe("The description of the task (optional - can be filled in the form)"),
        status: z
          .enum(["todo", "in-progress", "done"])
          .optional()
          .describe("Task status (optional, default: todo)"),
        dueDate: z
          .string()
          .optional()
          .describe("Due date in ISO format (YYYY-MM-DD)"),
      },
      _meta: widgetMeta(userInfoWidget),
    },
    async (args) => {
      // Handle case where user might provide full name in firstName
      let firstName = args.firstName?.trim() || "";
      let lastName = args.lastName?.trim() || "";

      // If firstName contains a space and lastName is empty, split it
      if (firstName && !lastName && firstName.includes(" ")) {
        const parts = firstName.split(" ");
        firstName = parts[0];
        lastName = parts.slice(1).join(" ") || "User";
      }

      // If no user info provided, show user info widget
      if (!firstName || !lastName) {
        return {
          content: [
            {
              type: "text",
              text: "Please enter your first and last name in the form below.",
            },
          ],
          structuredContent: {
            message: "User info collection",
          },
          _meta: widgetMeta(userInfoWidget),
        };
      }

      // Get or create user
      const user = await getOrCreateUser(firstName, lastName);
      const userId = (user as { _id: string })._id;

      // If title and description are provided, create the task immediately
      if (args.title && args.description) {
        try {
          const taskData: Record<string, unknown> = {
            userId,
            title: args.title,
            description: args.description,
            status: args.status || "todo",
          };

          if (args.dueDate) {
            taskData.dueDate = new Date(args.dueDate).getTime();
          }

          const taskId = await callConvexMutation(api.tasks.create, taskData);

          return {
            content: [
              {
                type: "text",
                text: `Task "${args.title}" created successfully!`,
              },
            ],
            structuredContent: {
              taskId,
              firstName: firstName,
              lastName: lastName,
              title: args.title,
              description: args.description,
              message: "Task created successfully",
            },
            _meta: widgetMeta(taskFormWidget),
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error creating task: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }

      // Show the task form widget with user info
      return {
        content: [
          {
            type: "text",
            text: `Task creation form is ready for ${firstName} ${lastName}. Fill out the form below to create a new task.`,
          },
        ],
        structuredContent: {
          firstName: firstName,
          lastName: lastName,
          title: args.title || "",
          description: args.description || "",
          status: args.status || "todo",
          dueDate: args.dueDate || "",
          message: "Task form ready",
        },
        _meta: widgetMeta(taskFormWidget),
      };
    }
  );

  // Register tool: Get tasks for a user (always shows widget)
  server.registerTool(
    "list_tasks",
    {
      title: "List Tasks",
      description:
        "Display all tasks for a user. The widget will show a form to enter your first and last name, then display your tasks.",
      inputSchema: {
        firstName: z.string().min(1, "First name required").optional().describe("The user's first name (optional - can be filled in the widget)"),
        lastName: z.string().min(1, "Last name required").optional().describe("The user's last name (optional - can be filled in the widget)"),
      },
      _meta: widgetMeta(taskListWidget),
    },
    async (args) => {
      // Defensive validation
      const firstName = typeof args.firstName === "string" ? args.firstName.trim() : "";
      const lastName = typeof args.lastName === "string" ? args.lastName.trim() : "";
      if (!firstName || !lastName) {
        return {
          content: [
            {
              type: "text",
              text: "Please enter your first and last name to view your tasks.",
            },
          ],
          structuredContent: {
            firstName,
            lastName,
            tasks: [],
            count: 0,
          },
          _meta: widgetMeta(taskListWidget),
        };
      }
      try {
        const user = await getOrCreateUser(firstName, lastName);
        if (!user || !(user as { _id?: string })._id) {
          return {
            content: [
              {
                type: "text",
                text: `No user found for ${firstName} ${lastName}. Please check your name or create a new user.`,
              },
            ],
            structuredContent: {
              firstName,
              lastName,
              tasks: [],
              count: 0,
            },
            _meta: widgetMeta(taskListWidget),
          };
        }
        const userId = (user as { _id: string })._id;
        const tasks = await callConvexQuery(api.tasks.getByUser, { userId });
        if (!Array.isArray(tasks) || tasks.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No tasks found for ${firstName} ${lastName}. You can create a new task!`,
              },
            ],
            structuredContent: {
              firstName,
              lastName,
              tasks: [],
              count: 0,
            },
            _meta: widgetMeta(taskListWidget),
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Found ${tasks.length} task(s) for ${firstName} ${lastName}`,
            },
          ],
          structuredContent: {
            firstName,
            lastName,
            tasks,
            count: tasks.length,
          },
          _meta: widgetMeta(taskListWidget),
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error loading tasks: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          structuredContent: {
            firstName,
            lastName,
            tasks: [],
            count: 0,
          },
          _meta: widgetMeta(taskListWidget),
        };
      }
    }
  );

  // Register tool: Get a specific task by ID
  server.registerTool(
    "get_task",
    {
      title: "Get Task",
      description: "Get details of a specific task by its ID.",
      inputSchema: {
        taskId: z.string().describe("The ID of the task to retrieve"),
      },
    },
    async (args) => {
      try {
        const task = await callConvexQuery(api.tasks.getById, {
          taskId: args.taskId as any,
        });

        if (!task) {
          return {
            content: [
              {
                type: "text",
                text: `Task with ID ${args.taskId} not found`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Task: ${(task as { title: string }).title}`,
            },
          ],
          structuredContent: task as Record<string, unknown>,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting task: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register tool: Update a task
  server.registerTool(
    "update_task",
    {
      title: "Update Task",
      description:
        "Update an existing task. You can update the title, description, status, or due date. Returns confirmation of the update.",
      inputSchema: {
        taskId: z.string().describe("The ID of the task to update"),
        title: z.string().optional().describe("New title for the task"),
        description: z
          .string()
          .optional()
          .describe("New description for the task"),
        status: z
          .enum(["todo", "in-progress", "done"])
          .optional()
          .describe("New status for the task"),
        dueDate: z
          .string()
          .optional()
          .describe("New due date in ISO format (YYYY-MM-DD)"),
      },
    },
    async (args) => {
      try {
        const updateData: Record<string, unknown> = { taskId: args.taskId };

        if (args.title) {
          updateData.title = args.title;
        }
        if (args.description !== undefined) {
          updateData.description = args.description || undefined;
        }
        if (args.status) {
          updateData.status = args.status;
        }
        if (args.dueDate) {
          updateData.dueDate = new Date(args.dueDate).getTime();
        }

        await callConvexMutation(api.tasks.update, updateData);

        // Get the updated task to return its details
        const updatedTask = await callConvexQuery(api.tasks.getById, {
          taskId: args.taskId as any,
        });

        return {
          content: [
            {
              type: "text",
              text: `Task "${(updatedTask as { title: string })?.title || args.taskId}" updated successfully!`,
            },
          ],
          structuredContent: {
            taskId: args.taskId,
            task: updatedTask,
            message: "Task updated successfully",
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error updating task: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register tool: Delete a task
  server.registerTool(
    "delete_task",
    {
      title: "Delete Task",
      description: "Delete a task by its ID. Returns confirmation of deletion.",
      inputSchema: {
        taskId: z.string().describe("The ID of the task to delete"),
      },
    },
    async (args) => {
      try {
        // Get task info before deleting for confirmation message
        const task = await callConvexQuery(api.tasks.getById, {
          taskId: args.taskId as any,
        });

        await callConvexMutation(api.tasks.remove, {
          taskId: args.taskId as any,
        });

        return {
          content: [
            {
              type: "text",
              text: `Task "${(task as { title: string })?.title || args.taskId}" has been deleted successfully.`,
            },
          ],
          structuredContent: {
            taskId: args.taskId,
            deletedTask: task,
            message: "Task deleted successfully",
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting task: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
});

export const GET = handler;
export const POST = handler;
