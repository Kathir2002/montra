import { TFunction } from 'i18next';
import { Platform } from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
} from '@react-native-documents/picker';
import EncryptedStorage from 'react-native-encrypted-storage';

class commonDataService {
  // Function which is used to set token from async storage
  async setToken(data: any) {
    try {
      await EncryptedStorage.setItem('login', JSON.stringify(data));
    } catch (error) {
      console.log(error);
    }
  }
  // Function which is used to get token from async storage
  async getToken() {
    try {
      const loginDetails: any = await EncryptedStorage.getItem('login');
      if (loginDetails !== undefined) {
        return JSON.parse(loginDetails);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async pickDocument(t: TFunction<'transaction', undefined>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const result: DocumentPickerResponse[] = await DocumentPicker.pick({
          type: [
            DocumentPicker.types.images,
            DocumentPicker.types.pdf,
            'application/msword', // For DOC files
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // For DOCX files
            // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // For XLSX files
          ],
          // allowMultiSelection: true,
        });

        // Check if the result is a valid object
        if (result) {
          // Define allowed MIME types
          const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ];

          // Check if the selected file's MIME type is allowed
          let testVal: string[] | undefined = result[0].name?.split('.');
          if (testVal != undefined) {
            if (
              result[0].type != undefined &&
              allowedMimeTypes.includes(result[0].type?.toLowerCase())
            ) {
              // check if the selected file size is less than or equal to 2 MB
              if (result[0].size != undefined && result[0]?.size <= 2097152) {
                let fileUri: string = result[0].uri;
                if (Platform.OS == 'ios') {
                  fileUri = decodeURIComponent(fileUri.replace('file://', ''));
                }
                if (
                  Platform.OS == 'android' &&
                  fileUri.includes('externalstorage')
                ) {
                  return reject(t('PICKING_FILE_FROM_ROOT_DIR'));
                } else {
                  let final = {
                    ext: result[0]?.type.split('.'),
                    name: result[0]?.name,
                    size: result[0]?.size,
                    type: result[0]?.type,
                    url: result[0]?.uri,
                  };

                  resolve(final);
                }
              } else {
                return reject(t('FILE_SIZE_EXCEED'));
              }
            } else {
              // Handle the case where the selected file has an invalid MIME type
              return reject(t('UNSUPPORTED_FILE_FORMATS'));
            }
          } else {
            // Handle the case where the selected file has an invalid MIME type
            return {
              msg: t('UNSUPPORTED_FILE_FORMATS'),
            };
          }
        } else {
          // Handle the case where the result object is missing
          reject(t('SOMETHING_WENT_WRONG'));
        }
      } catch (err: any) {
        if (DocumentPicker.isCancel(err)) {
          // User cancelled the document picker
          reject(t('USER_CANCELED'));
        } else {
          // Handle other errors
          console.error('Error picking document:', err);
          reject(t('SOMETHING_WENT_WRONG'));
        }
      }
    });
  }
}

const CommonDataService = new commonDataService();

export default CommonDataService;
