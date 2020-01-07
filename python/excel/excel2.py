# coding = utf-8

import xlwt

workbook = xlwt.Workbook(encoding='ascii')
i = 0

print(__name__)
while i < 4:
    worksheet = workbook.add_sheet('my worksheet%d' % i)
    style = xlwt.XFStyle()
    font = xlwt.Font()
    font.name = 'Time New Roman'
    font.bold = True
    font.underline = True
    font.italic = True
    style.font = font

    worksheet.write(0,0,'chaos%d' % i)
    worksheet.write(1,0,'chaos_ho%d' % i)
    i += 1

workbook.save('formatting.xls')