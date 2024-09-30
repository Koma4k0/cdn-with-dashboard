const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const chalk = require('chalk');

const app = express();
const config = yaml.load(fs.readFileSync('config.yml', 'utf8'));
const PORT = config.port;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true, limit: '500mb' }));
app.use(express.static('public'));
app.use(express.static('uploads'));

app.use(session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: config.production,
        sameSite: config.production ? 'None' : 'Lax'
    }
}));

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const storageRoutes = require('./routes/storage');

app.use('/', authRoutes);
app.use('/', fileRoutes);
app.use('/api', storageRoutes);

app.use((req, res, next) => {
    res.status(404).render('error', {
        statusCode: 404,
        message: 'Page not found'
    });
});

app.use((err, req, res, next) => {
    console.error(chalk.red.bold('Error:'), chalk.red(err.stack));
    res.status(err.status || 500).render('error', {
        statusCode: err.status || 500,
        message: err.message || 'Internal Server Error'
    });
});

function printStartupMessage() {
    console.clear();
    console.log('\n');

    const consoleWidth = process.stdout.columns || 80;
    const boxWidth = Math.min(consoleWidth - 4, 100);
    const horizontalLine = '─'.repeat(boxWidth - 2);
    const emptyLine = `│${' '.repeat(boxWidth - 2)}│`;


    console.log(chalk.blue(`┌${horizontalLine}┐`));
    console.log(chalk.blue('│'), chalk.white(centerText(`CDN Storage Manager`, boxWidth - 4)), chalk.blue('│'));
    console.log(chalk.blue(`├${horizontalLine}┤`));
    console.log(chalk.blue('│'), chalk.white(centerText(`Version: ${chalk.green(require('./package.json').version)}`, boxWidth - 4)), chalk.blue('│'));
    console.log(chalk.blue('│'), chalk.white(centerText(`Node.js ${chalk.green(process.version)}`, boxWidth - 4)), chalk.blue('│'));
    console.log(chalk.blue('│'), chalk.white(centerText(`Environment: ${chalk.green(config.production ? 'Production' : 'Development')}`, boxWidth - 4)), chalk.blue('│'));
    console.log(chalk.blue(emptyLine));
    console.log(chalk.blue('│'), chalk.white(centerText(`Server running on: ${chalk.green(`http://localhost:${PORT}`)}`, boxWidth - 4)), chalk.blue('│'));
    console.log(chalk.blue(emptyLine));
    console.log(chalk.blue('│'), chalk.white(centerText(`Developed By: ${chalk.yellow('Koma4k')}`, boxWidth - 4)), chalk.blue('│'));
    console.log(chalk.blue(`└${horizontalLine}┘`));
    console.log('\n');
}

function centerText(text, width) {
    const strippedText = text.replace(/\u001b\[.*?m/g, '');
    const padding = Math.max(0, width - strippedText.length);
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

app.listen(PORT, () => {
    printStartupMessage();
});