const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Store task queues and timestamps for rate limiting
const userTasks = {};

const RATE_LIMIT_SECONDS = 1; // 1 task per second
const RATE_LIMIT_MINUTES = 20; // 20 tasks per minute
const taskLogFilePath = path.join(__dirname, 'task_logs.txt');

async function task(user_id) {
    const logMessage = `${user_id}-task completed at-${Date.now()}\n`;
    fs.appendFileSync(taskLogFilePath, logMessage);
}

function canProcessTask(user_id) {
    const now = Date.now();
    const tasks = userTasks[user_id] || { timestamps: [] };

    // Filter timestamps to only keep those within the last minute
    tasks.timestamps = tasks.timestamps.filter(ts => ts > now - 60 * 1000);

    // Check rate limits
    if (tasks.timestamps.length < RATE_LIMIT_MINUTES) {
        tasks.timestamps.push(now);
        userTasks[user_id] = tasks;
        return true;
    }
    return false;
}

const taskQueue = {};

function queueTask(user_id, res) {
    if (!taskQueue[user_id]) {
        taskQueue[user_id] = [];
    }
    taskQueue[user_id].push(res);
}

function processQueue(user_id) {
    const res = taskQueue[user_id].shift();
    if (res) {
        handleTask(user_id, res);
    }
}

function handleTask(user_id, res) {
    if (canProcessTask(user_id)) {
        task(user_id).then(() => {
            res.status(200).send(`Task completed for user ${user_id}`);
            processQueue(user_id);
        });
    } else {
        queueTask(user_id, res);
        res.status(429).send(`Too Many Requests for user ${user_id}`);
    }
}

app.post('/api/v1/task', (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).send('User ID is required');
    }

    handleTask(user_id, res);
});

// Start the server and enable clustering
if (require.main === module) {
    const cluster = require('cluster');
    const numCPUs = require('os').cpus().length;

    if (cluster.isMaster) {
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`);
        });
    } else {
        app.listen(PORT, () => {
            console.log(`Worker ${process.pid} started and listening on port ${PORT}`);
        });
    }
}
