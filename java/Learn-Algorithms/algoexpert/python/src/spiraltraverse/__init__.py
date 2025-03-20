

def spiralTraverse(array):
    # Write your code here.
    length, width = len(array), len(array[0])
    newArray = []

    # first traversal
    startRow, endRow = 0, length
    startColumn, endColumn = 0, width

    traversePerimeter(startRow, startColumn, endRow, endColumn, array, newArray)

    return newArray

def traversePerimeter(startingRow, startingColumn, maxLength, maxWidth, array, newArray):
    currentColumn, currentRow = 0, 0
    for column in range(startingColumn, maxWidth):
        currentColumn = column
        addToArray(startingRow, column, array, newArray)
    for row in range(startingRow + 1, maxLength):
        currentRow = row
        addToArray(row, currentColumn, array, newArray)
    for column in range(currentColumn - 1, startingColumn - 1, -1):
        currentColumn = column
        addToArray(currentRow, column, array, newArray)
    for row in range(currentRow - 1, startingRow, -1):
        currentRow = row
        addToArray(row, currentColumn, array, newArray)

    # determineTraverse()

def addToArray(currentRow, currentColumn, array, newArray):
    newArray.append(array[currentRow][currentColumn])


def main():
    array = [[1, 2, 3, 4], [12, 13, 14, 5], [11, 16, 15, 6], [10, 9, 8, 7]]
    spiralTraverse(array)

if __name__ == "__main__":
    main()