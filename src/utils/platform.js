export const usePlatform = () => {
    return /electron/i.test(navigator.userAgent) ? 'electron' : 'web';
}