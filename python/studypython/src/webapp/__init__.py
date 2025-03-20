magic_number = 5


def ask_number():
    num = input("Pick a number: ")
    return int(num)


def input_number():
    num = ask_number()
    if num != magic_number:
        print("Wrong!")
        num()
    else:
        print("Right!")
        exit(0)


input_number()
