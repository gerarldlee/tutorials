def fake_ping(server_ip, ping_time):
    # TODO - Return a string that says "Ping response from [server_ip] [ping_time]"
    return f'Ping response from {server_ip} {ping_time}'

def ping(server_ip):
    # TODO - Call the fake_ping function with a ping_time of 10ms
    return fake_ping(server_ip, "10ms")
