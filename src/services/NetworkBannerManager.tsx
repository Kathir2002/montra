// NetworkBannerManager.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Animated,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getFailedRequestsCount, networkEventEmitter, retryFailedRequests } from '@services/interceptor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommonText from '@shared/components/commonText/CommonText';

// Shared state manager for network banner
class NetworkBannerState {
    private listeners: Set<(state: BannerState) => void> = new Set();
    private state: BannerState = {
        isOnline: true,
        isRetrying: false,
        failedCount: 0,
        shouldShow: false,
        isModalOpen: false, // NEW: Track if modal is open
    };

    subscribe(listener: (state: BannerState) => void) {
        this.listeners.add(listener);
        listener(this.state); // Send current state immediately
        return () => this.listeners.delete(listener);
    }

    updateState(updates: Partial<BannerState>) {
        this.state = { ...this.state, ...updates };
        this.listeners.forEach(listener => listener(this.state));
    }

    getState() {
        return this.state;
    }
}

interface BannerState {
    isOnline: boolean;
    isRetrying: boolean;
    failedCount: number;
    shouldShow: boolean;
    isModalOpen: boolean; // NEW
}

export const networkBannerState = new NetworkBannerState();

// Hook to use network banner state
export const useNetworkBannerState = () => {
    const [state, setState] = useState<BannerState>(networkBannerState.getState());

    useEffect(() => {
        return networkBannerState.subscribe(setState);
    }, []);

    return state;
};

// NEW: Function to notify when modal opens/closes
export const setModalOpen = (isOpen: boolean) => {
    networkBannerState.updateState({ isModalOpen: isOpen });
};

// The actual banner UI component (reusable)
export const NetworkBannerUI = ({ isInModal = false }: { isInModal?: boolean }) => {
    const [slideAnim] = useState(new Animated.Value(-100));
    const insets = useSafeAreaInsets();
    const bannerState = useNetworkBannerState();
    const { isOnline, isRetrying, failedCount, shouldShow, isModalOpen } = bannerState;

    // Only show this banner instance if:
    // - isInModal=true and modal is open, OR
    // - isInModal=false and modal is NOT open
    const shouldRender = isInModal ? isModalOpen : !isModalOpen;

    useEffect(() => {
        if (shouldShow && shouldRender) {
            showBanner();
        } else {
            hideBanner();
        }
    }, [shouldShow, shouldRender]);

    const showBanner = () => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();
    };

    const hideBanner = () => {
        Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleRetry = async () => {
        if (isRetrying) return;

        networkBannerState.updateState({ isRetrying: true });

        try {
            const netInfo = await NetInfo.fetch();
            if (!netInfo.isConnected) {
                networkBannerState.updateState({ isRetrying: false });
                return;
            }

            const success = await retryFailedRequests();

            setTimeout(() => {
                const newCount = getFailedRequestsCount();
                networkBannerState.updateState({
                    isRetrying: false,
                    failedCount: newCount,
                    shouldShow: newCount > 0 || !netInfo.isConnected,
                    isOnline: netInfo.isConnected === true,
                });
            }, 500);
        } catch (error) {
            console.error('Retry failed:', error);
            networkBannerState.updateState({
                isRetrying: false,
                failedCount: getFailedRequestsCount()
            });
        }
    };

    // Don't render if this instance shouldn't show
    if (!shouldRender || (!shouldShow && !isRetrying)) {
        return null;
    }

    return (
        <View
            style={isInModal ? styles.modalContainer : styles.normalContainer}
            pointerEvents="box-none"
        >
            <StatusBar barStyle='light-content' />
            <Animated.View
                style={[
                    styles.banner,
                    {
                        transform: [{ translateY: slideAnim }],
                        paddingTop: insets.top + 10,
                    },
                ]}
                pointerEvents="auto"
            >
                <View style={styles.content}>
                    <View style={styles.textContainer}>
                        <CommonText content='No Internet Connection' style={styles.title} />
                        <CommonText
                            content={isRetrying ? 'Retrying requests...' : 'Please check your network settings.'}
                            style={styles.subtitle}
                        />
                        {failedCount > 0 && !isRetrying && (
                            <CommonText
                                content={`${failedCount} request${failedCount > 1 ? 's' : ''} pending`}
                                style={styles.failedCount}
                            />
                        )}
                    </View>

                    {!isRetrying && (
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={handleRetry}
                        >
                            <CommonText content='Retry' style={styles.retryText} />
                        </TouchableOpacity>
                    )}

                    {isRetrying && (
                        <View style={styles.retryButton}>
                            <ActivityIndicator color="#FF6B6B" size="small" />
                        </View>
                    )}
                </View>
            </Animated.View>
        </View>
    );
};

// Global network listener (mount once in App.tsx)
export const NetworkBannerListener = () => {
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const online = state.isConnected && state.isInternetReachable !== false;
            const currentState = networkBannerState.getState();
            const wasOffline = !currentState.isOnline;

            networkBannerState.updateState({ isOnline: online });

            if (!online) {
                networkBannerState.updateState({ shouldShow: true });
                setTimeout(() => {
                    networkBannerState.updateState({
                        failedCount: getFailedRequestsCount()
                    });
                }, 100);
            } else {
                // Auto-retry when back online
                if (wasOffline && getFailedRequestsCount() > 0) {
                    console.log('Network restored, auto-retrying');
                    networkBannerState.updateState({ isRetrying: true });
                    retryFailedRequests().then(() => {
                        setTimeout(() => {
                            const count = getFailedRequestsCount();
                            networkBannerState.updateState({
                                isRetrying: false,
                                shouldShow: count > 0,
                                failedCount: count,
                            });
                        }, 500);
                    });
                } else {
                    networkBannerState.updateState({ shouldShow: false });
                }
            }
        });

        const offlineHandler = () => {
            networkBannerState.updateState({
                isOnline: false,
                shouldShow: true
            });
            setTimeout(() => {
                networkBannerState.updateState({
                    failedCount: getFailedRequestsCount()
                });
            }, 100);
        };

        const onlineHandler = () => {
            const currentState = networkBannerState.getState();
            if (!currentState.isRetrying) {
                networkBannerState.updateState({
                    isOnline: true,
                    shouldShow: false
                });
            }
        };

        networkEventEmitter.on('offline', offlineHandler);
        networkEventEmitter.on('online', onlineHandler);

        return () => {
            unsubscribe();
            networkEventEmitter.off('offline', offlineHandler);
            networkEventEmitter.off('online', onlineHandler);
        };
    }, []);

    return <NetworkBannerUI isInModal={false} />;
};

const styles = StyleSheet.create({
    normalContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        elevation: 10000,
    },
    modalContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000, // High z-index inside modal
        elevation: 10000,
    },
    banner: {
        backgroundColor: '#ff4d4d',
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subtitle: {
        color: '#FFFFFF',
        fontSize: 13,
        opacity: 0.9,
    },
    failedCount: {
        color: '#FFFFFF',
        fontSize: 11,
        opacity: 0.8,
        marginTop: 2,
    },
    retryButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    retryText: {
        color: '#FF6B6B',
        fontSize: 14,
        fontWeight: '600',
    },
});