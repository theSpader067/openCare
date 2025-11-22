import { useOpenPanel } from '@openpanel/nextjs';

/**
 * Event tracking utilities for OpenPanel
 * Provides a centralized way to track analytics events throughout the application
 */

export interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export interface TaskEventProperties extends EventProperties {
  taskId?: string | number;
  title?: string;
  taskType?: 'team' | 'private';
  patientId?: string | number;
  patientName?: string;
  isMultiple?: boolean;
  taskCount?: number;
  status?: string;
}

export interface ActivityEventProperties extends EventProperties {
  activityId?: string | number;
  title?: string;
  type?: string;
  status?: string;
  location?: string;
  team?: string;
}

export interface UserActionProperties extends EventProperties {
  action?: string;
  resource?: string;
  duration?: number;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Track task-related events
 */
export const taskAnalytics = {
  trackTaskCreated: (tracker: ReturnType<typeof useOpenPanel>, properties: TaskEventProperties) => {
    tracker.track('task_created', {
      task_id: properties.taskId,
      title: properties.title,
      task_type: properties.taskType,
      patient_id: properties.patientId,
      patient_name: properties.patientName,
      is_multiple: properties.isMultiple || false,
      task_count: properties.taskCount,
      timestamp: new Date().toISOString(),
    });
  },

  trackTaskUpdated: (tracker: ReturnType<typeof useOpenPanel>, properties: TaskEventProperties) => {
    tracker.track('task_updated', {
      task_id: properties.taskId,
      title: properties.title,
      task_type: properties.taskType,
      status: properties.status,
      timestamp: new Date().toISOString(),
    });
  },

  trackTaskCompleted: (tracker: ReturnType<typeof useOpenPanel>, taskId: string | number) => {
    tracker.track('task_completed', {
      task_id: taskId,
      timestamp: new Date().toISOString(),
    });
  },

  trackTaskDeleted: (tracker: ReturnType<typeof useOpenPanel>, taskId: string | number) => {
    tracker.track('task_deleted', {
      task_id: taskId,
      timestamp: new Date().toISOString(),
    });
  },

  trackAddTaskModalOpened: (tracker: ReturnType<typeof useOpenPanel>) => {
    tracker.track('add_task_modal_opened', {
      timestamp: new Date().toISOString(),
    });
  },
};

/**
 * Track activity-related events
 */
export const activityAnalytics = {
  trackActivityCreated: (tracker: ReturnType<typeof useOpenPanel>, properties: ActivityEventProperties) => {
    tracker.track('activity_created', {
      activity_id: properties.activityId,
      title: properties.title,
      type: properties.type,
      location: properties.location,
      team: properties.team,
      timestamp: new Date().toISOString(),
    });
  },

  trackActivityUpdated: (tracker: ReturnType<typeof useOpenPanel>, properties: ActivityEventProperties) => {
    tracker.track('activity_updated', {
      activity_id: properties.activityId,
      title: properties.title,
      type: properties.type,
      status: properties.status,
      timestamp: new Date().toISOString(),
    });
  },

  trackActivityCompleted: (tracker: ReturnType<typeof useOpenPanel>, activityId: string | number) => {
    tracker.track('activity_completed', {
      activity_id: activityId,
      timestamp: new Date().toISOString(),
    });
  },

  trackActivityDeleted: (tracker: ReturnType<typeof useOpenPanel>, activityId: string | number) => {
    tracker.track('activity_deleted', {
      activity_id: activityId,
      timestamp: new Date().toISOString(),
    });
  },

  trackAddActivityModalOpened: (tracker: ReturnType<typeof useOpenPanel>) => {
    tracker.track('add_activity_modal_opened', {
      timestamp: new Date().toISOString(),
    });
  },
};

/**
 * Track general user actions
 */
export const userAnalytics = {
  trackPageView: (tracker: ReturnType<typeof useOpenPanel>, pageName: string) => {
    tracker.track('page_viewed', {
      page_name: pageName,
      timestamp: new Date().toISOString(),
    });
  },

  trackAction: (tracker: ReturnType<typeof useOpenPanel>, action: string, properties?: UserActionProperties) => {
    tracker.track(action, {
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  trackError: (tracker: ReturnType<typeof useOpenPanel>, errorAction: string, error: Error) => {
    tracker.track('error_occurred', {
      error_action: errorAction,
      error_message: error.message,
      timestamp: new Date().toISOString(),
    });
  },
};
