  
## User Task Queuing with Rate Limiting.

## Description:
This Node.js application implements a user task queuing system with rate limiting capabilities. It allows multiple users to submit tasks while ensuring that each user can only process a limited number of tasks within specific time frames. The application enforces a rate limit of one task per second and a maximum of twenty tasks per minute for each user.

## Key Features
Rate Limiting: Each user ID is restricted to a maximum of one task per second and twenty tasks per minute, ensuring fair usage and preventing abuse.
Task Queuing: Tasks that exceed the rate limit are queued and processed in the order they were received, allowing users to submit multiple requests without immediate processing.
Logging: Task completions are logged in a file, recording the user ID and timestamp for each completed task, facilitating easy monitoring and auditing.
Scalability: The application is designed to run in a clustered environment, taking advantage of Node.js's capabilities to utilize multiple CPU cores for handling concurrent requests efficiently.
Technologies Used
Node.js: The core runtime for the application.
Express: A web framework for building the API.
PM2: A process manager for Node.js applications that provides clustering and monitoring capabilities.
File System (fs): For logging task completions to a file.

## Setup Instructions
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Start the application with `pm2 start server.js -i max`.
4. Use Postman or curl to test the API at `http://localhost:3000/api/v1/task`.

## Usage
To use the API, send a POST request to /api/v1/task with a JSON body containing the user_id. 
Example request:

json
## Copy code
{
    "user_id": "123"
}

## Rate Limiting:
1 task per second, 20 tasks per minute.

## Assumptions Made
User IDs are provided as strings in the request body.
The application is expected to be deployed in a stable environment with Node.js and PM2 installed.
Proper error handling for user input is implemented to ensure the application remains robust against invalid requests.

