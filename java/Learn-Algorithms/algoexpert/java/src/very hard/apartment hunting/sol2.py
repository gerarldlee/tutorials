
# o(br) time | o(br) space

def apartmentHunting(blocks, reqs):
    minDistanceFromBlocks = list(map(lambda req: getMinDistances(blocks, req), reqs))
    maxDistanceAtBlocks = getMaxDistanceAtBlocks(blocks, minDistanceFromBlocks)
    return getIdxAtMinValue(maxDistanceAtBlocks)

