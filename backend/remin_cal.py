import sys
import os
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service():
    creds = None
    token_path = 'token_calendar_rw.pickle'
    credentials_path = r""  # <-- update if different

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

def main():
    if len(sys.argv) < 5:
        print("Usage: python create_reminder_cli.py \"Title\" YYYY-MM-DD HH:MM HH:MM [minutes]")
        sys.exit(1)

    summary = sys.argv[1]
    date_str = sys.argv[2]
    start_time = sys.argv[3]
    end_time = sys.argv[4]
    reminder_minutes = int(sys.argv[5]) if len(sys.argv) > 5 else 10

    start_iso = f"{date_str}T{start_time}:00"
    end_iso = f"{date_str}T{end_time}:00"

    service = get_calendar_service()

    event = {
        'summary': summary,
        'start': {'dateTime': start_iso, 'timeZone': 'Asia/Kolkata'},
        'end': {'dateTime': end_iso, 'timeZone': 'Asia/Kolkata'},
        'reminders': {
            'useDefault': False,
            'overrides': [{'method': 'popup', 'minutes': reminder_minutes}]
        }
    }

    try:
        created = service.events().insert(calendarId='primary', body=event).execute()
        print(f"✅ Event created: {created.get('htmlLink')}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    main()