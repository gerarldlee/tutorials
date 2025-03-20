import barcode
from barcode.writer import ImageWriter

# Step 1: Choose the type of barcode (EAN-13 in this example)
barcode_type = 'ean13'

# Step 2: Provide the barcode data (must be 12 digits for EAN-13)
barcode_data = '123456789012'

render_options = {
                "module_width": 0.25,
                "module_height": 6,
                "write_text": False,
                "module_width": 0.25,
                "quiet_zone": 0.1,
            }

writer = ImageWriter()

# Step 3: Create the barcode object with the ImageWriter to generate an image
ean = barcode.get(barcode_type, barcode_data, writer)

ean.render(render_options)

# Step 4: Save the barcode as an image file
filename = ean.save('barcode')

print(f"Barcode saved as {filename}.png")
