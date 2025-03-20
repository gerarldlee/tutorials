class User:
    def __init__(self, name, username, password, email_address, actions):
        self.name = name
        self.username = username
        self.password = password
        self.email_address = email_address
        self.actions = actions

    # TODO - Write a method, add_action, that adds an action to the user's actions list.
    # TODO - Make sure the method checks to make sure the requesting user (self) is admin
    # TODO - If the user is an admin, return True. Else, return False.
    def add_action(self, user_receiving_action, action):
        return False
