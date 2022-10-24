import * as dayjs from 'dayjs';

export function getDate(date: string): Date {
  return dayjs(date).add(1, 'day').toDate();
}
