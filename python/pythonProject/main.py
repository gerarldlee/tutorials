import json
import urllib.request
import datetime

original_url = 'https://bin.bnbstatic.com/api/i18n/-/web/cms/{}/kyc-vendor'

# languages = ["ar", "bn-BD", "bg-BG", "zh-CN", "zh-TW", "cs-CZ", "fp-PH", "fr-FR", "ka-GE", "de-DE", "el-GR", "id-ID",
#              "it-IT", "ja-JP", "kk-KZ", "lv-LV", "pl-PL", "pt-BR", "pt-PT", "ro-RO", "ru-RU", "sk-SK", "sl-SI", "es-LA",
#              "es-ES", "sv-SE", "tr-TR", "uk-UA", "ur-PK", "vi-VN", "nl-NL", "cn"]

languages = ["en"]

SUMSUB_CODES = ["SUMSUB_SDK_FORGERY",
                "SUMSUB_SDK_DOCUMENT_TEMPLATE",
                "SUMSUB_SDK_LOW_QUALITY",
                "SUMSUB_SDK_SPAM",
                "SUMSUB_SDK_NOT_DOCUMENT",
                "SUMSUB_SDK_SELFIE_MISMATCH",
                "SUMSUB_SDK_ID_INVALID",
                "SUMSUB_SDK_FOREIGNER",
                "SUMSUB_SDK_BAD_AVATAR",
                "SUMSUB_SDK_DUPLICATE",
                "SUMSUB_SDK_WRONG_USER_REGION",
                "SUMSUB_SDK_INCOMPLETE_DOCUMENT",
                "SUMSUB_SDK_BLACKLIST",
                "SUMSUB_SDK_UNSATISFACTORY_PHOTOS",
                "SUMSUB_SDK_DOCUMENT_PAGE_MISSING",
                "SUMSUB_SDK_DOCUMENT_DAMAGED",
                "SUMSUB_SDK_REGULATIONS_VIOLATIONS",
                "SUMSUB_SDK_INCONSISTENT_PROFILE",
                "SUMSUB_SDK_PROBLEMATIC_APPLICANT_DATA",
                "SUMSUB_SDK_ADDITIONAL_DOCUMENT_REQUIRED",
                "SUMSUB_SDK_AGE_REQUIREMENT_MISMATCH",
                "SUMSUB_SDK_EXPERIENCE_REQUIREMENT_MISMATCH",
                "SUMSUB_SDK_CRIMINAL",
                "SUMSUB_SDK_WRONG_ADDRESS",
                "SUMSUB_SDK_GRAPHIC_EDITOR",
                "SUMSUB_SDK_DOCUMENT_DEPRIVED",
                "SUMSUB_SDK_COMPROMISED_PERSONS",
                "SUMSUB_SDK_PEP",
                "SUMSUB_SDK_ADVERSE_MEDIA",
                "SUMSUB_SDK_FRAUDULENT_PATTERNS",
                "SUMSUB_SDK_SANCTIONS",
                "SUMSUB_SDK_NOT_ALL_CHECKS_COMPLETED",
                "SUMSUB_SDK_FRONT_SIDE_MISSING",
                "SUMSUB_SDK_BACK_SIDE_MISSING",
                "SUMSUB_SDK_SCREENSHOTS",
                "SUMSUB_SDK_BLACK_AND_WHITE",
                "SUMSUB_SDK_INCOMPATIBLE_LANGUAGE",
                "SUMSUB_SDK_EXPIRATION_DATE",
                "SUMSUB_SDK_UNFILLED_ID",
                "SUMSUB_SDK_BAD_SELFIE",
                "SUMSUB_SDK_BAD_VIDEO_SELFIE",
                "SUMSUB_SDK_BAD_FACE_MATCHING",
                "SUMSUB_SDK_BAD_PROOF_OF_IDENTITY",
                "SUMSUB_SDK_BAD_PROOF_OF_ADDRESS",
                "SUMSUB_SDK_BAD_PROOF_OF_PAYMENT",
                "SUMSUB_SDK_SELFIE_WITH_PAPER",
                "SUMSUB_SDK_FRAUDULENT_LIVENESS",
                "SUMSUB_SDK_OTHER",
                "SUMSUB_SDK_REQUESTED_DATA_MISMATCH",
                "SUMSUB_SDK_OK",
                "SUMSUB_SDK_COMPANY_NOT_DEFINED_STRUCTURE",
                "SUMSUB_SDK_COMPANY_NOT_DEFINED_BENEFICIARIES",
                "SUMSUB_SDK_COMPANY_NOT_VALIDATED_BENEFICIARIES",
                "SUMSUB_SDK_COMPANY_NOT_DEFINED_REPRESENTATIVES",
                "SUMSUB_SDK_COMPANY_NOT_VALIDATED_REPRESENTATIVES"]

EDD_CODES = ["(EDD-1) PEP Declaration - Incorrect/Incomplete",
             "(EDD-1) SOW Declaration -Employment Details Incorrect/Incomplete",
             "(EDD-1) SOW Declaration - Significant Mistakes",
             "(EDD-1) SOW Declaration - Higher Total Assets Value",
             "(EDD-1) Annual Income",
             "(EDD-1) Annual income - Bank Statement",
             "(EDD-1) SOF - Salary",
             "(EDD-1) SOF - Self-Employment",
             "(EDD-1) SOF - Savings",
             "(EDD-1) SOF - Allowance",
             "(EDD-1) SOF - Pension",
             "(EDD-1) SOF - Dividends Payments/Profit From a Company",
             "(EDD-1) SOF - Day Trading",
             "(EDD-1) SOF - Gambling",
             "(EDD-1) SOF - Passive Income",
             "(EDD-1) SOF - Loans/Mortgages",
             "(EDD-1) SOF - Sale of Financial Assets",
             "(EDD-1) SOF - Sale of Real Estate or Other Assets",
             "(EDD-1) SOF - Bank Statement Sale of Financial/Real Estate Asset",
             "(EDD-1) SOF - Inheritance",
             "(EDD-1) SOF - Donations",
             "(EDD-1) SOF - Crypto Mining",
             "(EDD-1) SOW - Salary",
             "(EDD-1) SOW - Self-Employment Income",
             "(EDD-1) SOW - Inheritance",
             "(EDD-1) SOW - Donation",
             "(EDD-1) SOW - Mortgages/Loans",
             "(EDD-1) SOW - Company Profits (Shares/Dividends)",
             "(EDD-1) SOW - Financial Investment",
             "(EDD-1) SOW - Crypto Investment",
             "(EDD-1) Original Copy Instead of a Screenshot",
             "(EDD-1) Unclear Copy of Photo",
             "(EDD-1) KYC Failed",
             "(EDD-1) POA Failed",
             "(EDD-1) Documents Issued With Third-Party Names",
             "(EDD-1) Opening Chat",
             "(EDD-1) Two or More Linked Bank Accounts",
             "(EDD-1) Document With Missing Details",
             "(EDD-1) Document With Missing Dates",
             "(EDD-1) EDD Approved",
             "(EDD-1) Limits Already Increased"]

codes = SUMSUB_CODES + EDD_CODES
FILE_NAME = 'fiat-kyc.csv'
SEPARATION = ';!;'


def write_data_to_file(file_name, code, lang, message):
    x = datetime.datetime.now()
    message = message.replace("'", "")

    with open(file_name, 'a') as fo:
        db_create_time = x.strftime("%Y-%m-%d %H:%M:%S")
        db_modify_time = db_create_time
        fo.write(f"INSERT INTO kyc_core.message_map (code, lang, message, db_create_time, db_modify_time) VALUES('{code}', '{lang}', '{message}', '{db_create_time}', '{db_modify_time}') ON DUPLICATE KEY UPDATE message = VALUES(message), db_create_time = VALUES(db_create_time), db_modify_time = VALUES(db_modify_time);\n")


def e(file_name):
    # write header
    error_messages = []

    for lang in languages:
        # call to url to get json file
        lang_e = lang
        if (lang == "cn"):
            lang_e = "zh-CN"
        temp_url = original_url.format(lang_e)
        print(temp_url)
        with urllib.request.urlopen(temp_url) as r:
            data = json.load(r)
            if not data:
                print(f"no data in {temp_url}")
            for code in data:
                if code in codes:
                    write_data_to_file(file_name, code, lang, data[code])
                    error_messages.append({'code': code, 'lang': lang, 'message': data[code]})

    with open('error_messages.json', 'w') as f:
        f.write(json.dumps(error_messages, indent=2))


if __name__ == '__main__':
    e('json.sql')
