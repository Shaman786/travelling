# Wireless Debugging Guide 📲

Connect your Android device to your PC wirelessly to run and debug the app without cables.

## Method 1: The "Set & Forget" Way (Requires USB for 10s) ⚡

_Best for: Daily work. Stable connection until phone reboots._

1.  **Plug in** your phone to the PC via USB.
2.  Check that **USB Debugging** is ON in Developer Options.
3.  Run the helper script in your terminal:
    ```powershell
    .\scripts\connect-phone.ps1
    ```
4.  Wait for the success message ("Device is connected wirelessly...").
5.  **Unplug** the USB cable.
6.  You are now connected! Run the app:
    ```bash
    npx expo run:android
    ```

---

## Method 2: The "No Cable" Way (Wireless Pairing) 📡

_Best for: When you don't have a cable handy. Requires Android 11+._

1.  Ensure PC and Phone are on the **Same Wi-Fi Network**.
2.  On Phone: Go to **Settings > System > Developer Options**.
3.  Enable **Wireless debugging**.
4.  Tap on **Wireless debugging** text to open settings.
5.  Tap **Pair device with pairing code**.
6.  Note the **IP:PORT** (e.g., `192.168.1.5:40000`) and **Code** (`123456`).
7.  On PC Terminal, run:
    ```bash
    adb pair 192.168.1.5:40000 123456
    ```
8.  **Success!** Now check the main Wireless Debugging screen on phone for the **Connect IP & Port** (It is different from pair port!).
    ```bash
    adb connect 192.168.1.5:45555
    ```
    _(Replace with the actual IP:Port shown on phone screen)_

---

## Troubleshooting

- **"No Connection"**: Run `adb kill-server` then try again.
- **"Device Unauthorized"**: Check phone screen for a popup asking to "Allow Debugging".
- **"Slow Install"**: Wireless install is slower than USB. Be patient for the first build.
