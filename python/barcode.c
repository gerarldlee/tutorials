#include <stdio.h>
#include <zint.h>

int main() {
    struct zint_symbol *my_symbol;
    int error_number;

    // Create a new barcode symbol
    my_symbol = ZBarcode_Create();
    if (my_symbol == NULL) {
        printf("Error: Could not create barcode symbol\n");
        return 1;
    }

    // Set barcode type (e.g., CODE 128)
    my_symbol->symbology = BARCODE_CODE128;

    // Set barcode data
    const char *data = "1234567890";
    error_number = ZBarcode_Encode(my_symbol, (unsigned char*)data, 0);
    if (error_number != 0) {
        printf("Error: %s\n", my_symbol->errtxt);
        ZBarcode_Delete(my_symbol);
        return 1;
    }

    // Set output file name
    my_symbol->outfile = "barcode.png";

    // Render the barcode to a PNG file
    error_number = ZBarcode_Print(my_symbol, 0);
    if (error_number != 0) {
        printf("Error: %s\n", my_symbol->errtxt);
        ZBarcode_Delete(my_symbol);
        return 1;
    }

    // Free memory
    ZBarcode_Delete(my_symbol);
    
    printf("Barcode generated and saved to barcode.png\n");

    return 0;
}
