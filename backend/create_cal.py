import os
import pickle
import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Full read/write access to Calendar
SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service():
    """Authenticate and return the Calendar API service."""
    creds = None
    token_path = 'token_calendar_rw.pickle'

    # ⚠️ Replace with YOUR credentials file path
    credentials_path = r""   # <-- change if needed

    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_path, 'wb') as token:
            pickle.dump(creds, token)

    return build('calendar', 'v3', credentials=creds)

def create_event_with_reminder(service, summary, start_time, end_time,
                               description='', reminder_minutes=10):
    """
    Create a Calendar event with a popup reminder.
    
    start_time / end_time: string in ISO format, e.g., '2026-05-03T15:00:00'
    reminder_minutes: minutes before start_time to trigger reminder.
    """
    event = {
        'summary': summary,
        'description': description,
        'start': {
            'dateTime': start_time,
            'timeZone': 'Asia/Kolkata',  # Change to your timezone
        },
        'end': {
            'dateTime': end_time,
            'timeZone': 'Asia/Kolkata',
        },
        'reminders': {
            'useDefault': False,
            'overrides': [
                {'method': 'popup', 'minutes': reminder_minutes},
                # Optional: add an email reminder
                # {'method': 'email', 'minutes': 30},
            ],
        },
    }

    created_event = service.events().insert(calendarId='primary', body=event).execute()
    return created_event

def main():
    service = get_calendar_service()

    print("=== Google Calendar Reminder Creator ===\n")
    
    summary = input("Event title: ").strip()
    if not summary:
        print("Title cannot be empty.")
        return

    # Date / time input – adjust format as you like
    date_str = input("Date (YYYY-MM-DD): ").strip()
    start_time_str = input("Start time (HH:MM, 24h): ").strip()
    end_time_str = input("End time (HH:MM, 24h): ").strip()

    description = input("Description (optional): ").strip()
    reminder_minutes = input("Reminder minutes before (default 10): ").strip()
    if not reminder_minutes:
        reminder_minutes = 10
    else:
        reminder_minutes = int(reminder_minutes)

    # Build ISO format strings
    start_iso = f"{date_str}T{start_time_str}:00"
    end_iso = f"{date_str}T{end_time_str}:00"

    try:
        event = create_event_with_reminder(
            service, summary, start_iso, end_iso, description, reminder_minutes
        )
        print("\n✅ Event created successfully!")
        print(f"   Link: {event.get('htmlLink')}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    main()