// To prevent 'Duplicate function implementation.' error due to functions being in global scope
export {};

/**
 * At the highest level, three portions need to be considered:
 *
 * 1. Start of working hour to first meeting.
 * 2. In between meetings.
 * 3. Last meeting towards end of working hour.
 */

const DEBUG = false;
const WORK_TIME_START = 900;
const WORK_TIME_END = 1900;
const WORK_TIME_END_HOUR = 19;
const TOTAL_WORK_HOUR = 60 * 10; // max working hours

// Duration: 60, free time: '12:15'
const schedules = [
  [
    ["09:00", "11:30"],
    ["13:30", "16:00"],
    ["16:00", "17:30"],
    ["17:45", "19:00"],
  ],
  [
    ["09:15", "12:00"],
    ["14:00", "16:30"],
    ["17:00", "17:30"],
  ],
  [
    ["11:30", "12:15"],
    ["15:00", "16:30"],
    ["17:45", "19:00"],
  ],
];

// Duration: 1, free time: '09:00'
const earlyMeetings = [[["09:01", "11:30"]], [["09:02", "12:00"]], [["09:03", "12:15"]]];

// If one person has no meeting at all,
// Duration: 60, free time: 'null'
// Duration: 59, free time: '16:30'
const noMeetingSchedule = [
  [],
  [
    ["09:15", "12:00"],
    ["14:00", "16:30"],
    ["17:30", "18:30"],
  ],
  [
    ["12:30", "14:00"],
    ["15:00", "16:30"],
    ["17:45", "19:00"],
  ],
];

// If every person have no meeting at all,
// Duration: any, free time: '09:00'
const emptyMeetingSchedule = [[], [], []];

// Duration: 60, free time: 'null'
// Duration: 29, free time: 'null'
const noFreeTimeSchedule = [
  [
    ["09:00", "11:30"],
    ["13:30", "16:00"],
    ["16:00", "17:30"],
    ["17:45", "19:00"],
  ],
  [
    ["09:15", "12:00"],
    ["14:00", "16:30"],
    ["17:00", "17:30"],
  ],
  [
    ["12:30", "14:00"],
    ["15:00", "16:30"],
    ["17:45", "19:00"],
  ],
];

// Duration: 30, free time: '18:30'
// Duration: 31, free time: 'null'
const nearEndOfWorkSchedule = [[["09:00", "18:30"]], [["16:00", "18:00"]]];

// Not using Winston as console logged array looks better
function customLog(text, object = null) {
  if (DEBUG) {
    console.log(text, object);
  }
}

/**
 * Find gaps in meeting schedules that can be used for the new appointment.
 * @param meetingSchedules
 * @param duration
 */
function findFreeTimes(meetingSchedules: string[][][], duration: number) {
  // Some input validation just in case it's needed
  if (duration > TOTAL_WORK_HOUR) {
    return null;
  }

  let hasNoFreeTime = false;
  const durationMs = duration * 60 * 1000;
  const personFreeTimes: number[][][] = [[[]]];

  // Iterate through every person
  meetingSchedules.forEach((personMeetings, personIndex) => {
    // Businessmen starts work from 09:00, this will help identify
    // any gap that can be used before the first meeting begins
    let prevEnd = WORK_TIME_START;
    personFreeTimes[personIndex] = [];

    // If this person has no meeting at all, it's a full day of free time.
    // Also, personMeetings.forEach() will not begin loop since it's an empty array
    // assuming no null or undefined will be provided.
    if (personMeetings.length == 0) {
      personFreeTimes[personIndex].push([WORK_TIME_START, WORK_TIME_END]);
    }

    // Iterate through every meeting this person has
    personMeetings.forEach((meeting, meetingIndex) => {
      const meetingStartTime = new Date();
      const prevEndTime = new Date();
      const apptEndTime = new Date(); // Potential appointment within free time
      const workEndTime = new Date();
      const meetingStart = Number(meeting[0].replace(":", ""));
      const meetingEnd = Number(meeting[1].replace(":", ""));

      // Made a logical error here, since meeting start time is used as the end of the possible free time.
      // there's no need to subtract one from it. E.g. Meeting time is [ 09:00, 11:30 ], free time can start from
      // 11:30 (end time is excluded from the meeting). With that, if the first meeting starts from 09:01, and we need only
      // one minute of meeting time, free time can be [ 09:00, 09:01 ] which makes a lot more sense now.
      // Wrong code: startTime.setHours(startHour, (start % 100) - 1);

      // Even though passing the decimal number to setHours() works,
      // still converts to integer just in case of inconsistencies.
      // Note: When using setHours(), pass 0 for sec and ms to prevent edge cases.
      meetingStartTime.setHours(Math.floor(meetingStart / 100), meetingStart % 100, 0, 0);
      workEndTime.setHours(WORK_TIME_END_HOUR, 0, 0, 0);
      prevEndTime.setHours(Math.floor(prevEnd / 100), prevEnd % 100, 0, 0);
      apptEndTime.setHours(prevEndTime.getHours(), prevEndTime.getMinutes() + duration, 0, 0);

      // If the gap between current meeting and previous meeting is longer than
      // the duration required, and by the end of the appointment (after duration)
      // it's still not after end of working hour (19:00), save this into the person's free time schedule.
      if (
        meetingStartTime.getTime() - prevEndTime.getTime() >= durationMs &&
        apptEndTime.getTime() <= workEndTime.getTime()
      ) {
        personFreeTimes[personIndex].push([prevEnd, meetingStart]);
      }
      // If this is the last meeting the person has, check if there's
      // any free time left from end of meeting to end of work hour.
      if (meetingIndex == personMeetings.length - 1) {
        const meetingEndTime = new Date();
        meetingEndTime.setHours(Math.floor(meetingEnd / 100), meetingEnd % 100, 0, 0);

        // If last meeting ends before end of working hour (19:00, will be negative if meetingEndTime is later than that)
        // and there's enough time for the appointment, save end of meeting time (exclusinees) to end of work as free time.
        if (workEndTime.getTime() - meetingEndTime.getTime() >= durationMs) {
          personFreeTimes[personIndex].push([
            meetingEndTime.getHours() * 100 + meetingEndTime.getMinutes(),
            WORK_TIME_END,
          ]);
        }
      }
      // Since a meeting end time is exclusive, it can be used
      // inclusively as the starting time of a new meeting.
      prevEnd = meetingEnd;
    });

    if (personFreeTimes[personIndex].length == 0) {
      // Set haNoFreeTime to true if there's one person that don't have any free time at all
      hasNoFreeTime = true;
    }
  });
  // customLog("Meetings", meetingSchedules);
  // customLog("Free times", personFreeTimes);

  return hasNoFreeTime ? null : personFreeTimes;
}

/**
 * Find the earliest time, when every businessman is free for at least that duration. Return null if not found.
 * @param meetingSchedules
 * @param duration
 */

function makeAppointment(meetingSchedules: string[][][], duration: number): string {
  const freetimes = findFreeTimes(meetingSchedules, duration);

  customLog("Meetings", meetingSchedules);
  customLog("Free times:", freetimes);

  // If there's one person that doesn't have a free time at all, return null.
  if (freetimes == null) {
    return null;
  }

  const indices = new Array(freetimes.length).fill(0); // Save pivot position of which meeting is being analyzed for each person
  const earliestTimeSlot = [[]];
  let output: string = undefined;
  let latestStart = WORK_TIME_START;

  // Keep looping until output result is out
  while (output === undefined) {
    let hasFoundFreeTime = true;
    const latestStartTime = new Date();
    const apptEndTime = new Date();
    // First loop is meant for finding the latest start time among
    // every person's current iteration of earliest free time slots.
    freetimes.forEach((personFreeTime, personIndex) => {
      // Get each person's earliest free time slot
      earliestTimeSlot[personIndex] = personFreeTime[indices[personIndex]];
      // For this iteration, find the latest start time among every person's
      // earliest time slot, because that would be the earliest possible start time.
      latestStart =
        earliestTimeSlot[personIndex][0] >= latestStart
          ? earliestTimeSlot[personIndex][0]
          : latestStart;
    });

    latestStartTime.setHours(Math.floor(latestStart / 100), latestStart % 100, 0, 0);
    apptEndTime.setTime(latestStartTime.getTime());
    apptEndTime.setMinutes(apptEndTime.getMinutes() + duration);

    // Second loop is meant for checking if each person's current iteration of earliest free time slots
    // fits into the meeting schedule if it were to start from the collectively latest start time.
    // If it does not, move pivot to next earliest time.
    for (let personIndex = 0; personIndex < freetimes.length; personIndex++) {
      // Get each person's earliest free time slot
      const startTimeMs = new Date().setHours(
        Math.floor(earliestTimeSlot[personIndex][0] / 100),
        earliestTimeSlot[personIndex][0] % 100,
        0,
        0
      );

      const endTimeMs = new Date().setHours(
        Math.floor(earliestTimeSlot[personIndex][1] / 100),
        earliestTimeSlot[personIndex][1] % 100,
        0,
        0
      );

      // Check if this free time slot starts earlier or at the same time with the collectively latest
      // start time and the end time is late enough to accomodate the duration of the appointment.
      if (!(startTimeMs <= latestStartTime.getTime() && apptEndTime.getTime() <= endTimeMs)) {
        // If this person's earliest time slot doesn't fit into current
        // collectively earliest time slot, move on to the next time slot.
        indices[personIndex]++;
        hasFoundFreeTime = false;

        // If this person doesn't have any free time left, return null (break loop).
        if (indices[personIndex] >= freetimes[personIndex].length) {
          output = null;
          break;
        }
      }
    }
    // If every person's earliest free time slot fits with the
    // latest start time, return the latest start time (break loop).
    if (hasFoundFreeTime) {
      // Format into hh:mm format
      output = latestStart.toString().padStart(4, "0");
      output = output.slice(0, 2) + ":" + output.slice(2, 5);
    }
  }

  return output;
}

function main() {
  console.log(makeAppointment(schedules, 60)); // 12:15
  console.log(makeAppointment(earlyMeetings, 1)); // 09:00
  console.log(makeAppointment(noMeetingSchedule, 60)); // 16:30
  console.log(makeAppointment(noMeetingSchedule, 61)); // null
  console.log(makeAppointment(emptyMeetingSchedule, 60)); // 09:00
  console.log(makeAppointment(noFreeTimeSchedule, 60)); // null
  console.log(makeAppointment(noFreeTimeSchedule, 29)); // 12:00
  console.log(makeAppointment(nearEndOfWorkSchedule, 30)); // 18:30
  console.log(makeAppointment(nearEndOfWorkSchedule, 31)); // null
}

main();
