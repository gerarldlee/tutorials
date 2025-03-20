import unittest

from random import randint

from task import ping, fake_ping

# todo: replace this with an actual test
class TestCase(unittest.TestCase):
    def test_ping_string_return_type(self):
        self.assertIn("str", str(type(ping("127.0.0.1"))))

    def test_ping_local_host(self):
        result = ping("127.0.0.1")
        self.assertEquals("Ping response from 127.0.0.1 10ms", result)

    def test_ping_random_ip(self):
        random_ip = str(randint(2, 254))  # Start at 2 to make 127.0.0.1 impossible
        for i in range(0, 3):
            random_ip += "." + str(randint(1, 254))
        result = ping(random_ip)
        self.assertEquals("Ping response from "+str(random_ip)+" 10ms", result)