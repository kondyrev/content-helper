import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing");

      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { topic, platform, style } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Не указана тема видео" },
        { status: 400 }
      );
    }

    const client = new OpenAI({
      apiKey,
      timeout: 30_000,
    });

    const prompt = `
Ты — опытный SMM-редактор и контент-маркетолог.

Сделай оформление для видео.

Тема видео:
${topic}

Площадка:
${platform || "не указана"}

Стиль:
${style || "универсальный"}

Выдай результат строго в такой структуре:

1. Заголовок:
2. Короткое описание:
3. SEO-описание:
4. Первый комментарий:
5. Хештеги:
6. Идеи для обложки:
7. Призыв к действию:

Пиши на русском языке.
Текст должен быть живым, полезным и без воды.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.8,
      max_output_tokens: 1200,
    });

    if (!response.output_text) {
      return NextResponse.json(
        { error: "AI вернул пустой ответ" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      result: response.output_text,
    });
  } catch (error) {
    console.error("Ошибка генерации:", error);

    return NextResponse.json(
      {
        error:
          "Не удалось сгенерировать контент. Попробуйте ещё раз через минуту.",
      },
      { status: 500 }
    );
  }
}