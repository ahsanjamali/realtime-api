import asyncio
import json
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import flask-cors
import websockets
import os
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Replace with the actual OpenAI realtime WebSocket endpoint.
OPENAI_WS_URL = "wss://api.openai.com/v1/realtime"
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY') # keep your key secure

async def communicate_with_openai(input_text):
    async with websockets.connect(
        OPENAI_WS_URL,
        extra_headers={"Authorization": f"Bearer {OPENAI_API_KEY}"}
    ) as ws:
        # 1. Send a session.update event.
        session_update = {
            "event_id": "event_123",
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": "Your knowledge cutoff is 2023-10. You are a helpful assistant.",
                "voice": "alloy",
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                # Removed unsupported 'input_audio_transcription' and 'max_output_tokens'
                "turn_detection": {},
                "tools": [{}],
                "tool_choice": "auto",
                "temperature": 0.8
            }
        }
        await ws.send(json.dumps(session_update))
        # Optionally, wait for a session.created/updated response here.

        # 2. Send the user's message as a conversation item.
        conversation_item = {
            "event_id": "event_345",
            "type": "conversation.item.create",
            "previous_item_id": None,
            "item": {
                "id": "msg_001",
                "type": "message",
                "status": "completed",
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": input_text
                    }
                ]
            }
        }
        await ws.send(json.dumps(conversation_item))

        # 3. Trigger a response.
        response_create = {
            "event_id": "event_234",
            "type": "response.create",
            "response": {
                "modalities": ["text", "audio"],
                "instructions": "Please assist the user.",
                "voice": "alloy",
                "output_audio_format": "pcm16",
                "tools": [{}],
                "tool_choice": "auto",
                "temperature": 0.7,
                "max_output_tokens": 150
            }
        }
        await ws.send(json.dumps(response_create))

        # 4. Process the streaming response from the API.
        full_text = ""
        audio_content = None  # Placeholder if you wish to process audio chunks.

        while True:
            message = await ws.recv()
            data = json.loads(message)

            # Look for text deltas.
            if data.get("type") == "response.text.delta":
                delta = data.get("delta", "")
                full_text += delta

            # Once the full text response is complete.
            elif data.get("type") == "response.text.done":
                break

        return full_text, audio_content

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    input_text = data.get('input', '')
    if not input_text:
        return jsonify({"error": "No input provided"}), 400

    # Run the asyncio code in a new event loop.
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        text_response, audio_response = loop.run_until_complete(communicate_with_openai(input_text))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        loop.close()

    return jsonify({"response": text_response, "audio": audio_response})

if __name__ == "__main__":
    app.run(debug=True)







