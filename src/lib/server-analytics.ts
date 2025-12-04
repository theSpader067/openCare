/**
 * Server-side analytics for OpenPanel events
 * This module tracks events when they actually occur on the backend
 * (e.g., when tasks/activities are created, updated, deleted in the database)
 */

interface EventProperties {
  [key: string]: string | number | boolean | undefined | null;
}

interface TaskEventData extends EventProperties {
  task_id?: string | number;
  title?: string;
  task_type?: 'team' | 'private';
  patient_id?: string | number;
  patient_name?: string;
  user_id?: string | number;
  is_multiple?: boolean;
  task_count?: number;
}

interface ActivityEventData extends EventProperties {
  activity_id?: string | number;
  title?: string;
  type?: string;
  location?: string;
  team?: string;
  user_id?: string | number;
}

interface PatientEventData extends EventProperties {
  patient_id?: string | number;
  patient_name?: string;
  user_id?: string | number;
  patient_type?: 'team' | 'private';
  service?: string;
  diagnostic?: string;
  age?: number;
}

/**
 * Send event to OpenPanel API
 * This function makes a direct HTTP request to OpenPanel
 */
async function sendEventToOpenPanel(eventName: string, properties: EventProperties, profileId?: string) {
  try {
    const clientId = process.env.OPENPANEL_CLIENT_ID;
    const clientSecret = process.env.OPENPANEL_SECRET_ID;

    if (!clientId || !clientSecret) {
      console.warn('OPENPANEL_CLIENT_ID or OPENPANEL_SECRET_ID not configured, skipping analytics');
      return;
    }

    const payload = {
      type: 'track',
      payload: {
        name: eventName,
        profileId: profileId,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
        },
      },
    };

    const response = await fetch('https://api.openpanel.dev/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'openpanel-client-id': clientId,
        'openpanel-client-secret': clientSecret,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send event to OpenPanel: ${response.statusText}`, errorText);
    } else {
      console.log(`Event '${eventName}' sent to OpenPanel successfully`);
    }
  } catch (error) {
    console.error('Error sending event to OpenPanel:', error);
    // Silently fail - don't break application if analytics fails
  }
}

/**
 * Task analytics - track task operations on the backend
 */
export const taskServerAnalytics = {
  trackTaskCreated: async (taskData: {
    id: number;
    title: string;
    isPrivate: boolean;
    creatorId: number;
    patientId?: number;
    patientName?: string;
  }) => {
    await sendEventToOpenPanel('task_created', {
      task_id: taskData.id,
      title: taskData.title,
      task_type: taskData.isPrivate ? 'private' : 'team',
      patient_id: taskData.patientId,
      patient_name: taskData.patientName,
      user_id: taskData.creatorId,
    });
  },

  trackTaskUpdated: async (taskData: {
    id: number;
    title: string;
    isPrivate: boolean;
    updatedAt: Date;
  }) => {
    await sendEventToOpenPanel('task_updated', {
      task_id: taskData.id,
      title: taskData.title,
      task_type: taskData.isPrivate ? 'private' : 'team',
    });
  },

  trackTaskCompleted: async (taskId: number) => {
    await sendEventToOpenPanel('task_completed', {
      task_id: taskId,
    });
  },

  trackTaskDeleted: async (taskId: number) => {
    await sendEventToOpenPanel('task_deleted', {
      task_id: taskId,
    });
  },
};

/**
 * Activity analytics - track activity operations on the backend
 */
export const activityServerAnalytics = {
  trackActivityCreated: async (activityData: {
    id: number;
    title: string;
    category: string;
    creatorId: number;
    place?: string;
    équipe?: string;
  }) => {
    await sendEventToOpenPanel('activity_created', {
      activity_id: activityData.id,
      title: activityData.title,
      type: activityData.category,
      location: activityData.place,
      team: activityData.équipe,
      user_id: activityData.creatorId,
    });
  },

  trackActivityUpdated: async (activityData: {
    id: number;
    title: string;
    category: string;
  }) => {
    await sendEventToOpenPanel('activity_updated', {
      activity_id: activityData.id,
      title: activityData.title,
      type: activityData.category,
    });
  },

  trackActivityDeleted: async (activityId: number) => {
    await sendEventToOpenPanel('activity_deleted', {
      activity_id: activityId,
    });
  },
};

/**
 * Patient analytics - track patient operations on the backend
 */
export const patientServerAnalytics = {
  trackPatientCreated: async (patientData: {
    id: number;
    fullName: string;
    isPrivate: boolean;
    userId: number;
    dateOfBirth?: Date;
    service?: string;
    diagnostic?: string;
  }) => {
    let age: number | undefined;
    if (patientData.dateOfBirth) {
      const today = new Date();
      age = today.getFullYear() - patientData.dateOfBirth.getFullYear();
      const hasBirthdayPassed =
        today.getMonth() > patientData.dateOfBirth.getMonth() ||
        (today.getMonth() === patientData.dateOfBirth.getMonth() &&
         today.getDate() >= patientData.dateOfBirth.getDate());
      if (!hasBirthdayPassed) {
        age--;
      }
    }

    await sendEventToOpenPanel('patient_created', {
      patient_id: patientData.id,
      patient_name: patientData.fullName,
      patient_type: patientData.isPrivate ? 'private' : 'team',
      service: patientData.service,
      diagnostic: patientData.diagnostic,
      age: age,
    }, patientData.userId.toString());
  },

  trackPatientUpdated: async (patientData: {
    id: number;
    fullName: string;
    isPrivate: boolean;
    updatedAt?: Date;
  }) => {
    await sendEventToOpenPanel('patient_updated', {
      patient_id: patientData.id,
      patient_name: patientData.fullName,
      patient_type: patientData.isPrivate ? 'private' : 'team',
    });
  },

  trackPatientDeleted: async (patientId: number) => {
    await sendEventToOpenPanel('patient_deleted', {
      patient_id: patientId,
    });
  },
};

/**
 * User analytics - track user actions on the backend
 */
export const userServerAnalytics = {
  trackAction: async (action: string, properties?: EventProperties) => {
    await sendEventToOpenPanel(action, properties || {});
  },

  trackError: async (errorAction: string, error: Error, additionalData?: EventProperties) => {
    await sendEventToOpenPanel('error_occurred', {
      error_action: errorAction,
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500), // Limit stack trace length
      ...additionalData,
    });
  },
};
