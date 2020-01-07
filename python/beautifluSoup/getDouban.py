#encoding:UTF-8
from bs4 import BeautifulSoup
import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

# headers = {
#     'User-Agnet': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
#     'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
#     'Accept-Encoding': 'gzip, deflate, br',

# }


def get_html(url):
    request = urllib.request.Request(url)
    request.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36 LBBROWSER')
    response = urllib.request.urlopen(request)
    return response.read().decode('utf-8', 'ignore')


file = open('index.txt', 'a+', encoding='utf-8')


page = 1

while page < 11:
    url = "https://www.dytt8.net/html/gndy/dyzz/list_23_%d.html" % page
    html = get_html(url)
    soup = BeautifulSoup(html, 'lxml')
    imgs = soup.find_all('img')
    print('这是爬取的url', url)

    for img in imgs:
        link = img.get('src')
        if not link:
            continue
        if not 'http' in link:
            link = 'https:' + link
        print('link', link)
        urllib.request.urlretrieve(link, 'other/' + link.split('/')[len(link.split('/')) - 1])
        file.write(str(img['src']) + '\n')

    page += 1
