# ln-dashboard
A Lightning Network Dashboard for power users.

This project is aimed at technical lightning network routing providers who want to have a better overview over their funds,
channels and fee policies to maximize their utility as a routing node.

## Requirements
nodejs>=10,
npm>=6

## Installation
    git clone https://github.com/patricklemke/ln-dashboard
    cd ln-dashboard
    npm install
    
## Running the Dashboard
Make sure you filled in the details in the config.js file and run `npm start` in the project folder. You also need to run the server with `node src/Server/server.js`. Then navigate to localhost:3000 to view the dashboard.