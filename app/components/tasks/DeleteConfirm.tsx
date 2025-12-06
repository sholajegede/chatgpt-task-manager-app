"use client";

import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmProps {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteConfirm({ 
  taskTitle, 
  onConfirm, 
  onCancel,
  isDeleting = false 
}: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Task
            </h3>
            <p className="text-gray-600 mb-1">
              Are you sure you want to delete the task:
            </p>
            <p className="text-gray-900 font-medium mb-4">
              "{taskTitle}"?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

