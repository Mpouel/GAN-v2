import { GANBluetooth } from "gan-web-bluetooth";

console.log = function (...message) {
    document.writeln(message);
}

async function connectToCube() {
    console.log('test + connect')
    try {
        console.log("🔍 Scanning for Bluetooth Cube...");

        // Initialize GAN Bluetooth
        const ganBluetooth = new GANBluetooth();
        const device = await ganBluetooth.requestDevice();

        if (!device) {
            console.log("❌ No device found.");
            return;
        }

        console.log(`✅ Device Found: ${device.name || "Unknown"}`);
        console.log(`🔢 MAC Address: ${device.address || "N/A"}`);
        console.log(`🔄 Connecting...`);

        // Connect to the device
        await ganBluetooth.connect(device);

        console.log("✅ Connected!");
        console.log(`📡 Services: ${JSON.stringify(device.services, null, 2)}`);

        // Subscribe to notifications (if supported)
        device.services.forEach(service => {
            service.characteristics.forEach(async characteristic => {
                if (characteristic.properties.notify) {
                    console.log(`📥 Subscribing to ${characteristic.uuid}...`);
                    await characteristic.startNotifications();
                    characteristic.addEventListener('characteristicvaluechanged', (event) => {
                        let value = new TextDecoder().decode(event.target.value);
                        console.log(`📊 Data from ${characteristic.uuid}: ${value}`);
                    });
                }
            });
        });

    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

document.querySelector("#connectButton").addEventListener("click", connectToCube);