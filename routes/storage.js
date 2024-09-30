const express = require('express');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const chalk = require('chalk');
const router = express.Router();
const { table } = require('table');

const config = yaml.load(fs.readFileSync('config.yml', 'utf8'));
const totalStorageBytes = config.storage_limit_gb * 1024 * 1024 * 1024;

function ensureAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        return next();
    }
    res.redirect('/login');
}

function logTableData(data, errorStyle = false) {
    const consoleWidth = process.stdout.columns || 80;
    const maxWidth = Math.min(consoleWidth - 4, 100);

    const tableConfig = {
        border: {
            topBody: errorStyle ? chalk.red('─') : chalk.blue('─'),
            topJoin: errorStyle ? chalk.red('┬') : chalk.blue('┬'),
            topLeft: errorStyle ? chalk.red('┌') : chalk.blue('┌'),
            topRight: errorStyle ? chalk.red('┐') : chalk.blue('┐'),
            bottomBody: errorStyle ? chalk.red('─') : chalk.blue('─'),
            bottomJoin: errorStyle ? chalk.red('┴') : chalk.blue('┴'),
            bottomLeft: errorStyle ? chalk.red('└') : chalk.blue('└'),
            bottomRight: errorStyle ? chalk.red('┘') : chalk.blue('┘'),
            bodyLeft: errorStyle ? chalk.red('│') : chalk.blue('│'),
            bodyRight: errorStyle ? chalk.red('│') : chalk.blue('│'),
            bodyJoin: errorStyle ? chalk.red('│') : chalk.blue('│'),
            joinBody: errorStyle ? chalk.red('─') : chalk.blue('─'),
            joinLeft: errorStyle ? chalk.red('├') : chalk.blue('├'),
            joinRight: errorStyle ? chalk.red('┤') : chalk.blue('┤'),
            joinJoin: errorStyle ? chalk.red('┼') : chalk.blue('┼')
        },
        columns: {
            0: { width: Math.floor(maxWidth * 0.3) },
            1: { width: Math.floor(maxWidth * 0.2) },
            2: { width: Math.floor(maxWidth * 0.5) }
        }
    };

    console.log(table(data, tableConfig));
}

function logOperation(operation, details) {
    const timestamp = new Date().toISOString();
    const logData = [
        [chalk.cyan('Timestamp'), chalk.cyan('Operation'), chalk.cyan('Details')],
        [chalk.white(timestamp), chalk.green(operation), chalk.yellow(details)]
    ];
    logTableData(logData);
}

function logError(operation, error) {
    const timestamp = new Date().toISOString();
    const logData = [
        [chalk.cyan('Timestamp'), chalk.cyan('Operation'), chalk.cyan('Error')],
        [chalk.white(timestamp), chalk.red(operation), chalk.yellow(error.message)]
    ];
    logTableData(logData, true);
}

router.get('/storage', ensureAuthenticated, (req, res, next) => {
    calculateStorageUsage((err, storage) => {
        if (err) {
            logError('calculating storage usage', err);
            return next(new Error('Failed to calculate storage usage'));
        }
        logOperation('Storage Calculated', `Used: ${storage.usedPercentage}%, Remaining: ${formatBytes(storage.remainingStorage)}`);
        res.json(storage);
    });
});

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function calculateStorageUsage(callback) {
    const uploadsDir = path.join(__dirname, '..', 'uploads');

    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return callback(err);
        }

        let totalSize = 0;
        let count = files.length;

        files.forEach(file => {
            fs.stat(path.join(uploadsDir, file), (err, stats) => {
                if (err) {
                    return callback(err);
                }

                totalSize += stats.size;
                count--;

                if (count === 0) {
                    const usedPercentage = (totalSize / totalStorageBytes * 100).toFixed(2);
                    const remainingStorage = totalStorageBytes - totalSize;
                    callback(null, { 
                        totalSize, 
                        usedPercentage, 
                        remainingStorage,
                        totalStorageGB: config.storage_limit_gb
                    });
                }
            });
        });

        if (files.length === 0) {
            callback(null, { 
                totalSize: 0, 
                usedPercentage: 0, 
                remainingStorage: totalStorageBytes,
                totalStorageGB: config.storage_limit_gb
            });
        }
    });
}

module.exports = router;