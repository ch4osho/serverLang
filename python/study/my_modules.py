def add(*params):
    res = 0
    print('你进来了my_modules的add函数模块')
    for para in params:
        res += para
    return res


def multiple(*params):
    res = 1
    print('你进来了my_modules的multiple函数模块')
    for para in params:
        res *= para
    return res

package_name = 'my_modules'
