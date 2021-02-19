// To prevent 'Duplicate function implementation.' error due to functions being in global scope
export {};

/**
 * At the highest level, three portions to be considered:
 *
 * 1. Start of working hour to first meeting.
 * 2. In between meetings.
 * 3. Last meeting towards end of working hour.
 */

const DEBUG = false;
const WORK_TIME_START = 900;
const WORK_TIME_END = 1900;
const WORK_TIME_END_HR = 19;
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
const earlyMeetings = [
  [["09:01", "11:30"]],
  [["09:02", "12:00"]],
  [["09:03", "12:15"]],
];

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
  const workTimeEnd = new Date();
  workTimeEnd.setHours(19, 0);
  if (duration > TOTAL_WORK_HOUR) {
    return null;
  }
  let noFreeTime = false;
  const personFreeTimes: number[][][] = [[[]]];

  // Iterate through every person
  meetingSchedules.forEach((personMeetings, index) => {
    // Businessmen starts work from 09:00, this will help identify
    // any gap that can be used before the first meeting begins
    let prevEnd = WORK_TIME_START;
    personFreeTimes[index] = [];

    // If this person has no meeting at all, it's a full day of free time.
    // Also, personMeetings.forEach() will not begin loop since it's an empty array
    // assuming no null or undefined will be provided.
    if (personMeetings.length == 0) {
      personFreeTimes[index].push([WORK_TIME_START, WORK_TIME_END]);
    }

    // Iterate through every meeting this person has
    personMeetings.forEach((meeting, i) => {
      const start = Number(meeting[0].split(":").join(""));
      const end = Number(meeting[1].split(":").join(""));

      // Even though passing the decimal number to setHours() works,
      // still convert to integer just in case of inconsistencies.
      const startHour = Math.floor(start / 100);
      const startTime = new Date();
      // Made a logical error here, since meeting start time is used as the end of the possible free time.
      // there's no need to subtract one from it. E.g. Meeting time is [ 09:00, 11:30 ], free time can start from
      // 11:30 (end time is excluded from the meeting). With that, if the first meeting starts from 09:01, and we need only
      // one minute of meeting time, free time can be [ 09:00, 09:01 ] which makes a lot more sense now.
      // Wrong code: startTime.setHours(startHour, (start % 100) - 1);
      startTime.setHours(startHour, start % 100);
      const apptStart = startTime.getHours() * 100 + startTime.getMinutes();

      const apptEndTime = new Date();
      apptEndTime.setHours(startHour, start % 100);
      apptEndTime.setMinutes(apptEndTime.getMinutes() + duration);

      // If the gap between current meeting and previous meeting is longer than
      // the duration required, and by the end of the meeting (after duration)
      // it's still not 19:00, save this into the person's free time schedule.
      if (
        apptStart - prevEnd >= duration &&
        apptEndTime.getHours() <= WORK_TIME_END_HR
      ) {
        personFreeTimes[index].push([prevEnd, apptStart]);
      }
      // If this is the last meeting the person has, check if there's
      // any free time left from end of meeting to end of work hour.
      if (i == personMeetings.length - 1) {
        const endTime = new Date();
        const endHour = Math.floor(end / 100);
        endTime.setHours(endHour, end % 100);

        // If last meeting ends before 19 and there's enough time for the appointment,
        // save end of meeting time (exclusinees) to end of work as free time.
        if (
          endTime.getHours() <= WORK_TIME_END_HR &&
          workTimeEnd.getTime() - endTime.getTime() >= duration
        ) {
          personFreeTimes[index].push([
            endTime.getHours() * 100 + endTime.getMinutes(),
            WORK_TIME_END,
          ]);
        }
      }
      // Since a meeting end time is exclusive, it can be used
      // inclusively as the starting time of a new meeting.
      prevEnd = end;
    });

    if (personFreeTimes[index].length == 0) {
      // Set noFreeTime to true if there's one person that don't have any free time at all
      noFreeTime = true;
    }
  });
  customLog("Meetings", meetingSchedules);
  customLog("Free times", personFreeTimes);

  return noFreeTime ? null : personFreeTimes;
}

/**
 * Find the earliest time, when every businessman is free for at least that duration. Return null if not found.
 * @param meetingSchedules
 * @param duration
 */

function makeAppointments(
  meetingSchedules: string[][][],
  duration: number
): string {
  const freetimes = findFreeTimes(meetingSchedules, duration);

  // If there's one person that doesn't have a free time at all, return null.
  if (freetimes == null) {
    return null;
  }
  customLog("Meetings", meetingSchedules);
  customLog("Free times:", freetimes);

  const indices = new Array(freetimes.length).fill(0); // Save pivot position of which meeting is being analyzed for each person
  const earliestTimeSlot = [[]];
  let output: string = undefined;
  let latestStart = WORK_TIME_START;

  while (output === undefined) {
    // First loop is meant for finding the latest start time among
    // every person's current iteration of earliest free time slots.
    for (let i = 0; i < freetimes.length; i++) {
      // Get each person's earliest free time slot
      earliestTimeSlot[i] = freetimes[i][indices[i]];

      // For this iteration, find the latest start time among every person's
      // earliest time slot, because that would be the earliest possible start time.
      latestStart =
        earliestTimeSlot[i][0] >= latestStart
          ? earliestTimeSlot[i][0]
          : latestStart;
    }

    let found = true;

    // Second loop is meant for checking if each person's current iteration of earliest free time slots
    // fits into the meeting schedule if it were to start from the collectively latest start time.
    // If it does not, move pivot to next earliest time.
    for (let i = 0; i < freetimes.length; i++) {
      // Get each person's earliest free time slot
      const startTime = new Date().setHours(
        Math.floor(earliestTimeSlot[i][0] / 100),
        earliestTimeSlot[i][0] % 100
      );

      const endTime = new Date().setHours(
        Math.floor(earliestTimeSlot[i][1] / 100),
        earliestTimeSlot[i][1] % 100
      );

      const latestStartTime = new Date();
      latestStartTime.setHours(
        Math.floor(latestStart / 100),
        latestStart % 100
      );

      const apptEndTime = latestStartTime;
      apptEndTime.setMinutes(apptEndTime.getMinutes() + duration);

      // Check if this time slot starts earlier or at the same time with the collectively latest
      // start time and the end time is late enough to accomodate the duration of the appointment.
      if (
        !(
          startTime <= latestStartTime.getTime() &&
          apptEndTime.getTime() <= endTime
        )
      ) {
        // If this person's earliest time slot doesn't fit into current
        // collectively earliest time slot, move on to the next time slot.
        indices[i]++;
        found = false;

        // If this person doesn't have any free time left, return null (break loop).
        if (indices[i] >= freetimes[i].length) {
          output = null;
        }
      }
    }
    // If every person's earliest free time slot fits with
    // the latest start time, return the latest start time (break loop).
    if (found) {
      // Format into hh:mm format
      output = latestStart.toString().padStart(4, "0");
      output = output.slice(0, 2) + ":" + output.slice(2, 5);
    }
  }

  return output;
}

function main() {
  console.log(makeAppointments(schedules, 60)); // 12:15
  console.log(makeAppointments(earlyMeetings, 1)); // 09:00
  console.log(makeAppointments(noMeetingSchedule, 59)); // 16:30
  console.log(makeAppointments(noMeetingSchedule, 60)); // null
  console.log(makeAppointments(emptyMeetingSchedule, 60)); // 09:00
  console.log(makeAppointments(noFreeTimeSchedule, 60)); // null
  console.log(makeAppointments(noFreeTimeSchedule, 29)); // 12:00
  console.log(makeAppointments(nearEndOfWorkSchedule, 30)); // 18:30
  console.log(makeAppointments(nearEndOfWorkSchedule, 31)); // null
}

main();
