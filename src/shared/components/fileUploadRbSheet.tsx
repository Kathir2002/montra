import {StyleSheet, View} from 'react-native';
import React, {
  forwardRef,
  SetStateAction,
  Dispatch,
  useEffect,
  JSXElementConstructor,
  ReactElement,
  SVGProps,
} from 'react';

import CameraIcon from '@assets/svg/camera.svg';
import GalleryIcon from '@assets/svg/gallery.svg';
import DocumentIcon from '@assets/svg/file.svg';
import CommonDataService from '@shared/commonDataServices';
import {
  CameraOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import callPermission from '@services/permission';
import CommonText from './commonText/CommonText';
import {TouchableOpacity} from 'react-native';
import {appColors} from '@shared/appColors';
import {RBSheetRef} from './commonRBSheet/CommonRBSheet';
import {Toast} from '@shared/ToastConfig';
import {FormikValues} from 'formik';

export interface DocumentInterface {
  ext: string;
  name: string;
  url?: string;
  type: string;
  size: number;
}

interface Props {
  name: string;
  icon: (
    props: SVGProps<SVGSVGElement>,
  ) => ReactElement<any, string | JSXElementConstructor<any>>;
  onPress: () => void;
}

interface PropsInterface {
  setDocument: Dispatch<SetStateAction<DocumentInterface | undefined>>;
  closeHandler: () => void;
  formik?: FormikValues;
  isUploadDocumentVisible?: boolean;
}

const FileUploadRbSheet = ({
  setDocument,
  closeHandler,
  isUploadDocumentVisible = true,
  formik,
}: PropsInterface) => {
  const uploadStaticData: Props[] = [
    {
      name: 'Camera',
      icon: CameraIcon,
      onPress: () => openCamera(),
    },
    {
      name: 'Image',
      icon: GalleryIcon,
      onPress: () => openGallery(),
    },
  ];
  if (isUploadDocumentVisible) {
    uploadStaticData.push({
      name: 'Document',
      icon: DocumentIcon,
      onPress: () => {
        CommonDataService.pickDocument()
          .then(res => {
            setDocument(res);
            formik && formik?.setFieldTouched('isDocumentUpdate', true);
            closeHandler();
          })
          .catch(err => {
            closeHandler();
            Toast({message: err, type: 'error'});
          });
      },
    });
  }
  const profilePictureUploadLimit = 2097152;

  let options: CameraOptions = {
    quality: 0.5,
    saveToPhotos: true,
    mediaType: 'photo',
  };

  /**
   * method to open the camera
   */
  const openCamera = async () => {
    callPermission('CAMERA')
      .then(() => {
        setTimeout(async () => {
          const result: ImagePickerResponse = await launchCamera(options);
          if (
            result?.didCancel != true &&
            result?.assets &&
            result?.assets[0].fileSize
          ) {
            if (result?.assets[0]?.fileSize <= profilePictureUploadLimit) {
              if (result?.assets[0]?.fileName && result?.assets[0]?.type) {
                let data: DocumentInterface = {
                  url: result?.assets[0]?.uri,
                  ext: result?.assets[0]?.type?.split('/')[0],
                  name: result?.assets[0].fileName,
                  size: result.assets[0].fileSize,
                  type: result?.assets[0]?.type,
                };
                setDocument(data);
                formik && formik?.setFieldTouched('isDocumentUpdate', true);
                closeHandler();
              }
            } else {
              closeHandler();
              Toast({
                message: "File size shouldn't exceed 2 MB",
                type: 'error',
              });
            }
          }
        }, 500);
      })
      .catch(error => console.log('CAMERA request error', error));
  };

  /**
   * method to open the gallery
   */
  const openGallery = async () => {
    callPermission('GALLERY')
      .then(async () => {
        const result: ImagePickerResponse = await launchImageLibrary(options);
        if (
          result?.didCancel != true &&
          result?.assets &&
          result?.assets[0].fileSize
        ) {
          if (result?.assets[0]?.fileSize <= profilePictureUploadLimit) {
            if (result?.assets[0]?.fileName && result?.assets[0]?.type) {
              let data: DocumentInterface = {
                url: result?.assets[0]?.uri,
                ext: result?.assets[0]?.type?.split('/')[0],
                name: result?.assets[0].fileName,
                size: result.assets[0].fileSize,
                type: result?.assets[0]?.type,
              };
              setDocument(data);

              formik && formik?.setFieldTouched('isDocumentUpdate', true);
              closeHandler();
            }
          } else {
            closeHandler();
            Toast({message: "File size shouldn't exceed 2 MB", type: 'error'});
          }
        }
      })
      .catch(error => console.log('GALLERY request error', error));
  };

  return (
    <View
      style={{
        marginVertical: 10,
        flexDirection: 'row',
        gap: isUploadDocumentVisible ? 5 : 15,
        alignItems: 'center',
        justifyContent: isUploadDocumentVisible
          ? 'space-between'
          : 'flex-start',
        paddingHorizontal: 15,
      }}>
      {uploadStaticData.map((item, index) => {
        return (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPress={item.onPress}
            style={{
              backgroundColor: appColors.buttonClear,
              paddingVertical: 15,
              width: 100,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 15,
            }}>
            <item.icon height={30} width={30} />
            <CommonText
              content={item.name}
              size={'label'}
              color={appColors.primary}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default FileUploadRbSheet;

const styles = StyleSheet.create({});
