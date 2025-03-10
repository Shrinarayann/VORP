
import requests
API_KEY = "483abfe40c7c4393b51a7117d14f1235"


url = f"https://api.geoapify.com/v1/batch/geocode/search?apiKey={API_KEY}"

data = [
    "Chromepet, Chennai, 600044, India",
    "Marina Beach, Chennai, 600001, India",
    "MG Road, Bengaluru, 560001, India",
    "Connaught Place, New Delhi, 110001, India",
    "Marine Drive, Mumbai, 400020, India",
    "Juhu Beach, Mumbai, 400049, India",
    "Hawa Mahal, Jaipur, 302002, India",
    "Victoria Memorial, Kolkata, 700071, India",
    "Gateway of India, Mumbai, 400001, India",
    "Taj Mahal, Agra, 282001, India",
    "Red Fort, New Delhi, 110006, India",
    "Qutub Minar, New Delhi, 110030, India",
    "Lotus Temple, New Delhi, 110019, India",
    "India Gate, New Delhi, 110001, India",
    "Charminar, Hyderabad, 500002, India",
    "Golconda Fort, Hyderabad, 500008, India",
    "Meenakshi Temple, Madurai, 625001, India",
    "Golden Temple, Amritsar, 143006, India",
    "Ajanta Caves, Aurangabad, 431001, India",
    "Ellora Caves, Aurangabad, 431005, India"
]



response = requests.post(url, json=data)
print(response)
print(response.json())

ID=response.json()['id']

while True: 
    res=requests.get(f'https://api.geoapify.com/v1/batch/geocode/search?id={ID}&apiKey={API_KEY}')
    if res.status_code==200:
        break



for item in res.json():
    lon = item['lon']
    lat = item['lat']
    print(f"Longitude: {lon}, Latitude: {lat}")


