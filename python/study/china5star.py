import turtle
# from turtle import *

turtle.setup(600, 400, 0, 0)
turtle.color('yellow')
turtle.bgcolor('red')
turtle.fillcolor('yellow')

def mygoto(x, y):
    turtle.up()
    turtle.goto(x, y)
    turtle.down()

def drawfive(r):
    turtle.begin_fill()

    for i in range(5):
        turtle.forward(r)
        turtle.left(-144)
    turtle.end_fill()

mygoto(-230, 100)
drawfive(100)

for i in range(4):
    x = 1
    if i in [0, 3]:
        x = 0
    mygoto(-120 + x * 50, 150 - i * 40)
    turtle.left(15 - i * 15)
    drawfive(30)

mygoto(0, 0)

turtle.hideturtle()
turtle.done()