const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let gameRooms = {}; // To store game rooms

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        const data = JSON.parse(message);

        if (data.action === 'createGame') {
            const { name, gameId } = data;

            // Create new room if it doesn't exist
            if (!gameRooms[gameId]) {
                gameRooms[gameId] = {
                    players: [],
                    currentTurn: 0,
                    squares: [], // Initialize squares for the game
                };
            }

            // Check if player already exists in the game room
            const existingPlayer = gameRooms[gameId].players.find(player => player.name === name);
            if (existingPlayer) {
                ws.send(JSON.stringify({ error: "Player name already exists in this game." }));
                return;
            }

            // Add player to game room
            gameRooms[gameId].players.push({ name: name, money: 1500, position: 0 });

            // Send updated state to all players in the game room
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(gameRooms[gameId]));
                }
            });
        }

        if (data.action === 'joinGame') {
            const { name, gameId } = data;

            // Check if gameId exists
            if (gameRooms[gameId]) {
                // Check if player already exists in the game room
                const existingPlayer = gameRooms[gameId].players.find(player => player.name === name);
                if (existingPlayer) {
                    ws.send(JSON.stringify({ error: "Player name already exists in this game." }));
                    return;
                }

                // Add player to game room
                gameRooms[gameId].players.push({ name: name, money: 1500, position: 0 });

                // Send updated state to all players in the game room
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(gameRooms[gameId]));
                    }
                });
            } else {
                ws.send(JSON.stringify({ error: "Game ID does not exist." }));
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        // Optional: Handle player disconnection and update game state if necessary
    });
});

server.listen(1611, () => {
    console.log('Server is listening on port 1611');
});
