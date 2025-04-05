from flask import Flask, render_template, request, jsonify
import requests
import google.generativeai as genai

app = Flask(__name__)

# API Keys
GEMINI_API_KEY = "AIzaSyDlmKmQxLl-urDBUCdl8nX29SPB0EbuxYw"
WEATHER_API_KEY = "4e616e536d0673bd066d44b68b6504e9"
EXCHANGE_API_KEY = "c155b2ec5eac794a2624a973"

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

def get_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    data = requests.get(url).json()
    if data.get("main"):
        temp = data["main"]["temp"]
        desc = data["weather"][0]["description"]
        return f"{city}: {temp}°C, {desc}"
    return "Couldn't get weather. Try another city."

def get_currency_conversion(amount, from_currency, to_currency):
    url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_API_KEY}/latest/{from_currency.upper()}"
    data = requests.get(url).json()
    if data.get("result") == "success":
        rate = data["conversion_rates"].get(to_currency.upper())
        if rate:
            converted = round(amount * rate, 2)
            return f"{amount} {from_currency.upper()} ≈ {converted} {to_currency.upper()}"
    return "Currency conversion failed."

def get_gemini_response(prompt):
    travel_context = (
        "You are TravelMate, a friendly travel assistant. Give short and helpful replies. "
        "Help with travel tips, weather, currency, packing, and destinations."
    )
    full_prompt = f"{travel_context}\n\nUser: {prompt}"
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(full_prompt)
    return response.text.strip().split("\n")[0]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/get_response', methods=['POST'])
def get_response():
    user_msg = request.json.get('message', '')
    msg = user_msg.lower()

    # Weather intent
    if "weather" in msg:
        for word in user_msg.split():
            if word.istitle():
                return jsonify({'response': get_weather(word)})

    # Currency conversion intent
    if "convert" in msg and "to" in msg:
        words = user_msg.split()
        try:
            amount = float(words[1])
            from_currency = words[2]
            to_currency = words[4]
            return jsonify({'response': get_currency_conversion(amount, from_currency, to_currency)})
        except:
            return jsonify({'response': "Use format like 'convert 100 USD to INR'."})

    # Default to Gemini
    response = get_gemini_response(user_msg)
    return jsonify({'response': response})

if __name__ == '__main__':
    print("🌍 TravelMate server running...")
    app.run(debug=True)
