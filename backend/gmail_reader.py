import os
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# If modifying scopes, delete the token.pickle file.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def get_gmail_service():
    """Authenticate and return the Gmail API service."""
    creds = None
    token_path = 'token.pickle'
    credentials_path =""

    # Load existing token if available
    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)

    # If no valid credentials, log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
        # Save for next run
        with open(token_path, 'wb') as token:
            pickle.dump(creds, token)

    return build('gmail', 'v1', credentials=creds)

def main():
    service = get_gmail_service()

    # Get the 5 most recent messages
    results = service.users().messages().list(userId='me', maxResults=5).execute()
    messages = results.get('messages', [])

    print(f"Found {len(messages)} messages.\n")
    for msg in messages:
        txt = service.users().messages().get(userId='me', id=msg['id']).execute()
        # Extract headers (subject, from, date)
        headers = {h['name']: h['value'] for h in txt['payload']['headers']}
        print(f"Subject: {headers.get('Subject', 'No Subject')}")
        print(f"From: {headers.get('From')}")
        print(f"Date: {headers.get('Date')}")
        # Get snippet
        print(f"Snippet: {txt.get('snippet', '')}\n")
        print("-" * 50)

if __name__ == '__main__':
    main()