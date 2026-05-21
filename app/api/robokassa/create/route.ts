import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseServer } from "@/lib/supabase-server";

const plans = {
  creator: {
    amount: 299,
    name: "Creator",
  },
  smm_pro: {
    amount: 990,
    name: "SMM Pro",
  },
} as const;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { planId, userId } = await request.json();

    const plan = plans[planId as keyof typeof plans];

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const merchantLogin = process.env.ROBOKASSA_LOGIN;
    const password1 = process.env.ROBOKASSA_PASSWORD_1;

    if (!merchantLogin || !password1) {
      return NextResponse.json(
        { error: "Robokassa env missing" },
        { status: 500 }
      );
    }

    const invId = Date.now();
    const outSum = plan.amount.toString();

    const { error: paymentError } = await supabaseServer
      .from("payments")
      .insert({
        user_id: userId,
        plan_id: planId,
        amount: plan.amount,
        inv_id: invId,
        status: "pending",
      });

    if (paymentError) {
      console.error("Payment insert error:", paymentError);

      return NextResponse.json(
        { error: "Payment create failed" },
        { status: 500 }
      );
    }

    const shpParams = `Shp_planId=${planId}:Shp_userId=${userId}`;

    const signature = sha256(
      `${merchantLogin}:${outSum}:${invId}:${password1}:${shpParams}`
    );

    const paymentUrl =
      `https://auth.robokassa.ru/Merchant/Index.aspx` +
      `?MerchantLogin=${encodeURIComponent(merchantLogin)}` +
      `&OutSum=${encodeURIComponent(outSum)}` +
      `&InvId=${encodeURIComponent(String(invId))}` +
      `&Description=${encodeURIComponent(`Тариф ${plan.name}`)}` +
      `&SignatureValue=${signature}` +
      `&Culture=ru` +
      `&Encoding=utf-8` +
      `&Shp_planId=${encodeURIComponent(planId)}` +
      `&Shp_userId=${encodeURIComponent(userId)}`;

    return NextResponse.json({
      url: paymentUrl,
    });
  } catch (error) {
    console.error("Robokassa create error:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}