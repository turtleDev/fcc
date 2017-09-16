# What?
My submission for the [dh-fastest-code-contest](https://github.com/rep-movsd/dh-fast-code-contest).

Fastest code wins - because whats the point of correct code if it misses the bus?

## 001-rekt
My submission is for the dynamic langauge category, and the language I'm using is lua with luajit v2 interpreter

You can find the source in `001-rekt/lua/`

I'm using two algorithms simultaneously: linear probe and kd-tree based range lookup. I've done some thresholding and fine-tuning, and I think the current implementation gives a well rounded performance for most of the seeds. I wanted it to be much more faster, but alas, I'm still nowhere near the speeds of compiled language implementations. 

N.B. I improved the performance of the k-d tree by adding collision detection after the contest. The speed gains were in the 2x-10x, depending on the seed.

## 002-palt

I'm using javascript for this contest; the runtime of choice in this case is node v7

You can find the source under `002-palt/js`

usage:
```
node index.js --method none /path/to/palette-file /path/to/image-file
```

you can change the `none` part to any of the method available; run it without any options to see a list of available options.

I decided to use a more modular approach this time, and defined a standard interface, which could then be provided by the actual implementation. Take a look at `002-palt/js/methods` to get a better idea.
You specify what method you want to use at runtime using the `--method` flag.

method implemented so far:  
* pseudo-lookup table
* k-d tree (pseudo-nearest neighbour search; aka blind-kdt)
* k-d tree with nearest neighbour search
* linear search (baseline)
* none (because I can)

Some other things that were in the funnel, but never got implemented:
* Locality Sensitive Hashing
* Dithering

blind-kdt gives the best results under realtime constraints, for ahead of time preparation, nothing beats the plut.

