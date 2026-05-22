import OpenAI from "openai";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function startOfTodayIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function isSubscriptionExpired(currentPeriodEnd: string | null) {
  if (!currentPeriodEnd) return false;
  return new Date(currentPeriodEnd) < new Date();
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "Нужно войти в аккаунт" },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Сессия истекла. Войдите заново." },
        { status: 401 }
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

    let { data: subscription } = await supabaseServer
      .from("subscriptions")
      .select("plan_id, status, current_period_end")
      .eq("user_id", user.id)
      .single();

    if (!subscription) {
      const { data: insertedSubscription, error: insertSubscriptionError } =
        await supabaseServer
          .from("subscriptions")
          .insert({
            user_id: user.id,
            plan_id: "free",
            status: "active",
            current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .select("plan_id, status, current_period_end")
          .single();

      if (insertSubscriptionError || !insertedSubscription) {
        console.error("Subscription bootstrap error:", insertSubscriptionError);

        return NextResponse.json(
          { error: "Не удалось загрузить тариф" },
          { status: 500 }
        );
      }

      subscription = insertedSubscription;
    }

    const expired =
      subscription.plan_id !== "free" &&
      isSubscriptionExpired(subscription.current_period_end);

    if (expired) {
      const { data: downgradedSubscription, error: downgradeError } =
        await supabaseServer
          .from("subscriptions")
          .update({
            plan_id: "free",
            status: "active",
            current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .select("plan_id, status, current_period_end")
          .single();

      if (downgradeError || !downgradedSubscription) {
        console.error("Subscription downgrade error:", downgradeError);

        return NextResponse.json(
          { error: "Не удалось обновить тариф" },
          { status: 500 }
        );
      }

      subscription = downgradedSubscription;
    }

    const planId = subscription.plan_id || "free";

    const { data: plan, error: planError } = await supabaseServer
      .from("plans")
      .select("id, name, daily_limit")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      console.error("Plan load error:", planError);

      return NextResponse.json(
        { error: "Тариф не найден" },
        { status: 500 }
      );
    }

    const todayStart = startOfTodayIso();

    const { count, error: countError } = await supabaseServer
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", todayStart);

    if (countError) {
      console.error("Count generation error:", countError);

      return NextResponse.json(
        { error: "Не удалось проверить лимит генераций" },
        { status: 500 }
      );
    }

    const usedToday = count || 0;
    const dailyLimit = Number(plan.daily_limit);

    if (usedToday >= dailyLimit) {
      return NextResponse.json(
        {
          error: `Лимит генераций на сегодня исчерпан. Ваш тариф: ${plan.name}, лимит: ${dailyLimit} в день.`,
          limitReached: true,
          usedToday,
          dailyLimit,
          planId: plan.id,
          planName: plan.name,
          subscriptionEnd: subscription.current_period_end,
        },
        { status: 403 }
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

    await supabaseServer.from("generations").insert({
      user_id: user.id,
      topic,
      platform: platform || "",
      style: style || "",
      result: response.output_text,
    });

    return NextResponse.json({
      result: response.output_text,
      usedToday: usedToday + 1,
      dailyLimit,
      planId: plan.id,
      planName: plan.name,
      subscriptionEnd: subscription.current_period_end,
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