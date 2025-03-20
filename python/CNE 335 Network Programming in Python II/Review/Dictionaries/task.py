def fake_create_initial_dns_record_dict():
    # TODO - Create a dictionary with 3 server_name : server_ip records, i.e. "localhost":"127.0.0.1"
    return

def fake_add_to_dns_records(dns_records, server_name, server_ip):
    # TODO - Add a record to the DNS record dict.
    # NOTE - Return is not necessary, but you do not lose points for using.
    dns_records

def fake_dns_lookup(dns_records, server_name):
    # TODO - Return the IP for the server name
    return

# Do not change anything below
def start_dns_server():
    return fake_create_initial_dns_record_dict()

def add_to_dns(dns_records, server_name, server_ip):
    return fake_add_to_dns_records(dns_records, server_name, server_ip)

def dns_lookup(dns_records, server_name):
    return fake_dns_lookup(dns_records, server_name)