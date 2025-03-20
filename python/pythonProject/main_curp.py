

def open_csv(file_name):

    with open(file_name, 'r') as fo:
        print(fo.readline())

        # fo.write(
        #     f"INSERT INTO kyc_core.message_map (code, lang, message, db_create_time, db_modify_time) VALUES('{code}', '{lang}', '{message}', '{db_create_time}', '{db_modify_time}') ON DUPLICATE KEY UPDATE message = VALUES(message), db_create_time = VALUES(db_create_time), db_modify_time = VALUES(db_modify_time);\n")

if __name__ == '__main__':
    open_csv('curp_upload.csv')
