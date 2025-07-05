# 🚚 VORP - Vehicle Optimal Route Planner

VORP is an advanced vehicle routing optimization platform that efficiently solves complex Vehicle Routing Problems (VRP). Designed for logistics and supply chain optimization, it combines cutting-edge algorithms with a sleek user interface to help businesses reduce costs, improve delivery efficiency, and manage fleet operations effectively.

![VORP Homepage](https://github.com/Navadeep-Reddy/ProjectScreenshots-/blob/main/VORPScreenShots/Screenshot%20From%202025-03-12%2018-54-39.png)
<p align="center"><em>Modern interface with interactive route optimization</em></p>

![Route Calculation](https://github.com/Navadeep-Reddy/ProjectScreenshots-/blob/main/VORPScreenShots/Screenshot%20From%202025-03-12%2019-12-41.png)
<p align="center"><em>Interactive route planning with capacity constraints</em></p>

![Optimized Routes](https://github.com/Navadeep-Reddy/ProjectScreenshots-/blob/main/VORPScreenShots/Screenshot%20From%202025-03-12%20at%2019.15.05.png)
<p align="center"><em>Visualized optimized routes with detailed metrics</em></p>

---

## ✨ Key Features
- **Capacitated VRP Solver:** Handles vehicle capacities and delivery demands using Google OR-Tools.
- **Interactive Map Interface:** Real-time visualization of locations, routes, and optimization results.
- **User Authentication:** Secure login with Google OAuth via Supabase.
- **Save & Load Routes:** Store and retrieve route configurations for future use.
- **Multi-Vehicle Support:** Configure multiple vehicle types with distinct capacities.
- **Depot Selection:** Set any location as the central depot.
- **Real-Time Distance Calculation:** Powered by OpenRouteService API for accurate travel metrics.

---

## 🛠️ Tech Stack
| Layer          | Technology                              |
|----------------|------------------------------------------|
| **Frontend**   | React, TypeScript, Tailwind CSS, Shadcn UI, Leaflet |
| **Backend**    | Flask, Python, Google OR-Tools           |
| **APIs**       | OpenRouteService, Geoapify               |
| **Database**   | Supabase (PostgreSQL, Authentication)    |
| **State Mgmt** | React Context API                        |

---

## 🏗️ Architecture
VORP follows a client-server model:
- **Client:** React-based SPA with responsive design and interactive maps.
- **Server:** Flask API managing optimization requests and data handling.
- **Algorithms:** Google OR-Tools for solving complex routing scenarios.

---

## 🚀 Getting Started

### Server Setup
```bash
cd VORP/server
pip install -r requirements.txt
python run.py
```
Server runs at: `http://localhost:8080`

### Client Setup
```bash
cd VORP/client
npm install
npm run dev
```
Client runs at: `http://localhost:5173`

---

## ⚡ How It Works
1. **Input Data:** Add delivery locations, demands, and vehicle fleet details.
2. **Set Constraints:** Choose a depot and configure vehicle specifications.
3. **Optimize Routes:** The system calculates efficient routes using OR-Tools.
4. **Visualize Results:** Display routes and metrics on the interactive map.
5. **Save & Share:** Store optimized routes for future reference or team collaboration.

---

## 📡 API Endpoints
### POST `/api/v1/calculate_routes`
Calculates optimal delivery routes based on input parameters.

---

## 🌱 Future Enhancements
- Support for time-window constraints
- Driver break scheduling and shift planning
- Mobile application for delivery drivers
- Real-time traffic integration
- Multi-depot optimization

---

## 📜 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
