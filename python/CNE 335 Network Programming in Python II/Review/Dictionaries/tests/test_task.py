import unittest

from random import randint

from task import start_dns_server, add_to_dns, dns_lookup

class TestCase(unittest.TestCase):
    def test_create_dns_dict_type(self):
        dns = start_dns_server()
        self.assertEqual(type(dns), dict)

    def test_create_network_three_records(self):
        dns = start_dns_server()
        self.assertEqual(len(dns), 3)

    def test_add_server_dict_type(self):
        dns = start_dns_server()
        self.assertEqual(type(dns), dict)
        random_ip = str(randint(2, 254))  # Start at 2 to make 127.0.0.1 impossible
        for i in range(0, 3):
            random_ip += "." + str(randint(1, 254))
        add_to_dns(dns, "Random", random_ip)
        self.assertEqual(type(dns), dict)

    def test_add_server_four_servers(self):
        dns = start_dns_server()
        self.assertEqual(len(dns), 3)
        random_ip = str(randint(2, 254))  # Start at 2 to make 127.0.0.1 impossible
        for i in range(0, 3):
            random_ip += "." + str(randint(1, 254))
        add_to_dns(dns, "Random", random_ip)
        self.assertEqual(len(dns), 4)

    def test_get_record_exists(self):
        dns = start_dns_server()
        random_ip = str(randint(2, 254))  # Start at 2 to make 127.0.0.1 impossible
        for i in range(0, 3):
            random_ip += "." + str(randint(1, 254))
        add_to_dns(dns, "Random", random_ip)
        # Most recent server should be at the end. -1 is needed to avoid an off-by-one error.
        added_server = dns_lookup(dns, "Random")
        self.assertEqual(added_server, random_ip)