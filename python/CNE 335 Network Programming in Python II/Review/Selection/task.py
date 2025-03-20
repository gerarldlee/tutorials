def is_ip_localhost(server_ip):
    # TODO - Return 'True' if server_ip = "127.0.0.1", False otherwise.
    return server_ip == "127.0.0.1"

def who_assigned_ip(server_ip):
    # TODO - Return 'Localhost' if server_ip = "127.0.0.1", "DHCP" if the ip starts with 192.168.0, "Unknown" otherwise.
    if is_ip_localhost(server_ip) == True:
        return "Localhost"
    elif server_ip.startswith("192.168.0"):
        return "DHCP"
    else:
        return "Unknown"
