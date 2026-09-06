import { Course } from '../types';
import { spanishCourse } from './courses/spanish';
import { englishCourse } from './courses/english';
import { frenchCourse } from './courses/french';
import { germanCourse } from './courses/german';
import { italianCourse } from './courses/italian';
import { japaneseCourse } from './courses/japanese';
import { portugueseCourse } from './courses/portuguese';
import { arabicCourse } from './courses/arabic';
import { chineseCourse } from './courses/chinese';
import { russianCourse } from './courses/russian';
import { koreanCourse } from './courses/korean';
import { dutchCourse } from './courses/dutch';
import { getEarlyLearnerUnits } from './earlyLearnerCourse';

const BASE_COURSES: Course[] = [
  spanishCourse,
  englishCourse,
  frenchCourse,
  germanCourse,
  italianCourse,
  japaneseCourse,
  portugueseCourse,
  arabicCourse,
  chineseCourse,
  russianCourse,
  koreanCourse,
  dutchCourse,
];

// Enrich each language course with the specialized 3-6 years early childhood units
export const COURSES_DATA: Course[] = BASE_COURSES.map((course) => {
  const earlyUnits = getEarlyLearnerUnits(course.language);
  return {
    ...course,
    units: [...earlyUnits, ...course.units],
  };
});

