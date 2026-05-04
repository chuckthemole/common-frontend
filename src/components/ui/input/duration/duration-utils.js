// TODO: migrate this to general utils eventually

const UNIT_TO_MS = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000, // approximation
    years: 365 * 24 * 60 * 60 * 1000,
};

export function durationToMs({ amount, unit }) {
    return amount * UNIT_TO_MS[unit];
}