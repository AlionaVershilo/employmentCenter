import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "node:fs";
import OpenAI from "openai";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.GPT_API_KEY });

const typesOfWork = [
  { id: "work1", name: "Plumber" },
  { id: "work2", name: "Nanny" },
  { id: "work3", name: "Housekeeper" },
  { id: "work4", name: "Painter" },
  { id: "work5", name: "Gardener" },
  { id: "work6", name: "Electrician" },
  { id: "work7", name: "Driver" },
  { id: "work8", name: "Carpenter" },
  { id: "work9", name: "Governess" },
  { id: "work10", name: "Seamstress" },
];

const stringTypesOfWork = typesOfWork.map((typeOfWork) => {
  return `Type of work: ${typeOfWork.name}, ID: ${typeOfWork.id}`;
});

const workers = [
  {
    id: "worker_1",
    name: "Alexey Ivanov",
    works: ["work1"],
  },
  {
    id: "worker_2",
    name: "Maria Petrova",
    works: ["work2", "work3"],
  },
  {
    id: "worker_3",
    name: "Igor Sokolov",
    works: ["work4"],
  },
  {
    id: "worker_4",
    name: "Anna Smirnova",
    works: ["work5"],
  },
  {
    id: "worker_5",
    name: "Dmitry Karpov",
    works: ["work6", "work7"],
  },
  {
    id: "worker_6",
    name: "Elena Volkova",
    works: ["work3"],
  },
  {
    id: "worker_7",
    name: "Sergey Fedorov",
    works: ["work8"],
  },
  {
    id: "worker_8",
    name: "Natalia Orlova",
    works: ["work9"],
  },
  {
    id: "worker_9",
    name: "Andrey Pavlov",
    works: ["work7", "work5"],
  },
  {
    id: "worker_10",
    name: "Olga Belova",
    works: ["work10"],
  },
  {
    id: "worker_11",
    name: "Darya",
    works: ["work10"],
  },
  {
    id: "worker_12",
    name: "Egor",
    works: ["work10"],
  },
  {
    id: "worker_13",
    name: "Aliona",
    works: ["work10"],
  },
  {
    id: "worker_14",
    name: "Misha",
    works: ["work10"],
  },
  {
    id: "worker_15",
    name: "Katya",
    works: ["work10"],
  },
];

// for (let i = workers.length + 1; i <= 15; i++) {
//   workers.push({
//     id: `worker_${i}`,
//     name: "test",
//     works: ["work10"]
//   });
// }

const feedbacks = [
  {
    workerId: "worker_1",
    feedbacks: [
      { rate: 5, text: "" },
      { rate: 4, text: "" },
      { rate: 5, text: "" },
    ],
  },
  {
    workerId: "worker_2",
    feedbacks: [
      { rate: 5, text: "" },
      { rate: 5, text: "" },
    ],
  },
  {
    workerId: "worker_3",
    feedbacks: [{ rate: 5, text: "" }],
  },
  {
    workerId: "worker_4",
    feedbacks: [
      { rate: 3, text: "" },
      { rate: 2, text: "" },
    ],
  },
  {
    workerId: "worker_10",
    feedbacks: [{ rate: 5, text: "" }],
  },
  {
    workerId: "worker_13",
    feedbacks: [{ rate: 2, text: "" }],
  },
  {
    workerId: "worker_11",
    feedbacks: [
      { rate: 3, text: "" },
      { rate: 2, text: "" },
    ],
  },
  {
    workerId: "worker_14",
    feedbacks: [
      { rate: 5, text: "" },
      { rate: 5, text: "" },
    ],
  },
  {
    workerId: "worker_15",
    feedbacks: [{ rate: 4, text: "" }],
  },
];

// for (let i = history.length + 1; i <= 100; i++) {
//   history.push({
//     workerId: `worker_${i}`,
//     tasks: [
//       { skill: "Boiler maintenance" },
//       { skill: "Paint fences" },
//     ],
//   });
// }

const schedule = [
  {
    workerId: "worker_1",
    scheduleEntries: [
      { date: "2024-12-26", start: 9, end: 12 },
      { date: "2024-12-26", start: 14, end: 17 },
    ],
  },
  {
    workerId: "worker_2",
    scheduleEntries: [
      { date: "2024-12-26", start: 10, end: 16 },
      { date: "2024-12-27", start: 10, end: 15 },
    ],
  },
  {
    workerId: "worker_3",
    scheduleEntries: [{ date: "2024-12-26", start: 8, end: 20 }],
  },
  {
    workerId: "worker_4",
    scheduleEntries: [
      { date: "2024-12-26", start: 7, end: 12 },
      { date: "2024-12-27", start: 13, end: 18 },
    ],
  },
  {
    workerId: "worker_5",
    scheduleEntries: [
      { date: "2024-12-26", start: 9, end: 14 },
      { date: "2024-12-27", start: 8, end: 12 },
    ],
  },
  {
    workerId: "worker_6",
    scheduleEntries: [
      { date: "2024-12-26", start: 10, end: 15 },
      { date: "2024-12-28", start: 11, end: 16 },
    ],
  },
  {
    workerId: "worker_7",
    scheduleEntries: [
      { date: "2024-12-26", start: 8, end: 12 },
      { date: "2024-12-27", start: 14, end: 19 },
    ],
  },
  {
    workerId: "worker_8",
    scheduleEntries: [
      { date: "2024-12-26", start: 9, end: 13 },
      { date: "2024-12-27", start: 10, end: 14 },
    ],
  },
  {
    workerId: "worker_9",
    scheduleEntries: [
      { date: "2024-12-26", start: 7, end: 10 },
      { date: "2024-12-27", start: 15, end: 20 },
    ],
  },
  {
    workerId: "worker_10",
    scheduleEntries: [
      { date: "2025-01-15", start: 10, end: 17 },
      { date: "2025-01-16", start: 9, end: 12 },
      { date: "2025-01-17", start: 9, end: 13 },
    ],
  },
  {
    workerId: "worker_11",
    scheduleEntries: [
      { date: "2024-12-26", start: 10, end: 13 },
      { date: "2024-12-27", start: 9, end: 12 },
      { date: "2025-01-16", start: 9, end: 10 },
      { date: "2025-01-17", start: 9, end: 14 },
    ],
  },
  {
    workerId: "worker_12",
    scheduleEntries: [
      { date: "2025-01-15", start: 10, end: 20 },
      { date: "2025-01-17", start: 9, end: 14 },
    ],
  },
  {
    workerId: "worker_13",
    scheduleEntries: [
      { date: "2025-01-15", start: 13, end: 16 },
      { date: "2025-01-16", start: 14, end: 15 },
      { date: "2025-01-17", start: 10, end: 15 },
    ],
  },
  {
    workerId: "worker_14",
    scheduleEntries: [
      { date: "2024-12-27", start: 9, end: 12 },
      { date: "2025-01-17", start: 9, end: 14 },
    ],
  },
  {
    workerId: "worker_15",
    scheduleEntries: [{ date: "2025-01-17", start: 9, end: 14 }],
  },
];

// for (let i = schedule.length + 1; i <= 100; i++) {
//   schedule.push({
//     workerId: `worker_${i}`,
//     scheduleEntries: [
//       { date: "2024-12-26", start: 8, end: 11 },
//     ],
//   });
// }

function getWorkerInfoForAI(worker) {
  const workerSchedule = schedule.find((s) => s.workerId === worker.id);

  if (workerSchedule) {
    const scheduleText = workerSchedule.scheduleEntries
      .map((entry) => `${entry.date}: ${entry.start}:00 - ${entry.end}:00`)
      .join("; ");

    return `
    Worker name: ${worker.name}
    ID: ${worker.id}
    Working time: ${scheduleText}
    Average rating: ${worker.avgRating}
  `;
  }
}

async function askGPT(message, model) {
  const completion = await openai.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: message }],
  });

  // for reading the whole prompt
  fs.writeFile("./test.txt", message, (err) => {
    if (err) {
      console.error(err);
    }
  });
  return completion.choices[0].message.content;
}

function calculateAverageRating(feedbacks) {
  const totalRating = feedbacks.reduce(
    (sum, feedback) => sum + feedback.rate,
    0
  );
  return totalRating / feedbacks.length;
}

function getWorkersByJobAndRating(workers, feedbacks, jobId) {
  const filteredWorkers = workers.filter((worker) =>
    worker.works.includes(jobId)
  );

  const workersWithRatings = filteredWorkers.map((worker) => {
    const workerFeedback = feedbacks.find(
      (feedback) => feedback.workerId === worker.id
    );
    const avgRating = workerFeedback
      ? calculateAverageRating(workerFeedback.feedbacks)
      : 0;
    return { ...worker, avgRating };
  });

  workersWithRatings.sort((a, b) => b.avgRating - a.avgRating);
  return workersWithRatings;
}

function getCurrentDate() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

function getWorkerInfo(workerIds, workers, typesOfWork, feedbacks, schedule) {
  const getWorkNames = (workIds) =>
    workIds.map((id) => typesOfWork.find((type) => type.id === id)?.name || "");

  const getAverageRating = (workerId) => {
    const workerFeedback = feedbacks.find((f) => f.workerId === workerId);
    return workerFeedback
      ? calculateAverageRating(workerFeedback.feedbacks)
      : null;
  };

  const getWorkingTime = (workerId) => {
    const workerSchedule = schedule.find((s) => s.workerId === workerId);
    if (!workerSchedule) return [];
    return workerSchedule.scheduleEntries.map((entry) => ({
      start_date: `${entry.date} ${String(entry.start).padStart(2, "0")}:00:00`,
      end_date: `${entry.date} ${String(entry.end).padStart(2, "0")}:00:00`,
    }));
  };

  return workerIds
    .map((id) => {
      const worker = workers.find((w) => w.id === id);
      if (!worker) return null;

      return {
        id: worker.id,
        name: worker.name,
        works: getWorkNames(worker.works),
        averageRating: getAverageRating(worker.id),
        workingTime: getWorkingTime(worker.id),
      };
    })
    .filter(Boolean);
}

function getSuitableWorkersIds(string) {
  const pattern = /###([a-zA-Z0-9_]+)###/g;
  const matches = [...string.matchAll(pattern)];
  return matches.map((match) => match[1]);
}

async function convertUserRequestToParams(userRequest) {
  const currentYear = new Date().getFullYear();
  const message = `Find the appropriate type of work from the list ${stringTypesOfWork.join(
    "; "
  )} that matches my request ${userRequest}.
    answer me using the template: "###{id}_{name}_{date}_{time}###", where use time format yyyy-mm-dd, if the year is not specified, use ${currentYear} only if we have the date at all. If there is no some params return null for them`;

  const gptResult = await askGPT(message, "gpt-4o");

  if (gptResult) {
    const regex = /###([^_]+)_([^_]+)_([^_]+)_([^_]+)###/;
    const match = gptResult.match(regex);

    if (match) {
      return [
        match[1], // workId
        match[2], // workName
        match[3], // startDate
        match[4], // startTime
      ];
    } else {
      return null;
    }
  }
  return null;
}

function createMessageForFindingEmployees(
  filteredAndSortedWorkers,
  startDate,
  startTime
) {
  const workersDataForAI = [];
  filteredAndSortedWorkers.forEach((worker) => {
    workersDataForAI.push(getWorkerInfoForAI(worker));
  });
  const stringDataForAI = workersDataForAI.join(";");

  const fullTimePeriod = `${
    startDate !== "null" ? startDate : getCurrentDate()
  } ${startTime !== "null" ? `at ${startTime}` : "at any time"}`;
  const timeDetails =
    startTime !== "null" ? `
  Important clarification: If the task starts later than the employee's working hours, it is necessary to ensure that its completion DOES NOT EXCEED THEIR WORKING HOURS. The task should be completed within 30 minutes from the actual start time.

  For example:
    ▪ If an employee is available from 15:00 to 18:00, and the task starts at 18:00, they are NOT SUITABLE because the task would end at 18:30, while their shift ends at 18:00.
    ▪ If an employee is available from 15:00 to 18:00, and the task starts at 17:30, they ARE SUITABLE because the task will end at 18:00.
  ` : ``;

  const partOfResponseTemplate =
    startTime !== "null"
      ? "starting from {start} and ending at {end} (since {end} is less than or equal to {end_shift_time})"
      : "because they have working hours - {working_time}";

  const message = `
  Task: Find ALL Suitable Employees
  I need to find ALL employees who are capable of performing their job ${fullTimePeriod}.
  ${timeDetails}

  Response Format:

  If suitable employees are found, arrange them in order from the highest average rating (5) to the lowest (0) and show me first five of them. 
  Respond strictly according to the template:

  "Found {count_of_suitibale_employees} employees.
    Employee 1: {name} ###{id}###. ${fullTimePeriod} ${partOfResponseTemplate}.
    Employee 2: {name} ###{id}###. ${fullTimePeriod} ${partOfResponseTemplate}.
    ...
    Employee N: {name} ###{id}###. ${fullTimePeriod} ${partOfResponseTemplate}.
  "
  
  If no suitable employees are found, respond strictly:
    "Found 0 employees. There are no available employees matching the selected criteria."

  Employees Data:
  ${stringDataForAI}
`;
  return message;
}

async function findWorkersByCriteria(req, res) {
  try {
    const { requestText } = req.body;
    if (!requestText) {
      return res.status(400).json({ error: "Request text is required" });
    }

    const [workId, workName, startDate, startTime] =
      await convertUserRequestToParams(requestText);
    if (!workId) {
      return res.status(400).json({
        error: "Unable to identify work type. Please rephrase your request.",
      });
    }

    const filteredAndSortedWorkers = getWorkersByJobAndRating(workers, feedbacks, workId);

    const messageText = createMessageForFindingEmployees(filteredAndSortedWorkers, startDate, startTime);

    const mainResult = await askGPT(messageText, "o1-preview");
    console.log(mainResult);

    // const mainResult = `Found 3 employees.
    //   Employee 1: Olga Belova ###worker_10### 2025-01-17 at any time because they have working hours - 9:00 - 13:00.
    //   Employee 2: Darya ###worker_11### 2025-01-17 at any time because they have working hours - 9:00 - 14:00.
    //   Employee 3: Aliona ###worker_13### 2025-01-17 at any time because they have working hours - 10:00 - 15:00.`;

    const pattern = /Found (\d+) employees/;
    const countOfSuitableEmployees = mainResult.match(pattern);
    const numberCount = parseInt(countOfSuitableEmployees[1]);

    if (numberCount > 0) {
      const workersIds = getSuitableWorkersIds(mainResult);
      const workersInfo = getWorkerInfo(
        workersIds,
        workers,
        typesOfWork,
        feedbacks,
        schedule
      );
      console.log(workersInfo);
      return res.json({ success: true, workers: workersInfo });
    } else {
      return res.json({
        success: true,
        message:
          "Found 0 employees. There are no available employees matching the selected criteria.",
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

(async function () {
  await findWorkersByCriteria(
    { body: "I need to sew my pants January 17" },
    res
  );
})();

app.post("/find-workers", async (req, res) => {
  return await findWorkersByCriteria(req, res);
});

const app = express();

app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
