import random
condition=True
num=random.randint(0,10)
while condition:
    if num==7:
        condition=False
    num=random.randint(0,10)
print(num)