const express = require('express');
const multer = require('multer');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const chalk = require('chalk');
const router = express.Router();
const { table } = require('table');

const config = yaml.load(fs.readFileSync('config.yml', 'utf8'));
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
const upload = multer({ 
    storage: storage, 
    limits: { fileSize: config.max_upload_size_mb * 1024 * 1024 } 
});

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

// Root route
router.get('/', ensureAuthenticated, (req, res, next) => {
    fs.readdir(path.join(__dirname, '..', 'uploads'), (err, files) => {
        if (err) {
            logError('reading uploads directory', err);
            return next(new Error('Failed to read uploads directory'));
        }
        logOperation('Files Listed', `${files.length} files found`);
        res.render('index', { files });
    });
});

router.post('/upload', ensureAuthenticated, upload.single('file'), (req, res) => {
    logOperation('File Uploaded', req.file.originalname);
    res.redirect('/');
});

router.get('/delete/:filename', ensureAuthenticated, (req, res, next) => {
    const filename = req.params.filename;
    fs.unlink(path.join(__dirname, '..', 'uploads', filename), (err) => {
        if (err) {
            logError('deleting file', err);
            return next(new Error('Failed to delete the file'));
        }
        logOperation('File Deleted', filename);
        res.redirect('/');
    });
});

// View file route
router.get('/download/:filename', ensureAuthenticated, (req, res, next) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return next(new Error('File not found'));
        }
        
        res.sendFile(filePath);
    });
});

// Download file route
router.get('/api/download/:filename', ensureAuthenticated, (req, res, next) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return next(new Error('File not found'));
        }
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    });
});

module.exports = router;