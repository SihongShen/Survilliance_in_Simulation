# Honeypot Experiment

## 1. What is it?
This project is a technical "data journalism" experiment. It functions as a Honeypot, designed to capture and visualize the invisible, automated surveillance noise that permeates the global internet infrastructure.

By opening a "vulnerable" TCP port to the public web, the project records unauthorized connection attempts from bots, scanners, and scripts. It then resolves these intrusions into geographic coordinates, mapping the physical reality of the "Instrumentarium Society" in real-time.

## 2. Technical Stack
The system is built on a dual-layer **Node.js** architecture to handle both low-level network traffic and high-level data visualization:

* **Backend (Node.js):**
    * **TCP Listener (`net` module):** Acts as the "sensor," listening for raw connection attempts on Port 2222.
    * **Geolocation Engine:** Integrated with the `ip-api` to resolve raw IP addresses into city and country metadata.
    * **Web Server (Express.js):** Hosts the dashboard and provides a JSON API endpoint (`/api/logs`) for the frontend.
    * **Data Persistence:** Uses a lightweight `attacks.json` file to store session logs.
* **Frontend (JavaScript):**
    * **Mapping Engine (Leaflet.js):** Renders an interactive, high-performance global map.
    * **CartoDB Dark Tile:** Provides a "hacker-chic" dark aesthetic consistent with themes of surveillance and state legibility.
    * **Real-time Polling:** Automatically syncs with the server every 5 seconds to update intrusion markers.



## 3. Configuration & Setup

### 3.1 Local Installation
1.  **Install dependencies:**
    ```bash
    npm install express axios cors
    ```
2.  **Start the server:**
    ```bash
    node server.js
    ```
3.  **View the Dashboard:**
    Navigate to `http://localhost:3000` in your browser.

### 3.2 Manual Testing (Simulated Intrusion)
Since local environments are protected by firewalls, you can manually trigger the honeypot to verify the mapping logic:
* **Via Terminal:** Use `nc -zv localhost 2222`
* **Via Browser:** Visit `http://localhost:2222` (The server will log the attempt and immediately close the connection).

### 3.3 Production Deployment
To capture real global traffic, deploy the project to a VPS with a public IP (e.g., DigitalOcean, AWS):
1.  **Firewall:** Ensure Ports **3000** (Visualization) and **2222** (Honeypot) are open in your provider's Security Group/UFW.
2.  **Persistence:** Use a process manager like **PM2** to keep the script running:
    ```bash
    sudo npm install pm2 -g
    pm2 start server.js
    ```