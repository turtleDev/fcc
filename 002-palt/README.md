
#### Intro

A simple problem statement and test data provided and you have 4 weeks in which you can submit as many solutions as you like.

A monetary prize will be given to the winners (maximum two winners) - Amounts will be discussed on the slack channel


The submissions will be divided into 2 categories based on langauge demographics

 * Compiled languages - C/C++/Rust/Go/Java/C# etc. - no inline assembler or GPGPU (but compiler intrinsics allowed)
 * Dynamic languages - python/ruby/JS

Multiprocessing of any kind is not allowed - Solutions will be tested on a single core machine

If you are in category 1, you will have to create a shared object .so that can be called from a C program, so that we need not write a testing harness for every language.

Category 2 will need individual test scripts that we will write for each language.

At the end the absolutely fastest code submission per person is only considered  and the top winner in each class wins half the prize money.

We are keeping 2 classes because otherwise the compiled solutions will always dominate. There is no rule that you have to use only one language for all your submissions.

If any dynamic language program manages to get top spot, then it wins the entire prize money, because the programmer has rekt all the Gurus.

The sole criteria for dynamic/static language is whether you can produce a self standing .so file - If it needs external dependencies, no problem, just include the build instructions

For now not supporting Windows - you can use it to develop and test, but final submission is a Linux .so
The reason is the system we use for testing all programs has to be a single one and adding Windows to the mix is needless complexity and may not reflect the same relative time.

---

#### Problem statement

Given an RGB image with 24 bit colors (2^24 distinct colors) one can define a palette of 256 out of the possible 16 million
Using colors in this palette alone we can recreate the image such that it looks like a reasonable facsimile of the original  

This is the basis for 8 bit color images like 8-bit PNG and GIF formats

When converting a 24 bit color image to an 8 bit color depth, two operations are performed

  * First we need to get the best 256 colors
  * Then we need to scan through the image and for each 24 bit pixel, we decide which of the 256 palette colors we need to use for that
  
The first part is a very complex and there are many algorithms that are commonly used like Median Cut and Octrees - we don not concern ourselves with that for this challenge
The second part is simple to state but hard to do efficiently without using a lookup table.

You are given a file containing 256 rows each describing a RGB color (we will refer to this as the palette file):

    R G B
    R G B
    ...

R, G and B and A are integer values in the range
    
    0 <= val <= 255   


You are also given a file containing several million 24 bit values each representing a pixel in an image

    RGB RGB RGB ...

Each RGB are integer values in the range
    
    0 <= val <= 0x00FFFFFF   


Remember that we are in little-endian mode so if you have a 24 bit integer value in HEX 0x00345678 then 78 is R, 56 is G, 34 is B
Static-typed language programmers should not have to worry about this, but dynamic people make sure you get it right

The challenge is to produce an output file containing one entry for each pixel, ranging from 0 to 255
The output values are the index of the palette color which match the input pixel color closest.

We define closeness of two colors as the cartesian distance between them in RGB 3D space.
If we have two colors R1, G1, B1 and R2, G2, B2 distance between them is given by:

    SQRT(ABS(R1-R2)^2 + ABS(G1-G2)^2 + ABS(B1-B2)^2)
    
This is nothing but the basic distance formula, visualized with the 3 axes being red, green, blue
It is possible (but very unlikely) that two palette colors match an input color, in that case choose arbitrarily

The "average error" of the file is calculated as the RGBA distance between each input and output pixel averaged over the whole image and scaled to a percentage


The following test framework is provided:

 * dump_image - Takes a 24 bpp PNG image dumps to stdout the RGB values of each pixel, one per line
 * dump_palette - Takes an 8 bpp PNG image and dumps to stdout the 256 palette colors, one per line
 * reference - Takes an image and palette files (generated by above two) and creates a new file containing the a palette index for each pixel. The palette index is the one whose color is closest in RGB space to the pixel
 * dump_png - Takes the output of reference and a palette and generates the PNG file - this can be used to visually compare the original and palette mapped file to check if the algorithm is working OK


The winner is the program that runs the fastest and gives least error, calculated as follows:

The minimum error possible for any palette is what the reference program above generates.
Assume your entry takes time T and has average pixel error E, let reference error be R

    Let (1 - R) be the accuracy ratio of the reference (call it Q)
    Let (1 - E) be the accuracy ratio of your implementation (call it P)
    T is multipled by P/Q to get your final time 

The logic being that less accurate results are penalized proportionally
If your implementation accuracy matches the reference then the penalty 

For example lets say: 
    
    Reference produces an error (R) of 9.12% i.e. 0.0912  
    Implementation 1 produces an error (E1) of 13% i.e. 0.13 and takes 10 seconds
    Implementation 2 produces an error (E2) of 10% i.e. 0.10 and takes 10.2 seconds

    Q = 1 - R = 0.9088
    P1 = 1 - E1 = 0.87
    P2 = 1 - E2 = 0.90

    Accuracy ratio for P1 = P1/Q = 0.957
    Accuracy ratio for P2 = P2/Q = 0.990

Adjusted times are

    Implementation 1 => 10.0 / 0.957 = 10.45
    Implementation 2 => 10.2 / 0.990 = 10.30

So implementation 2 wins
 
 
---

#### Prize money

The prize is divided between the top winners of two groups equally.

The winning entries have to have at least 5% better speed than the next best program. 
Otherwise we have a tie and the prize chunk is divided amongst the tied people.

If someones dynamic program takes top spot, entire prize money goes to them.

