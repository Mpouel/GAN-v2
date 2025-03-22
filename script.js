function log(message) {
    document.writeln(message);
}

async function connectToCube() {
    try {
        console.log("Requesting Bluetooth Device...");
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service'] // Add specific service UUIDs if needed
        });

        console.log(`✅ Device Found: ${device.name}`);
        console.log(`🔹 ID (UUID-like): ${device.id}`);

        const server = await device.gatt.connect();
        console.log("🔗 Connected to GATT Server");

        const services = await server.getPrimaryServices();
        console.log("📡 Services:", services.map(service => service.uuid));

        for (const service of services) {
            const characteristics = await service.getCharacteristics();
            for (const char of characteristics) {
                console.log(`🔹 Characteristic: ${char.uuid}`);

                if (char.properties.notify || char.properties.indicate) {
                    char.addEventListener('characteristicvaluechanged', event => {
                        const value = new TextDecoder().decode(event.target.value);
                        console.log(`📥 Data from ${char.uuid}:`, value);
                    });
                    await char.startNotifications();
                    console.log(`🔔 Listening for updates from ${char.uuid}`);
                }
            }
        }
    } catch (error) {
        console.error("❌ Connection Error:", error);
    }
}

// Run the connection function
connectToCube();
