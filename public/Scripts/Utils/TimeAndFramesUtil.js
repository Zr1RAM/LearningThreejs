export function getMillisecondsFromUnixTimestamp(unixTimestamp) {
    const date = new Date(unixTimestamp / 1000000);
    console.log(date);
    return date.getMilliseconds();
}