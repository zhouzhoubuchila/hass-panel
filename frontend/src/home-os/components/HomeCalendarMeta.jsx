import React, { useMemo } from 'react';
import { buildCalendarModel } from '../environment/environmentModel';

export default function HomeCalendarMeta({ date }) {
  const calendar = useMemo(() => buildCalendarModel(date), [date]);
  return <> · {calendar.lunarDate}{calendar.jieQi ? ` · ${calendar.jieQi}` : ''}</>;
}
