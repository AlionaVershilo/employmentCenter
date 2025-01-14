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
  }
];

for (let i = workers.length + 1; i <= 100; i++) {
  workers.push({
    id: `worker_${i}`,
    name: "test",
    skills: ["Boiler maintenance", "Mow lawns"],
  });
}

const history = [
  {
    workerId: "worker_1",
    tasks: [
      { skill: "Boiler maintenance" },
      { skill: "Mow lawns" },
    ],
  },
  {
    workerId: "worker_2",
    tasks: [
      { skill: "Mow lawns"},
      { skill: "Paint fences"},
    ],
  },
  {
    workerId: "worker_3",
    tasks: [
      { skill: "Boiler maintenance"},
      { skill: "Paint fences" },
    ],
  },
];

for (let i = history.length + 1; i <= 100; i++) {
  history.push({
    workerId: `worker_${i}`,
    tasks: [
      { skill: "Boiler maintenance" },
      { skill: "Paint fences" },
    ],
  });
}

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
  }
];

for (let i = schedule.length + 1; i <= 100; i++) {
  schedule.push({
    workerId: `worker_${i}`,
    scheduleEntries: [
      { date: "2024-12-26", start: 8, end: 11 },
    ],
  });
}

function getWorkerInfoForAI(workerId) {
  const worker = workers.find(w => w.id === workerId);
  const workerHistory = history.find(h => h.workerId === workerId);
  const workerSchedule = schedule.find(s => s.workerId === workerId);

  const tasksText = workerHistory.tasks
    .map(task => `${task.skill}: ${task.time} часов`)
    .join(', ');

  const scheduleText = workerSchedule.scheduleEntries
    .map(entry => `${entry.date}: ${entry.start}:00 - ${entry.end}:00`)
    .join(', ');

  return `
    Работник: ${worker.name}
    ID: ${worker.id}
    Навыки ${worker.name}: ${worker.skills.join(', ')}
    Скорость работы ${worker.name}: ${tasksText}
    Смены ${worker.name}: ${scheduleText}
  `;
}

async function chatWithGroq(job, date, start) {

  const dataForAI = [];
  workers.forEach(worker => {
    dataForAI.push(getWorkerInfoForAI(worker.id));
  });
  const stringDataForAI = dataForAI.join(';');

        const a = {
          messages: [
            {
              role: "system",
              content: `
            Мне нужна твоя помощь в поиске сотрдников по определенным критериям. 
            Критерии для выбора работника:
            1. Работник из данных должен иметь навык, равный ${job}.
            2. В данных об историях задач должна быть запись ${job} и время относящееся к этой работе должно быть минимально среди всех работников с этим навыком.
            Уточнение: Этот критерий должен быть привязан к текущей задаче. Минимальное время выполнения задачи должно определяться только среди работников, которые удовлетворяют всем остальным критериям, чтобы не сравнивать недоступных работников.
            3.Работник должен быть доступен в день ${date} и должен начать в ${start}, то есть это время входит в диапазон его рабочего времени, также в его истории время выполнения задачи должно укладываться в его рабочее время (time <= end - start), промежуток потраченного времени может быть в середине графика, график работы это время доступности работника, если временной слот меньше либо равно рабочему промежутку, то этот вариант подходит.
            
            Ответь строго по шаблону и ничего больше: 'Вот подходящие работники под ваши критерии: {name}, который может за {time} часов сделать {job} {date} в {start}' и так по всем работникам и замени {name}, {time}, {job}, {date}, и {start} на значения из ответа и выведи информацию о работнике в слаженном тексте имя и что он умеет (skills). Если никто не соответствует критериям, ответь строго: Cвободных работников нет по выбранным вами критериям.
            
            Вот информация по работникам
                ${stringDataForAI}
            `},
          ],
          model: 'llama-3.3-70b-versatile',
        };

        const content = a.messages[0].content;
        fs.writeFile('./test.txt', content, err => {  
          if (err) {
            console.error(err);  
        }});

  // console.log(a);
  const response = await groq.chat.completions.create(a);
  return response.choices[0].message.content;
}

async function chatWithGPT(job, date, start) {
  const dataForAI = [];
  workers.forEach(worker => {
    dataForAI.push(getWorkerInfoForAI(worker.id));
  });
  const stringDataForAI = dataForAI.join(';');

  const message =  `
  Задача: Найти подходящего работника
Мне нужно найти работника, который обладает нужным навыком (укажу ниже) и способен выполнить работу (укажу ниже) в указанное время, то есть соответствует следующим критериям:
 1 Навык: Работник должен обладать навыком "${job}".
 2 Доступность: Работник должен быть доступен и соответствовать следующим требованиям:
 ◦ Дата: ${date}
 ◦ Время начала задачи: ${start}
 ◦ Время выполнения задачи: строго укладывается в смену сотрудника, даже если задача начинается позже начала его смены.
 ▪ Важное уточнение: Если задача начинается позже начала смены, необходимо проверить, что её завершение НЕ ВЫХОДИТ ЗА ПРЕДЕЛЫ ЕГО СМЕНЫ. Например:
 ▪ Если сотрудник доступен 15:00–18:00, а задача начинается в 16:00 и занимает 3 часа, он НЕ ПОДХОДИТ, так как задача заканчивается в 19:00, а его смена заканчивается в 18:00.
 ▪ Если сотрудник доступен 15:00–18:00, а задача начинается в 16:00 и занимает 2 часа, он ПОДХОДИТ, так как задача заканчивается в 18:00.

_

Формат ответа:

Если найден подходящий работник, напишите строго по шаблону:
"Подходит: {name} ###{id}. Он может выполнить "{job}" за {time} часов {date} начиная с {start} и заканчивая в {end} (поскольку {end} меньше либо равно чем {end_shift_time}). Поскольку окончание работ меньше или равно времени окончания смены {end_shift_time} работника, мы не заставляем его возвращаться домой позже запланированного и не нарушаем закон штата.  {Здесь мы приводим данные исходные работника полностью из постановки задачи}"

Если подходящего работника нет, напишите строго:
"Свободных работников нет по выбранным критериям."

Ответ должен быть СТРОГО ПО ФОРМАТУ. НЕ НУЖНО РАЗМЫШЛЕНИЙ, МНЕ НЕ ИНТЕРЕСНЫ ДЕТАЛИ КАК ТЫ ВЫЧИСЛЯЛА ЭТО.

_

Данные сотрудников:
${stringDataForAI}

Примечания для корректного анализа:
 1 Задача начинается в ${start}. Проверьте, что завершение задачи НЕ ВЫХОДИТ ЗА РАМКИ СМЕНЫ СОТРУДНИКА, даже если начало задачи позже начала смены.
 2 Убедитесь, что работник обладает навыком "${job}".
 3 Если нет подходящего сотрудника, строго используйте шаблон: "Свободных работников нет по выбранным критериям."
 4 Если вы уверены, что работник подходит, убедитесь, что завершение задачи укладывается в его смену. Пример:
 ◦ Если задача занимает 3 часа, а смена заканчивается в 18:00, значит, задача должна завершиться не позже 18:00.
  
    `;

    const b = `Мне нужна твоя помощь в поиске сотрдников по определенным критериям. 
    Критерии для выбора работника:
    1. Работник из данных должен иметь навык, равный ${job} (job).
    2. В данных об историях задач должна быть запись ${job} (job) и время относящееся к этой работе должно быть минимально среди всех работников с этим навыком.
    Уточнение: Этот критерий должен быть привязан к текущей задаче. Минимальное время выполнения задачи должно определяться только среди работников, которые удовлетворяют всем остальным критериям, чтобы не сравнивать недоступных работников.
    3.Работник должен быть доступен в день ${date} (date) и должен начать в ${start} (start), то есть это время входит в диапазон его рабочего времени, также в его истории время выполнения задачи должно укладываться в его рабочее время (время выполнения задачи из истории <= конец рабочего дня минус start), промежуток потраченного времени может быть в середине графика, график работы это время доступности работника, если временной слот меньше либо равно рабочему промежутку, то этот вариант подходит.
    
    Ответь строго по шаблону и ничего больше: 'Вот подходящие работники под ваши критерии: {name}, который может за {time} часов сделать {job} {date} в {start}' и так по всем работникам и замени {name}, {time}, {job}, {date}, и {start} на значения из ответа и вопроса и выведи информацию о работнике в слаженном тексте имя и что он умеет (skills). Если никто не соответствует критериям, ответь строго: Cвободных работников нет по выбранным вами критериям.
    
    Вот информация по работникам
        ${stringDataForAI}`;

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

(async () => {
  const job = "Paint fences";
  const date = "2024-12-26";
  const start = '15:00';

  const result = await chatWithGPT(job, date, start);
  console.log(result);
})();


async function chatWithClaude() {
  const dataForAI = [];
  workers.forEach(worker => {
    dataForAI.push(getWorkerInfoForAI(worker.id));
  });
  const stringDataForAI = dataForAI.join(';');
  console.log(stringDataForAI);

  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1000,
    temperature: 0,
    // system: "Respond only with short poems.",
    messages: [
        {
        "role": "user",
        "content": [
            {
            "type": "text",
            "text": "Вот контекст для работы: Работник: Bob Johnson ID: worker_1 Навыки: Boiler maintenance, Mow lawns История задач: Boiler maintenance: 4 часов, Mow lawns: 2 часов График работы: 2024-12-26: с 9:00 до 12:00, 2024-12-26: с 14:00 до 17:00 ; Работник: Jane Smith ID: worker_2 Навыки: Paint fences, Mow lawns История задач: Mow lawns: 5 часов, Paint fences: 3 часов График работы: 2024-12-26: с 10:00 до 13:00, 2024-12-26: с 15:00 до 18:00 ; Работник: John Doe ID: worker_3 Навыки: Boiler maintenance, Paint fences История задач: Boiler maintenance: 1 часов, Paint fences: 2 часов График работы: 2024-12-26: с 8:00 до 11:00, 2024-12-26: с 13:00 до 16:00 Ответь строго по шаблону и ничего больше: 'Вот подходящий работник под ваши критерии - {name}, который может за {time} часов сделать {job} {date} в {start}' Замени {name}, {time}, {job}, {date}, и {start} на значения из ответа и выведи информацию о работнике в слаженном тексте имя и что он умеет (skills). Если никто не соответствует критериям, ответь строго: Cвободных работников нет по выбранным вами критериям. Критерии для выбора работника: 1. Работник из данных workers должен иметь навык, равный {job}. 2. В данных history должна быть запись, где skill == job и время (time) выполнения работы минимально. 3. Работник должен быть доступен в день {date} и время {start} входит в его рабочее време, также его время выполнения задачи (time из history) должно укладываться в его рабочее время, то есть time <= (end - start). дальше я буду лишь менять параметры job, date, start. job = 'Mow lawns'; date = '2024-12-26'; start = 14:00"
            }
        ]
        }
    ]
    });
}

const app = express();

app.use(cors({ origin: '*' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});