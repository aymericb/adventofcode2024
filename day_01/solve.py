
def load_file(path: str) -> list[int, int]:
    with open(path, "r") as f:
        lines = f.readlines()
        values = [tuple(int(x) for x in line.split("   ")) for line in lines]
        l1 = [x[0] for x in values]
        l2 = [x[1] for x in values]
        return [l1, l2]

[l1, l2] = load_file("./input.txt")
# print(l1)
# print(l2)

l1.sort()
l2.sort()

distances = [abs(x - y) for x, y in zip(l1, l2)]
# print(distances)

print("Solution to part 1:", sum(distances))

m2 = {} 
for x in l2:
    m2[x] = m2.get(x, 0) + 1

similarities = [x * m2.get(x, 0) for x in l1]
# print(similarities)
print("Solution to part 2:", sum(similarities))
# print(sum)
