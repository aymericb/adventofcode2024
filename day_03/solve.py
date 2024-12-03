import re

with open("input.txt", "r") as f:
    text = f.read()

re1 = re.compile(r"mul\(([0-9]{1,3})\,([0-9]{1,3})\)")
matches = re1.findall(text)
multiples = [int(x[0]) * int(x[1]) for x in matches]
print(sum(multiples))

re2 = re.compile(r"(mul\(([0-9]{1,3})\,([0-9]{1,3})\))|(don't\(\))|(do\(\))")
# sample = "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))"
matches = re2.findall(text)
state = True
theSum = 0
for match in matches:
    # print(match)
    if match[3] == "don't()":
        state = False
    elif match[4] == "do()":
        state = True
    else:
        if state:
            theSum += int(match[1]) * int(match[2])

print(theSum)
