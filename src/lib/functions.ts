import {store} from '@store/store';
import * as CryptoJS from 'react-native-crypto-js';
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
  const curencySymbol = store.getState().auth.userDetails.currencySymbol;

  if (formatting) {
    return amount?.toLocaleString('en-US', {
      style: 'currency',
      currency: curencySymbol,
    });
  } else {
    return amount?.toLocaleString('en', {
      style: 'currency',
      currency: curencySymbol,
      minimumFractionDigits: 0, // No decimal places
      maximumFractionDigits: 0, // No decimal places
      useGrouping: false, // No commas
    });
  }
};
