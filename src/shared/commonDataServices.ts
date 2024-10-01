import {Platform} from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
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

  async pickDocument(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const result: DocumentPickerResponse[] = await DocumentPicker.pick({
          type: [
            DocumentPicker.types.images,
            DocumentPicker.types.pdf,
            'application/msword', // For DOC files
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // For DOCX files
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // For XLSX files
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
                  return reject(
                    "Picking files from the root directory isn't supported. Please choose a different folder.",
                  );
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
                return reject("File size shouldn't exceed 2 MB");
              }
            } else {
              // Handle the case where the selected file has an invalid MIME type
              return reject(
                'Unsupported file format. Please upload a JPG, PNG, DOC, DOCX, XLSX, or PDF file.',
              );
            }
          } else {
            // Handle the case where the selected file has an invalid MIME type
            return {
              msg: 'Unsupported file format. Please upload a JPG, PNG, DOC, DOCX, XLSX, or PDF file.',
            };
          }
        } else {
          // Handle the case where the result object is missing
          reject('Something went wrong. Please try selecting a file again.');
        }
      } catch (err: any) {
        if (DocumentPicker.isCancel(err)) {
          // User cancelled the document picker
          reject('Operation cancelled by user');
        } else {
          // Handle other errors
          console.error('Error picking document:', err);
          reject('Something went wrong. Please try selecting a file again.');
        }
      }
    });
  }
}

const CommonDataService = new commonDataService();

export default CommonDataService;
