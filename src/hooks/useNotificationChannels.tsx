import React, {useCallback, useState} from 'react';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  AndroidStyle,
} from '@notifee/react-native';

interface IColorMap {
  urgent: string;
  promotional: string;
  system: string;
  default: string;
}

// Types for better type safety
interface NotificationChannelConfig {
  id: string;
  name: string;
  description?: string;
  importance: AndroidImportance;
  vibration?: boolean;
  lights?: boolean;
  badge?: boolean;
}

export interface MessageType {
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

// Fallback default channels
const getDefaultChannels: NotificationChannelConfig[] = [
  {
    id: 'budget',
    name: 'Budget Alerts',
    importance: AndroidImportance.HIGH,
    vibration: true,
    lights: true,
    badge: true,
    description:
      'Stay informed with timely notifications about your budget usage, helping you track and control your spending effectively.',
  },
  {
    id: 'expense',
    name: 'Expense Alerts',
    importance: AndroidImportance.HIGH,
    vibration: true,
    lights: true,
    badge: true,
    description:
      'Get timely updates and reminders for all your expenses, helping you stay on top of your spending.',
  },
  {
    id: 'tips&articles',
    name: 'Tips & Articles',
    importance: AndroidImportance.HIGH,
    vibration: true,
    lights: true,
    badge: true,
    description:
      'Receive valuable tips and tricks to help you manage your finances better.',
  },
  {
    id: 'account',
    name: 'Account Notifications',
    importance: AndroidImportance.HIGH,
    vibration: true,
    lights: true,
    badge: true,
    description:
      'Stay informed with notifications about account status changes, including deactivations and reactivations.',
  },
];

// Custom hook for notification channel management
const useNotificationChannels = () => {
  const [channels, setChannels] = useState<string[]>([]);
  // Color mapping for different message types
  const getColorForMessageType = (type: string) => {
    const colorMap = {
      urgent: '#FF0000', // Red for urgent
      promotional: '#FFA500', // Orange for marketing
      system: '#4287f5', // Blue for system updates
      default: '#000000', // Black for default
    };
    return colorMap[type as keyof IColorMap] || colorMap['default'];
  };
  // Create notification channels
  const createNotificationChannels = useCallback(async () => {
    try {
      // Fetch channel configurations
      const channelConfigs = getDefaultChannels;

      // Create channels and store their IDs
      const createdChannels = await Promise.all(
        channelConfigs.map(async config => {
          // Create new channel

          const channelId = await notifee.createChannel({
            id: config.id,
            name: config.name,
            description: config.description,
            importance: config.importance,
            vibration: config.vibration,
            lights: config.lights,
            badge: config.badge,
          });

          return channelId;
        }),
      );

      setChannels(createdChannels);
      return createdChannels;
    } catch (error) {
      console.error('Channel creation failed', error);
      return [];
    }
  }, []);

  // Determine channel for a specific message
  const determineChannelForMessage = useCallback(
    async (message: MessageType): Promise<string> => {
      const channelId = message?.type || 'general';

      // Ensure channel exists
      await createNotificationChannels();

      return channelId;
    },
    [createNotificationChannels],
  );

  // Display notification
  const displayNotification = useCallback(
    async (message: MessageType) => {
      try {
        // Determine appropriate channel
        const channelId = await determineChannelForMessage(message);
        // Display notification
        await notifee.displayNotification({
          title: message.title,
          body: message.body,
          android: {
            channelId,
            importance: AndroidImportance.HIGH,
            color: getColorForMessageType(message.type),
            visibility: AndroidVisibility.PUBLIC,
            // Optional: Add more Android-specific styling
            smallIcon: 'ic_notification',
            style: message.data?.imageUrl
              ? {
                  type: AndroidStyle.BIGPICTURE,
                  picture: message.data.imageUrl,
                }
              : undefined,
          },
          // Additional metadata can be passed
          data: message.data,
        });
      } catch (error) {
        console.error('Notification display failed', error);
      }
    },
    [determineChannelForMessage],
  );

  return {
    channels,
    createNotificationChannels,
    displayNotification,
  };
};

const data = () => {
  return;
};

export {useNotificationChannels};
