// Sri Lankan NIC decoder
// Old format: 9 digits + V or X  (e.g. 901234567V)
// New format: 12 digits           (e.g. 199012345678)

interface NICInfo {
    dob: string;         // "YYYY-MM-DD"
    gender: "MALE" | "FEMALE";
}

export function decodeNIC(nic: string): NICInfo | null {
    const trimmed = nic.trim();
    let year: number;
    let dayOfYear: number;

    const oldFormat = /^(\d{9})[VXvx]$/.exec(trimmed);
    const newFormat = /^(\d{12})$/.exec(trimmed);

    if (oldFormat) {
        year = 1900 + parseInt(trimmed.substring(0, 2), 10);
        dayOfYear = parseInt(trimmed.substring(2, 5), 10);
    } else if (newFormat) {
        year = parseInt(trimmed.substring(0, 4), 10);
        dayOfYear = parseInt(trimmed.substring(4, 7), 10);
    } else {
        return null;
    }

    const gender: "MALE" | "FEMALE" = dayOfYear >= 500 ? "FEMALE" : "MALE";
    if (dayOfYear >= 500) dayOfYear -= 500;

    // Convert day-of-year to month and day
    const date = new Date(year, 0, dayOfYear); // Jan 1 + (dayOfYear - 1)
    if (isNaN(date.getTime())) return null;

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return { dob: `${year}-${month}-${day}`, gender };
}
