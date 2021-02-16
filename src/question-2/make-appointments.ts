// To prevent 'Duplicate function implementation.' error due to functions being in global scope
export {};

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

/**
 * Find gaps in meeting schedules that can be used for the new meeting.
 * @param meetingSchedules
 * @param duration
 */
function findFreeTimes(meetingSchedules: string[][][], duration: number) {
  const tenhours = 60 * 10; // max working hours
  // Some input validation just in case it's needed
  if (duration > tenhours) {
    return null;
  }
  console.log(meetingSchedules);
  let noFreeTime = false;
  const personFreeTimes: number[][][] = [[[]]];

  // Iterate through every person row
  meetingSchedules.forEach((person, index) => {
    // Businessmen starts work from 09:00, this will help identify
    // any gap that can be used before the first meeting begins
    let prevEnd = 900;
    personFreeTimes[index] = [];
    // Iterate through every meeting this person has
    person.forEach((meetings) => {
      const start = Number(meetings[0].split(":").join(""));
      const end = Number(meetings[1].split(":").join(""));

      // Even though passing the decimal number to setHours() works,
      // still convert to integer just in case of inconsistencies.
      const startHour = Math.floor(start / 100);
      const endTime = new Date();
      endTime.setHours(startHour, start % 100);
      endTime.setMinutes(endTime.getMinutes() + duration);
      // console.log(
      //   `start: ${start} end: ${end} endTime: ${endTime.getHours()}:${endTime.getMinutes()}`
      // );

      // If the gap between current meeting and previous meeting is longer than
      // the duration required, and by the end of the meeting (after duration)
      // it's still not 19:00, save this into the person's free time schedule.
      if (start - prevEnd >= duration && endTime.getHours() < 19) {
        personFreeTimes[index].push([prevEnd, start]);
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

  console.log("Free times: \n", personFreeTimes);

  return noFreeTime ? null : personFreeTimes;
}

function makeAppointments(meetingSchedules: string[][][], duration: number) {
  const freetimes = findFreeTimes(meetingSchedules, duration);

  const indices = new Array(freetimes.length).fill(0); // Save pivot position of which meeting is being analyzed for each person
  const earliestTimeSlot = [[]];
  let output: number = undefined;
  let latestStart = 900;
  // let latestEndTime = 1900;

  while (output === undefined) {
    // First loop is meant for finding the latest start time among
    // every person's current iteration of earliest free time slots.
    for (let i = 0; i < freetimes.length; i++) {
      // Get each person's earliest free time slot
      earliestTimeSlot[indices[i]] = freetimes[i][indices[i]];

      // For this iteration, find the latest start time among every person's
      // earliest time slot, because that would be the earliest possible start time.
      latestStart =
        earliestTimeSlot[indices[i]][0] > latestStart
          ? earliestTimeSlot[indices[i]][0]
          : latestStart;
      // latestEndTime =
      //   earliestTimeSlot[indices[i]][1] < latestEndTime
      //     ? earliestTimeSlot[indices[i]][1]
      //     : latestEndTime;

      console.log("earliestFreeTimes: ", earliestTimeSlot[indices[i]]);
      console.log(`latestStart: ${latestStart}`);
    }

    let found = true;
    for (let i = 0; i < freetimes.length; i++) {
      // Get each person's earliest free time slot
      earliestTimeSlot[indices[i]] = freetimes[i][indices[i]];

      const startTime = new Date().setHours(
        Math.floor(earliestTimeSlot[indices[i]][0] / 100),
        earliestTimeSlot[indices[i]][0] % 100
      );

      const endTime = new Date().setHours(
        Math.floor(earliestTimeSlot[indices[i]][1] / 100),
        earliestTimeSlot[indices[i]][1] % 100
      );

      const latestStartTime = new Date();
      latestStartTime.setHours(
        Math.floor(latestStart / 100),
        latestStart % 100
      );

      const meetingEndTime = latestStartTime;
      meetingEndTime.setMinutes(meetingEndTime.getMinutes() + duration);

      // Check if this time slot starts earlier or at the same time of the latest time slot
      // and the end time is late enough to accomodate the duration of the meeting.
      if (
        !(
          startTime <= latestStartTime.getTime() &&
          meetingEndTime.getTime() <= endTime
        )
      ) {
        // If this person's earliest time slot doesn't fit into current
        // collectively earliest time slot, move on to the next time slot.
        indices[i]++;
        found = false;

        // If this person doesn't have any free time left, return null.
        if (indices[i] > freetimes[i].length) {
          output = null;
        }
      }
      console.log("earliestFreeTimes: ", earliestTimeSlot[indices[i]]);
      console.log(`latestStartTime: ${latestStart}`);
    }
    // If every person's earliest free time slot fits with
    // the latest start time, return the latest start time.
    if (found) {
      output = latestStart;
    }
  }

  // while (output === undefined) {
  //   // Iterate through all persons
  //   for (let i = 0; i < freetimes.length; i++) {
  //     // Find earliest free time
  //     if (freetimes[i].length > 0) {
  //       earliestFreeTimes[i] = freetimes[i][indices[i]][0];
  //       earliestTime =
  //         earliestFreeTimes[i] < earliestTime
  //           ? earliestFreeTimes[i]
  //           : earliestTime;
  //     } else {
  //       output = undefined;
  //       continue;
  //     }
  //     // if (freeTime !== undefined) {
  //     //   startTimes[i] = freeTime[0];
  //     // } else {
  //     //   output = undefined;
  //     // }
  //   }

  //   for (let i = 0; i < earliestFreeTimes.length; i++) {
  //     // if (startTimes[i] )
  //   }
  // }

  return output;
}

function main() {
  console.log("output: ", makeAppointments(schedules, 60));
}

main();
