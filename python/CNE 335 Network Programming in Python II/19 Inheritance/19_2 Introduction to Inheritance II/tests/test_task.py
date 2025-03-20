import unittest
from ServerClass import ServerClass
from AWSServer import AWSServer
from task import local_server, aws_server
class TestCase(unittest.TestCase):
    def test_create_serverclass_type(self):
        server = ServerClass("127.0.0.1", "localhost")
        self.assertIn("ServerClass", str(type(server)))

    def test_create_awsserver_type(self):
        awsserver = AWSServer("127.0.0.1", "localhost", "EC2")
        self.assertIn("AWSServer", str(type(awsserver)))

    def test_create_awsserver_is_subclass_of_serverclass(self):
        awsserver = AWSServer("127.0.0.1", "localhost", "EC2")
        self.assertIn("AWSServer", str(type(awsserver)))
        self.assertTrue(issubclass(AWSServer, ServerClass))

    def test_create_awsserver_has_instance_type_variable(self):
        awsserver = AWSServer("127.0.0.1", "localhost", "EC2")
        self.assertTrue(hasattr(awsserver, "instance_type"))

    def test_localserver_is_serverclass(self):
        self.assertTrue(issubclass(ServerClass, type(local_server)))

    def test_awsserver_is_awsserver(self):
        self.assertTrue(issubclass(AWSServer, type(local_server)))
