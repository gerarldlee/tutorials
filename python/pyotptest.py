import pyotp
import time

# Step 1: Generate a secret key (In a real application, this would be shared between the app and the server)
# secret = pyotp.random_base32()
secret = "T6DHWBBS3MSZJNTK"
print(f"Your secret key: {secret}")

# Step 2: Create a TOTP object
totp = pyotp.TOTP(secret)

# Step 3: Generate and print an OTP
otp = totp.now()
print(f"Your OTP: {otp}")

# Step 4: Loop to continuously print the OTP every 30 seconds (the default TOTP interval)
while True:
    otp = totp.now()
    print(f"Current OTP: {otp}")
    time.sleep(30)
