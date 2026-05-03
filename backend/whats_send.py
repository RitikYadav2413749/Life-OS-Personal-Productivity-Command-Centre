import os
import sys
from dotenv import load_dotenv
from google import genai
from twilio.rest import Client

def initialize_clients():
    """Loads environment variables and initializes API clients."""
    load_dotenv()  # Reads from the .env file and sets them as OS env vars

    # --- Gemini Setup ---
    # The client automatically looks for the 'GEMINI_API_KEY' environment variable.
    gemini_client = genai.Client()

    # --- Twilio Setup ---
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    if not account_sid or not auth_token:
        raise ValueError("Twilio Account SID or Auth Token not found in environment variables.")
    
    twilio_client = Client(account_sid, auth_token)

    return gemini_client, twilio_client

def generate_gemini_response(client, prompt):
    """Generates a response from Google Gemini."""
    try:
        # 'gemini-2.5-flash' is the current model recommended by Google. 
        # You can change this to 'gemini-1.5-pro' or 'gemini-1.5-flash' if needed.
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Error generating Gemini response: {e}")
        return None

def send_whatsapp_message(twilio_client, message_body):
    """Sends a message via WhatsApp using Twilio's sandbox."""
    # --- Twilio Sandbox Configuration ---
    # Replace this with the full number of your Twilio WhatsApp Sandbox in E.164 format.
    TWILIO_WHATSAPP_NUMBER = 'whatsapp:' 
    # Replace this with your personal WhatsApp number in E.164 format.
    RECIPIENT_WHATSAPP_NUMBER = 'whatsapp:' 

    try:
        message = twilio_client.messages.create(
            from_=TWILIO_WHATSAPP_NUMBER,
            body=message_body,
            to=RECIPIENT_WHATSAPP_NUMBER
        )
        print(f"✅ WhatsApp message sent successfully! Message SID: {message.sid}")
    except Exception as e:
        print(f"❌ Error sending WhatsApp message: {e}")

if __name__ == "__main__":
    # Initialize the API clients
    try:
        gemini_client, twilio_client = initialize_clients()
    except ValueError as e:
        print(f"❌ Configuration Error: {e}")
        sys.exit(1)

    # Get user input for the prompt
    prompt = input("What would you like to ask Gemini? ")
    
    # Step 1: Generate Response with Gemini
    print("\n🤖 Gemini is thinking...")
    gemini_answer = generate_gemini_response(gemini_client, prompt)

    if not gemini_answer:
        print("Failed to get a response from Gemini, aborting.")
        sys.exit(1)

    print(f"Gemini's Response:\n{gemini_answer}")

    # Step 2: Send the Response via WhatsApp
    print("\n--- Sending the response to WhatsApp... ---")
    send_whatsapp_message(twilio_client, gemini_answer)