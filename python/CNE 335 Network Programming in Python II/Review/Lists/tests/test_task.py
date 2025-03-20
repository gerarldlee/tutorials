import unittest

from task import create_initial_network, add_to_network, get_server_at_index

from random import randint

class TestCase(unittest.TestCase):
    def test_create_network_list_type(self):
        network = create_initial_network()
        self.assertEqual(type(network), list)

    def test_create_network_three_servers(self):
        network = create_initial_network()
        self.assertEqual(len(network), 3)

    def test_add_server_list_type(self):
        network = create_initial_network()
        self.assertEqual(type(network), list)
        add_to_network(network, "42.42.42.42")
        self.assertEqual(type(network), list)

    def test_add_server_four_servers(self):
        network = create_initial_network()
        self.assertEqual(len(network), 3)
        random_ip = str(randint(2, 254))  # Start at 2 to make 127.0.0.1 impossible
        for i in range(0, 3):
            random_ip += "." + str(randint(1, 254))
        add_to_network(network, random_ip)
        self.assertEqual(len(network), 4)

    def test_most_recently_added_server(self):
        network = create_initial_network()
        random_ip = str(randint(2, 254))  # Start at 2 to make 127.0.0.1 impossible
        for i in range(0, 3):
            random_ip += "." + str(randint(1, 254))
        add_to_network(network, random_ip)
        # Most recent server should be at the end. -1 is needed to avoid an off-by-one error.
        most_recently_added_server = get_server_at_index(network, len(network) - 1)
        self.assertEqual(most_recently_added_server, random_ip)