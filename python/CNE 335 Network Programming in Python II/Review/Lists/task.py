def fake_create_initial_network_list():
    # TODO - Create a list and add 3 servers.
    return ["127.0.0.1", "192.168.0.0", "192.168.0.1"]

def fake_add_to_network(network_list, server_ip):
    return network_list.append(server_ip)
    return

def get_server_at_index(network_list, index):
    # TODO - Return the server at location 'index', where index is an integer
    return


# Do not change anything below
def create_initial_network():
    return fake_create_initial_network_list()

def add_to_network(network_list, server_ip):
    return fake_add_to_network(network_list, server_ip)