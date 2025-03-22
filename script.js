function log(message) {
    document.writeln(message);
}

async function connectToCube() {
    try {
        log("🔍 Requesting Bluetooth Device...");
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service', 'device_information']
        });

        log(`✅ Device Found: ${device.name || "Unknown Device"}`);
        log(`🔢 ID: ${device.id || "Unknown ID"}`);
        log("🔗 Connecting to GATT Server..."); 

        const server = await device.gatt.connect();

        log("📡 Getting Services...");
        const services = await server.getPrimaryServices();

        for (const service of services) {
            log(`🛠️ Service UUID: ${service.uuid}`);
            const characteristics = await service.getCharacteristics();

            for (const char of characteristics) {
                log(`   ➡️ Characteristic: ${char.uuid}`);

                // Read initial value if readable
                if (char.properties.read) {
                    const value = await char.readValue();
                    log(`      📖 Value: ${new TextDecoder().decode(value)}`);
                }

                // Subscribe to notifications
                if (char.properties.notify) {
                    await char.startNotifications();
                    char.addEventListener('characteristicvaluechanged', (event) => {
                        const value = new TextDecoder().decode(event.target.value);
                        log(`      🔔 Notification: ${value}`);
                    });
                }
            }
        }

        // Handle disconnections
        device.addEventListener('gattserverdisconnected', () => {
            log("⚠️ Device disconnected! Reconnecting...");
            connectToCube();
        });

    } catch (error) {
        log("❌ Error: " + error);
    }
}

document.querySelector("#connectButton").addEventListener("click", connectToCube);
