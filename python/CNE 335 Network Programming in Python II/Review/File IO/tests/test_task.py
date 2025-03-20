# import unittest
#
# from task import get_log_event_count
#
# class TestCase(unittest.TestCase):
#     def test_get_log_event(self):
#         # result = get_log_event_count("Launch")
#         # self.assertEqual(200, len(result))
#         self.assertEqual(1, 1)

import unittest
import os
from task import get_log_event_list

class TestCase(unittest.TestCase):
    def test_get_log_event_count_list_type(self):
        log_list = get_log_event_list(os.getcwd()+"/user_data.log", "Yes")
        self.assertEqual(type(log_list), list)

    def test_get_log_event_count_launch_count(self):
        log_list = get_log_event_list(os.getcwd()+"/user_data.log", "Launch")
        self.assertEqual(368, len(log_list))

    def test_get_log_event_count_first_event(self):
        log_list = get_log_event_list(os.getcwd()+"/user_data.log", "Launch")
        log_event_zero = """{"User": "fe980e3f-b65a-47c5-aef3-f73cecaacfcf", "Session": "0f443983-7a63-4f6a-b11a-e63312e64d52", "Time": "2019-10-03T09:48:14Z", "Event": "Launch"}"""
        #self.assertEqual(log_event_zero, log_list[0])
        self.assertIn(log_event_zero, log_list[0])