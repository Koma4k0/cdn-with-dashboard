VANTA.NET({
    el: "#vanta-background",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x3fff,
    backgroundColor: 0x0f1b2b,
    points: 20.00,
    maxDistance: 25.00,
    spacing: 17.00
});

MicroModal.init();

let storageChart;

function updateStorageChart(usedPercentage, totalStorageGB) {
    if (storageChart) {
        storageChart.destroy();
    }

    const ctx = document.getElementById('storage-chart').getContext('2d');
    storageChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Used', 'Available'],
            datasets: [{
                data: [usedPercentage, 100 - usedPercentage],
                backgroundColor: ['#3498db', '#ffffff'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%',
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });

    const usedGB = (usedPercentage / 100 * totalStorageGB).toFixed(2);
    const availableGB = (totalStorageGB - usedGB).toFixed(2);
    
    document.getElementById('used-storage').textContent = `${usedGB} GB`;
    document.getElementById('available-storage').textContent = `${availableGB} GB`;
    document.getElementById('total-storage').textContent = `${totalStorageGB} GB`;
}

function fetchStorageInfo() {
    fetch('/api/storage')
        .then(response => response.json())
        .then(data => {
            const usedPercentage = parseFloat(data.usedPercentage);
            const totalStorageGB = parseFloat(data.totalStorageGB);
            updateStorageChart(usedPercentage, totalStorageGB);
        })
        .catch(error => {
            console.error('Error fetching storage data:', error);
            document.getElementById('storage-remaining').textContent = 'Failed to load storage data';
        });
}

fetchStorageInfo();

function uploadFile() {
    var form = document.getElementById('upload-form');
    var formData = new FormData(form);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    var progressBar = document.getElementById('upload-progress');
    var progressContainer = progressBar.parentElement;
    progressContainer.style.display = 'block';

    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            var percentComplete = Math.floor((e.loaded / e.total) * 100);
            progressBar.style.width = percentComplete + '%';
            progressBar.setAttribute('aria-valuenow', percentComplete);
            progressBar.textContent = percentComplete + '%';
        }
    };

    xhr.onload = function() {
        if (xhr.status === 200) {
            progressBar.classList.remove('progress-bar-animated');
            progressBar.classList.add('bg-success');
            progressBar.textContent = 'Upload Complete!';
            gsap.to(progressBar, {width: '100%', duration: 0.5, ease: 'power2.out'});
            setTimeout(() => {
                gsap.to(progressContainer, {opacity: 0, duration: 0.5, onComplete: () => {
                    window.location.reload();
                }});
            }, 1500);
        } else {
            progressBar.classList.remove('progress-bar-animated');
            progressBar.classList.add('bg-danger');
            progressBar.textContent = 'Upload Failed!';
            gsap.to(progressBar, {width: '100%', duration: 0.5, ease: 'power2.out'});
            setTimeout(() => {
                gsap.to(progressContainer, {opacity: 0, duration: 0.5});
            }, 1500);
        }
    };

    xhr.send(formData);
}

function showPreview(fileName) {
    var modalTitle = document.getElementById('previewModalTitle');
    var previewContent = document.getElementById('previewContent');
    var filePath = '/download/' + fileName;
    var fileExtension = fileName.split('.').pop().toLowerCase();

    previewContent.innerHTML = '';
    modalTitle.textContent = 'Preview of ' + fileName;

    function createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        for (const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
        return element;
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
        const img = createElement('img', {
            src: filePath,
            style: 'max-width: 100%; height: auto;'
        });
        previewContent.appendChild(img);
    }else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
        const video = createElement('video', {
            src: filePath,
            controls: '',
            style: 'max-width: 100%;'
        });
        previewContent.appendChild(video);
    } else if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
        const audio = createElement('audio', {
            src: filePath,
            controls: ''
        });
        previewContent.appendChild(audio);
    } else if (fileExtension === 'pdf') {
        const embed = createElement('embed', {
            src: filePath,
            type: 'application/pdf',
            width: '100%',
            height: '600px'
        });
        previewContent.appendChild(embed);
    } else if (['txt', 'log', 'csv', 'json', 'xml', 'html', 'css', 'js'].includes(fileExtension)) {
        fetch(filePath)
            .then(response => response.text())
            .then(text => {
                const pre = createElement('pre', {
                    style: 'white-space: pre-wrap; word-break: break-word; max-height: 400px; overflow-y: auto;'
                });
                pre.textContent = text;
                previewContent.appendChild(pre);
            })
            .catch(error => {
                console.error('Error loading the text file:', error);
                previewContent.textContent = 'Error loading file content.';
            });
    } else {
        const p = createElement('p');
        p.textContent = 'Preview not available for this file type.';
        const a = createElement('a', {
            href: filePath,
            download: fileName
        });
        a.textContent = 'Download the file';
        p.appendChild(a);
        previewContent.appendChild(p);
    }

    MicroModal.show('previewModal');
}

function shareLink(fileName, buttonId) {
    let path = window.location.origin + fileName;
    navigator.clipboard.writeText(path).then(() => {
        const button = document.getElementById(buttonId);
        button.classList.remove('btn-dark');
        button.classList.add('btn-success');
        button.innerHTML = '<i class="fas fa-check me-1"></i>';

        setTimeout(() => {
            button.classList.remove('btn-success');
            button.classList.add('btn-dark');
            button.innerHTML = '<i class="fas fa-share-alt me-1"></i>';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy CDN link.');
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('.card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

document.getElementById('fileSearch').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const fileName = row.querySelector('td:first-child').textContent.toLowerCase();
        if (fileName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});