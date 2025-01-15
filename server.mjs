import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Groq from 'groq-sdk';
import fs from 'node:fs';
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";


dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
const openai = new OpenAI({ apiKey: process.env.GPT_API_KEY });

const typesOfWork = [
  { "id": "work1", "name": "Plumber" },
  { "id": "work2", "name": "Nanny" },
  { "id": "work3", "name": "Housekeeper" },
  { "id": "work4", "name": "Painter" },
  { "id": "work5", "name": "Gardener" },
  { "id": "work6", "name": "Electrician" },
  { "id": "work7", "name": "Driver" },
  { "id": "work8", "name": "Carpenter" },
  { "id": "work9", "name": "Governess" },
  { "id": "work10", "name": "Seamstress" }
];

const stringTypesOfWork = typesOfWork.map(typeOfWork => {
  return `Type of work: ${typeOfWork.name}, ID: ${typeOfWork.id}`
});

const workers = [
  {
    "id": "worker_1",
    "name": "Alexey Ivanov",
    "works": ["work1"]
  },
  {
    "id": "worker_2",
    "name": "Maria Petrova",
    "works": ["work2", "work3"]
  },
  {
    "id": "worker_3",
    "name": "Igor Sokolov",
    "works": ["work4"]
  },
  {
    "id": "worker_4",
    "name": "Anna Smirnova",
    "works": ["work5"]
  },
  {
    "id": "worker_5",
    "name": "Dmitry Karpov",
    "works": ["work6", "work7"]
  },
  {
    "id": "worker_6",
    "name": "Elena Volkova",
    "works": ["work3"]
  },
  {
    "id": "worker_7",
    "name": "Sergey Fedorov",
    "works": ["work8"]
  },
  {
    "id": "worker_8",
    "name": "Natalia Orlova",
    "works": ["work9"]
  },
  {
    "id": "worker_9",
    "name": "Andrey Pavlov",
    "works": ["work7", "work5"]
  },
  {
    "id": "worker_10",
    "name": "Olga Belova",
    "works": ["work10"]
  }
];

for (let i = workers.length + 1; i <= 15; i++) {
  workers.push({
    id: `worker_${i}`,
    name: "test",
    works: ["work10"]
  });
}

const feedbacks = [
  {
    "workerId": "worker_1",
    "feedbacks": [
      { "rate": 5, "text": "" },
      { "rate": 4, "text": "" },
      { "rate": 5, "text": "" }
    ]
  },
  {
    "workerId": "worker_2",
    "feedbacks": [
      { "rate": 5, "text": "" },
      { "rate": 5, "text": "" }
    ]
  },
  {
    "workerId": "worker_3",
    "feedbacks": [
      { "rate": 5, "text": "" }
    ]
  },
  {
    "workerId": "worker_4",
    "feedbacks": [
      { "rate": 3, "text": "" },
      { "rate": 2, "text": "" }
    ]
  },
  {
    "workerId": "worker_10",
    "feedbacks": [
      { "rate": 5, "text": "" },
    ]
  },
  {
    "workerId": "worker_11",
    "feedbacks": [
      { "rate": 3, "text": "" },
      { "rate": 2, "text": "" },
    ]
  },
  {
    "workerId": "worker_15",
    "feedbacks": [
      { "rate": 4, "text": "" },
    ]
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
    "workerId": "worker_1",
    "scheduleEntries": [
      { "date": "2024-12-26", "start": 9, "end": 12 },
      { "date": "2024-12-26", "start": 14, "end": 17 }
    ]
  },
  {
    "workerId": "worker_2",
    "scheduleEntries": [
      { "date": "2024-12-26", "start": 10, "end": 16 },
      { "date": "2024-12-27", "start": 10, "end": 15 }
    ]
  },
  {
    "workerId": "worker_3",
    "scheduleEntries": [
      { "date": "2024-12-26", "start": 8, "end": 20 }
    ]
  },
  {
    "workerId": "worker_4",
    "scheduleEntries": [
      { "date": "2024-12-26", "start": 7, "end": 12 },
      { "date": "2024-12-27", "start": 13, "end": 18 }
    ]
  },
  {
    "workerId": "worker_5",
    "scheduleEntries": [
      { "date": "2024-12-26", "start": 9, "end": 14 },
      { "date": "2024-12-27", "start": 8, "end": 12 }
    ]
  },
  {
    "workerId": "worker_6",
    "scheduleEntries": [
      { "date": "2024-12-26", "start": 10, "end": 15 },
      { "date": "2024-12-28", "start": 11, "end": 16 }
    ]
  },
  {
    "workerId": "worker_7",
    "scheduleEntries": [
      { "date": "2024-12-26", "start": 8, "end": 12 },
      { "date": "2024-12-27", "start": 14, "end": 19 }
    ]
  },
  {
    "workerId": "worker_8",
    "scheduleEntries": [
      { "date": "2024-12-26", "start": 9, "end": 13 },
      { "date": "2024-12-27", "start": 10, "end": 14 }
    ]
  },
  {
    "workerId": "worker_9",
    "scheduleEntries": [
      { "date": "2024-12-26", "start": 7, "end": 10 },
      { "date": "2024-12-27", "start": 15, "end": 20 }
    ]
  },
  {
    "workerId": "worker_10",
    "scheduleEntries": [
      { "date": "2024-12-26", "start": 10, "end": 13 },
      { "date": "2024-12-27", "start": 9, "end": 12 }
    ]
  }
];

// for (let i = schedule.length + 1; i <= 100; i++) {
//   schedule.push({
//     workerId: `worker_${i}`,
//     scheduleEntries: [
//       { date: "2024-12-26", start: 8, end: 11 },
//     ],
//   });
// }

function getWorkerInfoForAI(workerId) {
  const worker = workers.find(w => w.id === workerId);
  const workerSchedule = schedule.find(s => s.workerId === workerId);

  const scheduleText = workerSchedule.scheduleEntries
    .map(entry => `${entry.date}: ${entry.start}:00 - ${entry.end}:00`)
    .join(', ');

  return `
    Worker: ${worker.name}
    ID: ${worker.id}
    Performed works: ${worker.name}: ${worker.works.join(', ')}
    Working time: ${worker.name}: ${scheduleText}
  `;
}

// const dataForAI = [];
// workers.forEach(worker => {
//   dataForAI.push(getWorkerInfoForAI(worker.id));
// });
// const stringDataForAI = dataForAI.join(';');

async function chatWithGPT(message) {
  // console.log(await openai.models);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
        { role: "user", content: message}
    ],
  });

  const content = message;
    fs.writeFile('./test.txt', content, err => {  
      if (err) {
        console.error(err);  
      }});
  // console.log(completion.choices[0].message);
  return completion.choices[0].message.content;
}

function parseGPTResult(gptResult) {
  const regex = /^###([^_]+)_([^_]+)_(\d{4}-\d{2}-\d{2})_(\d{2}:\d{2})###$/;
  const match = gptResult.match(regex);

  if (match) {
    return [
      match[1], // workId
      match[2], // workName
      match[3], // startDate
      match[4]  // startTime
    ];
  } else {
    throw new Error("String format is invalid");
  }
}

const calculateAverageRating = (feedbacks) => {
  const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rate, 0);
  return totalRating / feedbacks.length;
};

const getWorkersByJobAndRating = (workers, feedbacks, jobId) => {
  const filteredWorkers = workers.filter(worker => worker.works.includes(jobId));

  const workersWithRatings = filteredWorkers.map(worker => {
    const workerFeedback = feedbacks.find(feedback => feedback.workerId === worker.id);
    const avgRating = workerFeedback ? calculateAverageRating(workerFeedback.feedbacks) : 0;
    return { ...worker, avgRating };
  });

  workersWithRatings.sort((a, b) => b.avgRating - a.avgRating);
  return workersWithRatings;
};


(async () => {
  const requestText = 'I need to sew my pants on January 27 at 15:00';
  const gptResult = await chatWithGPT(
    `Find the appropriate type of work from the list ${stringTypesOfWork.join('; ')} that matches my request ${requestText}.
    answer me using the template: '###{id}_{name}_{date}_{time}###', where use time format yyyy-mm-dd. If there is no some data return null for this param.`
  );
  console.log(gptResult);

  const [workId, workName, startDate, startTime] = parseGPTResult(gptResult);

  console.log(workId, workName, startDate, startTime);

  const filteredAndSortedWorkers = getWorkersByJobAndRating(workers, feedbacks, workId);
  console.log(filteredAndSortedWorkers);

  // const job = "Paint fences";
  // const date = "2024-12-26";
  // const start = '15:00';

//   const message =  `
//   Задача: Найти подходящего работника
// Мне нужно найти работника, который обладает нужным навыком (укажу ниже) и способен выполнить работу (укажу ниже) в указанное время, то есть соответствует следующим критериям:
//  1 Навык: Работник должен обладать навыком "${job}".
//  2 Доступность: Работник должен быть доступен и соответствовать следующим требованиям:
//  ◦ Дата: ${date}
//  ◦ Время начала задачи: ${start}
//  ◦ Время выполнения задачи: строго укладывается в смену сотрудника, даже если задача начинается позже начала его смены.
//  ▪ Важное уточнение: Если задача начинается позже начала смены, необходимо проверить, что её завершение НЕ ВЫХОДИТ ЗА ПРЕДЕЛЫ ЕГО СМЕНЫ. Например:
//  ▪ Если сотрудник доступен 15:00–18:00, а задача начинается в 16:00 и занимает 3 часа, он НЕ ПОДХОДИТ, так как задача заканчивается в 19:00, а его смена заканчивается в 18:00.
//  ▪ Если сотрудник доступен 15:00–18:00, а задача начинается в 16:00 и занимает 2 часа, он ПОДХОДИТ, так как задача заканчивается в 18:00.

// _

// Формат ответа:

// Если найден подходящий работник, напишите строго по шаблону:
// "Подходит: {name} ###{id}. Он может выполнить "{job}" за {time} часов {date} начиная с {start} и заканчивая в {end} (поскольку {end} меньше либо равно чем {end_shift_time}). Поскольку окончание работ меньше или равно времени окончания смены {end_shift_time} работника, мы не заставляем его возвращаться домой позже запланированного и не нарушаем закон штата.  {Здесь мы приводим данные исходные работника полностью из постановки задачи}"

// Если подходящего работника нет, напишите строго:
// "Свободных работников нет по выбранным критериям."

// Ответ должен быть СТРОГО ПО ФОРМАТУ. НЕ НУЖНО РАЗМЫШЛЕНИЙ, МНЕ НЕ ИНТЕРЕСНЫ ДЕТАЛИ КАК ТЫ ВЫЧИСЛЯЛА ЭТО.

// _

// Данные сотрудников:
// ${stringDataForAI}

// Примечания для корректного анализа:
//  1 Задача начинается в ${start}. Проверьте, что завершение задачи НЕ ВЫХОДИТ ЗА РАМКИ СМЕНЫ СОТРУДНИКА, даже если начало задачи позже начала смены.
//  2 Убедитесь, что работник обладает навыком "${job}".
//  3 Если нет подходящего сотрудника, строго используйте шаблон: "Свободных работников нет по выбранным критериям."
//  4 Если вы уверены, что работник подходит, убедитесь, что завершение задачи укладывается в его смену. Пример:
//  ◦ Если задача занимает 3 часа, а смена заканчивается в 18:00, значит, задача должна завершиться не позже 18:00.
  
//     `;

  // const result = await chatWithGPT(message);
  // console.log(result);
})();

const app = express();

app.use(cors({ origin: '*' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});