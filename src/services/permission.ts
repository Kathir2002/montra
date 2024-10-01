import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import {Alert, Appearance, Platform} from 'react-native';

const callPermission = (access: 'PUSH_NOTIFICATION' | 'CAMERA' | 'GALLERY') => {
  const promise = new Promise(async (resolve, reject) => {
    if (access === 'CAMERA') {
      check(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA,
      )
        .then(result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              request(
                Platform.OS === 'ios'
                  ? PERMISSIONS.IOS.CAMERA
                  : PERMISSIONS.ANDROID.CAMERA,
              ).then(result => {
                console.log('request CAMERA', result);
                if (result === 'blocked') {
                  reject(false);
                } else {
                  resolve(true);
                }
              });
              break;
            case RESULTS.DENIED:
              request(
                Platform.OS === 'ios'
                  ? PERMISSIONS.IOS.CAMERA
                  : PERMISSIONS.ANDROID.CAMERA,
              ).then(result => {
                console.log('request CAMERA', result);
                if (
                  (result === 'blocked' && Platform.OS === 'ios') ||
                  (result === 'denied' && Platform.OS === 'android')
                ) {
                  reject(false);
                } else if (result === 'blocked' && Platform.OS === 'android') {
                  console.log(
                    'INSIDE result === blocked && Platform.OS === android',
                  );
                  Alert.alert(
                    'Permission Denied',
                    `You must allow "Montra" for using camera`,
                    [
                      {
                        text: 'Cancel',
                        onPress: () => {
                          reject(false);
                        },
                        style: 'cancel',
                      },
                      {
                        text: 'Go to Settings',
                        onPress: () => {
                          openSettings().catch(() =>
                            console.warn('cannot open settings'),
                          );
                        },
                      },
                    ],
                  );
                } else {
                  resolve(true);
                }
              });
              break;
            case RESULTS.LIMITED:
              console.log('The permission is Limited');
              break;
            case RESULTS.GRANTED:
              console.log('The permission is GRANTED');
              resolve(true);
              break;
            case RESULTS.BLOCKED:
              Alert.alert(
                'Permission Denied',
                `You must allow "Montra" for using camera`,
                [
                  {
                    text: 'Cancel',
                    onPress: () => {
                      reject(false);
                    },
                    style: 'cancel',
                  },
                  {
                    text: 'Go to Settings',
                    onPress: () => {
                      openSettings().catch(() =>
                        console.warn('cannot open settings'),
                      );
                    },
                  },
                ],
              );
              console.log('The permission is BLOCKED');
              break;
          }
        })
        .catch(error => {
          console.log('PERMISSIONS CAMERA Error', error);
          reject(false);
        });
    } else if (access === 'PUSH_NOTIFICATION') {
      check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
        .then(result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(result => {
                if (result === 'blocked') {
                  reject(false);
                } else {
                  resolve(true);
                }
              });
              break;
            case RESULTS.DENIED:
              console.log('The permission is DENIED');
              request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(result => {
                console.log('request PUSH NOTIFICATION', result);
                if (result === 'denied') {
                  reject(false);
                } else if (result === 'blocked') {
                  reject(false);
                } else {
                  resolve(true);
                }
              });
              break;
            case RESULTS.GRANTED:
              console.log('The permission is GRANTED');
              resolve(true);
              break;
            case RESULTS.BLOCKED:
              Alert.alert(
                'Permission Denied',
                `You must allow "Montra" for using camera`,
                [
                  {
                    text: 'Cancel',
                    onPress: () => {
                      reject(false);
                    },
                    style: 'cancel',
                  },
                  {
                    text: 'Go to Settings',
                    onPress: () => {
                      openSettings().catch(() =>
                        console.warn('cannot open settings'),
                      );
                    },
                  },
                ],
              );
              console.log('The permission is BLOCKED');
              break;
          }
        })
        .catch(error => {
          console.log('PERMISSIONS CAMERA Error', error);
          reject(false);
        });
    } else {
      const version =
        Platform.OS == 'android' && (await Platform.constants?.Release);
      check(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.PHOTO_LIBRARY
          : Number(version) > 12
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      )
        .then(result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              request(
                Platform.OS === 'ios'
                  ? PERMISSIONS.IOS.PHOTO_LIBRARY
                  : Number(version) > 12
                  ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                  : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
              ).then(result => {
                if (result === 'blocked') {
                  reject(false);
                } else {
                  resolve(true);
                }
              });
              break;
            case RESULTS.DENIED:
              request(
                Platform.OS === 'ios'
                  ? PERMISSIONS.IOS.PHOTO_LIBRARY
                  : Number(version) > 12
                  ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                  : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
              ).then(result => {
                if (
                  (result === 'blocked' && Platform.OS === 'ios') ||
                  (result === 'denied' && Platform.OS === 'android')
                ) {
                  reject(false);
                } else if (result === 'blocked' && Platform.OS === 'android') {
                  Alert.alert(
                    'Permission Denied',
                    `You must allow "Montra" for using gallery`,
                    [
                      {
                        text: 'Cancel',
                        onPress: () => {
                          reject(false);
                        },
                        style: 'cancel',
                      },
                      {
                        text: 'Go to Settings',
                        onPress: () => {
                          openSettings().catch(() =>
                            console.warn('cannot open settings'),
                          );
                        },
                      },
                    ],
                  );
                } else {
                  resolve(true);
                }
              });
              break;
            case RESULTS.LIMITED:
              console.log('The permission is Limited');
              break;
            case RESULTS.GRANTED:
              console.log('The permission is GRANTED');
              resolve(true);
              break;
            case RESULTS.BLOCKED:
              Alert.alert(
                'Permission Denied',
                `You must allow "Montra" for using gallery`,
                [
                  {
                    text: 'Cancel',
                    onPress: () => {
                      reject(false);
                    },
                    style: 'cancel',
                  },
                  {
                    text: 'Go to Settings',
                    onPress: () => {
                      openSettings().catch(() =>
                        console.warn('cannot open settings'),
                      );
                    },
                  },
                ],
              );
              break;
          }
        })
        .catch(error => {
          console.log('PERMISSIONS CAMERA Error', error);
          reject(false);
        });
    }
  });

  return promise;
};
export default callPermission;
