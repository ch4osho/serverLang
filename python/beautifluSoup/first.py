import urllib.request

def getHtml(url):
    baidu = urllib.request.urlopen(url)
    return baidu.read().decode('utf-8')

def writeFile(filename, data):
    htmlFile = open(filename, 'a')
    htmlFile.write(data)
    htmlFile.close()

html = getHtml('http://kt.fff.com/function_18.html')

sf = open('./myhtml.html', 'w', encoding="utf-8")

print(html)
sf.write(html)
sf.close()