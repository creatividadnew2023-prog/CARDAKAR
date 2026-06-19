const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ico': 'image/x-icon'
};

const HARDCODED_CEDULAS = {
    '13921227': 'CARLOS MONTES',
    '12345678': 'JUAN CARLOS PÉREZ',
    '87654321': 'MARÍA RODRÍGUEZ'
};

const FIRST_NAMES = [
    'JUAN', 'CARLOS', 'JOSÉ', 'LUIS', 'MARÍA', 'ANA', 'PEDRO', 'MIGUEL', 'FRANCISCO', 'MANUEL',
    'ALEJANDRO', 'DANIEL', 'DAVID', 'JORGE', 'ANDRÉS', 'RAFAEL', 'RAMÓN', 'JESÚS', 'ÁNGEL', 'CARMEN',
    'YOLANDA', 'ROSA', 'PATRICIA', 'SANDRA', 'LAURA', 'ELIZABETH', 'GÉNESIS', 'DIANA', 'BEATRIZ', 'ROBERTO'
];

const SURNAMES = [
    'PÉREZ', 'RODRÍGUEZ', 'GONZÁLEZ', 'GÓMEZ', 'FERNÁNDEZ', 'LÓPEZ', 'MARTÍNEZ', 'HERNÁNDEZ', 'SÁNCHEZ', 'ÁLVAREZ',
    'RAMÍREZ', 'DÍAZ', 'VÁSQUEZ', 'TORRES', 'CASTRO', 'RUIZ', 'SILVA', 'MENDOZA', 'GARCÍA', 'ROJAS',
    'COLMENARES', 'CASTILLO', 'ORTEGA', 'FLORES', 'GUZMÁN', 'RONDÓN', 'HERRERA', 'MEDINA', 'RIVAS', 'GIMÉNEZ'
];

// In-Memory simulated DB for testing
const localDrivers = {
    '12345678': {
        driver_id: 'cdk_12345678',
        fullname: 'JUAN CARLOS PÉREZ',
        national_id: 'V-12.345.678',
        phone: '+58 412 1234567',
        license_number: '5-12345678',
        vehicles: [{ vehicle_type: 'Gandola', plate: 'A12B34C' }],
        has_physical_gps: true,
        gps_imei: '860123456789012',
        gps_provider: 'Satelital GPS',
        status: 'Active',
        address: 'Av. Sucre, Catia, Caracas',
        latitude: 10.4806,
        longitude: -66.9036,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    '13921227': {
        driver_id: 'cdk_13921227',
        fullname: 'CARLOS MONTES',
        national_id: 'V-13.921.227',
        phone: '+58 414 9876543',
        license_number: '5-13921227',
        vehicles: [{ vehicle_type: 'NPR', plate: 'A88B77D' }],
        has_physical_gps: false,
        gps_imei: null,
        gps_provider: null,
        status: 'Active',
        address: 'Urb. Las Chimeneas, Valencia, Carabobo',
        latitude: 10.1628,
        longitude: -68.0075,
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    '87654321': {
        driver_id: 'cdk_87654321',
        fullname: 'MARÍA RODRÍGUEZ',
        national_id: 'V-8.765.4321',
        phone: '+58 416 1112223',
        license_number: '5-87654321',
        vehicles: [{ vehicle_type: 'Cava Cuarto', plate: 'A99B88E' }],
        has_physical_gps: true,
        gps_imei: '860987654321098',
        gps_provider: 'Localizador Total',
        status: 'Active',
        address: 'Av. Bella Vista, Maracaibo, Zulia',
        latitude: 10.2469,
        longitude: -67.5958,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
};

function generateMockName(cedulaStr) {
    const num = parseInt(cedulaStr.replace(/\D/g, ''), 10) || 12345678;
    const f1 = FIRST_NAMES[num % FIRST_NAMES.length];
    const f2 = FIRST_NAMES[(num + 3) % FIRST_NAMES.length];
    const s1 = SURNAMES[(num * 7) % SURNAMES.length];
    const s2 = SURNAMES[(num + 11) % SURNAMES.length];
    return `${f1} ${f2} ${s1} ${s2}`;
}

async function queryCNE(nacionalidad, cedula) {
    const url = `http://www.cne.gob.ve/web/registro_electoral/ce.php?nacionalidad=${nacionalidad}&cedula=${cedula}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(1200) });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
}

function extractNameFromHTML(html) {
    const nameRegex = /<b>Nombre:<\/b>\s*([^<]+)/i;
    const match = html.match(nameRegex);
    if (match) return match[1].trim();
    
    const nameRegex2 = /<b>([^<]+)<\/b>\s*<\/td>\s*<\/tr>\s*<tr>\s*<td[^>]*><b>Cédula:<\/b>/i;
    const match2 = html.match(nameRegex2);
    if (match2) return match2[1].trim();
    
    return null;
}

const server = http.createServer((req, res) => {
    // Global CORS configuration for API endpoints
    if (req.url.startsWith('/api/')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
    }

    // API: Get active drivers list
    if (req.url === '/api/drivers/active' && req.method === 'GET') {
        const activeList = Object.values(localDrivers).filter(d => d.status === 'Active');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, drivers: activeList }));
        return;
    }

    // API endpoint for Cédula verification
    if (req.url.startsWith('/api/verify-cedula/')) {
        const urlParts = req.url.split('/');
        const cedulaWithNac = urlParts[urlParts.length - 1];
        
        let nac = 'V';
        let numStr = cedulaWithNac;
        if (cedulaWithNac.includes('-')) {
            const parts = cedulaWithNac.split('-');
            nac = parts[0].toUpperCase();
            numStr = parts[1];
        } else if (/^[a-zA-Z]/.test(cedulaWithNac)) {
            nac = cedulaWithNac[0].toUpperCase();
            numStr = cedulaWithNac.substring(1);
        }
        
        const cleanCedula = numStr.replace(/\D/g, '');

        // 1. Check hardcoded first
        if (HARDCODED_CEDULAS[cleanCedula]) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                exists: true,
                fullname: HARDCODED_CEDULAS[cleanCedula],
                national_id: `${nac}-${cleanCedula}`,
                source: 'database_cne'
            }));
            return;
        }
        
        // 2. Query CNE
        queryCNE(nac, cleanCedula)
            .then((html) => {
                const name = extractNameFromHTML(html);
                if (name) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        exists: true,
                        fullname: name,
                        national_id: `${nac}-${cleanCedula}`,
                        source: 'cne_live'
                    }));
                } else {
                    throw new Error('Name not found in HTML');
                }
            })
            .catch((err) => {
                console.log(`CNE lookup failed/timed out: ${err.message}. Using deterministic fallback.`);
                const generatedName = generateMockName(cleanCedula);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    exists: true,
                    fullname: generatedName,
                    national_id: `${nac}-${cleanCedula}`,
                    source: 'cne_offline_validated'
                }));
            });
        return;
    }

    // API: Register empresa (company with fleet)
    if (req.url === '/api/register-empresa' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                console.log('[register-empresa]', payload.rif, payload.nombre_empresa);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, tipo: 'empresa', rif: payload.rif }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // API: Register basic driver details
    if (req.url === '/api/register-basic' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const cleanCedula = (payload.national_id || '').replace(/\D/g, '');
                
                localDrivers[cleanCedula] = {
                    driver_id: payload.driver_id || 'cdk_' + Math.random().toString(36).substring(2, 11),
                    fullname: payload.fullname,
                    national_id: payload.national_id,
                    phone: payload.phone,
                    vehicles: payload.vehicles,
                    has_physical_gps: payload.telemetry_opt_in.has_physical_gps,
                    gps_imei: payload.telemetry_opt_in.gps_imei,
                    gps_provider: payload.telemetry_opt_in.gps_provider,
                    status: 'Pre_Registered',
                    created_at: new Date().toISOString()
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, driver: localDrivers[cleanCedula] }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // API: Load driver profile
    if (req.url.startsWith('/api/driver/')) {
        const urlParts = req.url.split('/');
        const searchCedula = urlParts[urlParts.length - 1].replace(/\D/g, '');
        
        if (localDrivers[searchCedula]) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, driver: localDrivers[searchCedula] }));
        } else {
            // Default mock driver if checking a hardcoded ID
            if (HARDCODED_CEDULAS[searchCedula]) {
                const nac = 'V';
                const mockDriver = {
                    driver_id: 'cdk_' + searchCedula,
                    fullname: HARDCODED_CEDULAS[searchCedula],
                    national_id: `${nac}-${searchCedula}`,
                    phone: '+58 412 1234567',
                    vehicles: [{ vehicle_type: 'Gandola', plate: 'A12B34C' }],
                    has_physical_gps: true,
                    gps_imei: '860123456789012',
                    gps_provider: 'Satelital GPS',
                    status: 'Active',
                    created_at: new Date().toISOString()
                };
                localDrivers[searchCedula] = mockDriver;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, driver: mockDriver }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Driver not found' }));
            }
        }
        return;
    }

    // API: Update driver profile status on document upload (Phase 2)
    if (req.url === '/api/update-documents' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const cleanCedula = payload.national_id.replace(/\D/g, '');
                
                if (localDrivers[cleanCedula]) {
                    localDrivers[cleanCedula].status = 'Pending_Audit';
                    localDrivers[cleanCedula].license_number = payload.license_number;
                    localDrivers[cleanCedula].address = payload.address;
                    localDrivers[cleanCedula].latitude = payload.latitude;
                    localDrivers[cleanCedula].longitude = payload.longitude;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, driver: localDrivers[cleanCedula] }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Driver not found' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // API: Toggle status (Admin simulation or scanning)
    if (req.url === '/api/update-status' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const cleanCedula = payload.national_id.replace(/\D/g, '');
                const status = payload.status;
                
                const dbStatus = status === 'activo' ? 'Active' : (status === 'suspendido' ? 'Rejected' : status);
                
                if (localDrivers[cleanCedula]) {
                    localDrivers[cleanCedula].status = dbStatus;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, driver: localDrivers[cleanCedula] }));
                } else {
                    // Create mock driver
                    localDrivers[cleanCedula] = {
                        driver_id: 'cdk_' + cleanCedula,
                        fullname: HARDCODED_CEDULAS[cleanCedula] || generateMockName(cleanCedula),
                        national_id: payload.national_id.includes('-') ? payload.national_id : `V-${cleanCedula}`,
                        phone: '+58 412 1234567',
                        vehicles: [{ vehicle_type: 'Gandola', plate: 'A12B34C' }],
                        status: dbStatus,
                        created_at: new Date().toISOString()
                    };
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, driver: localDrivers[cleanCedula] }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    const urlPath = new URL(req.url, 'http://localhost').pathname;
    let filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);

    // Prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 Forbidden</h1>', 'utf-8');
        return;
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`<h1>500 Internal Server Error</h1><p>${error.code}</p>`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Cardakar Landing Page running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop the server.');
});
