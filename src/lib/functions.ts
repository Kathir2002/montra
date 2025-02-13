import {
  StackCardInterpolatedStyle,
  StackCardInterpolationProps,
} from '@react-navigation/stack';
import {store} from '@store/store';
import * as CryptoJS from 'react-native-crypto-js';
import RNFetchBlob from 'react-native-blob-util';
import {Alert, Linking, Platform} from 'react-native';

/**
 * async function for encrypting the tokens and id details
 */

export const encryptDetails = (data: string) => {
  if (data) {
    const text = CryptoJS.AES.encrypt(
      data.toString(),
      'mycryptoSecretKeyy',
    ).toString();
    return text.replace(/\\/g, '|');
  } else {
    return null;
  }
};

export const formatBytes = (bytes: number) => {
  const bytesInKilobyte = 1024;
  const bytesInMegabyte = 1048576;

  if (bytes >= bytesInMegabyte) {
    return (bytes / bytesInMegabyte).toFixed(2) + ' MB';
  } else {
    return (bytes / bytesInKilobyte).toFixed(2) + ' KB';
  }
};

// Function to generate a unique color using the HSL color model
export const generateUniqueColors = (count: number) => {
  const colors = [];
  const saturation = 70;
  const lightness = 30;

  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i); // Distribute hues evenly
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
};

export const getCurrencySymbol = (amount: number, formatting = true) => {
  const currencySymbol = store.getState().auth.userDetails.currencySymbol;

  // Define currency-specific formatting rules
  const currencyFormats: Record<
    string,
    {
      minimumFractionDigits: number;
      maximumFractionDigits: number;
      useGrouping: boolean;
    }
  > = {
    USD: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    },
    EUR: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    },
    JPY: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: false,
    },
    // Add more currencies as needed
    INR: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    },
    // Default formatting
    default: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: false,
    },
  };

  // Get the appropriate format for the currency, or fall back to 'default'
  const currencyFormat =
    currencyFormats[currencySymbol!] || currencyFormats['default'];

  if (formatting) {
    return amount?.toLocaleString('en-US', {
      style: 'currency',
      currency: currencySymbol,
      minimumFractionDigits: currencyFormat.minimumFractionDigits,
      maximumFractionDigits: currencyFormat.maximumFractionDigits,
      useGrouping: currencyFormat.useGrouping,
    });
  } else {
    return amount?.toLocaleString('en', {
      style: 'currency',
      currency: currencySymbol,
      minimumFractionDigits: 0, // No decimal places
      maximumFractionDigits: 0, // No decimal places
      useGrouping: false, // No commas
    });
  }
};

export const forSlideFromLeftAnimation = ({
  current,
  layouts,
}: StackCardInterpolationProps): StackCardInterpolatedStyle => {
  const translateX = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-layouts.screen.width, 0],
  });
  return {
    cardStyle: {
      transform: [{translateX}],
    },
  };
};

export const openFileFromUrl = async (
  fileUrl: string,
  mimeType: string,
  isLocalFile: boolean,
) => {
  try {
    // Extract the file name from the URL
    const fileName = fileUrl.split('/').pop();
    if (!isLocalFile) {
      // Define the path to save the file
      const {dirs} = RNFetchBlob.fs;
      const filePath =
        Platform.OS === 'ios'
          ? `${dirs.DocumentDir}/${fileName}`
          : `${dirs.LegacyDownloadDir}/${fileName}`;

      // Download the file
      const response = await RNFetchBlob.config({
        fileCache: true,
        path: filePath, // Path where the file will be saved
      }).fetch('GET', fileUrl);

      if (response.path()) {
        // Open the file
        if (Platform.OS === 'ios') {
          // Open the file using the default iOS viewer
          Linking.openURL(`file://${response.path()}`);
        } else {
          RNFetchBlob.android.actionViewIntent(response.path(), mimeType);
        }
      } else {
        Alert.alert('Error', 'File download failed');
      }
    } else {
      // Handle Android
      if (Platform.OS === 'android') {
        const sanitizedFilePath = fileUrl.replace('file://', '');
        await RNFetchBlob.android.actionViewIntent(sanitizedFilePath, mimeType);
      }
      // Handle iOS
      else if (Platform.OS === 'ios') {
        if (fileUrl.startsWith('file://')) {
          await Linking.openURL(fileUrl);
        } else {
          await Linking.openURL(`file://${fileUrl}`);
        }
      }
    }
  } catch (error) {
    console.error('Error opening file:', error);
    Alert.alert('Error', 'Unable to open the file.');
  }
};

export const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = Number(now) - Number(new Date(date)); // Difference in milliseconds

  // Convert to seconds
  const seconds = Math.floor(diff / 1000);

  // Less than a minute
  if (seconds < 60) {
    return 'just now';
  }

  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Less than a week
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // Less than a month
  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  // Less than a year
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  // More than a year
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

export const getDateLabel = (date: Date) => {
  const now = new Date(); // Keep as Date object
  const messageDate = new Date(date); // Ensure it's a Date object
  const diffTime = Math.abs(now.getTime() - messageDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (messageDate.toDateString() === now.toDateString()) {
    return 'Today';
  }

  const yesterday = new Date(now); // Clone current date
  yesterday.setDate(now.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  if (diffDays <= 7) {
    return messageDate.toLocaleDateString('en-US', {weekday: 'long'});
  }

  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
