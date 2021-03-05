export default class DeviceInfo {

    static isMobile() {
        return ( /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) );
    }
}