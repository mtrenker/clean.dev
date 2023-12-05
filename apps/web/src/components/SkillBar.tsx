'use client';
import React from 'react';
import {Transition} from '@headlessui/react';

export interface SkillBarProps {
  skill: string;
  level: number;
}

export const SkillBar: React.FC<SkillBarProps> = ({ skill, level }) => {
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between">
        <span className="text-sm font-medium text-gray-700">{skill}</span>
        <span className="text-sm font-medium text-gray-700">{level}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200">
        <Transition
          appear
          enter="transition-width duration-700 ease-out"
          enterFrom="w-0"
          enterTo={`w-${level}/100`}
          show
        >
          <div className="h-2.5 rounded-full bg-blue-600" style={{width: `${level}%`}} />
        </Transition>
      </div>
    </div>
  );
}
