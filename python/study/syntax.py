# coding: UTF-8

import time
import my_modules
import locale
my_class = 'hechaohao'

print('系统编码', locale.getpreferredencoding())


def pp(word):
    print(word)

# for in 循环
for letter in my_class:
    print('当前字母', letter)


# for in 循环 + range()
fruits = ['bananas', 'apple', 'pear']

for index in range(len(fruits)):
    print('当前水果 ：', fruits[index], index)

print(range(len(fruits)))




# pass Python pass 是空语句，是为了保持程序结构的完整性。
# pass 不做任何事情，一般用做占位语句

def sample(params):
    pass

for letter in 'Python':
    if letter == 'h':
        pass
        print('这是 pass 块')
    print('当前字母 :', letter)

print("Good bye!")


print('------------------------------------------')
# break 跳出循环
for words in 'chaos':
    if words == 'a':
        break
        print('break')

    print(words)


print('------------------------------------------')

# continue 跳出本次循环，继续下一次循环
# 也可以理解为语法题一遇到continue就会回到判断体
for words in 'chaos':
    if words == 'a':
        continue
        print('break')

    print(words)


# number
print(10)
name = str(10)
print(name)
print(15.236)
print(9.322e-36j)




#
tup1 = ('chaos', 'tracy', 'lucy')
tup2 = (1, 2, 3, 4, 5, 6, 7, 8, 9)
tup3 = (4,)
list1 = [1, 2, 3, 4, 5, 6, 7, 8, 9]

print(tup1[0])
print(tup2[0:5])
print(tup3)
tup3 = tuple(list1)
print(tup3)

# 字典 以键值对的形式存在,有点类似于对象,但是字典的键可以是数字,字符串,或者元祖,这些不可变的数据类型
dict1 = {
    'a': 132,
    98.6: 155,
    (16, 56, 71, 78): 1555
}


dict1['a'] = 666
dict1['b'] = 777
print(dict1)

del dict1['a']
print(dict1)
print(dict1[(16, 56, 71, 78)])
keyss = dict1.keys()
print(len(keyss))
print(dict1.get(98.6))
print('------')

# 日期和时间---太多方法,及时查看api吧
ticks = time.time()
print('当前时间戳', ticks)


localtime = time.asctime(time.localtime(time.time()))
print(localtime)


def print_var_tuple(*vartuple):
    print('打印输出')
    for params in vartuple:
        print('vartuple', params)
    return


print_var_tuple(6, 7, 8, 9, 10)

total = 0

# 匿名函数
def real_sum(arg1, arg2):
    total = 30
    print('total', total)
    return (arg1 + arg2) * 100


sum = lambda arg1, arg2: real_sum(arg1, arg2)

print(my_modules.add(1, 2, 3, 4, 5, 6, 7))
print(my_modules.multiple(1, 2, 3, 4, 5, 6, 7))


Money = 2000

# 在函数里要操作全局函数的话，要在函数前加global关键字，不然python解释器会把所有函数内的变量解释为局部变量
def add_money():
    global Money
    Money = Money + 1


print(Money)
add_money()
print(Money)


# 查看模块名
content = dir(my_modules)

print(my_modules.__file__)


print(content)


# 查看全局变量和局部变量
print('全局变量', globals())


def test_locals():
    name = 'cjaos',
    age = 18
    print('局部变量', locals())
    print('全局变量', globals())
    return False


test_locals()


pp('---------------------编码的琐事-------------------')
# bytes转字符串的方法
# encode 解码
# decode 编码

words = '我的生命像一首歌'
my_bytes = words.encode('utf-8')


# <class 'str'>
pp(type(words))

# <class 'bytes'>
pp(type(my_bytes))

# 第一种方法 字节类运行decode方法
pp(my_bytes.decode('utf-8'))

# 第二种方法,利用str(),传入编码，生成字符串
pp(str(my_bytes, 'utf-8'))

# 第三种方法
pp(my_bytes.decode('utf-8', 'ignore'))


# 字符串转bytes的方法

# 方法1,bytes()强制转换成字节型
pp(bytes(words, encoding='utf-8'))

# 方法二，encode方法
pp(words.encode('utf-8'))


print('---------------文件的相关操作------------')
# 文件的相关操作

file = open('test2.txt', 'w+', encoding='utf-8')
str1 = file.read()
i = 0
while i < 100:
    file.write('我的生命像一首歌\n')
    i += 1










