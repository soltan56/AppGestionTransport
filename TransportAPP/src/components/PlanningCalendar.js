import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const pastelColors = [
  'bg-blue-200',
  'bg-violet-200',
  'bg-green-200',
  'bg-yellow-200',
  'bg-pink-200',
  'bg-cyan-200',
];

const PlanningCalendar = ({ currentWeek, onWeekSelect, plannedWeeks = [] }) => {
  const weeks = Array.from({ length: 53 }, (_, i) => i + 1);
  const isPlanned = (week) => plannedWeeks.includes(week);

  return (
    <div className="grid grid-cols-7 gap-4 p-6 bg-white rounded-xl shadow-lg max-w-5xl mx-auto mt-8">
      {weeks.map((week, idx) => {
        const isPast = week < currentWeek;
        const isFuture = week >= currentWeek;
        const planned = isPlanned(week);
        const color = pastelColors[idx % pastelColors.length];
        return (
          <motion.div
            key={week}
            whileHover={isFuture && !planned ? { scale: 1.08 } : {}}
            className={clsx(
              'relative flex flex-col items-center justify-center h-20 rounded-lg cursor-pointer transition-all duration-200 select-none border-2',
              {
                'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed': isPast,
                [color]: isFuture && !planned,
                'bg-green-400 text-white border-green-500 shadow-lg': planned,
              }
            )}
            onClick={() => isFuture && !planned && onWeekSelect && onWeekSelect(week)}
            style={{ pointerEvents: isPast ? 'none' : 'auto' }}
          >
            <span className="text-lg font-bold">S{week}</span>
            {planned && (
              <span className="absolute top-2 right-2 bg-white text-green-600 rounded-full px-2 py-0.5 text-xs font-semibold shadow">
                ✔
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default PlanningCalendar; 