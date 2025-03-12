// ✅ Import required modules
const http = require('http'); // Import the built-in HTTP module
const app = require('./app'); // Import the Express application instance

// ✅ Create an HTTP server using Express
const server = http.createServer(app);

// ✅ Define the port for the server (from environment variables or default to 5000)
const PORT = process.env.PORT || 5000;

// ✅ Start the server and listen on the specified port
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
