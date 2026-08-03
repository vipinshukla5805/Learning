# Generators – Interview Notes

## Definition (say this)

A **generator** is a function that uses `yield` to produce values **lazily**, one at a time, without storing the whole sequence in memory. Calling it returns a generator object (an iterator).

---

## Core idea: `return` vs `yield`

| | Normal function | Generator |
|--|-----------------|-----------|
| Keyword | `return` | `yield` |
| Memory | All results at once | One value at a time |
| State | Lost after return | Paused between yields |
| Returns | value / list | generator object |
| Reusable | Yes (call again) | No — exhausted after one full pass |

```python
def get_numbers():
    return [1, 2, 3]          # list in memory

def get_numbers_gen():
    yield 1
    yield 2
    yield 3                   # values on demand

gen = get_numbers_gen()
print(next(gen))  # 1
print(next(gen))  # 2
# next(gen) after end → StopIteration
```

---

## Why use generators?

1. **Memory efficient** — do not store the entire sequence
2. **Lazy evaluation** — compute only when needed
3. **Infinite sequences** — safe (consume with `islice` / break)
4. **Pipelines** — chain stages without intermediate lists

```python
import sys

numbers_list = [x**2 for x in range(10000)]
numbers_gen = (x**2 for x in range(10000))

print(sys.getsizeof(numbers_list))  # large
print(sys.getsizeof(numbers_gen))   # tiny (~100–200 bytes)
```

---

## Creating generators

### Generator function

```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1

for num in countdown(5):
    print(num)  # 5 4 3 2 1
```

### Generator expression (like list comprehension, but `()`)

```python
squares_list = [x**2 for x in range(10)]   # list
squares_gen = (x**2 for x in range(10))    # generator

sum_of_squares = sum(x**2 for x in range(10))  # no need for []
```

---

## Practical examples (memorize these)

### 1. Count / custom range

```python
def count_up_to(n):
    count = 1
    while count <= n:
        yield count
        count += 1
```

### 2. Infinite Fibonacci

```python
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

from itertools import islice
print(list(islice(fibonacci(), 10)))
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### 3. Read large file line by line

```python
def read_large_file(file_path):
    with open(file_path, "r") as file:
        for line in file:
            yield line.strip()

# only one line in memory at a time
for line in read_large_file("huge.log"):
    process(line)
```

### 4. Lazy pipeline

```python
def numbers(n):
    for i in range(n):
        yield i

def even(seq):
    for x in seq:
        if x % 2 == 0:
            yield x

def squared(seq):
    for x in seq:
        yield x * x

print(list(squared(even(numbers(10)))))
# [0, 4, 16, 36, 64]
```

### 5. Batches

```python
def batch_generator(data, batch_size):
    for i in range(0, len(data), batch_size):
        yield data[i : i + batch_size]

for batch in batch_generator(list(range(1, 21)), 5):
    print(batch)
```

---

## Advanced (nice-to-have in interviews)

### `yield from` — delegate to another iterable

```python
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item

print(list(flatten([1, [2, 3, [4, 5]], 6])))
# [1, 2, 3, 4, 5, 6]
```

### `send()` — send a value into the generator

```python
def echo():
    while True:
        value = yield
        if value is not None:
            print(f"Received: {value}")

gen = echo()
next(gen)           # prime
gen.send("Hello")   # Received: Hello
gen.close()
```

### Other methods

- `throw(exc)` — inject an exception into the generator
- `close()` — stop the generator (runs `finally`)

---

## Iterable vs Iterator vs Generator

| Term | Meaning |
|------|---------|
| **Iterable** | Has `__iter__` (list, range, dict, generator) |
| **Iterator** | Has `__next__` (and usually `__iter__`) |
| **Generator** | Easiest way to build an iterator (`yield`) |

---

## Gotchas

```python
gen = (x for x in range(5))
list(gen)  # [0, 1, 2, 3, 4]
list(gen)  # []  ← exhausted! create a new generator to reuse
```

---

## Interview Q&A

**Q: What does `yield` do?**  
Suspends the function, returns a value, keeps local state, resumes later from the next line.

**Q: Generator vs list?**  
List stores everything (O(n) memory, reusable). Generator yields one item (O(1) memory, single-use).

**Q: When should you use generators?**  
Large/streaming data, big files, infinite sequences, lazy pipelines, batching.

**Q: Can you reuse a generator?**  
No. After full iteration it is exhausted. Call the function again to get a new generator.

**Q: What is `yield from`?**  
Delegates iteration to another iterable/generator (flattening, composing generators).

**Q: Generator expression vs list comprehension?**  
`()` = lazy generator; `[]` = eager list in memory.

---

## Quick cheat codes

```python
# take first N from infinite gen
from itertools import islice, chain, cycle, count

list(islice(fibonacci(), 10))
list(chain([1, 2], [3, 4]))
cycle([1, 2, 3])   # infinite cycle
count(10)          # 10, 11, 12, ...
```

---

## Related materials

- Lab: `labs/01-python-for-ai/18_generators.py`
- Guide: `guides/03_python_advanced.md` → Generators section
- Notebook: `labs/01-python-for-ai/notebooks/18_generators.ipynb`
