console.log = function (...data) {
    data.forEach((dt) => document.writeln(String(dt) + "<br>"));
}

async function connectToCube() {
    try {
        console.log("Requesting Bluetooth Device...");
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true, // Adjust to filter by name or services
            optionalServices: ['battery_service'] // Add GAN Cube services if known
        });

        console.log("Connecting to GATT Server...");
        const server = await device.gatt.connect();

        console.log("Getting Services...");
        const services = await server.getPrimaryServices();
        
        for (const service of services) {
            console.log(`Service: ${service.uuid}`);
            const characteristics = await service.getCharacteristics();
            for (const char of characteristics) {
                console.log(`  Characteristic: ${char.uuid}`);
                
                // Read value if readable
                if (char.properties.read) {
                    const value = await char.readValue();
                    console.log(`    Value: ${new TextDecoder().decode(value)}`);
                }

                // Listen for notifications if available
                if (char.properties.notify) {
                    await char.startNotifications();
                    char.addEventListener('characteristicvaluechanged', (event) => {
                        const value = new TextDecoder().decode(event.target.value);
                        console.log(`    Notification: ${value}`);
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error: ", error);
    }
}

// Trigger connection
document.querySelector("#connectButton").addEventListener("click", connectToCube);
