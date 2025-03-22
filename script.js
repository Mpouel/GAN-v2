function log(message) {
    document.writeln(message + '<br>');
}

async function connectToCube() {
    try {
        log("Requesting Bluetooth Device...");
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service'] // Add specific service UUIDs if needed
        });

        log(`✅ Device Found: ${device.name}`);
        log(`🔹 ID (UUID-like): ${device.id}`);

        const server = await device.gatt.connect();
        log("🔗 Connected to GATT Server");

        const services = await server.getPrimaryServices();
        log("📡 Services:", services.map(service => service.uuid));

        for (const service of services) {
            const characteristics = await service.getCharacteristics();
            for (const char of characteristics) {
                log(`🔹 Characteristic: ${char.uuid}`);

                if (char.properties.notify || char.properties.indicate) {
                    char.addEventListener('characteristicvaluechanged', event => {
                        const value = new TextDecoder().decode(event.target.value);
                        log(`📥 Data from ${char.uuid}:`, value);
                    });
                    await char.startNotifications();
                    log(`🔔 Listening for updates from ${char.uuid}`);
                }
            }
        }
    } catch (error) {
        log("❌ Connection Error:", error);
    }
}

// Run the connection function
connectToCube();
