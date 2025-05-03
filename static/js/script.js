document.addEventListener('DOMContentLoaded', () => {
    // Initialize Leaflet map
    const map = L.map('map').setView([30.4384, -84.3074], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Define custom icons
    const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });

    const blueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });

    // Function to format date (e.g., "07012025" to "July 1st, 2025")
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === 'N/A') return 'N/A';
        const month = parseInt(dateStr.slice(0, 2)) - 1;
        const day = parseInt(dateStr.slice(2, 4));
        const year = dateStr.slice(4);
        const date = new Date(year, month, day);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Function to open image viewer
    const openImageViewer = (images, selectedIndex) => {
        if (!images || images.length === 0) return;
        const viewer = document.createElement('div');
        viewer.className = 'image-viewer';
        viewer.innerHTML = `
            <button class="viewer-close"><i class="material-icons">close</i></button>
            <div class="viewer-main">
                <img src="${images[selectedIndex]}" alt="Main Image" class="main-image">
            </div>
            <div class="viewer-thumbnails">
                ${images.map((img, index) => `
                    <img src="${img}" alt="Thumbnail" class="viewer-thumbnail ${index === selectedIndex ? 'active' : ''}" data-index="${index}">
                `).join('')}
            </div>
        `;
        document.body.appendChild(viewer);

        // Close viewer
        viewer.querySelector('.viewer-close').addEventListener('click', () => {
            document.body.removeChild(viewer);
        });

        // Thumbnail click to update main image
        viewer.querySelectorAll('.viewer-thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const index = parseInt(thumb.dataset.index);
                viewer.querySelector('.main-image').src = images[index];
                viewer.querySelectorAll('.viewer-thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    };

    // Function to update sidebar for non-work pins
    const updateSidebar = (item) => {
        const aptNumber = item.apt_number && item.apt_number !== 'N/A' ? `, ${item.apt_number}` : '';
        const itemImages = Array.isArray(item.images) ? item.images : [];

        const sidebar = document.querySelector('.sidebar');
        sidebar.innerHTML = `
            <h2 class="sidebar-header">
                <i class="material-icons">home</i>
                ${item.address}${aptNumber}, Tallahassee, FL
            </h2>
            <div class="sidebar-content">
                <div class="sidebar-section">
                    <div><i class="material-icons">attach_money</i> Price: ${item.price || 'N/A'}</div>
                    <div><i class="material-icons">bed</i> Beds: ${item.beds || 'N/A'}</div>
                    <div><i class="material-icons">bathtub</i> Baths: ${item.baths || 'N/A'}</div>
                    <div><i class="material-icons">square_foot</i> Sqft: ${item.sqft || 'N/A'}</div>
                </div>
                <div class="sidebar-section">
                    <div><i class="material-icons">fingerprint</i> ID: ${item.id || 'N/A'}</div>
                    <div><i class="material-icons">category</i> Category: ${item.category || 'N/A'}</div>
                    <div><i class="material-icons">star</i> EOAS: ${item.eoas || 'N/A'} miles</div>
                    <div><i class="material-icons">star_border</i> Gables: ${item.gables || 'N/A'} miles</div>
                </div>
            </div>
            <div class="sidebar-dates">
                <span><i class="material-icons">event_available</i> Available: ${formatDate(item.avail_date)}</span>
                <span><i class="material-icons">event_note</i> Listed: ${formatDate(item.listed_date)}</span>
            </div>
            <div class="sidebar-thumbnails">
                ${itemImages.length > 0 ? itemImages.map(img => `
                    <img src="${img}" alt="Thumbnail" class="sidebar-thumbnail">
                `).join('') : '<p>No images available</p>'}
            </div>
        `;

        // Add click events to thumbnails
        sidebar.querySelectorAll('.sidebar-thumbnail').forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                openImageViewer(itemImages, index);
            });
        });
    };

    // Fetch data
    fetch('static/json/data.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load data.json');
            return response.json();
        })
        .then(data => {
            data.forEach(item => {
                const isWork = item.category === 'work';
                const marker = L.marker([item.lat, item.lon], {
                    icon: isWork ? redIcon : blueIcon
                }).addTo(map);

                // Create popup content
                let popupContent;
                if (isWork) {
                    popupContent = `<b>${item.address}, Tallahassee, FL</b>`;
                } else {
                    const aptNumber = item.apt_number && item.apt_number !== 'N/A' ? `, ${item.apt_number}` : '';
                    popupContent = `
                        <div class="popup-container">
                            <h3>${item.address}${aptNumber}, Tallahassee, FL</h3>
                            <table class="popup-table">
                                <tr>
                                    <td>
                                        <div><i class="material-icons">attach_money</i> Price: ${item.price || 'N/A'}</div>
                                        <div><i class="material-icons">bed</i> Beds: ${item.beds || 'N/A'}</div>
                                        <div><i class="material-icons">bathtub</i> Baths: ${item.baths || 'N/A'}</div>
                                        <div><i class="material-icons">square_foot</i> Sqft: ${item.sqft || 'N/A'}</div>
                                    </td>
                                    <td>
                                        <div><i class="material-icons">fingerprint</i> ID: ${item.id || 'N/A'}</div>
                                        <div><i class="material-icons">category</i> Category: ${item.category || 'N/A'}</div>
                                        <div><i class="material-icons">star</i> EOAS: ${item.eoas || 'N/A'} miles</div>
                                        <div><i class="material-icons">star_border</i> Gables: ${item.gables || 'N/A'} miles</div>
                                    </td>
                                </tr>
                            </table>
                            <div class="popup-dates">
                                <span>Available: ${formatDate(item.avail_date)}</span>
                                <span>Listed: ${formatDate(item.listed_date)}</span>
                            </div>
                        </div>
                    `;
                }

                marker.bindPopup(popupContent);

                // Add click event for non-work pins to update sidebar
                if (!isWork) {
                    marker.on('click', () => {
                        updateSidebar(item);
                    });
                }
            });
        })
        .catch(error => console.error('Error loading JSON:', error));
});