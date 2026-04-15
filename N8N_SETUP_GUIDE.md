# 🧠 Complete n8n Setup & Configuration Guide

This guide explains exactly how to set up the n8n backend from scratch, what credentials to plug in, and how to configure the nodes. If you are starting fresh or sharing this project, follow these exact steps.

---

## 1. Importing the Workflow
You do not need to build the graphical nodes from scratch. The entire architecture is saved in a JSON blueprint.
1. Make sure n8n is running locally (`npx n8n`) and go to `http://localhost:5678`.
2. On your n8n dashboard, click **Add Workflow** (or "New").
3. In the top right corner, click the three dots (`...`) and select **Import from File**.
4. Upload the `dental-clinic-workflow.json` file found in this repository. The entire visual canvas will instantly populate.

---

## 2. Setting Up Google Cloud Credentials (Tools)
To allow the AI to interact with Google Sheets and Google Calendar, you must create a Google Cloud OAuth App.

### A. Create the App
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project called **"Dental Agent"**.
3. Go to **APIs & Services > Library** and enable two APIs:
   - Google Calendar API
   - Google Sheets API
4. Go to **OAuth Consent Screen** and configure it as an "External" app. Add your personal email as a test user.
5. Go to **Credentials**, click Create Credentials, and choose **OAuth client ID** (Application type: Web application).
6. Set the Authorized Redirect URI to your n8n local instance: `http://localhost:5678/rest/oauth2-credential/callback`.
7. Save and copy your **Client ID** and **Client Secret**.

### B. Link the App in n8n
1. In your n8n workflow, double click the **Google Sheets** node.
2. Next to Credential, click **Create New**. Select "OAuth2".
3. Paste the Client ID and Client Secret you got from Google.
4. Click **Sign in with Google** and approve the permissions.
5. Repeat this exact process for the **Google Calendar** node.

---

## 3. Setting Up the AI Brain (Gemini)
1. Go to [Google AI Studio](https://aistudio.google.com/) and create a free API key.
2. In n8n, double-click the **Google Gemini Chat Model** node.
3. Create a new credential and paste your new API key.
4. Select the Model: **`gemini-2.5-flash`** (or `gemini-1.5-flash`). This model is blazing fast and incredibly cheap for complex reasoning.

---

## 4. The Edge-Case Business Logic
The entire power of the agent lives in the System Prompt. In n8n, double-click the large **AI Agent** node. Delete whatever is in the "System Message" box and paste this exact protocol:

```text
You are Lumina, the professional AI receptionist for Patel Dental Clinic. Your goal is to provide a seamless, premium booking experience. 

CLINIC DETAILS: 
• Hours: Monday - Friday, 9:00 AM to 5:00 PM EST. 
• Contact: 551-222-2025 | Email: patel@dental.com
• Available Doctors: Dr. Avinash Patel, Dr. John Patel, Dr. Parth Patel, and Dr. Devisha Patel.

CONVERSATION PHASES (CRITICAL INSTRUCTION):
You must strictly follow this flow. Do not jump ahead.

PHASE 1: GREETING & MENU (Start Here)
When the user first says hello, warmly welcome them to Patel Dental Clinic. Tell them you can help with:
1. Booking a new appointment
2. Checking clinic hours/location 
3. Information about our doctors
Ask them how you can help today. DO NOT ask for any personal information yet!

PHASE 2: APPOINTMENT INTAKE (Only start this if they select Option 1)
If they want to book an appointment, begin collecting data. 
RULE: Ask ONLY ONE question at a time. Never give a list.
1. Ask for their Name. Wait for reply.
2. Ask if they are a New or Returning patient. Wait for reply.
3. Ask for their 10-digit US phone number. Wait for reply.
4. Ask for their Email. Wait for reply.
5. Ask for the specific dental service they require.

PHASE 3: SCHEDULING
Once you have their info, ask if they have a preferred doctor. Ask what day/time works for them.
You MUST ALWAYS use your Google Calendar tool to check availability before confirming a slot. 
Once agreed, explicitly use your Google Sheets tool to save their data!
```

---

## 5. Connecting the Next.js Bridge
Because the memory and AI Agent process their input exclusively from the Next.js Webhook, the node references must be manually explicitly defined to prevent routing crashes.

1. Double click the **AI Agent** node. Ensure the `Prompt (User Message)` expression is set precisely to:
   `={{ $('Webhook').item.json.body.message }}`
2. Double click the **Simple Memory** node. Change `Session ID` to "Specify Below", and set the Expression exactly to:
   `={{ $('Webhook').item.json.body.sessionId }}`

*Warning: If the Simple Memory node says "Connected Chat Trigger Node", the entire application will crash with a 500 Network Error.*

---

## 6. Going Live
1. Toggle the button near the top right of your n8n workflow to **Publish/Active**.
2. Run your Next.js application (`npm run dev`).
3. Send a message on the UI!
