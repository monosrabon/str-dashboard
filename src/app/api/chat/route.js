import { NextResponse } from "next/server";
import { postMessage, getProperties } from "@/lib/dataStore";

export async function POST(req) {
  try {
    const { message, guestName = "Guest", propertyId } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Save guest message
    await postMessage({
      sender: "guest",
      message: message.trim(),
      guestName,
      isAiGenerated: false,
    });

    // Generate intelligent AI response based on property rules / context
    const properties = await getProperties();
    const activeProp = propertyId ? properties.find((p) => p.id === propertyId) : properties[0];

    const lower = message.toLowerCase();
    let reply = "";

    if (lower.includes("wifi") || lower.includes("wi-fi") || lower.includes("internet")) {
      reply = `Hello ${guestName}! The WiFi network details for ${activeProp?.name || "the property"} are provided in your welcome packet. Usually network names start with "${activeProp?.name ? activeProp.name.split(" ")[0] : "Guest"}_HighSpeed". Please let us know if you need connection assistance!`;
    } else if (lower.includes("check in") || lower.includes("check-in") || lower.includes("checkin")) {
      reply = `Standard check-in begins at 3:00 PM. Digital keypad codes are generated automatically on your arrival date. If you need early check-in, please request in advance so housekeeping can prepare!`;
    } else if (lower.includes("check out") || lower.includes("check-out") || lower.includes("checkout")) {
      reply = `Standard check-out is 11:00 AM. Before departing, please ensure all trash is placed in bags, lights are switched off, and the thermostat is set to eco mode. Safe travels!`;
    } else if (lower.includes("parking") || lower.includes("car") || lower.includes("garage")) {
      reply = `Designated guest parking is available on-site. Please display any guest permit provided on your dashboard during your stay.`;
    } else if (lower.includes("towel") || lower.includes("linen") || lower.includes("blanket")) {
      reply = `Extra fresh towels and linens are located in the primary hallway closet. If you need additional replenishments, our team will gladly assist!`;
    } else if (lower.includes("recommend") || lower.includes("food") || lower.includes("restaurant") || lower.includes("eat")) {
      reply = `We'd love to share top local spots! The surrounding neighborhood has wonderful artisanal cafes and dinner spots within walking distance. Let us know what cuisine you are craving!`;
    } else {
      reply = `Thank you for reaching out, ${guestName}! We have logged your request: "${message.trim()}". Our management team is monitoring and will follow up shortly if special assistance is required.`;
    }

    // Save AI response
    const aiMsg = await postMessage({
      sender: "ai",
      message: reply,
      guestName,
      isAiGenerated: true,
    });

    return NextResponse.json({ reply: aiMsg });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
