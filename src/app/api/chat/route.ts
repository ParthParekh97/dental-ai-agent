// @ts-nocheck
import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import { getServices, getDentists, checkAvailability, bookAppointment } from "@/lib/db";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-1.5-pro"),
    system: `You are a helpful, professional AI assistant for a premier dental clinic. 
Your job is to answer patient questions about our services, provide information about our dentists, and help patients check availability and book appointments.
Be polite, concise, and professional. 
If a patient asks to book an appointment, ALWAYS use the 'check_availability' tool first to find open slots before confirming a time.
DO NOT invent available times or dentist names. Only use information retrieved from your tools.
If a user tries to book an appointment with a dentist who is not in the system, tell them you cannot find that dentist.
Important: When making a booking, collect the patient's name and phone number before booking.`,
    messages,
    tools: {
      getServices: tool({
        description: "Get a list of dental services offered by the clinic.",
        parameters: z.object({}),
        execute: async (_args) => {
          return await getServices();
        },
      }),
      
      getDentists: tool({
        description: "Get information about the dentists working at the clinic, including their specialties and bios.",
        parameters: z.object({}),
        execute: async (_args) => {
          return await getDentists();
        },
      }),
      
      checkAvailability: tool({
        description: "Check available appointment slots. You can optionally filter by dentist name or date (YYYY-MM-DD format).",
        parameters: z.object({
          dentistName: z.string().optional().describe("First or last name of the dentist (e.g., 'Jenkins', 'Sarah')"),
          dateStr: z.string().optional().describe("Date to check availability for in YYYY-MM-DD format"),
        }),
        execute: async ({ dentistName, dateStr }: { dentistName?: string, dateStr?: string }) => {
          return await checkAvailability(dentistName, dateStr);
        },
      }),

      bookAppointment: tool({
        description: "Book an appointment for a patient. Must provide patient name, phone, dentist name, date, and time.",
        parameters: z.object({
          patientName: z.string().describe("Full name of the patient"),
          patientPhone: z.string().describe("Phone number of the patient"),
          dentistName: z.string().describe("Name of the dentist to book with"),
          dateStr: z.string().describe("Date of the appointment in YYYY-MM-DD format"),
          timeStr: z.string().describe("Time of the appointment in HH:MM format (24-hour clock)"),
        }),
        execute: async ({ patientName, patientPhone, dentistName, dateStr, timeStr }: { patientName: string, patientPhone: string, dentistName: string, dateStr: string, timeStr: string }) => {
          return await bookAppointment(patientName, patientPhone, dentistName, dateStr, timeStr);
        },
      }),
    },
  });

  return result.toTextStreamResponse();
}
