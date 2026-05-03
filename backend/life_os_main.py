import base64
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')
from datetime import datetime

from dotenv import load_dotenv

# Import from YOUR existing files
import gmail_read          # for Gmail
import create_cal          # for Calendar
import whats_send          # for Gemini + Twilio

# Load environment variables (Gemini key, Twilio SID/Token)
load_dotenv()

# ============ CONFIG ============
MAX_EMAILS = 5                     # How many unread emails to process
TIMEZONE = 'Asia/Kolkata'          # Calendar timezone
DRY_RUN = False                    # Set True to skip actual Calendar/WhatsApp actions
# =================================

def get_email_text(service, msg_id):
    """Fetch the full plain‑text body of an email."""
    msg = service.users().messages().get(
        userId='me', id=msg_id, format='full'
    ).execute()
    body = ''
    if 'parts' in msg['payload']:
        for part in msg['payload']['parts']:
            if part['mimeType'] == 'text/plain':
                data = part['body']['data']
                body = base64.urlsafe_b64decode(data).decode('utf-8', errors='replace')
                break
    else:
        data = msg['payload']['body']['data']
        body = base64.urlsafe_b64decode(data).decode('utf-8', errors='replace')
    return body[:2000]  # limit length

def main():
    print("=" * 60)
    print("LIFE OS – Orchestrator (using your files)")
    print("=" * 60)

    # 1. Initialise Gemini & Twilio from whats_send
    print("\n🔐 Initialising Gemini & Twilio...")
    gemini_client, twilio_client = whats_send.initialize_clients()

    # 2. Get Gmail service (from gmail_read.py)
    print("📧 Getting Gmail service...")
    gmail_service = gmail_read.get_gmail_service()

    # 3. Get Calendar service (from create_cal.py)
    print("📅 Getting Calendar service...")
    calendar_service = create_cal.get_calendar_service()

    # 4. Fetch unread emails
    print(f"\n🔍 Searching for {MAX_EMAILS} unread emails...")
    results = gmail_service.users().messages().list(
        userId='me', q='is:unread', maxResults=MAX_EMAILS
    ).execute()
    messages = results.get('messages', [])

    if not messages:
        print("No unread emails found. Exiting.")
        return
    print(f"Found {len(messages)} email(s).")

    processed = []      # list of dicts for WhatsApp summary
    events_created = [] # list of calendar events added

    # 5. Process each email
    for msg_meta in messages:
        msg_id = msg_meta['id']
        # Get headers
        meta = gmail_service.users().messages().get(
            userId='me', id=msg_id, format='metadata',
            metadataHeaders=['From', 'Subject', 'Date']
        ).execute()
        headers = {h['name']: h['value'] for h in meta['payload']['headers']}
        subject = headers.get('Subject', 'No Subject')
        sender = headers.get('From', 'Unknown Sender')

        print(f"\n📩 Processing: {subject[:60]}...")

        # Get email body
        body = get_email_text(gmail_service, msg_id)

        # 6. Ask Gemini to analyse the email
        prompt = f"""
Analyse this email and respond ONLY with a valid JSON object (no extra text):

{{
  "simplified_summary": "one-line summary",
  "needs_calendar": true or false,
  "event_title": "short title if needed else null",
  "event_start": "ISO datetime string (YYYY-MM-DDTHH:MM:SS) or null",
  "event_end": "ISO datetime string or null",
  "reminder_minutes": integer or null
}}

Email:
Subject: {subject}
From: {sender}
Body: {body}
"""
        gemini_answer = whats_send.generate_gemini_response(gemini_client, prompt)
        if not gemini_answer:
            print("   ❌ Gemini failed – skipping email.")
            continue

        # Clean response (remove ```json fence)
        gemini_answer = gemini_answer.strip().replace('```json', '').replace('```', '')
        try:
            analysis = json.loads(gemini_answer)
        except json.JSONDecodeError:
            print("   ❌ Could not parse Gemini JSON – skipping.")
            continue

        simplified = analysis.get('simplified_summary', 'No summary')
        needs_calendar = analysis.get('needs_calendar', False)

        # 7. Create calendar event if needed
        event_link = None
        if needs_calendar and not DRY_RUN:
            event_title = analysis.get('event_title', 'Event from email')
            start_iso = analysis.get('event_start')
            end_iso = analysis.get('event_end')
            reminder = analysis.get('reminder_minutes', 10)

            if start_iso and end_iso:
                try:
                    created = create_cal.create_event_with_reminder(
                        calendar_service,
                        summary=event_title,
                        start_time=start_iso,
                        end_time=end_iso,
                        description=f"From email: {subject}",
                        reminder_minutes=reminder
                    )
                    event_link = created.get('htmlLink')
                    print(f"   📅 Calendar event created: {event_title}")
                    events_created.append({
                        'title': event_title,
                        'start': start_iso,
                        'end': end_iso,
                        'link': event_link
                    })
                except Exception as e:
                    print(f"   ❌ Calendar error: {e}")

        # Mark email as read (so we don't process it again)
        if not DRY_RUN:
            try:
                gmail_service.users().messages().modify(
                    userId='me', id=msg_id,
                    body={'removeLabelIds': ['UNREAD']}
                ).execute()
            except Exception as e:
                print(f"   ⚠️ Could not mark as read: {e}")

        processed.append({
            'subject': subject,
            'summary': simplified,
            'has_event': bool(event_link)
        })

    # 8. Build WhatsApp summary
    whatsapp_msg = "📬 *Life OS – Email Summary*\n\n"
    for i, p in enumerate(processed, 1):
        whatsapp_msg += f"{i}. *{p['subject']}*\n   {p['summary']}\n"
        if p['has_event']:
            whatsapp_msg += "   ➕ Calendar event added.\n"
        whatsapp_msg += "\n"

    if events_created:
        whatsapp_msg += "📅 *New events:*\n"
        for ev in events_created:
            whatsapp_msg += f"   – {ev['title']} ({ev['start']} → {ev['end']})\n"
            if ev.get('link'):
                whatsapp_msg += f"     🔗 Link: {ev['link']}\n"

    # 9. Send WhatsApp (or print in dry‑run)
    if DRY_RUN:
        print("\n🔇 DRY RUN – WhatsApp would contain:")
        print(whatsapp_msg)
    else:
        print("\n💬 Sending WhatsApp summary...")
        try:
            whats_send.send_whatsapp_message(twilio_client, whatsapp_msg)
            print("✅ WhatsApp message sent!")
        except Exception as e:
            print(f"❌ WhatsApp error: {e}")

    print("\n🏁 Orchestrator finished.")

if __name__ == '__main__':
    main()