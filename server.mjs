import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Groq from 'groq-sdk';
import fs from 'node:fs';

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const workers = [
  {
    id: "worker_1",
    name: "Bob Johnson",
    skills: ["Boiler maintenance", "Mow lawns"],
  },
  {
    id: "worker_2",
    name: "Jane Smith",
    skills: ["Paint fences", "Mow lawns"],
  },
  {
    id: "worker_3",
    name: "John Doe",
    skills: ["Boiler maintenance", "Paint fences"],
  },
];

const history = [
  {
    workerId: "worker_1",
    tasks: [
      { skill: "Boiler maintenance", time: 4 },
      { skill: "Mow lawns", time: 2 },
    ],
  },
  {
    workerId: "worker_2",
    tasks: [
      { skill: "Mow lawns", time: 5 },
      { skill: "Paint fences", time: 3 },
    ],
  },
  {
    workerId: "worker_3",
    tasks: [
      { skill: "Boiler maintenance", time: 1 },
      { skill: "Paint fences", time: 2 },
    ],
  },
];

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
      { date: "2024-12-26", start: 10, end: 13 },
      { date: "2024-12-26", start: 15, end: 18 },
    ],
  },
  {
    workerId: "worker_3",
    scheduleEntries: [
      { date: "2024-12-26", start: 8, end: 11 },
      { date: "2024-12-26", start: 13, end: 16 },
    ],
  },
];

function getWorkerInfoForAI(workerId) {
  const worker = workers.find(w => w.id === workerId);
  const workerHistory = history.find(h => h.workerId === workerId);
  const workerSchedule = schedule.find(s => s.workerId === workerId);

  const tasksText = workerHistory.tasks
    .map(task => `${task.skill}: ${task.time} часов`)
    .join(', ');

  const scheduleText = workerSchedule.scheduleEntries
    .map(entry => `${entry.date}: с ${entry.start}:00 до ${entry.end}:00`)
    .join(', ');

  return `
    Работник: ${worker.name}
    ID: ${worker.id}
    Навыки: ${worker.skills.join(', ')}
    История задач: ${tasksText}
    График работы: ${scheduleText}
  `;
}

async function chatWithGroq(job, date, start) {

  const dataForAI = [];
  workers.forEach(worker => {
    dataForAI.push(getWorkerInfoForAI(worker.id));
  });
  const stringDataForAI = dataForAI.join(';');
  console.log(stringDataForAI);

  // const message = `Найди работника, который соответствует следующим критериям: 
  //       1. Имеет навык ${job};
  //       2. Есть запись в history, где skill == ${job} и time меньше всех;
  //       3. Работает в день ${date}, начиная со времени поле start ${start} и успеет до конца своего рабочего дня - поле end, то есть поле time из history будет <= end - start.
  //       и ответь строго по шаблону и ничего больше 
  //       'Вот подходящий работник под ваши критерии, который может за time часов сделать ${job} ${date} в ${start}:00' и выведи информацию о работнике в слаженном тексте типа его имя - поле name, что он умеет поле skill
  //       или если никто не соответствует критериям, то ответь 'свободных работников нет по выбранным вами критериям'`;

        const a = {
          messages: [
            {
              role: "system",
              content: `Вот контекст для работы: 
                ${stringDataForAI}
                Ответь строго по шаблону и ничего больше:
                'Вот подходящий работник под ваши критерии - {name}, который может за {time} часов сделать {job} {date} в {start}' 
                Замени {name}, {time}, {job}, {date}, и {start} на значения из ответа и выведи информацию о работнике в слаженном тексте имя и что он умеет (skills).
                Если никто не соответствует критериям, ответь строго: Cвободных работников нет по выбранным вами критериям.

                Критерии для выбора работника:
                1. Работник из данных workers должен иметь навык, равный {job}.
                2. В данных history должна быть запись, где skill == job и время (time) выполнения работы минимально.
                3. Работник должен быть доступен в день {date} и время {start} входит в его рабочее време, также его время выполнения задачи (time из history) должно укладываться в его рабочее время, то есть time <= (end - start).

                дальше я буду лишь менять параметры job, date, start
            `},
            {
              role: "user",
              content: `
                job = ${job}; date = ${date}; start = ${start}
            `},
          ],
          model: 'llama-3.3-70b-versatile',
        };

        const content = a.messages[0].content;
        fs.writeFile('./test.txt', content, err => {  if (err) {
              console.error(err);  
            }});

  console.log(a);
  const response = await groq.chat.completions.create(a);

  return response.choices[0].message.content;
}

(async () => {
  const job = "Mow lawns";
  const date = "2024-12-26";
  const start = 14;

  const result = await chatWithGroq(job, date, start);
  console.log(result);
})();

const app = express();

app.use(cors({ origin: '*' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});