import unittest

from task import create_initial_network, ip_in_network_list

from random import randint

class TestCase(unittest.TestCase):
    def test_create_network_list_type(self):
        network = create_initial_network()
        self.assertEqual(type(network), list)

    def test_create_network_list_thousand_servers(self):
        network = create_initial_network()
        self.assertEqual(len(network), 1000)

    def test_ip_in_network_list_ip_exists(self):
        network = create_initial_network()
        random_ip = network[randint(0, len(network)-1)]
        self.assertEqual(ip_in_network_list(network, random_ip), random_ip)

    def test_ip_in_network_list_not_found(self):
        network = create_initial_network()
        random_ip = str(randint(0, 254))+"." + str(randint(0, 254))+"." + str(randint(0, 254))+"." + str(randint(0, 254))
        while random_ip in network:
            random_ip = str(randint(0, 254))+"." + str(randint(0, 254))+"." + str(randint(0, 254))+"." + str(randint(0, 254))
        self.assertEqual(ip_in_network_list(network, random_ip), "Not found")