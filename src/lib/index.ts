// place files you want to import through the `$lib` alias in this folder.
import { env } from "$env/dynamic/private"

interface SessionInfo {
    browser: string | undefined,
    device: string | undefined,
    os: string | undefined,
    ip: string | null,
    city: string | undefined,
    region: string | undefined,
    country: string | undefined,
}

export async function getSessionInfo(userAgent: string | null, ip: string | null): Promise<SessionInfo> {
    let browserName, osName, deviceType;

    if (userAgent) {
        if (userAgent.indexOf("Chrome") > -1) {
            browserName = "Chrome";
        } else if (userAgent.indexOf("Firefox") > -1) {
            browserName = "Firefox";
        } else if (userAgent.indexOf("Safari") > -1) {
            browserName = "Safari";
        } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
            browserName = "Internet Explorer";
        } else {
        }

        // Detect OS
        if (userAgent.indexOf("Win") > -1) {
            osName = "Windows";
        } else if (userAgent.indexOf("Mac") > -1) {
            osName = "MacOS";
        } else if (userAgent.indexOf("Linux") > -1) {
            osName = "Linux";
        } else if (userAgent.indexOf("Android") > -1) {
            osName = "Android";
        } else if (userAgent.indexOf("like Mac") > -1) {
            osName = "iOS";
        } else {
            osName = "Unknown";
        }

        // Detect device type
        if (/Mobi|Android/i.test(userAgent)) {
            deviceType = "Mobile";
        } else {
            deviceType = "Desktop";
        }

    }

    let ipInfo;
    if (ip) {
        try {
            ipInfo = await (await fetch(`https://ipinfo.io/${ip}?token=${env.IPINFO_TOKEN}`)).json()
        } catch (e) {
            console.log(e)
        }
    }

    let countryName, regionName, cityName;
    if (ipInfo) {
        countryName = ipInfo?.country
        regionName = ipInfo?.region
        cityName = ipInfo?.city
    }

    return {
        browser: browserName,
        device: deviceType,
        os: osName,
        ip,
        country: countryName,
        region: regionName,
        city: cityName
    }
}