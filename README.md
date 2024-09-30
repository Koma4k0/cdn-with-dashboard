<div align="center">

# CDN Storage Manager

![CDN Storage Manager Logo](/cdn_logo.png)

A powerful and flexible Content Delivery Network (CDN) solution for file storage, sharing, and management, built with Node.js and Express.

[![Version](https://img.shields.io/badge/version-1.0-blue.svg)](https://github.com/koma4k0/cdn-storage-manager/releases)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)
[![Express](https://img.shields.io/badge/Express-4.19.2-lightgrey)](https://expressjs.com/)

[Features](#-features) • [Prerequisites](#-prerequisites) • [Installation](#-installation) • [Configuration](#%EF%B8%8F-configuration) • [Usage](#%EF%B8%8F-usage) • [License](#-license)

---

## 📸 Preview

<img src="/photos/cdn_login.png" alt="CDN Login Page" width="45%">
<img src="/photos/cdn_dashboard.png" alt="CDN Dashboard" width="45%">


## 🌟 Features

- **📁 File Storage**: Securely store and manage files
- **🔗 File Sharing**: Generate shareable links for easy file distribution
- **🔐 User Authentication**: Secure access with username and password protection
- **📊 Customizable Storage Limits**: Set maximum storage capacity through configuration
- **📱 Responsive Dashboard**: Monitor and manage your CDN through a user-friendly interface
- **🔧 Environment-aware Settings**: Automatically adjust security settings based on the environment
- **🚨 Error Handling**: Comprehensive error management with custom error pages
- **📝 Logging**: Detailed console logging with color-coded messages for easy debugging

## 📋 Prerequisites

- Node.js (v18+)
- npm (Node Package Manager)
- Git
- VPS (Recommended for production use)
- Domain (Recommended for production use)
## 💻 Installation

</div>

1. Clone the repository:
   ```bash
   git clone https://github.com/Koma4k0/cdn-with-dashboard.git
   ```

2. Navigate to the project directory:
   ```bash
   cd cdn-storage-manager
   ```

3. Install dependencies:
   ```bash
   npm install
   ```
<div align="center">

## ⚙️ Configuration

</div>

1. Rename `config.yml.example` to `config.yml`:
   ```bash
   mv config.yml.example config.yml
   ```

2. Edit `config.yml` to set your desired configuration:
   ```yaml
   port: 3000
   storage_limit_gb: 1
   max_upload_size_mb: 10
   session_secret: "your_secure_random_string"
   username: "your_username"
   password: "your_secure_password"
   production: false
   ```

   - `port`: The port on which the server will run
   - `storage_limit_gb`: Maximum storage limit in gigabytes
   - `max_upload_size_mb`: Maximum upload size in megabytes
   - `session_secret`: A unique, random string used to secure session data
   - `username` and `password`: Credentials for accessing the dashboard
   - `production`: Set to `true` when deploying to a production environment or `false` when testing locally

<div align="center">

## 🏃‍♂️ Usage

</div>

1. Start the server:
   ```bash
   npm run start
   ```

2. For development with auto-restart on file changes:
   ```bash
   npm run dev
   ```

3. Access the dashboard by navigating to `http://localhost:3000` (or your configured port) in your web browser.

<div align="center">

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed with ❤️ by [Koma4k](https://koma4k.xyz/)

</div>
