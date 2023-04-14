export const LOG_PATH = './logs';

export const LOG_RETENTION_DURATION = 31;

export const SPECIAL_ALPHABEL_REGEX = /[ `!@#$%^&*()+=\[\]{};':"\\|,.<>\/?~]/;
export const NORMAL_ALPHABEL_REGEX = /^[A-Za-z0-9-_\s]+$/;

export const MOBILE_REGEX = /^[0-9]{10,11}$/;
export const CODE_REGEX = /^([A-Za-z0-9]{1,})(\.([A-Za-z0-9]{1,})){0,}$/i;

export const TIME_REGEX = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/;
