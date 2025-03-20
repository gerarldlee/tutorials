# Do not edit ServerClass!
# -----------------------------------------------
class ServerClass:
    def __init__(self, ip, name):
        self.ip = ip
        self.name = name

    def get_server_class_information(self):
        return f"Name: {self.name} IP: {self.ip}"
# -----------------------------------------------
# Edit below. Create a ServerWithOperatingSystemClass class

# TODO - Create a ServerWithOperatingSystemClass that inherits from ServerClass

    # TODO - Build a constructor that takes in ip, name, and operating_system variables

    # TODO - Write a method, get_inherited_server_class_information. get_inherited_server_class_information should call
    # TODO - get_server_class_information and append the operating_system variable

