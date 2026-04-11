import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return NextResponse.json({ status: "ok" });
    } else {
      return NextResponse.json(
        { error: "Invalid signature" }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      { error: "Error verifying payment" }, 
      { status: 500 }
    );
  }
}
