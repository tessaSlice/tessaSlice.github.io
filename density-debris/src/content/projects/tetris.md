---
name: 'Tetris'
icon: 'tetris'
caption: "A classic"
description: 'Tetris built from scratch using standard Java libraries.'
tags:
  - Java
  - Game
  - Eclipse IDE
github_link: "https://github.com/tessaSlice/Tetris"
visible: True
---

In high schoool, my computer science teacher challenged my class to create a game and then implement an AI algorithm. I chose Tetris. I also implemented a genetic algorithm, but unfortunately the parameters are not tuned very well so the decisions made by the algorithm are effectively random. 

This was undoubtedly the biggest CS project I had done up to that point, spanning many files. I always look back at this project fondly to remember har far I've progressed in my programming skills since then. 

# How I did it

It's entirely made of Java. I used standard Java libraries such as `java.awt.Color`, `java.awt.Font`, `java.awt.Graphics`, `java.awt.Point` to create my Tetris visual display using the `Eclipse IDE`. It was a really good exercise in practicing polymorphism, as I had realized much of the tetrimino blocks all shared the same actions (e.g. rotate left, rotate right, move left, move right, drop, hold). I also applied many geometry principles, such as rotating coordinates by 90 degrees and translating coordinates by a predefined amount. 

# Check it out!

- [GitHub repository](https://github.com/tessaSlice/Tetris): Contains all of my source files and also instructions for how to install and play the game. There's an executable file that you can download from there too. 