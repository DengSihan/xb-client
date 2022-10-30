export const usePlatform = () => {
    return /electron/i.test(navigator.userAgent) ? 'app' : 'web';
}