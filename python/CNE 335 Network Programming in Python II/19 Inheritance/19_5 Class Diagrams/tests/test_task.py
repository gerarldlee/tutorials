import unittest

from User import User
from PowerUser import PowerUser
from Admin import Admin
from NormalUser import NormalUser


class TestCase(unittest.TestCase):
    def test_admin_class_creation_type(self):
        admin = Admin("Andy", "AdminAndy", "PassAndy", "Andy@User.com")
        self.assertEquals(Admin, type(admin))

    def test_admin_class_attributes_stored(self):
        admin = Admin("Andy", "AdminAndy", "PassAndy", "Andy@User.com")
        self.assertEquals(admin.name, "Andy")
        self.assertEquals(admin.username, "AdminAndy")
        self.assertEquals(admin.password, "PassAndy")
        self.assertEquals(admin.email_address, "Andy@User.com")
        self.assertIn("delete", admin.actions)
        self.assertIn("add_action", admin.actions)
        self.assertIn("cd", admin.actions)

    def test_admin_class_add_action_success(self):
        admin = Admin("Andy", "AdminAndy", "PassAndy", "Andy@User.com")
        self.assertEquals(Admin, type(admin))
        self.assertTrue(admin.add_action(admin, "add_action"))
        new_normal_user = NormalUser("Sam", "NormalSam", "PassSam", "Sam@User.com")
        new_power_user = PowerUser("Pam", "PowerPam", "PassPam", "Pam@User.com")
        self.assertTrue(admin.add_action(new_normal_user, "new_action"))
        self.assertIn("new_action", new_normal_user.actions)
        self.assertTrue(admin.add_action(new_power_user, "new_action"))
        self.assertIn("new_action", new_power_user.actions)

    def test_user_class_creation_type(self):
        user = User("Bob", "UserBob", "PassBob", "Bob@User.com", ["ls"])
        self.assertEquals(User, type(user))

    def test_user_class_attributes_stored(self):
        user = User("Bob", "UserBob", "PassBob", "Bob@User.com", ["ls"])
        self.assertEquals(user.name, "Bob")
        self.assertEquals(user.username, "UserBob")
        self.assertEquals(user.password, "PassBob")
        self.assertEquals(user.email_address, "Bob@User.com")
        self.assertIn("ls", user.actions)
        self.assertNotIn("add_action", user.actions)
        self.assertNotIn("cd", user.actions)

    def test_user_class_add_action_fail(self):
        user = User("Bob", "UserBob", "PassBob", "Bob@User.com", ["ls"])
        self.assertEquals(User, type(user))
        self.assertNotEquals(Admin, type(user))
        self.assertFalse(user.add_action(user, "add_action"))

    def test_normal_user_class_creation_type(self):
        normal_user = NormalUser("Sam", "NormalSam", "PassSam", "Sam@User.com")
        self.assertEquals(NormalUser, type(normal_user))

    def test_normal_user_class_attributes_stored(self):
        normal_user = NormalUser("Sam", "NormalSam", "PassSam", "Sam@User.com")
        self.assertEquals(normal_user.name, "Sam")
        self.assertEquals(normal_user.username, "NormalSam")
        self.assertEquals(normal_user.password, "PassSam")
        self.assertEquals(normal_user.email_address, "Sam@User.com")
        self.assertIn("ls", normal_user.actions)
        self.assertNotIn("add_action", normal_user.actions)
        self.assertIn("cd", normal_user.actions)

    def test_normal_user_class_add_action_fail(self):
        normal_user = NormalUser("Sam", "NormalSam", "PassSam", "Sam@User.com")
        self.assertEquals(NormalUser, type(normal_user))
        self.assertNotEquals(Admin, type(normal_user))
        self.assertFalse(normal_user.add_action(normal_user, "add_action"))

    def test_power_user_class_creation_type(self):
        power_user = PowerUser("Pam", "PowerPam", "PassPam", "Pam@User.com")
        self.assertEquals(PowerUser, type(power_user))

    def test_power_user_class_attributes_stored(self):
        power_user = PowerUser("Pam", "PowerPam", "PassPam", "Pam@User.com")
        self.assertEquals(power_user.name, "Pam")
        self.assertEquals(power_user.username, "PowerPam")
        self.assertEquals(power_user.password, "PassPam")
        self.assertEquals(power_user.email_address, "Pam@User.com")
        self.assertIn("delete", power_user.actions)
        self.assertNotIn("add_action", power_user.actions)
        self.assertIn("cd", power_user.actions)

    def test_power_user_class_add_action_fail(self):
        power_user = PowerUser("Pam", "PowerPam", "PassPam", "Pam@User.com")
        self.assertEquals(PowerUser, type(power_user))
        self.assertNotEquals(Admin, type(power_user))
        self.assertFalse(power_user.add_action(power_user, "add_action"))
