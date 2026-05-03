import sys
import os
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def get_gmail_service():
    creds = None
    token_path = 'token_gmail.pickle'
    credentials_path = r""  # <-- change if needed

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

    return build('gmail', 'v1', credentials=creds)

def main():
    max_results = 5
    if len(sys.argv) > 1:
        try:
            max_results = int(sys.argv[1])
        except ValueError:
            print("Usage: python gmail_reader_cli.py [number_of_emails]")
            sys.exit(1)

    service = get_gmail_service()

    # Fetch message list
    results = service.users().messages().list(
        userId='me', maxResults=max_results
    ).execute()
    messages = results.get('messages', [])

    if not messages:
        print("No messages found.")
        return

    print(f"📬 {len(messages)} most recent email(s):\n")
    for i, msg in enumerate(messages, 1):
        # Get full message details
        msg_data = service.users().messages().get(
            userId='me', id=msg['id'], format='metadata',
            metadataHeaders=['From', 'Subject', 'Date']
        ).execute()

        headers = {h['name']: h['value'] for h in msg_data['payload']['headers']}
        subject = headers.get('Subject', 'No Subject')
        sender = headers.get('From', 'Unknown Sender')
        date = headers.get('Date', '')

        print(f"{i}. {subject}")
        print(f"   From: {sender}")
        print(f"   Date: {date}")
        # Snippet (first few lines of the email body)
        snippet = msg_data.get('snippet', '')
        if snippet:
            print(f"   {snippet[:120]}{'...' if len(snippet)>120 else ''}")
        print("-" * 50)

if __name__ == '__main__':
    main()