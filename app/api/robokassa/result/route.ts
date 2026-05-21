import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseServer } from "@/lib/supabase-server";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const outSum = String(formData.get("OutSum") || "");
    const invId = String(formData.get("InvId") || "");
    const signatureValue = String(formData.get("SignatureValue") || "").toLowerCase();

    const shpPlanId = String(formData.get("Shp_planId") || "");
    const shpUserId = String(formData.get("Shp_userId") || "");

    const password2 = process.env.ROBOKASSA_PASSWORD_2;

    if (!password2) {
      console.error("ROBOKASSA_PASSWORD_2 missing");
      return new NextResponse("ROBOKASSA_PASSWORD_2 missing", { status: 500 });
    }

    if (!outSum || !invId || !signatureValue || !shpPlanId || !shpUserId) {
      return new NextResponse("Bad request", { status: 400 });
    }

    const shpParams = `Shp_planId=${shpPlanId}:Shp_userId=${shpUserId}`;

    const expectedSignature = sha256(
      `${outSum}:${invId}:${password2}:${shpParams}`
    ).toLowerCase();

    if (signatureValue !== expectedSignature) {
      console.error("Invalid Robokassa signature", {
        invId,
        outSum,
        shpPlanId,
        shpUserId,
      });

      return new NextResponse("Invalid signature", { status: 400 });
    }

    const { data: payment, error: paymentFetchError } = await supabaseServer
      .from("payments")
      .select("*")
      .eq("inv_id", Number(invId))
      .single();

    if (paymentFetchError || !payment) {
      console.error("Payment not found", paymentFetchError);
      return new NextResponse("Payment not found", { status: 404 });
    }

    if (payment.status === "paid") {
      return new NextResponse(`OK${invId}`, { status: 200 });
    }

    if (
      payment.user_id !== shpUserId ||
      payment.plan_id !== shpPlanId ||
      Number(payment.amount) !== Number(outSum)
    ) {
      console.error("Payment data mismatch", {
        payment,
        outSum,
        invId,
        shpPlanId,
        shpUserId,
      });

      return new NextResponse("Payment mismatch", { status: 400 });
    }

    const { error: paymentUpdateError } = await supabaseServer
      .from("payments")
      .update({
        status: "paid",
      })
      .eq("inv_id", Number(invId));

    if (paymentUpdateError) {
      console.error("Payment update error:", paymentUpdateError);
      return new NextResponse("Payment update failed", { status: 500 });
    }

    const { error: subscriptionUpdateError } = await supabaseServer
      .from("subscriptions")
      .upsert(
        {
          user_id: shpUserId,
          plan_id: shpPlanId,
          status: "active",
        },
        {
          onConflict: "user_id",
        }
      );

    if (subscriptionUpdateError) {
      console.error("Subscription update error:", subscriptionUpdateError);
      return new NextResponse("Subscription update failed", { status: 500 });
    }

    return new NextResponse(`OK${invId}`, { status: 200 });
  } catch (error) {
    console.error("Robokassa result error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}